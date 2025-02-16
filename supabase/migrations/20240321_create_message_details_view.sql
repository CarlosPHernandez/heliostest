-- Create a view for message details that includes author information
CREATE OR REPLACE VIEW message_details AS
SELECT 
    m.id,
    m.content,
    m.created_at,
    m.is_read,
    m.proposal_id,
    p.full_name as author_name,
    p.is_admin as author_is_admin
FROM project_messages m
JOIN profiles p ON m.author_id = p.id;

-- Create policies for the view
DROP POLICY IF EXISTS "Users can view messages for their proposals" ON message_details;
DROP POLICY IF EXISTS "Admins can view all messages" ON message_details;

ALTER VIEW message_details OWNER TO authenticated;
ALTER VIEW message_details SET SCHEMA public;

CREATE POLICY "Users can view messages for their proposals"
ON message_details
FOR SELECT
TO authenticated
USING (
    proposal_id IN (
        SELECT id FROM proposals WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all messages"
ON message_details
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Enable RLS
ALTER VIEW message_details FORCE ROW LEVEL SECURITY; 