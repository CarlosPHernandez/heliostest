-- Create documents storage bucket
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

-- Allow authenticated users to upload files to their own proposal documents
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = 'project-documents' AND
    exists (
      select 1 from public.proposals
      where id = (storage.foldername(name))[2]::uuid
      and user_id = auth.uid()
    )
  );

-- Allow users to view their own documents
create policy "Users can view their own documents"
  on storage.objects for select
  using (
    auth.role() = 'authenticated' AND
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] = 'project-documents' AND
    exists (
      select 1 from public.proposals
      where id = (storage.foldername(name))[2]::uuid
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