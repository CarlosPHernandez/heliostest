-- Drop existing policies
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins can access all profiles" on public.profiles;
drop policy if exists "Users can access own messages" on public.project_messages;

-- Create profile policies
create policy "Enable read access to profiles"
    on public.profiles for select
    using (true);

create policy "Enable update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Enable insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Enable admin profile access"
    on public.profiles for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- Create message policies
create policy "Enable read access to messages"
    on public.project_messages for select
    using (
        author_id = auth.uid() or
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and proposals.user_id = auth.uid()
        )
    );

create policy "Enable admin message access"
    on public.project_messages for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    ); 