-- Create pending_admin_registrations table
create table public.pending_admin_registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table pending_admin_registrations enable row level security;

-- Create policies
create policy "Users can view their own pending registration"
  on pending_admin_registrations for select
  using (user_id = auth.uid());

create policy "Users can create their own pending registration"
  on pending_admin_registrations for insert
  with check (user_id = auth.uid());

create policy "Admins can view all pending registrations"
  on pending_admin_registrations for select
  using (exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  ));

create policy "Admins can update pending registrations"
  on pending_admin_registrations for update
  using (exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  ));

-- Create updated_at trigger
create trigger update_pending_admin_registrations_updated_at
  before update on pending_admin_registrations
  for each row
  execute function update_updated_at_column(); 