-- Drop all existing profile policies
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Enable users to see own profile" on profiles;
drop policy if exists "Enable users to update own profile" on profiles;
drop policy if exists "Enable profile creation" on profiles;
drop policy if exists "Allow public email lookup for login" on profiles;
drop policy if exists "Enable admin to see all profiles" on profiles;
drop policy if exists "Enable admin to update all profiles" on profiles;

-- Create simplified policies using is_admin() function
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- Add public policy for email lookup during login
create policy "Allow public email lookup"
  on profiles for select
  using (true); 