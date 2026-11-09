-- TEMPLATE: trusted provider SQL Editor only. Replace UUID after independently
-- confirming this is the owner's real, email-confirmed Auth account.
-- Email strings and browser metadata NEVER authorize the owner panel.
begin;
do $bootstrap$
declare
  v_owner_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  if v_owner_id = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Replace the confirmed owner Auth UUID before executing';
  end if;
  if not exists (select 1 from auth.users u where u.id = v_owner_id
    and u.email is not null and u.email_confirmed_at is not null) then
    raise exception 'Confirmed owner Auth identity not found';
  end if;
  insert into research_access_private.reviewers (user_id, active)
    values (v_owner_id, true)
    on conflict (user_id) do update set active = true;
end;
$bootstrap$;
commit;

-- To disable an owner panel later, use the trusted SQL Editor with the same
-- verified UUID: update research_access_private.reviewers set active = false
-- where user_id = '<confirmed UUID>'::uuid;
