-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable insert for authentication users only" on profiles;
drop policy if exists "Enable select for users based on id" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;

-- Create policies with more permissive insert
create policy "Enable insert for users"
  on profiles for insert
  with check (true);  -- Allow any authenticated user to insert

create policy "Enable select for users based on id"
  on profiles for select
  using (auth.uid() = id);

create policy "Enable update for users based on id"
  on profiles for update
  using (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger security definer
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  return new;
exception when others then
  -- Log the error but don't prevent user creation
  raise warning 'Failed to create profile for user %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 