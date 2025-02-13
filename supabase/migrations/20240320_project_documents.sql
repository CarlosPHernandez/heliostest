-- Create project_documents table
create table if not exists public.project_documents (
    id uuid default uuid_generate_v4() primary key,
    proposal_id uuid references public.proposals on delete cascade not null,
    name text not null,
    file_url text not null,
    document_type text not null,
    requires_input boolean default false,
    customer_data jsonb,
    status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add status column to proposals if not exists
alter table public.proposals 
add column if not exists status text default 'pending' 
check (status in ('pending', 'in_progress', 'approved', 'completed', 'cancelled'));

alter table public.proposals 
add column if not exists stage text default 'proposal' 
check (stage in ('proposal', 'onboarding', 'design', 'permitting', 'installation', 'completed'));

-- Enable RLS on project_documents
alter table public.project_documents enable row level security;

-- Create policies for project_documents
create policy "Users can view their own documents"
    on public.project_documents for select
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_documents.proposal_id
            and proposals.user_id = auth.uid()
        )
    );

create policy "Admins can view all documents"
    on public.project_documents for select
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

create policy "Admins can insert documents"
    on public.project_documents for insert
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

create policy "Users can update their own documents"
    on public.project_documents for update
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_documents.proposal_id
            and proposals.user_id = auth.uid()
        )
    );

-- Create indexes
create index project_documents_proposal_id_idx on public.project_documents(proposal_id);

-- Add function to update proposal updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for proposals
create trigger set_proposals_updated_at
    before update on public.proposals
    for each row
    execute function public.handle_updated_at();

-- Create trigger for project_documents
create trigger set_project_documents_updated_at
    before update on public.project_documents
    for each row
    execute function public.handle_updated_at(); 