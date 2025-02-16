-- Create project_documents table if it doesn't exist
create table if not exists public.project_documents (
    id uuid default gen_random_uuid() primary key,
    proposal_id uuid references public.proposals(id) on delete cascade not null,
    name text not null,
    file_url text not null,
    document_type text not null,
    requires_input boolean default false,
    customer_data jsonb,
    status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on project_documents
alter table public.project_documents enable row level security;

-- Drop existing document policies
drop policy if exists "Users can view their own documents" on public.project_documents;
drop policy if exists "Admins can view all documents" on public.project_documents;
drop policy if exists "Admins can insert documents" on public.project_documents;
drop policy if exists "Users can update their own documents" on public.project_documents;

-- Create simplified policies for project_documents
create policy "Users can view documents"
  on public.project_documents for select
  using (
    exists (
      select 1 from public.proposals
      where proposals.id = project_documents.proposal_id
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

create policy "Admins can manage documents"
  on public.project_documents for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Drop existing storage policies
drop policy if exists "Users can upload their own documents" on storage.objects;
drop policy if exists "Users can view their own documents" on storage.objects;
drop policy if exists "Admins can upload documents" on storage.objects;
drop policy if exists "Admins can view all documents" on storage.objects;
drop policy if exists "Admins can delete documents" on storage.objects;

-- Create simplified storage policies
create policy "Users can view documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    auth.role() = 'authenticated' and
    (
      exists (
        select 1 from public.proposals
        where id::text = (storage.foldername(name))[2]
        and user_id = auth.uid()
      ) or
      exists (
        select 1 from public.profiles
        where id = auth.uid()
        and is_admin = true
      )
    )
  );

create policy "Admins can manage storage"
  on storage.objects for all
  using (
    bucket_id = 'documents' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and is_admin = true
    )
  )
  with check (
    bucket_id = 'documents' and
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

-- Ensure documents bucket exists and is private
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update
set public = false;

-- Grant necessary permissions
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated; 