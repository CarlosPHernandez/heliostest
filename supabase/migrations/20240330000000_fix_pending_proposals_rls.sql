-- Drop existing RLS policies for pending_proposals
DROP POLICY IF EXISTS "Access pending proposals by temp_token" ON pending_proposals;
DROP POLICY IF EXISTS "Access pending proposals by token or sync" ON pending_proposals;
DROP POLICY IF EXISTS "Allow all pending proposals access" ON pending_proposals;

-- Create a simple policy that allows all operations
CREATE POLICY "Allow all pending proposals access"
  ON pending_proposals FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE pending_proposals ENABLE ROW LEVEL SECURITY; 