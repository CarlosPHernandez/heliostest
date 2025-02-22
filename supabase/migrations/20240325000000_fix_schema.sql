-- Drop existing tables and policies
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Enable users to see own profile" on profiles;
drop policy if exists "Enable users to update own profile" on profiles;
drop policy if exists "Enable profile creation" on profiles;
drop policy if exists "Enable admin to see all profiles" on profiles;
drop policy if exists "Enable admin to update all profiles" on profiles;
drop policy if exists "Allow public email lookup for login" on profiles;

drop policy if exists "Users can view their own proposals" on proposals;
drop policy if exists "Users can insert their own proposals" on proposals;
drop policy if exists "Users can update their own proposals" on proposals;
drop policy if exists "Enable users to see own proposals" on proposals;
drop policy if exists "Enable admin to see all proposals" on proposals;
drop policy if exists "Enable users to create own proposals" on proposals;
drop policy if exists "Enable admin to create proposals" on proposals;

-- Drop existing tables
drop table if exists public.project_messages cascade;
drop table if exists public.project_notes cascade;
drop table if exists public.project_documents cascade;
drop table if exists public.site_survey_images cascade;
drop table if exists public.site_surveys cascade;
drop table if exists public.pending_admin_registrations cascade;
drop table if exists public.proposals cascade;
drop table if exists public.profiles cascade;

-- Create base tables with proper relationships
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    email text not null,
    phone text,
    address text,
    avatar_url text,
    is_admin boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.proposals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    address text not null,
    system_size numeric not null,
    total_price numeric not null,
    number_of_panels integer not null,
    package_type text check (package_type in ('standard', 'premium', 'elite')),
    payment_type text check (payment_type in ('cash', 'finance', 'lease')),
    include_battery boolean default false,
    battery_type text,
    battery_count integer,
    down_payment numeric,
    monthly_payment numeric,
    financing_term integer,
    status text default 'pending' check (status in ('pending', 'in_progress', 'approved', 'completed', 'cancelled')),
    stage text default 'proposal' check (stage in ('proposal', 'onboarding', 'design', 'permitting', 'installation', 'completed')),
    notes text,
    latitude numeric,
    longitude numeric,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.project_documents (
    id uuid default gen_random_uuid() primary key,
    proposal_id uuid references public.proposals(id) on delete cascade,
    name text not null,
    file_url text not null,
    document_type text not null,
    requires_input boolean default false,
    customer_data jsonb,
    status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.site_surveys (
    id uuid default gen_random_uuid() primary key,
    proposal_id uuid references public.proposals(id) on delete cascade,
    property_type text not null,
    roof_age integer not null,
    roof_material text not null,
    roof_obstructions jsonb,
    attic_access boolean not null,
    electrical_panel_location text not null,
    electrical_system_capacity integer not null,
    status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table public.project_messages (
    id uuid default gen_random_uuid() primary key,
    proposal_id uuid references public.proposals(id) on delete cascade,
    author_id uuid references public.profiles(id) on delete cascade,
    content text not null,
    is_read boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes
create index if not exists proposals_user_id_idx on public.proposals(user_id);
create index if not exists proposals_status_idx on public.proposals(status);
create index if not exists proposals_stage_idx on public.proposals(stage);
create index if not exists proposals_coordinates_idx on public.proposals(latitude, longitude);
create index if not exists project_documents_proposal_id_idx on public.project_documents(proposal_id);
create index if not exists site_surveys_proposal_id_idx on public.site_surveys(proposal_id);
create index if not exists project_messages_proposal_id_idx on public.project_messages(proposal_id);
create index if not exists project_messages_author_id_idx on public.project_messages(author_id);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.proposals enable row level security;
alter table public.project_documents enable row level security;
alter table public.site_surveys enable row level security;
alter table public.project_messages enable row level security;

-- Create simplified RLS policies
-- Profiles
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Admins can access all profiles"
    on public.profiles for all
    using (exists (
        select 1 from public.profiles
        where id = auth.uid()
        and is_admin = true
    ));

-- Proposals
create policy "Users can view own proposals"
    on public.proposals for select
    using (
        user_id = auth.uid() or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Users can create proposals"
    on public.proposals for insert
    with check (
        user_id = auth.uid() or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

create policy "Users can update own proposals"
    on public.proposals for update
    using (
        user_id = auth.uid() or
        exists (
            select 1 from public.profiles
            where id = auth.uid()
            and is_admin = true
        )
    );

-- Project Documents
create policy "Users can access own documents"
    on public.project_documents for all
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_documents.proposal_id
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

-- Site Surveys
create policy "Users can access own surveys"
    on public.site_surveys for all
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
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

-- Project Messages
create policy "Users can access own messages"
    on public.project_messages for all
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = project_messages.proposal_id
            and (
                proposals.user_id = auth.uid() or
                author_id = auth.uid() or
                exists (
                    select 1 from public.profiles
                    where id = auth.uid()
                    and is_admin = true
                )
            )
        )
    );

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name)
    values (
        new.id,
        new.email,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        )
    );
    return new;
end;
$$;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Create function to update timestamps
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create updated_at triggers for all tables
create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at();

create trigger update_proposals_updated_at
    before update on public.proposals
    for each row execute function public.update_updated_at();

create trigger update_project_documents_updated_at
    before update on public.project_documents
    for each row execute function public.update_updated_at();

create trigger update_site_surveys_updated_at
    before update on public.site_surveys
    for each row execute function public.update_updated_at();

create trigger update_project_messages_updated_at
    before update on public.project_messages
    for each row execute function public.update_updated_at(); 