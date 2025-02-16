-- Check and create necessary tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  phone text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.proposals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  address text not null,
  system_size numeric not null,
  total_price numeric not null,
  number_of_panels integer not null,
  package_type text check (package_type in ('standard', 'premium', 'elite')),
  payment_type text check (payment_type in ('cash', 'finance', 'lease')),
  include_battery boolean default false,
  battery_type text,
  battery_count integer,
  status text default 'pending',
  stage text default 'onboarding',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.project_messages (
  id uuid default gen_random_uuid() primary key,
  proposal_id uuid references public.proposals(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create updated_at triggers for all tables
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

drop trigger if exists update_proposals_updated_at on proposals;
create trigger update_proposals_updated_at
  before update on proposals
  for each row
  execute function update_updated_at();

drop trigger if exists update_project_messages_updated_at on project_messages;
create trigger update_project_messages_updated_at
  before update on project_messages
  for each row
  execute function update_updated_at();

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table public.project_messages enable row level security;

-- Drop all existing policies to avoid conflicts
drop policy if exists "Enable users to see own profile" on profiles;
drop policy if exists "Enable users to update own profile" on profiles;
drop policy if exists "Enable admin to see all profiles" on profiles;
drop policy if exists "Enable admin to update all profiles" on profiles;
drop policy if exists "Enable profile creation" on profiles;
drop policy if exists "Allow public email lookup for login" on profiles;

drop policy if exists "Enable users to see own proposals" on proposals;
drop policy if exists "Enable admin to see all proposals" on proposals;
drop policy if exists "Enable users to create own proposals" on proposals;
drop policy if exists "Enable admin to create proposals" on proposals;

drop policy if exists "Enable users to see own messages" on project_messages;
drop policy if exists "Enable admin to see all messages" on project_messages;

-- Create comprehensive policies
-- Profiles policies
create policy "Enable users to see own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Enable users to update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Enable admin to see all profiles"
  on profiles for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ));

create policy "Enable admin to update all profiles"
  on profiles for update
  using (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ));

create policy "Enable profile creation"
  on profiles for insert
  with check (
    auth.uid() = id OR
    exists (
      select 1 from profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Allow public email lookup for login"
  on profiles for select
  using (true);

-- Proposals policies
create policy "Enable users to see own proposals"
  on proposals for select
  using (user_id = auth.uid());

create policy "Enable admin to see all proposals"
  on proposals for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ));

create policy "Enable users to create own proposals"
  on proposals for insert
  with check (user_id = auth.uid());

create policy "Enable admin to create proposals"
  on proposals for insert
  with check (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ));

-- Project messages policies
create policy "Enable users to see own messages"
  on project_messages for select
  using (
    author_id = auth.uid() OR
    exists (
      select 1 from proposals
      where proposals.id = project_messages.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

create policy "Enable admin to see all messages"
  on project_messages for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  ));

-- Create functions
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Create trigger for automatic profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end;
$$;

-- Drop if exists first
drop trigger if exists on_auth_user_created on auth.users;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up initial admin user
insert into public.profiles (id, email, is_admin)
select id, email, true
from auth.users
where email = 'carlosphernandez2020@gmail.com'  -- Replace with your admin email
on conflict (id) do update
set is_admin = true; 