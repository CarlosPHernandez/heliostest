-- Create proposals table
CREATE TABLE proposals (
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
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'ordered', 'site_survey_scheduled', 'permit_approved', 'installation_scheduled', 'system_activated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create admin role
CREATE ROLE admin;

-- Admin policies
CREATE POLICY "Admins can view all proposals"
  ON proposals FOR SELECT
  TO admin
  USING (true);

CREATE POLICY "Admins can update any proposal"
  ON proposals FOR UPDATE
  TO admin
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 