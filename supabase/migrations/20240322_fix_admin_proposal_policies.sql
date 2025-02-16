-- Drop existing proposal policies
drop policy if exists "Users can view their own proposals" on public.proposals;
drop policy if exists "Users can create their own proposals" on public.proposals;
drop policy if exists "Users can update their own proposals" on public.proposals;
drop policy if exists "Admins can view all proposals" on public.proposals;
drop policy if exists "Enable users to see own proposals" on public.proposals;
drop policy if exists "Enable admin to see all proposals" on public.proposals;
drop policy if exists "Enable users to create own proposals" on public.proposals;
drop policy if exists "Enable admin to create proposals" on public.proposals;

-- Create simplified policies
create policy "Users can view their own proposals"
  on public.proposals for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Users can create proposals"
  on public.proposals for insert
  with check (
    user_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Users can update their own proposals"
  on public.proposals for update
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

-- Ensure RLS is enabled
alter table public.proposals force row level security; 