-- Create pending_proposals table
CREATE TABLE pending_proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  package_type TEXT CHECK (package_type IN ('standard', 'premium')),
  system_size NUMERIC NOT NULL,
  panel_count INTEGER NOT NULL,
  monthly_production NUMERIC NOT NULL,
  address TEXT NOT NULL,
  monthly_bill NUMERIC NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('cash', 'financing')),
  financing JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'saved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE pending_proposals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own pending proposals"
  ON pending_proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending proposals"
  ON pending_proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending proposals"
  ON pending_proposals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pending_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pending_proposals_updated_at
  BEFORE UPDATE ON pending_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_proposals_updated_at(); 