-- Drop existing policies if they exist
drop policy if exists "Users can upload their own documents" on storage.objects;
drop policy if exists "Users can view their own documents" on storage.objects;
drop policy if exists "Admins can upload documents" on storage.objects;
drop policy if exists "Admins can view all documents" on storage.objects;
drop policy if exists "Admins can delete documents" on storage.objects;

-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
select 'documents', 'documents', false
where not exists (
    select 1 from storage.buckets where id = 'documents'
);

-- Allow authenticated users to upload files to their own proposal documents
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = 'project-documents' AND
    exists (
      select 1 from public.proposals
      where id::text = (storage.foldername(name))[2]
      and user_id = auth.uid()
    )
  );

-- Allow users to view documents from their own proposals
create policy "Users can view their own documents"
  on storage.objects for select
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = 'project-documents' AND
    exists (
      select 1 from public.proposals
      where id::text = (storage.foldername(name))[2]
      and user_id = auth.uid()
    )
  );

-- Allow admins to upload and view all documents
create policy "Admins can upload documents"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

create policy "Admins can view all documents"
  on storage.objects for select
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  );

-- Allow admins to delete documents
create policy "Admins can delete documents"
  on storage.objects for delete
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and is_admin = true
    )
  ); 