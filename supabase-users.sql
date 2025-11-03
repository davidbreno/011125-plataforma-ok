-- public.users table synced with auth.users
-- Stores profile info and the app role (doctor/receptionist/admin)

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  user_role text check (user_role in ('doctor','receptionist','admin')),
  specialization text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_set_updated_at on public.users;
create trigger trg_users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

-- function to handle new auth users and upsert into public.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, user_role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data ->> 'full_name'), new.email),
    null
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name;
  return new;
end;
$$;

-- attach to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- RLS policies
alter table public.users enable row level security;

-- allow anyone authenticated to read profiles
create policy if not exists users_select_authenticated
  on public.users for select to authenticated
  using (true);

-- allow users to insert/update only their own row
create policy if not exists users_insert_own
  on public.users for insert to authenticated
  with check (id = auth.uid());

create policy if not exists users_update_own
  on public.users for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
