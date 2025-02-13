-- Add missing columns to proposals table
alter table if exists public.proposals
  add column if not exists down_payment float,
  add column if not exists monthly_payment float,
  add column if not exists financing_term integer; 