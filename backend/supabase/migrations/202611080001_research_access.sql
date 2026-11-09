-- Research access foundation. Apply only to the owner's configured Supabase project.
-- Browser callers receive SELECT/RPC permissions only; provider owner reviews access.
begin;
select pg_advisory_xact_lock(hashtext('katabasis-research-access-install'));

create schema if not exists research_access_private;
revoke all on schema research_access_private from public, anon, authenticated;
grant usage on schema research_access_private to authenticated;

-- Marker makes repeating this SAME reviewed install safe while refusing an
-- unrecognized existing schema. It never creates/re-enables a reviewer account.
create table if not exists research_access_private.schema_installations (
  version text primary key,
  installed_at timestamptz not null default now()
);
alter table research_access_private.schema_installations enable row level security;
revoke all on research_access_private.schema_installations from public, anon, authenticated;
do $$
begin
  if not exists (select 1 from research_access_private.schema_installations
    where version = 'katabasis-research-access/202611080001')
    and (to_regclass('public.research_access_requests') is not null
      or to_regclass('public.research_materials') is not null
      or to_regclass('public.research_material_grants') is not null) then
    raise exception 'Unrecognized existing research schema: review before applying this installation';
  end if;
end;
$$;

create table if not exists public.research_access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'revoked')),
  display_name text not null check (char_length(display_name) between 1 and 160),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create table if not exists public.research_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 240),
  summary text not null default '' check (char_length(summary) <= 2000),
  storage_path text not null unique
    check (char_length(storage_path) between 1 and 1024 and left(storage_path, 1) <> '/'),
  file_type text not null default 'application/pdf'
    check (char_length(file_type) between 1 and 120),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.research_material_grants (
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid not null references public.research_materials(id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  revoked_at timestamptz,
  primary key (user_id, material_id)
);

alter table public.research_access_requests enable row level security;
alter table public.research_materials enable row level security;
alter table public.research_material_grants enable row level security;

-- Do not rely on default Supabase object grants.
revoke all on public.research_access_requests,
  public.research_materials, public.research_material_grants
  from public, anon, authenticated;
grant select on public.research_access_requests,
  public.research_materials, public.research_material_grants to authenticated;
grant all on public.research_access_requests,
  public.research_materials, public.research_material_grants to service_role;

-- Auth's confirmed_at also includes phone confirmation; require EMAIL confirmation.
-- All relations are qualified; no caller-controlled names enter the definer path.
create or replace function research_access_private.has_confirmed_email()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users as u
    where u.id = (select auth.uid())
      and u.email is not null
      and u.email_confirmed_at is not null
  );
$$;

create or replace function research_access_private.can_read_material(p_material_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select research_access_private.has_confirmed_email()
    and exists (
      select 1
      from public.research_access_requests as r
      join public.research_material_grants as g on g.user_id = r.user_id
      join public.research_materials as m on m.id = g.material_id
      where r.user_id = (select auth.uid())
        and r.status = 'approved'
        and g.material_id = p_material_id
        and g.revoked_at is null
        and (g.expires_at is null or g.expires_at > now())
        and m.published
    );
$$;

revoke all on function research_access_private.has_confirmed_email()
  from public, anon, authenticated;
revoke all on function research_access_private.can_read_material(uuid)
  from public, anon, authenticated;
grant execute on function research_access_private.has_confirmed_email()
  to authenticated;
grant execute on function research_access_private.can_read_material(uuid)
  to authenticated;

drop policy if exists research_request_read_own on public.research_access_requests;
create policy research_request_read_own on public.research_access_requests
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists research_grant_read_own on public.research_material_grants;
create policy research_grant_read_own on public.research_material_grants
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists research_material_read_granted on public.research_materials;
create policy research_material_read_granted on public.research_materials
for select to authenticated
using (research_access_private.can_read_material(id));

-- The sole end-user write surface. It derives user_id from the verified session.
-- Edits to self-reported contact fields never reopen/reapprove/revoke a request.
create or replace function research_access_private.submit_research_access_request(
  p_display_name text,
  p_contact_phone text default null
)
returns public.research_access_requests
language plpgsql security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := nullif(btrim(p_display_name), '');
  v_phone text := nullif(btrim(p_contact_phone), '');
  v_email text;
  v_result public.research_access_requests;
begin
  if v_user_id is null or not research_access_private.has_confirmed_email() then
    raise exception using errcode = '42501', message = 'Confirmed email required';
  end if;

  select u.email into v_email from auth.users as u where u.id = v_user_id;
  v_name := coalesce(v_name, left(v_email, 160));
  if char_length(v_name) > 160 or v_name ~ '[[:cntrl:]]'
     or char_length(v_phone) > 40 or v_phone ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Invalid contact fields';
  end if;

  insert into public.research_access_requests (user_id, display_name, contact_phone)
  values (v_user_id, v_name, v_phone)
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    contact_phone = excluded.contact_phone,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function research_access_private.submit_research_access_request(text, text)
  from public, anon, authenticated;
grant execute on function research_access_private.submit_research_access_request(text, text)
  to authenticated;

-- Keep the privileged implementation outside exposed Data API schemas.
create or replace function public.submit_research_access_request(
  p_display_name text,
  p_contact_phone text default null
)
returns public.research_access_requests
language sql security invoker
set search_path = ''
as $$
  select research_access_private.submit_research_access_request(
    p_display_name, p_contact_phone
  );
$$;
revoke all on function public.submit_research_access_request(text, text)
  from public, anon, authenticated;
grant execute on function public.submit_research_access_request(text, text)
  to authenticated;

-- This is a new private bucket. No real private objects belong in this migration.
insert into storage.buckets (id, name, public, file_size_limit)
values ('research-private', 'research-private', false, 20971520)
on conflict (id) do update set public = false, file_size_limit = 20971520;

-- Proxy-only byte delivery: ordinary clients cannot download or sign objects,
-- even if another pre-existing permissive Storage policy grants broad access.
-- Restrictive policies are AND-ed with all permissive policies. They leave other
-- buckets alone and block this bucket for BOTH anon and authenticated callers.
-- Server service_role bypasses RLS, after the Edge proxy's live user-scoped check.
drop policy if exists research_private_no_direct_select on storage.objects;
create policy research_private_no_direct_select on storage.objects
as restrictive for select to anon, authenticated
using (bucket_id <> 'research-private');

drop policy if exists research_private_no_direct_insert on storage.objects;
create policy research_private_no_direct_insert on storage.objects
as restrictive for insert to anon, authenticated
with check (bucket_id <> 'research-private');

drop policy if exists research_private_no_direct_update on storage.objects;
create policy research_private_no_direct_update on storage.objects
as restrictive for update to anon, authenticated
using (bucket_id <> 'research-private')
with check (bucket_id <> 'research-private');

drop policy if exists research_private_no_direct_delete on storage.objects;
create policy research_private_no_direct_delete on storage.objects
as restrictive for delete to anon, authenticated
using (bucket_id <> 'research-private');

comment on function research_access_private.submit_research_access_request(text, text) is
  'Intentional guarded security-definer helper outside exposed schemas: confirmed caller may update only their own self-reported contact fields; review state is preserved.';
comment on function public.submit_research_access_request(text, text) is
  'Security-invoker RPC forwarding to a narrowly granted private implementation; no caller-controlled user ID or review fields.';
comment on table public.research_materials is
  'Private catalog: row reads require current confirmed-email identity, owner approval, publication, and an active per-material grant.';

-- Only a trusted provider/database owner can bootstrap/change this allowlist.
create table if not exists research_access_private.reviewers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists research_access_private.review_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('approved', 'rejected', 'revoked')),
  material_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table research_access_private.reviewers enable row level security;
alter table research_access_private.review_events enable row level security;
revoke all on research_access_private.reviewers,
  research_access_private.review_events from public, anon, authenticated;

create or replace function research_access_private.is_reviewer()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select research_access_private.has_confirmed_email() and exists (
    select 1 from research_access_private.reviewers r
    where r.user_id = (select auth.uid()) and r.active
  );
$$;

create or replace function research_access_private.require_reviewer()
returns uuid
language plpgsql security definer set search_path = ''
as $$
begin
  if not research_access_private.is_reviewer() then
    raise exception using errcode = '42501', message = 'Reviewer access required';
  end if;
  return auth.uid();
end;
$$;

create or replace function research_access_private.list_research_access_requests()
returns table (
  user_id uuid, email text, display_name text, contact_phone text, status text,
  created_at timestamptz, updated_at timestamptz, reviewed_at timestamptz,
  email_confirmed boolean, material_ids uuid[]
)
language plpgsql security definer set search_path = ''
as $$
begin
  perform research_access_private.require_reviewer();
  return query select r.user_id, u.email::text, r.display_name, r.contact_phone,
    r.status, r.created_at, r.updated_at, r.reviewed_at,
    (u.email is not null and u.email_confirmed_at is not null),
    array(select g.material_id from public.research_material_grants g
      where g.user_id = r.user_id and g.revoked_at is null
        and (g.expires_at is null or g.expires_at > now())
      order by g.material_id)
    from public.research_access_requests r
    join auth.users u on u.id = r.user_id
    order by (r.status = 'pending') desc, r.created_at desc, r.user_id;
end;
$$;

create or replace function research_access_private.list_research_review_materials()
returns table (id uuid, title text, summary text, file_type text)
language plpgsql security definer set search_path = ''
as $$
begin
  perform research_access_private.require_reviewer();
  return query select m.id, m.title, m.summary, m.file_type
    from public.research_materials m
    where m.published and exists (select 1 from storage.objects o
      where o.bucket_id = 'research-private' and o.name = m.storage_path)
    order by m.title, m.id;
end;
$$;

create or replace function research_access_private.review_research_access(
  p_user_id uuid, p_status text, p_material_ids uuid[] default '{}'
)
returns public.research_access_requests
language plpgsql security definer set search_path = ''
as $$
declare
  v_reviewer uuid := research_access_private.require_reviewer();
  v_material_ids uuid[] := coalesce(p_material_ids, '{}'::uuid[]);
  v_result public.research_access_requests;
begin
  if p_user_id is null or p_status is null
     or p_status not in ('approved', 'rejected', 'revoked')
     or array_position(v_material_ids, null) is not null then
    raise exception using errcode = '22023', message = 'Invalid review decision';
  end if;
  -- Serialize reviews/contact edits for this requester; no client-supplied
  -- reviewer UUID, email or metadata is trusted.
  perform 1 from public.research_access_requests r
    where r.user_id = p_user_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Request not found';
  end if;
  if p_status = 'approved' then
    if not exists (select 1 from auth.users u where u.id = p_user_id
      and u.email is not null and u.email_confirmed_at is not null) then
      raise exception using errcode = '22023', message = 'Requester email must be confirmed';
    end if;
    if exists (select 1 from unnest(v_material_ids) wanted(id)
      where not exists (select 1 from public.research_materials m
        where m.id = wanted.id and m.published
          and exists (select 1 from storage.objects o
            where o.bucket_id = 'research-private' and o.name = m.storage_path))) then
      raise exception using errcode = '22023', message = 'Select published uploaded materials';
    end if;
  else
    -- Reject/revoke can never leave or create a live material grant.
    v_material_ids := '{}'::uuid[];
  end if;

  update public.research_access_requests set status = p_status,
    updated_at = now(), reviewed_at = now(), reviewed_by = v_reviewer
    where user_id = p_user_id returning * into v_result;
  update public.research_material_grants set revoked_at = now()
    where user_id = p_user_id and not (material_id = any(v_material_ids));
  if p_status = 'approved' then
    insert into public.research_material_grants
      (user_id, material_id, granted_at, granted_by, expires_at, revoked_at)
      select p_user_id, wanted.id, now(), v_reviewer, null, null
      from (select distinct unnest(v_material_ids) as id) wanted
      on conflict (user_id, material_id) do update set
        granted_at = now(), granted_by = v_reviewer, expires_at = null, revoked_at = null;
  end if;
  insert into research_access_private.review_events (user_id, reviewer_id, status, material_ids)
    values (p_user_id, v_reviewer, p_status, v_material_ids);
  return v_result;
end;
$$;

-- No private helper inherits default PUBLIC execution. Only exact per-user/
-- reviewer surfaces are callable; each guarded definer verifies the caller.
revoke all on function research_access_private.is_reviewer(),
  research_access_private.require_reviewer(),
  research_access_private.list_research_access_requests(),
  research_access_private.list_research_review_materials(),
  research_access_private.review_research_access(uuid, text, uuid[])
  from public, anon, authenticated;
grant execute on function research_access_private.is_reviewer(),
  research_access_private.list_research_access_requests(),
  research_access_private.list_research_review_materials(),
  research_access_private.review_research_access(uuid, text, uuid[]) to authenticated;

create or replace function public.research_is_reviewer()
returns boolean language sql security invoker set search_path = ''
as $$ select research_access_private.is_reviewer(); $$;
create or replace function public.list_research_access_requests()
returns table (
  user_id uuid, email text, display_name text, contact_phone text, status text,
  created_at timestamptz, updated_at timestamptz, reviewed_at timestamptz,
  email_confirmed boolean, material_ids uuid[]
)
language sql security invoker set search_path = ''
as $$ select * from research_access_private.list_research_access_requests(); $$;
create or replace function public.list_research_review_materials()
returns table (id uuid, title text, summary text, file_type text)
language sql security invoker set search_path = ''
as $$ select * from research_access_private.list_research_review_materials(); $$;
create or replace function public.review_research_access(
  p_user_id uuid, p_status text, p_material_ids uuid[] default '{}'
)
returns public.research_access_requests
language sql security invoker set search_path = ''
as $$ select research_access_private.review_research_access(p_user_id, p_status, p_material_ids); $$;
revoke all on function public.research_is_reviewer(),
  public.list_research_access_requests(), public.list_research_review_materials(),
  public.review_research_access(uuid, text, uuid[]) from public, anon, authenticated;
grant execute on function public.research_is_reviewer(),
  public.list_research_access_requests(), public.list_research_review_materials(),
  public.review_research_access(uuid, text, uuid[]) to authenticated;

insert into research_access_private.schema_installations(version)
values ('katabasis-research-access/202611080001') on conflict (version) do nothing;
commit;
