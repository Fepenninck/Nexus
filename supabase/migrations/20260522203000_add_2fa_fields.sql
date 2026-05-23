alter table public.profiles
  add column if not exists totp_secret text,
  add column if not exists totp_enabled boolean not null default false;
