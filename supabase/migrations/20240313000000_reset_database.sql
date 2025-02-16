-- Drop all policies first
DO $$ 
BEGIN
    -- Drop policies for each table if they exist
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own proposals') THEN
        DROP POLICY IF EXISTS "Users can view their own proposals" ON proposals;
        DROP POLICY IF EXISTS "Users can insert their own proposals" ON proposals;
        DROP POLICY IF EXISTS "Users can update their own proposals" ON proposals;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own profile') THEN
        DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own documents') THEN
        DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
        DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own pending proposals') THEN
        DROP POLICY IF EXISTS "Users can view their own pending proposals" ON pending_proposals;
        DROP POLICY IF EXISTS "Users can insert their own pending proposals" ON pending_proposals;
        DROP POLICY IF EXISTS "Users can update their own pending proposals" ON pending_proposals;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view project notes') THEN
        DROP POLICY IF EXISTS "Users can view project notes" ON project_notes;
        DROP POLICY IF EXISTS "Users can insert project notes" ON project_notes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view messages') THEN
        DROP POLICY IF EXISTS "Users can view messages" ON project_messages;
        DROP POLICY IF EXISTS "Users can insert messages" ON project_messages;
    END IF;
END $$;

-- Drop triggers if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proposals_updated_at') THEN
        DROP TRIGGER update_proposals_updated_at ON proposals;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        DROP TRIGGER update_profiles_updated_at ON profiles;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_documents_updated_at') THEN
        DROP TRIGGER update_documents_updated_at ON documents;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pending_proposals_updated_at') THEN
        DROP TRIGGER update_pending_proposals_updated_at ON pending_proposals;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_notes_updated_at') THEN
        DROP TRIGGER update_project_notes_updated_at ON project_notes;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_messages_updated_at') THEN
        DROP TRIGGER update_project_messages_updated_at ON project_messages;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        DROP TRIGGER on_auth_user_created ON auth.users;
    END IF;
END $$;

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS project_messages CASCADE;
DROP TABLE IF EXISTS project_notes CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS pending_proposals CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop any remaining storage policies
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects; 