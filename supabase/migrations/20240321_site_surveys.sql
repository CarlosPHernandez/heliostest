-- Create site_surveys table
create table if not exists public.site_surveys (
    id uuid default uuid_generate_v4() primary key,
    proposal_id uuid references public.proposals on delete cascade not null,
    property_type text,
    roof_age integer,
    roof_material text,
    roof_obstructions text[],
    attic_access boolean,
    electrical_panel_location text,
    electrical_system_capacity integer,
    status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create site_survey_images table
create table if not exists public.site_survey_images (
    id uuid default uuid_generate_v4() primary key,
    site_survey_id uuid references public.site_surveys on delete cascade not null,
    image_type text check (image_type in ('attic', 'electrical_panel', 'roof', 'exterior')),
    file_url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.site_surveys enable row level security;
alter table public.site_survey_images enable row level security;

-- Create policies for site_surveys
create policy "Users can view their own site surveys"
    on public.site_surveys for select
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
            and proposals.user_id = auth.uid()
        )
    );

create policy "Users can insert their own site surveys"
    on public.site_surveys for insert
    with check (
        exists (
            select 1 from public.proposals
            where proposals.id = proposal_id
            and proposals.user_id = auth.uid()
        )
    );

create policy "Users can update their own site surveys"
    on public.site_surveys for update
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
            and proposals.user_id = auth.uid()
        )
    );

-- Create policies for site_survey_images
create policy "Users can view their own survey images"
    on public.site_survey_images for select
    using (
        exists (
            select 1 from public.site_surveys
            join public.proposals on proposals.id = site_surveys.proposal_id
            where site_surveys.id = site_survey_images.site_survey_id
            and proposals.user_id = auth.uid()
        )
    );

create policy "Users can insert their own survey images"
    on public.site_survey_images for insert
    with check (
        exists (
            select 1 from public.site_surveys
            join public.proposals on proposals.id = site_surveys.proposal_id
            where site_surveys.id = site_survey_id
            and proposals.user_id = auth.uid()
        )
    );

-- Admin policies
create policy "Admins can view all site surveys"
    on public.site_surveys for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

create policy "Admins can view all survey images"
    on public.site_survey_images for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
    );

-- Create storage bucket for site survey images
insert into storage.buckets (id, name, public) values ('site-survey-images', 'site-survey-images', true);

-- Storage policies
create policy "Users can upload their own survey images"
    on storage.objects for insert
    with check (
        bucket_id = 'site-survey-images' and
        auth.role() = 'authenticated'
    );

create policy "Anyone can view site survey images"
    on storage.objects for select
    using (bucket_id = 'site-survey-images');

-- Add triggers for updated_at
create trigger set_site_surveys_updated_at
    before update on public.site_surveys
    for each row
    execute function public.handle_updated_at();

create trigger set_site_survey_images_updated_at
    before update on public.site_survey_images
    for each row
    execute function public.handle_updated_at(); 