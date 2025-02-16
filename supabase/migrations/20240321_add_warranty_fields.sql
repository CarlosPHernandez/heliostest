-- Add warranty package column to proposals table
alter table public.proposals
  add column if not exists warranty_package text default 'standard'; 