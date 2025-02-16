-- First, drop any existing foreign key constraints
ALTER TABLE project_messages
DROP CONSTRAINT IF EXISTS project_messages_author_id_fkey;

-- Drop existing policies that might reference the column
DROP POLICY IF EXISTS "Users can view messages" ON project_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON project_messages;
DROP POLICY IF EXISTS "Users can update message read status" ON project_messages;

-- Add the correct foreign key constraint
ALTER TABLE project_messages
ADD CONSTRAINT project_messages_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Recreate the policies with correct references
CREATE POLICY "Users can view messages"
  ON project_messages FOR SELECT
  USING (
    (SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
    author_id = auth.uid() OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert messages"
  ON project_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update message read status"
  ON project_messages FOR UPDATE
  USING (
    (SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
    author_id = auth.uid() OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (true);

-- Verify the schema cache
SELECT pg_notify('pgrst', 'reload schema'); 