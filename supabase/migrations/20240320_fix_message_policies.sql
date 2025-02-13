-- Drop existing policies
drop policy if exists "Users can view their own project messages" on public.project_messages;
drop policy if exists "Admins can create project messages" on public.project_messages;
drop policy if exists "Users can mark messages as read" on public.project_messages;

-- Allow users to view messages from their own proposals
create policy "Users can view their own project messages"
    on public.project_messages for select
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and proposals.user_id = auth.uid()
        )
        or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- Allow users to create messages for their own proposals
create policy "Users can create messages for their proposals"
    on public.project_messages for insert
    with check (
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and proposals.user_id = auth.uid()
        )
        or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- Allow users to mark messages as read
create policy "Users can mark messages as read"
    on public.project_messages for update
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and proposals.user_id = auth.uid()
        )
    )
    with check (
        is_read = true -- Only allow updating the is_read field
    ); 