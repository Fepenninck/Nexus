create or replace function public.delete_current_user_data()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Usuario nao autenticado';
  end if;

  delete from public.profiles
  where id = current_user_id;

  delete from auth.users
  where id = current_user_id;
end;
$$;

grant execute on function public.delete_current_user_data() to authenticated;
