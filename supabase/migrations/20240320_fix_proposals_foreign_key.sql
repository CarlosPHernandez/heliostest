-- Drop existing foreign key constraint
alter table public.proposals
  drop constraint if exists proposals_user_id_fkey;

-- Add new foreign key constraint to profiles table
alter table public.proposals
  add constraint proposals_user_id_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;

-- Update RLS policies to use profiles
drop policy if exists "Users can view their own proposals" on public.proposals;
drop policy if exists "Users can create their own proposals" on public.proposals;
drop policy if exists "Users can update their own proposals" on public.proposals;

create policy "Users can view their own proposals"
  on public.proposals for select
  using (
    user_id in (
      select id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Users can create their own proposals"
  on public.proposals for insert
  with check (
    user_id in (
      select id from public.profiles
      where id = auth.uid()
    )
  );

create policy "Users can update their own proposals"
  on public.proposals for update
  using (
    user_id in (
      select id from public.profiles
      where id = auth.uid()
    )
  );

-- Add policy for admins to view all proposals
create policy "Admins can view all proposals"
  on public.proposals for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  ); 