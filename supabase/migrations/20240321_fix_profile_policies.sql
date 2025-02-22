-- Drop all existing policies
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Enable users to see own profile" on profiles;
drop policy if exists "Enable users to update own profile" on profiles;
drop policy if exists "Enable profile creation" on profiles;
drop policy if exists "Allow public email lookup for login" on profiles;
drop policy if exists "Enable admin to see all profiles" on profiles;
drop policy if exists "Enable admin to update all profiles" on profiles;
drop policy if exists "Allow new user profile creation" on profiles;
drop policy if exists "Enable read access to own profile" on profiles;
drop policy if exists "Enable update access to own profile" on profiles;
drop policy if exists "Enable insert access to own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Allow authenticated users to read profiles" on profiles;
drop policy if exists "Admins can manage all content" on profiles;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Admins can manage all profiles" on profiles;

-- Drop all project_messages policies
drop policy if exists "Users can view messages for their proposals" on project_messages;
drop policy if exists "Users can create messages for their proposals" on project_messages;
drop policy if exists "Users can send messages" on project_messages;
drop policy if exists "Users can update message status" on project_messages;
drop policy if exists "Admins can manage all messages" on project_messages;
drop policy if exists "Enable users to see own messages" on project_messages;
drop policy if exists "Enable admin to see all messages" on project_messages;

-- Drop all project_notes policies
drop policy if exists "Users can view notes for their proposals" on project_notes;
drop policy if exists "Users can create notes for their proposals" on project_notes;
drop policy if exists "Only admins can insert notes" on project_notes;
drop policy if exists "Admins can manage all notes" on project_notes;

-- Drop all proposals policies
drop policy if exists "Users can view own proposals" on proposals;
drop policy if exists "Users can insert own proposals" on proposals;
drop policy if exists "Users can update own proposals" on proposals;
drop policy if exists "Enable users to see own proposals" on proposals;
drop policy if exists "Enable admin to see all proposals" on proposals;
drop policy if exists "Enable users to create own proposals" on proposals;
drop policy if exists "Enable admin to create proposals" on proposals;
drop policy if exists "Admins can manage all proposals" on proposals;

-- Drop existing functions
drop function if exists is_admin() cascade;
drop function if exists get_auth_user_id() cascade;

-- Create helper functions
create or replace function get_auth_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid()
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = get_auth_user_id()
    and is_admin = true
  );
$$;

-- Enable RLS on all tables
alter table profiles force row level security;
alter table project_messages force row level security;
alter table project_notes force row level security;
alter table proposals force row level security;

-- Profile Policies
create policy "Enable read access to own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Enable update access to own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Enable insert access to own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Enable admin access to all profiles"
  on profiles for all
  using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Project Messages Policies
create policy "Users can view messages for their proposals"
  on project_messages for select
  using (
    exists (
      select 1 from proposals p
      where p.id = project_messages.proposal_id
      and (p.user_id = auth.uid() or exists (
        select 1 from profiles where id = auth.uid() and is_admin = true
      ))
    )
  );

create policy "Users can create messages for their proposals"
  on project_messages for insert
  with check (
    exists (
      select 1 from proposals p
      where p.id = project_messages.proposal_id
      and (p.user_id = auth.uid() or exists (
        select 1 from profiles where id = auth.uid() and is_admin = true
      ))
    )
  );

-- Project Notes Policies
create policy "Users can view notes for their proposals"
  on project_notes for select
  using (
    exists (
      select 1 from proposals p
      where p.id = project_notes.proposal_id
      and (p.user_id = auth.uid() or exists (
        select 1 from profiles where id = auth.uid() and is_admin = true
      ))
    )
  );

-- Proposals Policies
create policy "Users can view own proposals"
  on proposals for select
  using (
    user_id = auth.uid() or exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can insert own proposals"
  on proposals for insert
  with check (
    user_id = auth.uid() or exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can update own proposals"
  on proposals for update
  using (
    user_id = auth.uid() or exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant update, insert on profiles to authenticated;
grant update, insert on proposals to authenticated;
grant update, insert on project_messages to authenticated;
grant all on project_notes to authenticated; 