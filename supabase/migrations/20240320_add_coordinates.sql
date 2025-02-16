-- Add latitude and longitude columns to proposals table
alter table public.proposals
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Create index for faster geospatial queries
create index if not exists proposals_coordinates_idx 
  on public.proposals(latitude, longitude); 