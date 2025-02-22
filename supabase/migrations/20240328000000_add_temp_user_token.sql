-- Add temp_user_token column to pending_proposals table
ALTER TABLE public.pending_proposals
ADD COLUMN temp_user_token UUID,
ADD COLUMN synced_to_user_id UUID REFERENCES auth.users(id),
ADD COLUMN synced_at TIMESTAMPTZ;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can insert their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can update their own pending proposals" ON pending_proposals;

-- Create new RLS policies that include temp_user_token access
CREATE POLICY "Access pending proposals by user_id or temp_token"
  ON pending_proposals FOR ALL
  USING (
    auth.uid() = user_id 
    OR temp_user_token::text = current_setting('app.temp_user_token', true)
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_proposals_temp_token 
  ON pending_proposals(temp_user_token);

-- Create index for faster synced proposal lookups
CREATE INDEX IF NOT EXISTS idx_pending_proposals_synced 
  ON pending_proposals(temp_user_token, synced_to_user_id); 