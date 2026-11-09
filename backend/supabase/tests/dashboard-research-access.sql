-- GENERATED DASHBOARD ACCEPTANCE RUNNER — run AFTER the reviewed migration.
-- Single SQL Editor execution, database-owner role, entire file (no selection).
-- All identity/object/policy fixtures are synthetic and in one rollback transaction.
-- An unexpected SQL error or failed TAP assertion aborts the query: do not ignore it.
-- If a failed run leaves a transaction open, issue ROLLBACK before retrying.
-- No Auth HTTP, SMTP, file-byte or Edge endpoint behavior is tested here.
-- Run in the owner's fresh Supabase project after the reviewed migration, before
-- opening registration/sharing real files; all fixtures/policies roll back.
-- SQL/RLS tests use synthetic identities and object metadata, not private files.
-- These tests do NOT prove Auth HTTP flows, Edge runtime, CDN behavior or SMTP.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

-- Capture TAP output in one disposable session-local table, including role tests.
create temporary table research_test_tap (id bigserial primary key, result text not null);
grant insert, select on pg_temp.research_test_tap to anon, authenticated;
grant usage on sequence pg_temp.research_test_tap_id_seq to anon, authenticated;
do $temp_access$
begin
  execute format('grant usage on schema %I to anon, authenticated',
    pg_my_temp_schema()::regnamespace::text);
end;
$temp_access$;

select no_plan();

insert into auth.users (id, email, email_confirmed_at, phone_confirmed_at)
values
  ('10000000-0000-0000-0000-000000000001', 'research-alice@example.invalid', now(), null),
  ('10000000-0000-0000-0000-000000000002', 'research-bob@example.invalid', now(), null),
  ('10000000-0000-0000-0000-000000000003', 'research-phone-only@example.invalid', null, now());

insert into public.research_materials (id, title, storage_path, published)
values
  ('20000000-0000-0000-0000-000000000001', 'Synthetic material A', 'tests/a.pdf', true),
  ('20000000-0000-0000-0000-000000000002', 'Synthetic material B', 'tests/b.pdf', true),
  ('20000000-0000-0000-0000-000000000003', 'Synthetic unpublished', 'tests/draft.pdf', false);
insert into storage.objects (bucket_id, name)
values ('research-private', 'tests/a.pdf'), ('research-private', 'tests/b.pdf');

-- Deliberately introduce broad permissive policies to prove the restrictive
-- bucket guard remains effective. All fixtures/permissions roll back below.
grant select, insert, update, delete on storage.objects to anon, authenticated;
create policy research_test_hostile_permissive on storage.objects
for all to anon, authenticated using (true) with check (true);

insert into pg_temp.research_test_tap(result) select ok((select not public from storage.buckets where id = 'research-private'),
  'research bucket is private');
insert into pg_temp.research_test_tap(result) select ok((select bool_and(relrowsecurity) from pg_class
  where oid in ('public.research_access_requests'::regclass,
    'public.research_materials'::regclass, 'public.research_material_grants'::regclass)),
  'RLS enabled on every application table');
insert into pg_temp.research_test_tap(result) select ok(not has_function_privilege('anon',
  'public.submit_research_access_request(text,text)', 'execute'),
  'anonymous cannot execute public request RPC');
insert into pg_temp.research_test_tap(result) select ok(not has_function_privilege('anon',
  'research_access_private.submit_research_access_request(text,text)', 'execute'),
  'anonymous cannot execute private request helper');
insert into pg_temp.research_test_tap(result) select ok(not (select prosecdef from pg_proc
  where oid = 'public.submit_research_access_request(text,text)'::regprocedure),
  'exposed RPC is security invoker');

set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{"role":"anon"}';
insert into pg_temp.research_test_tap(result) select throws_ok($$ select * from public.research_materials $$, '42501', null,
  'anonymous cannot read catalog');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.submit_research_access_request('Anonymous', null) $$,
  '42501', null, 'anonymous cannot submit request');
insert into pg_temp.research_test_tap(result) select is((select count(*) from storage.objects where bucket_id = 'research-private'), 0::bigint,
  'anonymous cannot read private object metadata despite permissive policy');

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","email":"research-alice@example.invalid","user_metadata":{"approved":true},"app_metadata":{"approved":true}}';
insert into pg_temp.research_test_tap(result) select is((public.submit_research_access_request('  Alice  ', '  +1 212 555 0100  ')).status,
  'pending', 'confirmed signup creates pending request; metadata does not approve');
insert into pg_temp.research_test_tap(result) select is((select display_name from public.research_access_requests), 'Alice',
  'request trims display name');
insert into pg_temp.research_test_tap(result) select is((select contact_phone from public.research_access_requests), '+1 212 555 0100',
  'optional phone is self-reported contact only');
insert into pg_temp.research_test_tap(result) select throws_ok($$ insert into public.research_access_requests
  (user_id, status, display_name) values
  ('10000000-0000-0000-0000-000000000002', 'approved', 'Spoof') $$,
  '42501', null, 'client cannot insert another user or set approval');
insert into pg_temp.research_test_tap(result) select throws_ok($$ update public.research_access_requests set status = 'approved' $$,
  '42501', null, 'client cannot update approval directly');
insert into pg_temp.research_test_tap(result) select throws_ok($$ insert into public.research_material_grants (user_id, material_id)
  values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001') $$,
  '42501', null, 'client cannot grant a material');
insert into pg_temp.research_test_tap(result) select throws_ok($$ insert into public.research_materials (title, storage_path)
  values ('Spoof', 'spoof.pdf') $$,
  '42501', null, 'client cannot publish or replace materials');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'pending user sees no materials');
insert into pg_temp.research_test_tap(result) select is((select count(*) from storage.objects where bucket_id = 'research-private'), 0::bigint,
  'pending user cannot read private storage metadata');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.submit_research_access_request(repeat('x', 161), null) $$,
  '22023', null, 'oversized display name rejected');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.submit_research_access_request('Alice', repeat('1', 41)) $$,
  '22023', null, 'oversized phone rejected');

reset role;
insert into public.research_access_requests (user_id, status, display_name)
values ('10000000-0000-0000-0000-000000000002', 'approved', 'Bob');
insert into public.research_material_grants (user_id, material_id)
values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002');

set local role authenticated;
-- Same Alice JWT; no refresh or claim change is needed after database updates.
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_access_requests), 1::bigint,
  'user sees only own request');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_access_requests
  where user_id = '10000000-0000-0000-0000-000000000002'), 0::bigint,
  'other user contact/request data hidden');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_material_grants), 0::bigint,
  'other user grants hidden');

reset role;
update public.research_access_requests set status = 'approved', reviewed_at = now()
where user_id = '10000000-0000-0000-0000-000000000001';
insert into public.research_material_grants (user_id, material_id)
values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003');

set local role authenticated;
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 1::bigint,
  'approved user sees only published material with an active individual grant');
insert into pg_temp.research_test_tap(result) select is((select title from public.research_materials), 'Synthetic material A',
  'per-material grant selects correct material');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials
  where id = '20000000-0000-0000-0000-000000000002'), 0::bigint,
  'approved user A cannot enumerate material granted to user B');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials
  where id = '20000000-0000-0000-0000-000000000003'), 0::bigint,
  'unpublished material hidden even with individual grant');
insert into pg_temp.research_test_tap(result) select is((select count(*) from storage.objects where bucket_id = 'research-private'), 0::bigint,
  'approved user cannot directly select Storage rows; proxy required');
insert into pg_temp.research_test_tap(result) select throws_ok($$ insert into storage.objects (bucket_id, name)
  values ('research-private', 'tests/client-upload.pdf') $$,
  '42501', null, 'approved user cannot upload despite permissive policy');
insert into pg_temp.research_test_tap(result) select is_empty($$ update storage.objects set name = 'tests/replaced.pdf'
  where bucket_id = 'research-private' returning id $$,
  'approved user cannot overwrite/move private objects');
insert into pg_temp.research_test_tap(result) select lives_ok($$ do $secure_delete$
declare
  v_deleted bigint;
begin
  begin
    delete from storage.objects where bucket_id = 'research-private'
      and name in ('tests/a.pdf', 'tests/b.pdf');
    get diagnostics v_deleted = row_count;
    if v_deleted <> 0 then
      raise exception using errcode = 'P0001', message = 'Private object DELETE unexpectedly removed rows';
    end if;
  exception when insufficient_privilege then
    -- New Supabase storage.protect_delete() denies direct SQL DELETE before RLS.
    -- Both this 42501 guard and a zero-row RLS result are secure outcomes.
    null;
  end;
end;
$secure_delete$ $$,
  'approved user DELETE is blocked by RLS or provider 42501 storage guard');
insert into pg_temp.research_test_tap(result) select is((public.submit_research_access_request('Alice updated', null)).status,
  'approved', 'contact update preserves approval status');

reset role;
update public.research_material_grants set revoked_at = now()
where user_id = '10000000-0000-0000-0000-000000000001'
  and material_id = '20000000-0000-0000-0000-000000000001';
set local role authenticated;
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'revoked individual grant denies next catalog query with same JWT');

reset role;
update public.research_material_grants set revoked_at = null, expires_at = now() - interval '1 second'
where user_id = '10000000-0000-0000-0000-000000000001'
  and material_id = '20000000-0000-0000-0000-000000000001';
set local role authenticated;
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'expired individual grant denied');

reset role;
update public.research_material_grants set expires_at = null
where user_id = '10000000-0000-0000-0000-000000000001';
update public.research_access_requests set status = 'revoked'
where user_id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'revoked account denies all material reads despite active grant');
insert into pg_temp.research_test_tap(result) select is((public.submit_research_access_request('Alice retry', null)).status,
  'revoked', 'resubmitting contact does not reopen revoked account');

reset role;
update public.research_access_requests set status = 'rejected'
where user_id = '10000000-0000-0000-0000-000000000001';
set local role authenticated;
insert into pg_temp.research_test_tap(result) select is((public.submit_research_access_request('Alice again', null)).status,
  'rejected', 'resubmitting contact does not reopen rejected account');

-- A phone-confirmed identity with unconfirmed email cannot submit or gain access,
-- even when the database contains an incorrectly preapproved request/grant.
reset role;
insert into public.research_access_requests (user_id, status, display_name)
values ('10000000-0000-0000-0000-000000000003', 'approved', 'Phone-only identity');
insert into public.research_material_grants (user_id, material_id)
values ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001');
set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","email_verified":true,"user_metadata":{"email_verified":true,"approved":true}}';
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.submit_research_access_request('Phone only', null) $$,
  '42501', null, 'phone/JWT metadata confirmation cannot replace DB email confirmation');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'unconfirmed email denied even with approval/grant');

-- Switch identity without resetting schema/grants; cross-user isolation still holds.
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((select title from public.research_materials), 'Synthetic material B',
  'second approved identity sees its own distinct material');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_access_requests
  where user_id = '10000000-0000-0000-0000-000000000001'), 0::bigint,
  'second identity cannot read first identity request');

reset role;
-- Owner-panel tests: review permissions are based on a confirmed Auth UUID in
-- the private allowlist, not on request approval, email strings or JWT metadata.
insert into auth.users (id, email, email_confirmed_at)
values
  ('10000000-0000-0000-0000-000000000004', 'research-owner@example.invalid', now()),
  ('10000000-0000-0000-0000-000000000005', 'research-disabled-owner@example.invalid', now());
insert into research_access_private.reviewers (user_id, active)
values
  ('10000000-0000-0000-0000-000000000004', true),
  ('10000000-0000-0000-0000-000000000005', false),
  ('10000000-0000-0000-0000-000000000003', true);
insert into pg_temp.research_test_tap(result) select ok(not has_function_privilege('anon',
  'public.review_research_access(uuid,text,uuid[])', 'execute'),
  'anonymous cannot invoke owner review RPC');
insert into pg_temp.research_test_tap(result) select ok(not has_function_privilege('anon',
  'public.list_research_access_requests()', 'execute'),
  'anonymous cannot invoke owner request-list RPC');

set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","user_metadata":{"reviewer":true,"is_owner":true},"app_metadata":{"reviewer":true}}';
insert into pg_temp.research_test_tap(result) select is(public.research_is_reviewer(), false,
  'ordinary user cannot become reviewer through metadata or approved request');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select * from public.list_research_access_requests() $$,
  '42501', null, 'ordinary user cannot list other requesters or email/phone data');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select * from public.list_research_review_materials() $$,
  '42501', null, 'ordinary user cannot list owner material choices');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000001', 'approved', '{}') $$,
  '42501', null, 'ordinary user cannot self-approve via reviewer RPC');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000002', 'revoked', '{}') $$,
  '42501', null, 'ordinary user cannot change another account review');
insert into pg_temp.research_test_tap(result) select throws_ok($$ insert into research_access_private.reviewers(user_id, active)
  values ('10000000-0000-0000-0000-000000000001', true) $$,
  '42501', null, 'ordinary user cannot write reviewer allowlist');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select * from research_access_private.reviewers $$,
  '42501', null, 'ordinary user cannot read reviewer allowlist');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is(public.research_is_reviewer(), true, 'confirmed active allowlisted UUID is reviewer');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.list_research_access_requests()
  where user_id in ('10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003')), 3::bigint,
  'reviewer can list requester accounts without exposing all Auth users');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.list_research_review_materials()
  where id in ('20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003')), 2::bigint,
  'reviewer choices include only published uploaded private materials');
insert into pg_temp.research_test_tap(result) select is((public.review_research_access('10000000-0000-0000-0000-000000000001',
  'approved', array['20000000-0000-0000-0000-000000000001'::uuid])).status,
  'approved', 'reviewer can approve selected individual material');
insert into pg_temp.research_test_tap(result) select is((select material_ids from public.list_research_access_requests()
  where user_id = '10000000-0000-0000-0000-000000000001'),
  array['20000000-0000-0000-0000-000000000001'::uuid],
  'owner list returns actual active grant IDs for preselection');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((select title from public.research_materials), 'Synthetic material A',
  'reviewer approval makes only selected file visible to requester');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_access_requests
  where user_id = '10000000-0000-0000-0000-000000000002'), 0::bigint,
  'approval does not grant other requester contact access');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((public.review_research_access('10000000-0000-0000-0000-000000000001',
  'approved', array['20000000-0000-0000-0000-000000000002'::uuid])).reviewed_by,
  '10000000-0000-0000-0000-000000000004'::uuid,
  'reviewer identity is server-derived and recorded');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000001', 'approved',
  array['20000000-0000-0000-0000-000000000099'::uuid]) $$,
  '22023', null, 'unknown material is rejected before any review mutation');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000001', 'approved',
  array['20000000-0000-0000-0000-000000000003'::uuid]) $$,
  '22023', null, 'unpublished material cannot be granted by panel');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000003', 'approved', '{}') $$,
  '22023', null, 'reviewer cannot approve unconfirmed email identity');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000001', 'pending', '{}') $$,
  '22023', null, 'reviewer cannot submit arbitrary status');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000099', 'revoked', '{}') $$,
  'P0002', null, 'review requires an existing account request');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((select title from public.research_materials), 'Synthetic material B',
  're-approval replaces old file grants and failed actions preserve current grants');
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials
  where id = '20000000-0000-0000-0000-000000000001'), 0::bigint,
  'unselected prior material grant is revoked');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((public.review_research_access('10000000-0000-0000-0000-000000000001',
  'approved', '{}')).status, 'approved',
  'reviewer may approve account with zero file access');
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'empty reviewed selection grants no files');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((public.review_research_access('10000000-0000-0000-0000-000000000001',
  'rejected', array['20000000-0000-0000-0000-000000000001'::uuid])).status,
  'rejected', 'reject action ignores supplied grants');
insert into pg_temp.research_test_tap(result) select is((select material_ids from public.list_research_access_requests()
  where user_id = '10000000-0000-0000-0000-000000000001'), '{}'::uuid[],
  'rejection leaves no active grants');
insert into pg_temp.research_test_tap(result) select is((public.review_research_access('10000000-0000-0000-0000-000000000002',
  'revoked', '{}')).status, 'revoked', 'reviewer can revoke another approved account');
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is((select count(*) from public.research_materials), 0::bigint,
  'revoked target loses catalog access without new JWT');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000005","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is(public.research_is_reviewer(), false, 'inactive allowlisted owner has no reviewer authority');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select * from public.list_research_access_requests() $$,
  '42501', null, 'inactive owner cannot list requester data');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000001', 'approved', '{}') $$,
  '42501', null, 'inactive owner cannot review');

set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is(public.research_is_reviewer(), false,
  'unconfirmed email owner allowlist entry is insufficient');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select * from public.list_research_access_requests() $$,
  '42501', null, 'phone-only confirmation cannot unlock owner panel');

reset role;
insert into pg_temp.research_test_tap(result) select is((select count(*) from research_access_private.review_events
  where user_id in ('10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002')), 5::bigint,
  'only successful review actions create private audit events');
update research_access_private.reviewers set active = false
where user_id = '10000000-0000-0000-0000-000000000004';
set local role authenticated;
set local request.jwt.claims = '{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}';
insert into pg_temp.research_test_tap(result) select is(public.research_is_reviewer(), false,
  'owner deactivation applies to same still-valid identity immediately on next call');
insert into pg_temp.research_test_tap(result) select throws_ok($$ select public.review_research_access(
  '10000000-0000-0000-0000-000000000001', 'approved', '{}') $$,
  '42501', null, 'deactivated owner cannot use old JWT to review');

reset role;
insert into pg_temp.research_test_tap(result) select * from finish();
-- SQL Editor must ERROR on any failed assertion; TAP 'not ok' is not SQL success.
do $assert_tap$
declare
  v_checks integer;
  v_failed integer;
  v_diagnostics text;
begin
  select count(*) into v_checks from pg_temp.research_test_tap
    where result ~ '^(not )?ok [0-9]+';
  select count(*), string_agg(result, E'\n' order by id)
    into v_failed, v_diagnostics from pg_temp.research_test_tap
    where result like 'not ok %';
  if v_checks <> 78 or v_failed <> 0 then
    raise exception using errcode = 'P0001', message = format(
      'Research access acceptance FAILED: %s failed; %s/%s assertions executed. %s',
      v_failed, v_checks, 78, left(coalesce(v_diagnostics, ''), 3000));
  end if;
end;
$assert_tap$;
rollback;
select 'PASS: 78/78 database/RLS assertions; synthetic fixtures and temporary policies rolled back.' as result;
