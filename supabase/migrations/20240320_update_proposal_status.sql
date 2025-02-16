-- First drop the existing check constraint
ALTER TABLE proposals
DROP CONSTRAINT IF EXISTS proposals_status_check;

-- Add the new check constraint with updated status values
ALTER TABLE proposals
ADD CONSTRAINT proposals_status_check 
CHECK (status IN (
  'saved',
  'ordered',
  'in_progress',
  'completed',
  'cancelled',
  'site_survey_scheduled',
  'permit_approved',
  'installation_scheduled',
  'system_activated'
)); 