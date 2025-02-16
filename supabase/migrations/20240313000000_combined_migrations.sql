-- Combined migrations file
-- This file combines all migrations in the correct order

-- Step 0: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can insert their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can update their own pending proposals" ON pending_proposals;
DROP POLICY IF EXISTS "Users can view project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can insert project notes" ON project_notes;
DROP POLICY IF EXISTS "Users can view messages" ON project_messages;
DROP POLICY IF EXISTS "Users can insert messages" ON project_messages;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_pending_proposals_updated_at ON pending_proposals;
DROP TRIGGER IF EXISTS update_project_notes_updated_at ON project_notes;
DROP TRIGGER IF EXISTS update_project_messages_updated_at ON project_messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 1: Create base tables and functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
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
  down_payment float,
  monthly_payment float,
  financing_term integer,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  is_admin boolean DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pending_proposals table
CREATE TABLE IF NOT EXISTS pending_proposals (
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

-- Create project_notes table
CREATE TABLE IF NOT EXISTS project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project_messages table
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS on all tables
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies for each table
-- Proposals policies
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

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING ((SELECT user_id FROM proposals WHERE id = documents.proposal_id) = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
              (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Pending proposals policies
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

-- Project notes policies
CREATE POLICY "Users can view project notes"
  ON project_notes FOR SELECT
  USING ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
         user_id = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert project notes"
  ON project_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Project messages policies
CREATE POLICY "Users can view messages"
  ON project_messages FOR SELECT
  USING ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
         author_id = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert messages"
  ON project_messages FOR INSERT
  WITH CHECK (auth.uid() = author_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Step 4: Create triggers for updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_proposals_updated_at
  BEFORE UPDATE ON pending_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_notes_updated_at
  BEFORE UPDATE ON project_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_messages_updated_at
  BEFORE UPDATE ON project_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Create function to handle new user profiles
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

-- Create trigger to automatically create profile for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 6: Set up storage
INSERT INTO storage.buckets (id, name)
VALUES ('documents', 'documents')
ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (auth.uid() = owner OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid() = owner OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Step 7: Add coordinates to proposals
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL; 