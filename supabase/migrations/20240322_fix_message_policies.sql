-- Create project_messages table if it doesn't exist
create table if not exists public.project_messages (
    id uuid default gen_random_uuid() primary key,
    proposal_id uuid references public.proposals(id) on delete cascade not null,
    author_id uuid references public.profiles(id) on delete cascade not null,
    content text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on project_messages
alter table public.project_messages enable row level security;

-- Drop existing message policies
drop policy if exists "Users can view messages" on public.project_messages;
drop policy if exists "Users can insert messages" on public.project_messages;
drop policy if exists "Users can update message status" on public.project_messages;

-- Create simplified policies for project_messages
create policy "Users can view messages"
  on public.project_messages for select
  using (
    exists (
      select 1 from public.proposals
      where proposals.id = project_messages.proposal_id
      and (
        proposals.user_id = auth.uid() or
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.is_admin = true
        )
      )
    )
  );

create policy "Users can send messages"
  on public.project_messages for insert
  with check (
    auth.uid() = author_id and
    exists (
      select 1 from public.proposals
      where proposals.id = proposal_id
      and (
        proposals.user_id = auth.uid() or
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.is_admin = true
        )
      )
    )
  );

create policy "Users can update message status"
  on public.project_messages for update
  using (
    exists (
      select 1 from public.proposals
      where proposals.id = project_messages.proposal_id
      and proposals.user_id = auth.uid()
    )
  );

-- Drop existing message_details view if it exists
drop view if exists public.message_details;

-- Create message_details view
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

-- Grant access to the view
grant select on public.message_details to authenticated;

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for project_messages
drop trigger if exists set_project_messages_updated_at on public.project_messages;
create trigger set_project_messages_updated_at
    before update on public.project_messages
    for each row
    execute function public.handle_updated_at(); 