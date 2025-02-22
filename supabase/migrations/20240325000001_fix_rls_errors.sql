-- First, drop problematic policies
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins can access all profiles" on public.profiles;

-- Create more permissive profile policies
create policy "Enable read access to profiles"
    on public.profiles for select
    using (true);  -- Allow reading all profiles for joins

create policy "Enable update own profile"
    on public.profiles for update
    using (
        auth.uid() = id or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Enable insert own profile"
    on public.profiles for insert
    with check (
        auth.uid() = id or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- Fix project messages policies
drop policy if exists "Users can access own messages" on public.project_messages;

create policy "Enable read access to messages"
    on public.project_messages for select
    using (
        author_id = auth.uid() or
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and (
                proposals.user_id = auth.uid() or
                exists (
                    select 1 from public.profiles
                    where id = auth.uid()
                    and is_admin = true
                )
            )
        )
    );

create policy "Enable insert messages"
    on public.project_messages for insert
    with check (
        author_id = auth.uid() or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Enable update messages"
    on public.project_messages for update
    using (
        author_id = auth.uid() or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- Add missing indexes for performance
create index if not exists profiles_is_admin_idx on public.profiles(is_admin);
create index if not exists profiles_email_idx on public.profiles(email);

-- Update handle_new_user function to be more robust
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    profile_exists boolean;
begin
    -- Check if profile already exists
    select exists(
        select 1 from public.profiles where id = new.id
    ) into profile_exists;
    
    -- Only insert if profile doesn't exist
    if not profile_exists then
        insert into public.profiles (
            id,
            email,
            full_name,
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
            now(),
            now()
        );
    end if;
    return new;
end;
$$; 