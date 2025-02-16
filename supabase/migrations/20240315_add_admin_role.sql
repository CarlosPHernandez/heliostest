-- Add admin column to profiles
alter table public.profiles
add column if not exists is_admin boolean default false,
add column if not exists phone text;

-- Drop ALL existing policies (comprehensive list)
drop policy if exists "Enable admin to select all profiles" on profiles;
drop policy if exists "Enable admin to update all profiles" on profiles;
drop policy if exists "Enable insert for authenticated users only" on profiles;
drop policy if exists "Enable users to update own profile" on profiles;
drop policy if exists "Enable admin to insert profiles" on profiles;
drop policy if exists "Enable profile creation" on profiles;
drop policy if exists "Enable users to see own profile" on profiles;
drop policy if exists "Enable users to create own profile" on profiles;
drop policy if exists "Enable users to delete own profile" on profiles;
drop policy if exists "Enable admin to delete profiles" on profiles;
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Allow public email lookup for login" on profiles;

-- First disable RLS to ensure clean slate
alter table profiles disable row level security;

-- Basic profile policies with simplified admin check
create policy "Enable users to see own profile"
  on profiles for select
  using (auth.uid() = id OR (select is_admin from profiles where id = auth.uid()));

create policy "Enable users to update own profile"
  on profiles for update
  using (auth.uid() = id OR (select is_admin from profiles where id = auth.uid()));

create policy "Enable profile creation"
  on profiles for insert
  with check (
    auth.uid() = id OR
    (select is_admin from profiles where id = auth.uid())
  );

-- Add public policy for email lookup during login
create policy "Allow public email lookup for login"
  on profiles for select
  using (true);

-- Re-enable RLS
alter table profiles enable row level security;

-- Create admin function
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

-- Create trigger to automatically create profile on signup
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

-- Project messages policies
-- First disable RLS
alter table project_messages disable row level security;

-- Drop existing policies
drop policy if exists "Enable users to see own messages" on project_messages;
drop policy if exists "Enable admin to see all messages" on project_messages;
drop policy if exists "Enable users to create own messages" on project_messages;
drop policy if exists "Enable users to update own messages" on project_messages;
drop policy if exists "Enable users to delete own messages" on project_messages;

create policy "Enable users to see own messages"
  on project_messages for select
  using (
    author_id = auth.uid() OR
    exists (
      select 1 from proposals
      where proposals.id = project_messages.proposal_id
      and proposals.user_id = auth.uid()
    ) OR
    (select is_admin from profiles where id = auth.uid())
  );

-- Re-enable RLS
alter table project_messages enable row level security;

-- Proposal policies
-- First disable RLS
alter table proposals disable row level security;

-- Drop existing policies
drop policy if exists "Enable users to see own proposals" on proposals;
drop policy if exists "Enable admin to see all proposals" on proposals;
drop policy if exists "Enable users to create own proposals" on proposals;
drop policy if exists "Enable admin to create proposals" on proposals;
drop policy if exists "Enable users to update own proposals" on proposals;
drop policy if exists "Enable users to delete own proposals" on proposals;

create policy "Enable users to see own proposals"
  on proposals for select
  using (user_id = auth.uid() OR (select is_admin from profiles where id = auth.uid()));

create policy "Enable users to create proposals"
  on proposals for insert
  with check (user_id = auth.uid() OR (select is_admin from profiles where id = auth.uid()));

-- Re-enable RLS
alter table proposals enable row level security;

-- Set up initial admin user if not exists (replace with your admin email)
insert into public.profiles (id, email, is_admin)
select id, email, true
from auth.users
where email = 'carlosphernandez2020@gmail.com'  -- Replace with your admin email
on conflict (id) do update
set is_admin = true;

-- First, get the role_id for admin
WITH admin_role AS (
  SELECT id FROM roles WHERE name = 'admin'
),
user_info AS (
  SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com'
)
INSERT INTO user_roles (user_id, role_id)
SELECT user_info.id, admin_role.id
FROM user_info, admin_role
ON CONFLICT (user_id, role_id) DO NOTHING; 