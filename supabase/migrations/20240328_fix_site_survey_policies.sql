-- Drop existing policies
drop policy if exists "Users can view their own site surveys" on public.site_surveys;
drop policy if exists "Users can create their own site surveys" on public.site_surveys;
drop policy if exists "Users can update their own site surveys" on public.site_surveys;

-- Clean up duplicate surveys - keep the most recently updated one for each proposal
DELETE FROM public.site_surveys a
    USING public.site_surveys b
    WHERE a.proposal_id = b.proposal_id 
    AND a.updated_at < b.updated_at;

-- Add unique constraint on proposal_id
ALTER TABLE public.site_surveys
    ADD CONSTRAINT site_surveys_proposal_id_key UNIQUE (proposal_id);

-- Create updated policies for site_surveys
create policy "Users can view their own site surveys"
    on public.site_surveys for select
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
            and (proposals.user_id = auth.uid() or
                exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.is_admin = true
                )
            )
        )
    );

create policy "Users can insert their own site surveys"
    on public.site_surveys for insert
    with check (
        exists (
            select 1 from public.proposals
            where proposals.id = proposal_id
            and (proposals.user_id = auth.uid() or
                exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.is_admin = true
                )
            )
        )
    );

create policy "Users can update their own site surveys"
    on public.site_surveys for update
    using (
        exists (
            select 1 from public.proposals
            where proposals.id = site_surveys.proposal_id
            and (proposals.user_id = auth.uid() or
                exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.is_admin = true
                )
            )
        )
    );

-- Create a temporary column for the conversion
alter table public.site_surveys add column roof_obstructions_new text[];

-- Update the new column with converted data
update public.site_surveys 
set roof_obstructions_new = array(
    select jsonb_array_elements_text(roof_obstructions)
)
where roof_obstructions is not null;

-- Drop the old column and rename the new one
alter table public.site_surveys drop column roof_obstructions;
alter table public.site_surveys rename column roof_obstructions_new to roof_obstructions;

-- Make other fields nullable for initial creation
alter table public.site_surveys alter column property_type drop not null;
alter table public.site_surveys alter column roof_age drop not null;
alter table public.site_surveys alter column roof_material drop not null;
alter table public.site_surveys alter column attic_access drop not null;
alter table public.site_surveys alter column electrical_panel_location drop not null;
alter table public.site_surveys alter column electrical_system_capacity drop not null; 