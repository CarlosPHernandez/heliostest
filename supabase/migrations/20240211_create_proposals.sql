-- Create proposals table
create table if not exists public.proposals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  system_size float not null,
  number_of_panels integer not null,
  total_price float not null,
  monthly_bill float not null,
  address text not null,
  package_type text not null,
  include_battery boolean default false,
  battery_count integer default 0,
  battery_type text,
  warranty_package text not null default 'standard',
  payment_type text not null,
  financing_term integer,
  down_payment float,
  monthly_payment float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.proposals enable row level security;

-- Create policies
create policy "Users can view their own proposals"
  on public.proposals for select
  using ( auth.uid() = user_id );

create policy "Users can create their own proposals"
  on public.proposals for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own proposals"
  on public.proposals for update
  using ( auth.uid() = user_id );

-- Create index for faster lookups
create index proposals_user_id_idx on public.proposals(user_id); 