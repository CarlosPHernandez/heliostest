-- First, drop all existing policies to start fresh
drop policy if exists "Enable read access to profiles" on public.profiles;
drop policy if exists "Enable update own profile" on public.profiles;
drop policy if exists "Enable insert own profile" on public.profiles;
drop policy if exists "Enable admin profile access" on public.profiles;
drop policy if exists "Enable read access to messages" on public.project_messages;
drop policy if exists "Enable admin message access" on public.project_messages;

-- Create a function to check admin status without recursion
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from auth.users
    where id = user_id
    and raw_user_meta_data->>'is_admin' = 'true'
  );
$$;

-- Create simplified profile policies
create policy "profiles_read_policy"
    on public.profiles for select
    using (
        -- Users can read their own profile
        auth.uid() = id
        -- Admins can read all profiles
        or public.is_admin(auth.uid())
    );

create policy "profiles_insert_policy"
    on public.profiles for insert
    with check (
        -- Users can only insert their own profile
        auth.uid() = id
        -- Admins can insert any profile
        or public.is_admin(auth.uid())
    );

create policy "profiles_update_policy"
    on public.profiles for update
    using (
        -- Users can update their own profile
        auth.uid() = id
        -- Admins can update any profile
        or public.is_admin(auth.uid())
    );

-- Create simplified message policies
create policy "messages_read_policy"
    on public.project_messages for select
    using (
        -- Users can read messages they authored
        author_id = auth.uid()
        -- Or messages for proposals they own
        or exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and proposals.user_id = auth.uid()
        )
        -- Admins can read all messages
        or public.is_admin(auth.uid())
    );

create policy "messages_write_policy"
    on public.project_messages for insert
    with check (
        -- Users can only create messages as themselves
        author_id = auth.uid()
        -- Admins can create messages as anyone
        or public.is_admin(auth.uid())
    );

create policy "messages_update_policy"
    on public.project_messages for update
    using (
        -- Users can only update their own messages
        author_id = auth.uid()
        -- Admins can update any message
        or public.is_admin(auth.uid())
    );

-- Update handle_new_user function to set admin status
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    profile_exists boolean;
    is_admin_user boolean;
begin
    -- Check if profile already exists
    select exists(
        select 1 from public.profiles where id = new.id
    ) into profile_exists;
    
    -- Check if user should be admin
    is_admin_user := (new.raw_user_meta_data->>'is_admin')::boolean;
    
    -- Only insert if profile doesn't exist
    if not profile_exists then
        insert into public.profiles (
            id,
            email,
            full_name,
            is_admin,
            created_at,
            updated_at
        )
        values (
            new.id,
            new.email,
            coalesce(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(new.email, '@', 1)
            ),
            is_admin_user,
            now(),
            now()
        );
    end if;
    return new;
end;
$$; 