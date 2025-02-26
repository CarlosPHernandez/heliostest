-- Add new columns to site_surveys table
ALTER TABLE public.site_surveys
ADD COLUMN IF NOT EXISTS is_hoa boolean,
ADD COLUMN IF NOT EXISTS ownership_type text,
ADD COLUMN IF NOT EXISTS roof_condition text;

-- Add check constraint for roof_condition
ALTER TABLE public.site_surveys
ADD CONSTRAINT site_surveys_roof_condition_check
CHECK (roof_condition IN ('excellent', 'good', 'fair', 'poor', 'unknown'));

-- Add check constraint for ownership_type
ALTER TABLE public.site_surveys
ADD CONSTRAINT site_surveys_ownership_type_check
CHECK (ownership_type IN ('own', 'rent'));

-- Update the check_site_survey_completion function to include new fields
CREATE OR REPLACE FUNCTION check_site_survey_completion(survey_id uuid)
RETURNS boolean AS $$
DECLARE
    has_all_images boolean;
    survey_complete boolean;
BEGIN
    -- Check if all required image types exist
    SELECT EXISTS (
        SELECT DISTINCT image_type
        FROM public.site_survey_images
        WHERE site_survey_id = survey_id
        AND image_type IN ('attic', 'electrical_panel', 'roof', 'exterior')
        HAVING COUNT(DISTINCT image_type) = 4
    ) INTO has_all_images;

    -- Check if all survey fields are filled
    SELECT EXISTS (
        SELECT 1
        FROM public.site_surveys
        WHERE id = survey_id
        AND property_type IS NOT NULL
        AND ownership_type IS NOT NULL
        AND is_hoa IS NOT NULL
        AND roof_age IS NOT NULL
        AND roof_material IS NOT NULL
        AND roof_condition IS NOT NULL
        AND attic_access IS NOT NULL
        AND electrical_panel_location IS NOT NULL
        AND electrical_system_capacity IS NOT NULL
    ) INTO survey_complete;

    RETURN has_all_images AND survey_complete;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 