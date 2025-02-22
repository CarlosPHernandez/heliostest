-- Clean up duplicate surveys - keep the most recently updated one for each proposal
DELETE FROM public.site_surveys a
    USING public.site_surveys b
    WHERE a.proposal_id = b.proposal_id 
    AND a.updated_at < b.updated_at
    AND a.id != b.id;  -- Make sure we don't compare a row with itself

-- Add unique constraint on proposal_id if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'site_surveys_proposal_id_key'
    ) THEN
        ALTER TABLE public.site_surveys
            ADD CONSTRAINT site_surveys_proposal_id_key UNIQUE (proposal_id);
    END IF;
END $$; 