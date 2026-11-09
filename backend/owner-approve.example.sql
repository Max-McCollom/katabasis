-- TEMPLATE ONLY. Run through the trusted provider-owner SQL editor after review.
-- Replace the zero UUID and empty array. Never expose this operation in browser JS.
begin;
do $owner_review$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000000';
  v_material_ids uuid[] := array[]::uuid[];
begin
  if v_user_id = '00000000-0000-0000-0000-000000000000'
     or cardinality(v_material_ids) = 0 then
    raise exception 'Replace the user and individual material IDs before executing';
  end if;
  perform 1 from public.research_access_requests r
    join auth.users u on u.id = r.user_id
    where r.user_id = v_user_id and u.email_confirmed_at is not null
    for update of r;
  if not found then raise exception 'Confirmed requesting user not found'; end if;
  if exists (
    select 1 from unnest(v_material_ids) as wanted(id)
    where not exists (
      select 1 from public.research_materials m
      join storage.objects o on o.name = m.storage_path
        and o.bucket_id = 'research-private'
      where m.id = wanted.id and m.published
    )
  ) then raise exception 'A selected published material or private object is missing'; end if;

  update public.research_access_requests set status = 'approved',
    reviewed_at = now(), updated_at = now(), reviewed_by = null
    where user_id = v_user_id;
  -- The reviewed set is exhaustive: earlier grants outside it are revoked.
  update public.research_material_grants set revoked_at = now()
    where user_id = v_user_id and not (material_id = any(v_material_ids));
  insert into public.research_material_grants (user_id, material_id, granted_at, expires_at, revoked_at)
    select v_user_id, wanted.id, now(), null, null
    from (select distinct unnest(v_material_ids) as id) wanted
    on conflict (user_id, material_id) do update
      set granted_at = now(), expires_at = null, revoked_at = null;
end;
$owner_review$;
commit;
