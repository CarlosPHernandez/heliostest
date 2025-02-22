-- Drop existing check constraints if they exist
alter table public.proposals
drop constraint if exists proposals_status_check,
drop constraint if exists proposals_stage_check;

-- Add new check constraints with correct values
alter table public.proposals
add constraint proposals_status_check
check (status in ('pending', 'in_progress', 'approved', 'completed', 'cancelled'));

alter table public.proposals
add constraint proposals_stage_check
check (stage in ('proposal', 'onboarding', 'design', 'permitting', 'installation', 'completed'));

-- Update any existing rows that might have invalid status or stage values
update public.proposals
set status = 'pending'
where status not in ('pending', 'in_progress', 'approved', 'completed', 'cancelled');

update public.proposals
set stage = 'proposal'
where stage not in ('proposal', 'onboarding', 'design', 'permitting', 'installation', 'completed'); 