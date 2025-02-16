-- Add battery-related columns to proposals table
alter table public.proposals
  add column if not exists include_battery boolean default false,
  add column if not exists battery_type text,
  add column if not exists battery_count integer; 