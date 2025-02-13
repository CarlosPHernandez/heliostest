-- Drop existing policies
drop policy if exists "Enable admin to select all profiles" on profiles;
drop policy if exists "Enable admin to update all profiles" on profiles;
drop policy if exists "Enable admin to view all proposals" on proposals;
drop policy if exists "Enable admin to update all proposals" on proposals;

-- Recreate admin function with better performance
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin
     from public.profiles
     where id = auth.uid()
     limit 1),
    false
  );
$$;

-- Add basic profile policies first
create policy "Enable users to view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Enable users to update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Add admin override policies with direct function check
create policy "Enable admin to view all profiles"
  on profiles for select
  using (public.is_admin());

create policy "Enable admin to update all profiles"
  on profiles for update
  using (public.is_admin());

-- Update proposal policies
create policy "Enable admin to view all proposals"
  on proposals for select
  using (public.is_admin());

create policy "Enable admin to update all proposals"
  on proposals for update
  using (public.is_admin());

-- Ensure RLS is enabled
alter table public.profiles force row level security;
alter table public.proposals force row level security; 