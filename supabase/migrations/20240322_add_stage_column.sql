-- Add stage column to proposals table if it doesn't exist
alter table public.proposals 
add column if not exists stage text default 'proposal' 
check (stage in ('proposal', 'onboarding', 'design', 'permitting', 'installation', 'completed'));

-- Update existing rows to have a default stage if needed
update public.proposals
set stage = 'proposal'
where stage is null; 