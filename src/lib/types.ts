export interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  academic_year: string;
  program: string;
  bio: string;
  avatar_url: string;
  about: string;
  availability_status: string;
  experience_level: string;
  completed_projects: number;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileSkill {
  id: string;
  profile_id: string;
  skill_name: string;
  proficiency: number;
}

export interface ProfileInterest {
  id: string;
  profile_id: string;
  interest_name: string;
}

export interface Experience {
  id: string;
  profile_id: string;
  title: string;
  organization: string;
  description: string;
  start_date: string;
  end_date: string;
}

export interface Certification {
  id: string;
  profile_id: string;
  title: string;
  issuer: string;
  date: string;
}

export interface Achievement {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  date: string;
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  project_type: string;
  department: string;
  required_skills: string[];
  team_size: number;
  open_roles: string[];
  timeline: string;
  status: string;
  created_at: string;
  owner_name?: string;
  current_members?: number;
  difficulty?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  status: string;
}

export interface Team {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  purpose: string;
  required_skills: string[];
  team_size: number;
  status: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface TeamMessage {
  id: string;
  team_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ResearchOpportunity {
  id: string;
  owner_id: string;
  title: string;
  professor: string;
  research_area: string;
  skills_needed: string[];
  duration: string;
  open_positions: number;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface CommunityQuestion {
  id: string;
  author_id: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  created_at: string;
}

export interface CommunityAnswer {
  id: string;
  question_id: string;
  author_id: string;
  body: string;
  upvotes: number;
  created_at: string;
}

export const SKILL_OPTIONS = [
  'Frontend', 'Backend', 'UI/UX', 'AI/ML', 'Data Science',
  'Mobile Development', 'Cybersecurity', 'Cloud', 'Marketing', 'Content Writing',
  'DevOps', 'Blockchain', 'Game Development', 'Product Management', 'QA Testing',
];

export const INTEREST_OPTIONS = [
  'Hackathons', 'Open Source', 'Startups', 'Research', 'Web Development',
  'Mobile Apps', 'AI & Robotics', 'FinTech', 'HealthTech', 'EdTech',
  'Gaming', 'Music', 'Photography', 'Sports', 'Entrepreneurship',
];

export const DEPARTMENTS = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Business Administration', 'Mathematics',
  'Physics', 'Biology', 'Chemistry', 'Design', 'Information Technology',
  'Data Science', 'Artificial Intelligence', 'Electronics and Communication',
  'Environmental Engineering', 'Psychology', 'Other',
];

export const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgraduate', 'PhD'];

export const PROJECT_TYPES = ['Hackathon', 'Research', 'Academic', 'Project', 'Startup Idea'];

export const COMMUNITY_TAGS = [
  'Hackathons', 'Placements', 'DSA', 'Web Development', 'AI/ML',
  'Research', 'Startups', 'Career Guidance',
];

export const AVAILABILITY_OPTIONS = ['Open to collaborate', 'Busy', 'Available soon', 'Not available'];

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
