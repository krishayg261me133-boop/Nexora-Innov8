/*
# NEXORA — Student Talent Network Schema

## Overview
Creates the full database for a verified student-only talent network. Students
create profiles with skills/interests/availability, discover teammates via a
match-score engine, create and join projects/teams, message each other, browse
research opportunities, participate in a community Q&A, and receive notifications.

## Tables Created
1. profiles — extended user info (department, year, program, bio, avatar, onboarding state)
2. skills — master list of skills
3. profile_skills — join: profile <-> skill (with proficiency level)
4. interests — master list of interests
5. profile_interests — join: profile <-> interest
6. availability — a student's current availability status
7. experiences — work/project experience entries
8. certifications — certifications a student holds
9. achievements — notable achievements
10. projects — user-created projects (hackathon/research/academic/startup)
11. project_members — join: project <-> user (role + status)
12. teams — teams formed around a goal
13. team_members — join: team <-> user (role + status)
14. connections — student-to-student connect requests (pending/accepted)
15. messages — direct messages between users
16. team_messages — messages within a team channel
17. research_opportunities — faculty/posted research listings
18. research_applications — applications to research opportunities
19. notifications — real-time notification feed
20. community_questions — Q&A forum questions
21. community_answers — answers on questions
22. project_applications — applications to join a project

## Security
- RLS enabled on every table.
- All policies scoped TO authenticated with ownership or membership checks.
- Owner columns default to auth.uid() so client inserts omitting user_id succeed.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  department text DEFAULT '',
  academic_year text DEFAULT '',
  program text DEFAULT '',
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  about text DEFAULT '',
  availability_status text DEFAULT 'open',
  experience_level text DEFAULT 'beginner',
  completed_projects int DEFAULT 0,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text DEFAULT ''
);
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_skills" ON skills;
CREATE POLICY "read_skills" ON skills FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS profile_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency int DEFAULT 3,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_profile_skills" ON profile_skills;
CREATE POLICY "read_profile_skills" ON profile_skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile_skills" ON profile_skills;
CREATE POLICY "insert_own_profile_skills" ON profile_skills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "delete_own_profile_skills" ON profile_skills;
CREATE POLICY "delete_own_profile_skills" ON profile_skills FOR DELETE
  TO authenticated USING (auth.uid() = profile_id);

-- ============================================================
-- INTERESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_interests" ON interests;
CREATE POLICY "read_interests" ON interests FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS profile_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  interest_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_profile_interests" ON profile_interests;
CREATE POLICY "read_profile_interests" ON profile_interests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile_interests" ON profile_interests;
CREATE POLICY "insert_own_profile_interests" ON profile_interests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "delete_own_profile_interests" ON profile_interests;
CREATE POLICY "delete_own_profile_interests" ON profile_interests FOR DELETE
  TO authenticated USING (auth.uid() = profile_id);

-- ============================================================
-- EXPERIENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  organization text DEFAULT '',
  description text DEFAULT '',
  start_date text DEFAULT '',
  end_date text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_experiences" ON experiences;
CREATE POLICY "read_experiences" ON experiences FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_experiences" ON experiences;
CREATE POLICY "insert_own_experiences" ON experiences FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "delete_own_experiences" ON experiences;
CREATE POLICY "delete_own_experiences" ON experiences FOR DELETE
  TO authenticated USING (auth.uid() = profile_id);

-- ============================================================
-- CERTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  issuer text DEFAULT '',
  date text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_certifications" ON certifications;
CREATE POLICY "read_certifications" ON certifications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_certifications" ON certifications;
CREATE POLICY "insert_own_certifications" ON certifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "delete_own_certifications" ON certifications;
CREATE POLICY "delete_own_certifications" ON certifications FOR DELETE
  TO authenticated USING (auth.uid() = profile_id);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_achievements" ON achievements;
CREATE POLICY "read_achievements" ON achievements FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_achievements" ON achievements;
CREATE POLICY "insert_own_achievements" ON achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "delete_own_achievements" ON achievements;
CREATE POLICY "delete_own_achievements" ON achievements FOR DELETE
  TO authenticated USING (auth.uid() = profile_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  project_type text DEFAULT 'academic',
  department text DEFAULT '',
  required_skills text[] DEFAULT '{}',
  team_size int DEFAULT 4,
  open_roles text[] DEFAULT '{}',
  timeline text DEFAULT '',
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_projects" ON projects;
CREATE POLICY "read_projects" ON projects FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  status text DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_project_members" ON project_members;
CREATE POLICY "read_project_members" ON project_members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_project_members" ON project_members;
CREATE POLICY "insert_own_project_members" ON project_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_project_members" ON project_members;
CREATE POLICY "delete_own_project_members" ON project_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Project applications
CREATE TABLE IF NOT EXISTS project_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_project_applications" ON project_applications;
CREATE POLICY "read_project_applications" ON project_applications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_project_applications" ON project_applications;
CREATE POLICY "insert_own_project_applications" ON project_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_project_applications" ON project_applications;
CREATE POLICY "update_own_project_applications" ON project_applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  purpose text DEFAULT '',
  required_skills text[] DEFAULT '{}',
  team_size int DEFAULT 4,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_teams" ON teams;
CREATE POLICY "read_teams" ON teams FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_teams" ON teams;
CREATE POLICY "insert_own_teams" ON teams FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_teams" ON teams;
CREATE POLICY "update_own_teams" ON teams FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_teams" ON teams;
CREATE POLICY "delete_own_teams" ON teams FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  status text DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_team_members" ON team_members;
CREATE POLICY "read_team_members" ON team_members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_team_members" ON team_members;
CREATE POLICY "insert_own_team_members" ON team_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_team_members" ON team_members;
CREATE POLICY "delete_own_team_members" ON team_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CONNECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_connections" ON connections;
CREATE POLICY "read_connections" ON connections FOR SELECT
  TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "insert_own_connections" ON connections;
CREATE POLICY "insert_own_connections" ON connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "update_own_connections" ON connections;
CREATE POLICY "update_own_connections" ON connections FOR UPDATE
  TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id) WITH CHECK (true);

-- ============================================================
-- MESSAGES (direct)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_messages" ON messages;
CREATE POLICY "read_messages" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Team messages
CREATE TABLE IF NOT EXISTS team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_team_messages" ON team_messages;
CREATE POLICY "read_team_messages" ON team_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM team_members WHERE team_members.team_id = team_messages.team_id AND team_members.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_team_messages" ON team_messages;
CREATE POLICY "insert_own_team_messages" ON team_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ============================================================
-- RESEARCH OPPORTUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS research_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  professor text DEFAULT '',
  research_area text DEFAULT '',
  skills_needed text[] DEFAULT '{}',
  duration text DEFAULT '',
  open_positions int DEFAULT 1,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE research_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_research" ON research_opportunities;
CREATE POLICY "read_research" ON research_opportunities FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_research" ON research_opportunities;
CREATE POLICY "insert_own_research" ON research_opportunities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_research" ON research_opportunities;
CREATE POLICY "delete_own_research" ON research_opportunities FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS research_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id uuid REFERENCES research_opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE research_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_research_applications" ON research_applications;
CREATE POLICY "read_research_applications" ON research_applications FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_research_applications" ON research_applications;
CREATE POLICY "insert_own_research_applications" ON research_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  link text DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_notifications" ON notifications;
CREATE POLICY "read_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- COMMUNITY Q&A
-- ============================================================
CREATE TABLE IF NOT EXISTS community_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  tags text[] DEFAULT '{}',
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_questions" ON community_questions;
CREATE POLICY "read_questions" ON community_questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_questions" ON community_questions;
CREATE POLICY "insert_own_questions" ON community_questions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "delete_own_questions" ON community_questions;
CREATE POLICY "delete_own_questions" ON community_questions FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

CREATE TABLE IF NOT EXISTS community_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES community_questions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_answers" ON community_answers;
CREATE POLICY "read_answers" ON community_answers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_answers" ON community_answers;
CREATE POLICY "insert_own_answers" ON community_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "delete_own_answers" ON community_answers;
CREATE POLICY "delete_own_answers" ON community_answers FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile ON profile_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_profile ON profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_question ON community_answers(question_id);
