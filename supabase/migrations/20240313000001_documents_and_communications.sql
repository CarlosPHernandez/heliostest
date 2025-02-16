-- Set up storage for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create documents table for proposal attachments
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Document policies
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING ((SELECT user_id FROM proposals WHERE id = documents.proposal_id) = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
              (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Storage bucket policies
CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (
    auth.uid() = owner OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  ));

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (
    auth.uid() = owner OR 
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  ));

-- Create project notes table
CREATE TABLE project_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on project notes
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- Project notes policies
CREATE POLICY "Users can view project notes"
  ON project_notes FOR SELECT
  USING ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
         user_id = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert project notes"
  ON project_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create project messages table for communication
CREATE TABLE project_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  author_id UUID,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT project_messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on project messages
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Project messages policies
CREATE POLICY "Users can view messages"
  ON project_messages FOR SELECT
  USING ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
         author_id = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert messages"
  ON project_messages FOR INSERT
  WITH CHECK (auth.uid() = author_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update message read status"
  ON project_messages FOR UPDATE
  USING ((SELECT user_id FROM proposals WHERE id = proposal_id) = auth.uid() OR 
         author_id = auth.uid() OR 
         (SELECT is_admin FROM profiles WHERE id = auth.uid()))
  WITH CHECK (true); -- Allow updating is_read status

-- Add triggers for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
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