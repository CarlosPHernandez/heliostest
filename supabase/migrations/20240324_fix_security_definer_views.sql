-- Drop existing views
drop view if exists public.message_details;
drop view if exists public.note_details;

-- Create message_details view with SECURITY INVOKER (default)
create view public.message_details as
select 
  m.id,
  m.content,
  m.created_at,
  m.is_read,
  m.proposal_id,
  m.author_id,
  p.full_name as author_name,
  p.is_admin as author_is_admin
from public.project_messages m
left join public.profiles p on p.id = m.author_id;

-- Create note_details view with SECURITY INVOKER (default)
create view public.note_details as
select 
  n.id,
  n.content,
  n.created_at,
  n.proposal_id,
  n.author_id,
  p.full_name as author_name,
  p.is_admin as author_is_admin
from public.project_notes n
left join public.profiles p on p.id = n.author_id;

-- Grant access to authenticated users
grant select on public.message_details to authenticated;
grant select on public.note_details to authenticated;

-- Create RLS policies for the views
alter table public.project_messages enable row level security;
alter table public.project_notes enable row level security;

-- Policy for project_messages: Users can view messages for proposals they own or if they're admin
create policy "Users can view their own project messages or if admin"
  on public.project_messages
  for select
  using (
    exists (
      select 1 from public.proposals p
      where p.id = project_messages.proposal_id
      and (
        p.user_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and is_admin = true
        )
      )
    )
  );

-- Policy for project_notes: Users can view notes for proposals they own or if they're admin
create policy "Users can view their own project notes or if admin"
  on public.project_notes
  for select
  using (
    exists (
      select 1 from public.proposals p
      where p.id = project_notes.proposal_id
      and (
        p.user_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and is_admin = true
        )
      )
    )
  );

-- Policy for inserting messages: Users can insert messages for their own proposals or if admin
create policy "Users can insert messages for their own proposals or if admin"
  on public.project_messages
  for insert
  with check (
    exists (
      select 1 from public.proposals p
      where p.id = project_messages.proposal_id
      and (
        p.user_id = auth.uid()
        or exists (
          select 1 from public.profiles
          where id = auth.uid()
          and is_admin = true
        )
      )
    )
  );

-- Policy for inserting notes: Only admins can insert notes
create policy "Only admins can insert notes"
  on public.project_notes
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  ); 