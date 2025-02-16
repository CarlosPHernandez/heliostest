-- Drop existing foreign key constraints if they exist
alter table public.project_messages
  drop constraint if exists project_messages_author_id_fkey;

alter table public.project_notes
  drop constraint if exists project_notes_author_id_fkey;

-- Add foreign key constraints referencing profiles table
alter table public.project_messages
  add constraint project_messages_author_id_fkey
  foreign key (author_id)
  references public.profiles(id)
  on delete cascade;

alter table public.project_notes
  add constraint project_notes_author_id_fkey
  foreign key (author_id)
  references public.profiles(id)
  on delete cascade;

-- Drop existing policies
drop policy if exists "Users can view messages" on public.project_messages;
drop policy if exists "Users can view project notes" on public.project_notes;

-- Create updated policies
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

create policy "Users can view project notes"
  on public.project_notes for select
  using (
    author_id = auth.uid() or
    exists (
      select 1 from public.proposals
      where proposals.id = project_notes.proposal_id
      and proposals.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  ); 