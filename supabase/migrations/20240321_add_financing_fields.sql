-- Add financing-related columns to proposals table
alter table public.proposals
  add column if not exists down_payment float,
  add column if not exists monthly_payment float,
  add column if not exists financing_term integer,
  add column if not exists total_price numeric; 