-- Add admin column to profiles
alter table public.profiles
add column if not exists is_admin boolean default false;

-- Create admin policies
create policy "Enable admin to select all profiles"
  on profiles for select
  using (auth.uid() in (
    select id from public.profiles where is_admin = true
  ));

create policy "Enable admin to update all profiles"
  on profiles for update
  using (auth.uid() in (
    select id from public.profiles where is_admin = true
  ));

-- Create admin functions
create or replace function public.is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and is_admin = true
  );
$$;

-- Update proposal policies to allow admin access
create policy "Enable admin to view all proposals"
  on public.proposals for select
  using (auth.uid() in (
    select id from public.profiles where is_admin = true
  ));

create policy "Enable admin to update all proposals"
  on public.proposals for update
  using (auth.uid() in (
    select id from public.profiles where is_admin = true
  )); 