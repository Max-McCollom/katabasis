-- TEMPLATE ONLY. Replace UUID, then run through trusted provider-owner SQL editor.
begin;
do $owner_revoke$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  if v_user_id = '00000000-0000-0000-0000-000000000000' then
    raise exception 'Replace the user ID before executing';
  end if;
  update public.research_access_requests set status = 'revoked',
    reviewed_at = now(), updated_at = now(), reviewed_by = null
    where user_id = v_user_id;
  if not found then raise exception 'Requesting user not found'; end if;
  update public.research_material_grants set revoked_at = now()
    where user_id = v_user_id;
end;
$owner_revoke$;
commit;
