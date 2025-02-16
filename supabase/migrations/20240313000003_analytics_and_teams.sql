-- Create team members table
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('sales', 'installer', 'project_manager', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  specialties TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on team members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team member policies
CREATE POLICY "Team members can view other team members"
  ON team_members FOR SELECT
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) OR 
         EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create project assignments table
CREATE TABLE project_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('sales', 'installer', 'project_manager')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, team_member_id, role)
);

-- Enable RLS on project assignments
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- Project assignment policies
CREATE POLICY "Team members can view assignments"
  ON project_assignments FOR SELECT
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) OR 
         EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage assignments"
  ON project_assignments FOR ALL
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create customer feedback table
CREATE TABLE customer_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  category TEXT CHECK (category IN ('sales_process', 'installation', 'customer_service', 'overall')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on customer feedback
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- Feedback policies
CREATE POLICY "Users can view public feedback"
  ON customer_feedback FOR SELECT
  USING (is_public OR auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can add their own feedback"
  ON customer_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON customer_feedback FOR UPDATE
  USING (auth.uid() = user_id OR (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create analytics events table
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on analytics events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Only admins can view analytics"
  ON analytics_events FOR SELECT
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- Create analytics summary views
CREATE OR REPLACE VIEW proposal_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_proposals,
  COUNT(CASE WHEN status = 'system_activated' THEN 1 END) as completed_installations,
  AVG(system_size) as avg_system_size,
  SUM(monthly_production) as total_monthly_production,
  COUNT(CASE WHEN payment_type = 'financing' THEN 1 END)::float / COUNT(*)::float as financing_percentage
FROM proposals
GROUP BY DATE_TRUNC('month', created_at);

-- Create team performance view
CREATE OR REPLACE VIEW team_performance AS
SELECT 
  tm.id as team_member_id,
  p.full_name,
  tm.role,
  COUNT(DISTINCT pa.proposal_id) as assigned_projects,
  COUNT(DISTINCT CASE WHEN pr.status = 'system_activated' THEN pr.id END) as completed_projects,
  AVG(cf.rating) as avg_rating
FROM team_members tm
JOIN profiles p ON tm.user_id = p.id
LEFT JOIN project_assignments pa ON tm.id = pa.team_member_id
LEFT JOIN proposals pr ON pa.proposal_id = pr.id
LEFT JOIN customer_feedback cf ON pr.id = cf.proposal_id
GROUP BY tm.id, p.full_name, tm.role;

-- Add triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at
  BEFORE UPDATE ON project_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_feedback_updated_at
  BEFORE UPDATE ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically track analytics events
CREATE OR REPLACE FUNCTION track_analytics_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_events (event_type, user_id, proposal_id, event_data)
  VALUES (
    TG_ARGV[0],
    CASE 
      WHEN TG_TABLE_NAME = 'proposals' THEN NEW.user_id
      WHEN TG_TABLE_NAME = 'customer_feedback' THEN NEW.user_id
      ELSE NULL
    END,
    CASE 
      WHEN TG_TABLE_NAME = 'proposals' THEN NEW.id
      WHEN TG_TABLE_NAME = 'customer_feedback' THEN NEW.proposal_id
      ELSE NULL
    END,
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics event triggers
CREATE TRIGGER track_new_proposal
  AFTER INSERT ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION track_analytics_event('new_proposal');

CREATE TRIGGER track_proposal_status_change
  AFTER UPDATE ON proposals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_analytics_event('proposal_status_change');

CREATE TRIGGER track_customer_feedback
  AFTER INSERT ON customer_feedback
  FOR EACH ROW
  EXECUTE FUNCTION track_analytics_event('new_feedback'); 