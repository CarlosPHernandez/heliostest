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

-- Create policies
create policy "Enable insert for authentication users only"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Enable select for users based on id"
  on profiles for select
  using (auth.uid() = id);

create policy "Enable update for users based on id"
  on profiles for update
  using (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
declare
  retries integer := 0;
  max_retries constant integer := 5;
  profile_created boolean := false;
begin
  while retries < max_retries and not profile_created loop
    begin
      insert into public.profiles (id, name, email)
      values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', ''),
        new.email
      );
      profile_created := true;
    exception when others then
      retries := retries + 1;
      if retries < max_retries then
        perform pg_sleep(0.5); -- Wait 500ms before retrying
      end if;
    end;
  end loop;

  if not profile_created then
    raise exception 'Failed to create profile after % attempts', max_retries;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 