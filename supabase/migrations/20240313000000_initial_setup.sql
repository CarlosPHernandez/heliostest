-- Initial setup for core functionality

-- Helper function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create profiles table (essential for user management)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Profile triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Create proposals table (core business logic)
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
  latitude double precision,
  longitude double precision,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Proposal policies
CREATE POLICY "Users can view their own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create index for map functionality
CREATE INDEX proposals_coordinates_idx 
  ON proposals(latitude, longitude);

-- Proposal triggers
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Set up initial admin user (replace email with actual admin email)
INSERT INTO public.profiles (id, email, is_admin, full_name)
SELECT id, email, true, COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE email = 'carlosphernandez2020@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true; 