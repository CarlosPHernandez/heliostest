-- Create admin role
create type user_role as enum ('user', 'admin');

-- Add role column to profiles
alter table public.profiles
  add column if not exists role user_role not null default 'user';

-- Add status to proposals
create type proposal_status as enum (
  'pending',
  'site_survey_scheduled',
  'site_survey_completed',
  'design_in_progress',
  'design_completed',
  'permits_in_progress',
  'permits_approved',
  'installation_scheduled',
  'installation_in_progress',
  'installation_completed',
  'inspection_scheduled',
  'inspection_passed',
  'system_activated'
);

-- Add status and progress fields to proposals
alter table public.proposals
  add column if not exists status proposal_status not null default 'pending',
  add column if not exists status_updated_at timestamp with time zone default timezone('utc'::text, now()),
  add column if not exists notes text;

-- Create policy for admin access
create policy "Admin users can view all proposals"
  on public.proposals for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admin users can update all proposals"
  on public.proposals for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create function to update status_updated_at
create or replace function update_status_updated_at()
returns trigger as $$
begin
  if OLD.status is distinct from NEW.status then
    NEW.status_updated_at = timezone('utc'::text, now());
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger for status updates
create trigger update_proposal_status_timestamp
  before update on public.proposals
  for each row
  execute function update_status_updated_at(); 