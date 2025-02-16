-- Add alias for panel_count column
alter table public.proposals
  rename column panel_count to number_of_panels; 