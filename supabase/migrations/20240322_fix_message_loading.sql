-- Drop existing message_details view and its policies
drop view if exists public.message_details;

-- Recreate message_details view with proper columns
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

-- Grant necessary permissions
grant select on public.message_details to authenticated;

-- Drop existing message policies
drop policy if exists "Users can view messages" on public.project_messages;
drop policy if exists "Users can send messages" on public.project_messages;
drop policy if exists "Users can update message status" on public.project_messages;

-- Create simplified policies for project_messages
create policy "Users can view messages"
    on public.project_messages for select
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and (
                proposals.user_id = auth.uid()
                or exists (
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
        exists (
            select 1 from public.profiles
            where profiles.id = author_id
            and profiles.id = auth.uid()
        )
        and
        exists (
            select 1 from public.proposals
            where proposals.id = proposal_id
            and (
                proposals.user_id = auth.uid()
                or exists (
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
            and (
                proposals.user_id = auth.uid()
                or exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.is_admin = true
                )
            )
        )
    )
    with check (
        is_read <> (select is_read from public.project_messages where id = project_messages.id)
    ); 