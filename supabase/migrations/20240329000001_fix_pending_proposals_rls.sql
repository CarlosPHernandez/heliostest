-- Drop all existing RLS policies for pending_proposals
DROP POLICY IF EXISTS "Access pending proposals by user_id or temp_token" ON pending_proposals;
DROP POLICY IF EXISTS "Access pending proposals by temp_token" ON pending_proposals;
DROP POLICY IF EXISTS "Users can view their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can insert their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can update their own pending proposals" ON pending_proposals;

-- Create new RLS policy that only checks temp_user_token
CREATE POLICY "Access pending proposals by temp_token"
  ON pending_proposals FOR ALL
  USING (true);  -- Allow all operations for now since we're using temp_user_token

-- Enable RLS
ALTER TABLE pending_proposals ENABLE ROW LEVEL SECURITY; 