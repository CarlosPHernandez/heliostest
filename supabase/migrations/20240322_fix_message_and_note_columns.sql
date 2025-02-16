-- First ensure the author_id columns exist
alter table public.project_messages
  add column if not exists author_id uuid references public.profiles(id) on delete cascade;

alter table public.project_notes
  add column if not exists author_id uuid references public.profiles(id) on delete cascade;

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

-- Drop existing views
drop view if exists public.message_details;
drop view if exists public.note_details;

-- Create new views with explicit columns
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

-- Grant access to the views
grant select on public.message_details to authenticated;
grant select on public.note_details to authenticated; 