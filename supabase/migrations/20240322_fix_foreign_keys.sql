-- Drop existing foreign key constraints if they exist
alter table public.proposals
  drop constraint if exists proposals_user_id_fkey;

alter table public.project_messages
  drop constraint if exists project_messages_author_id_fkey;

-- Add foreign key constraints referencing profiles table
alter table public.proposals
  add constraint proposals_user_id_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;

alter table public.project_messages
  add constraint project_messages_author_id_fkey
  foreign key (author_id)
  references public.profiles(id)
  on delete cascade;

-- Update the join queries in the RLS policies
drop policy if exists "Users can view their own proposals" on public.proposals;
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

drop policy if exists "Users can view messages" on public.project_messages;
create policy "Users can view messages"
  on public.project_messages for select
  using (
    author_id = auth.uid() or
    exists (
      select 1 from public.proposals
      where proposals.id = project_messages.proposal_id
      and proposals.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  ); 