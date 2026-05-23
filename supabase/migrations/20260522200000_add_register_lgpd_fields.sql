alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists cpf text,
  add column if not exists lgpd_consent boolean not null default false,
  add column if not exists lgpd_consent_at timestamptz,
  add column if not exists lgpd_terms_version text;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    phone,
    cpf,
    lgpd_consent,
    lgpd_consent_at,
    lgpd_terms_version
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'cpf',
    coalesce((new.raw_user_meta_data->>'lgpd_consent')::boolean, false),
    nullif(new.raw_user_meta_data->>'lgpd_consent_at', '')::timestamptz,
    new.raw_user_meta_data->>'lgpd_terms_version'
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    cpf = excluded.cpf,
    lgpd_consent = excluded.lgpd_consent,
    lgpd_consent_at = excluded.lgpd_consent_at,
    lgpd_terms_version = excluded.lgpd_terms_version;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
