-- Create project_notes table for internal admin notes
create table if not exists public.project_notes (
    id uuid default uuid_generate_v4() primary key,
    proposal_id uuid references public.proposals on delete cascade not null,
    author_id uuid references public.profiles on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create project_messages table for customer-facing messages
create table if not exists public.project_messages (
    id uuid default uuid_generate_v4() primary key,
    proposal_id uuid references public.proposals on delete cascade not null,
    author_id uuid references public.profiles on delete cascade not null,
    content text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.project_notes enable row level security;
alter table public.project_messages enable row level security;

-- RLS policies for project_notes (admin only)
create policy "Admins can view project notes"
    on public.project_notes for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Admins can create project notes"
    on public.project_notes for insert
    with check (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Admins can update project notes"
    on public.project_notes for update
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Admins can delete project notes"
    on public.project_notes for delete
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- RLS policies for project_messages
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

create policy "Admins can create project messages"
    on public.project_messages for insert
    with check (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

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

-- Create indexes for better performance
create index project_notes_proposal_id_idx on public.project_notes(proposal_id);
create index project_messages_proposal_id_idx on public.project_messages(proposal_id);
create index project_messages_is_read_idx on public.project_messages(is_read);

-- Add updated_at triggers
create trigger set_project_notes_updated_at
    before update on public.project_notes
    for each row
    execute function public.handle_updated_at();

create trigger set_project_messages_updated_at
    before update on public.project_messages
    for each row
    execute function public.handle_updated_at(); 