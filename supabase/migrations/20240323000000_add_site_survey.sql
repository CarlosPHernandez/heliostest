-- Create site_surveys table
create table if not exists public.site_surveys (
    id uuid default gen_random_uuid() primary key,
    proposal_id uuid references public.proposals(id) on delete cascade not null,
    property_type text not null,
    roof_age integer not null,
    roof_material text not null,
    roof_obstructions jsonb,  -- Array of obstructions like chimneys, skylights, vents
    attic_access boolean not null,
    electrical_panel_location text not null,
    electrical_system_capacity integer not null,  -- In amperes
    status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create site_survey_images table for storing image references
create table if not exists public.site_survey_images (
    id uuid default gen_random_uuid() primary key,
    site_survey_id uuid references public.site_surveys(id) on delete cascade not null,
    image_type text not null check (image_type in ('attic', 'electrical_panel', 'roof', 'exterior')),
    file_url text not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on both tables
alter table public.site_surveys enable row level security;
alter table public.site_survey_images enable row level security;

-- Create storage bucket for site survey images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('site-survey-images', 'site-survey-images', false)
on conflict (id) do nothing;

-- Create policies for site_surveys table
create policy "Users can view their own site surveys"
    on public.site_surveys for select
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
            and (
                proposals.user_id = auth.uid() or
                exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.is_admin = true
                )
            )
        )
    );

create policy "Users can create their own site surveys"
    on public.site_surveys for insert
    with check (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
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

-- Create policies for site_survey_images table
create policy "Users can view their own site survey images"
    on public.site_survey_images for select
    using (
        exists (
            select 1 from public.site_surveys
            where site_surveys.id = site_survey_images.site_survey_id
            and exists (
                select 1 from public.proposals
                where proposals.id = site_surveys.proposal_id
                and (
                    proposals.user_id = auth.uid() or
                    exists (
                        select 1 from public.profiles
                        where profiles.id = auth.uid()
                        and profiles.is_admin = true
                    )
                )
            )
        )
    );

create policy "Users can upload their own site survey images"
    on public.site_survey_images for insert
    with check (
        exists (
            select 1 from public.site_surveys
            where site_surveys.id = site_survey_images.site_survey_id
            and exists (
                select 1 from public.proposals
                where proposals.id = site_surveys.proposal_id
                and proposals.user_id = auth.uid()
            )
        )
    );

-- Create storage policies for site survey images
create policy "Users can upload site survey images"
    on storage.objects for insert
    with check (
        bucket_id = 'site-survey-images' and
        auth.uid() = owner
    );

create policy "Users can view site survey images"
    on storage.objects for select
    using (
        bucket_id = 'site-survey-images' and
        (
            auth.uid() = owner or
            exists (
                select 1 from public.profiles
                where profiles.id = auth.uid()
                and profiles.is_admin = true
            )
        )
    );

-- Create triggers for updated_at
create trigger update_site_surveys_updated_at
    before update on public.site_surveys
    for each row
    execute function update_updated_at_column();

create trigger update_site_survey_images_updated_at
    before update on public.site_survey_images
    for each row
    execute function update_updated_at_column();

-- Add site survey completion check function
create or replace function check_site_survey_completion(survey_id uuid)
returns boolean as $$
declare
    has_all_images boolean;
    survey_complete boolean;
begin
    -- Check if all required image types exist
    select exists (
        select distinct image_type
        from public.site_survey_images
        where site_survey_id = survey_id
        and image_type in ('attic', 'electrical_panel', 'roof', 'exterior')
        having count(distinct image_type) = 4
    ) into has_all_images;

    -- Check if all survey fields are filled
    select exists (
        select 1
        from public.site_surveys
        where id = survey_id
        and property_type is not null
        and roof_age is not null
        and roof_material is not null
        and attic_access is not null
        and electrical_panel_location is not null
        and electrical_system_capacity is not null
    ) into survey_complete;

    return has_all_images and survey_complete;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically update survey status
create or replace function update_site_survey_status()
returns trigger as $$
begin
    if check_site_survey_completion(new.id) then
        new.status = 'completed';
    else
        new.status = 'in_progress';
    end if;
    return new;
end;
$$ language plpgsql security definer;

create trigger check_site_survey_completion
    before insert or update on public.site_surveys
    for each row
    execute function update_site_survey_status(); 