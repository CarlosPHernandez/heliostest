-- Drop existing site survey policies
DROP POLICY IF EXISTS "Users can view their own site surveys" ON public.site_surveys;
DROP POLICY IF EXISTS "Users can insert their own site surveys" ON public.site_surveys;
DROP POLICY IF EXISTS "Users can update their own site surveys" ON public.site_surveys;
DROP POLICY IF EXISTS "Users can access own surveys" ON public.site_surveys;

-- Drop and recreate the foreign key constraint to handle both tables
ALTER TABLE public.site_surveys
DROP CONSTRAINT IF EXISTS site_surveys_proposal_id_fkey;

-- Create a function to validate proposal_id exists in either table
CREATE OR REPLACE FUNCTION check_proposal_exists(proposal_id uuid) 
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.pending_proposals WHERE id = proposal_id
    );
END;
$$ LANGUAGE plpgsql;

-- Add the constraint using the function
ALTER TABLE public.site_surveys
ADD CONSTRAINT site_surveys_proposal_id_fkey
FOREIGN KEY (proposal_id)
REFERENCES public.pending_proposals(id)
ON DELETE CASCADE;

-- Create updated policies for site_surveys
CREATE POLICY "Users can view their own site surveys"
    ON public.site_surveys FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pending_proposals
            WHERE pending_proposals.id = site_surveys.proposal_id
            AND (
                pending_proposals.synced_to_user_id = auth.uid() OR
                pending_proposals.temp_user_token IS NOT NULL OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Users can insert their own site surveys"
    ON public.site_surveys FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pending_proposals
            WHERE pending_proposals.id = proposal_id
            AND (
                pending_proposals.synced_to_user_id = auth.uid() OR
                pending_proposals.temp_user_token IS NOT NULL OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    );

CREATE POLICY "Users can update their own site surveys"
    ON public.site_surveys FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pending_proposals
            WHERE pending_proposals.id = site_surveys.proposal_id
            AND (
                pending_proposals.synced_to_user_id = auth.uid() OR
                pending_proposals.temp_user_token IS NOT NULL OR
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.is_admin = true
                )
            )
        )
    ); 