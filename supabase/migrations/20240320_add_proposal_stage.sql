-- Add stage column to proposals table
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS stage TEXT CHECK (
  stage IN (
    'new',
    'site_survey',
    'design',
    'permitting',
    'installation',
    'inspection',
    'completed'
  )
) DEFAULT 'new';

-- Update existing proposals to have a stage if they don't already
UPDATE proposals 
SET stage = CASE 
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'site_survey_scheduled' THEN 'site_survey'
  WHEN status = 'permit_approved' THEN 'permitting'
  WHEN status = 'installation_scheduled' THEN 'installation'
  WHEN status = 'system_activated' THEN 'completed'
  ELSE 'new'
END
WHERE stage IS NULL; 