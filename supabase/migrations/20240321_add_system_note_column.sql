-- Add is_system_note column to project_notes table
ALTER TABLE project_notes
ADD COLUMN is_system_note BOOLEAN DEFAULT false;

-- Update existing notes to have is_system_note set to false
UPDATE project_notes
SET is_system_note = false
WHERE is_system_note IS NULL; 