create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  company text,
  plan text default 'Vanta Core',
  role text default 'member' check (role in ('admin', 'member')),
  access_status text default 'paused' check (access_status in ('active', 'paused', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own basic profile" on public.profiles;
create policy "Users can update own basic profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    company,
    plan,
    access_status,
    role
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'company', ''),
    coalesce(new.raw_user_meta_data->>'plan', 'Vanta Core'),
    coalesce(new.raw_user_meta_data->>'access_status', 'paused'),
    'member'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    company = coalesce(nullif(excluded.company, ''), public.profiles.company),
    plan = coalesce(nullif(excluded.plan, ''), public.profiles.plan),
    access_status = coalesce(nullif(excluded.access_status, ''), public.profiles.access_status),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Depois de criar seu usuario admin no Supabase Auth, rode:
-- update public.profiles set role = 'admin' where email = 'arthurbarris4@gmail.com';
