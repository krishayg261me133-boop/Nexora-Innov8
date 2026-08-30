import { Project } from '@/lib/types';
import { SAMPLE_STUDENTS_BY_NAME } from './sampleStudents';

function ownerId(name: string) {
  return SAMPLE_STUDENTS_BY_NAME[name.toLowerCase()]?.id || '';
}

function sampleProject(p: {
  projectId: string;
  title: string;
  projectType: string;
  department: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  currentMembers: number;
  openRoles: string[];
  difficulty: string;
  duration: string;
  status: string;
  createdBy: string;
}): Project {
  return {
    id: `sample-${p.projectId}`,
    owner_id: ownerId(p.createdBy),
    owner_name: p.createdBy,
    title: p.title,
    description: p.description,
    project_type: p.projectType,
    department: p.department,
    required_skills: p.requiredSkills,
    team_size: p.teamSize,
    open_roles: p.openRoles,
    timeline: p.duration,
    status: p.status.toLowerCase() === 'open' ? 'open' : p.status.toLowerCase() === 'in progress' ? 'in progress' : p.status.toLowerCase(),
    created_at: '2026-07-01T10:00:00.000Z',
    current_members: p.currentMembers,
    difficulty: p.difficulty,
  };
}

export const SAMPLE_PROJECTS: Project[] = [
  sampleProject({
    projectId: 'P001',
    title: 'AI Resume Analyzer',
    projectType: 'Hackathon',
    department: 'Computer Science',
    description: 'An AI-powered platform that analyzes resumes and provides improvement suggestions.',
    requiredSkills: ['Python', 'Machine Learning', 'React', 'UI/UX'],
    teamSize: 5,
    currentMembers: 2,
    openRoles: ['ML Engineer', 'Frontend Developer', 'UI Designer'],
    difficulty: 'Intermediate',
    duration: '2 Months',
    status: 'Open',
    createdBy: 'Ananya Sharma',
  }),
  sampleProject({
    projectId: 'P002',
    title: 'Campus Waste Segregation Tracker',
    projectType: 'Research',
    department: 'Environmental Engineering',
    description: 'An IoT and data-driven system that monitors and improves waste segregation practices across campus hostels and departments.',
    requiredSkills: ['IoT', 'Data Analysis', 'Python', 'Embedded Systems'],
    teamSize: 4,
    currentMembers: 1,
    openRoles: ['IoT Developer', 'Data Analyst', 'Research Assistant'],
    difficulty: 'Advanced',
    duration: '4 Months',
    status: 'Open',
    createdBy: 'Rohan Mehta',
  }),
  sampleProject({
    projectId: 'P003',
    title: 'Peer-to-Peer Study Notes Marketplace',
    projectType: 'Project',
    department: 'Information Technology',
    description: 'A platform where students can upload, share, and rate study notes and past exam materials by course and semester.',
    requiredSkills: ['Node.js', 'MongoDB', 'React', 'UI/UX'],
    teamSize: 4,
    currentMembers: 3,
    openRoles: ['Backend Developer'],
    difficulty: 'Beginner',
    duration: '6 Weeks',
    status: 'Open',
    createdBy: 'Fatima Sheikh',
  }),
  sampleProject({
    projectId: 'P004',
    title: 'Smart Attendance System Using Facial Recognition',
    projectType: 'Hackathon',
    department: 'Computer Science',
    description: 'A facial-recognition based attendance system that automates classroom attendance and generates real-time reports.',
    requiredSkills: ['Python', 'OpenCV', 'Machine Learning', 'Flask'],
    teamSize: 5,
    currentMembers: 5,
    openRoles: [],
    difficulty: 'Advanced',
    duration: '1 Month',
    status: 'In Progress',
    createdBy: 'Karan Malhotra',
  }),
  sampleProject({
    projectId: 'P005',
    title: 'Mental Health Support Chatbot for Students',
    projectType: 'Research',
    department: 'Psychology',
    description: 'A conversational AI chatbot offering first-level emotional support and connecting students to campus counselors when needed.',
    requiredSkills: ['NLP', 'Python', 'Psychology Research', 'UI/UX'],
    teamSize: 6,
    currentMembers: 2,
    openRoles: ['NLP Engineer', 'Research Assistant', 'UI Designer', 'Content Writer'],
    difficulty: 'Intermediate',
    duration: '3 Months',
    status: 'Open',
    createdBy: 'Neha Kulkarni',
  }),
  sampleProject({
    projectId: 'P006',
    title: 'Campus Ride-Sharing App',
    projectType: 'Project',
    department: 'Computer Science',
    description: 'A ride-sharing app connecting students commuting to campus from similar routes to split costs and reduce traffic.',
    requiredSkills: ['React Native', 'Firebase', 'Google Maps API', 'Node.js'],
    teamSize: 4,
    currentMembers: 1,
    openRoles: ['Mobile Developer', 'Backend Developer', 'Firebase Specialist'],
    difficulty: 'Intermediate',
    duration: '2 Months',
    status: 'Open',
    createdBy: 'Aditya Verma',
  }),
  sampleProject({
    projectId: 'P007',
    title: 'Renewable Energy Consumption Dashboard',
    projectType: 'Research',
    department: 'Electrical Engineering',
    description: 'A dashboard visualizing real-time solar and wind energy generation across campus renewable installations.',
    requiredSkills: ['Data Visualization', 'Python', 'IoT', 'Electrical Systems'],
    teamSize: 3,
    currentMembers: 1,
    openRoles: ['Data Visualization Developer', 'Hardware Engineer'],
    difficulty: 'Advanced',
    duration: '3 Months',
    status: 'Open',
    createdBy: 'Priya Nair',
  }),
  sampleProject({
    projectId: 'P008',
    title: 'Skill-Based Hackathon Team Finder',
    projectType: 'Hackathon',
    department: 'Information Technology',
    description: 'A matchmaking tool that pairs hackathon participants based on complementary skills and availability, built as an internal demo for NEXORA.',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Algorithms'],
    teamSize: 4,
    currentMembers: 0,
    openRoles: ['Frontend Developer', 'Backend Developer', 'Algorithm Designer', 'UI Designer'],
    difficulty: 'Beginner',
    duration: '48 Hours',
    status: 'Open',
    createdBy: 'Saloni Bhanwar',
  }),
  sampleProject({
    projectId: 'P009',
    title: 'AI-Based Plagiarism Detector for Assignments',
    projectType: 'Project',
    department: 'Computer Science',
    description: 'A tool that checks student assignment submissions for textual and code plagiarism using semantic similarity models.',
    requiredSkills: ['NLP', 'Python', 'Machine Learning', 'Django'],
    teamSize: 5,
    currentMembers: 4,
    openRoles: ['ML Engineer'],
    difficulty: 'Advanced',
    duration: '2 Months',
    status: 'Open',
    createdBy: 'Rishabh Nagvekar',
  }),
  sampleProject({
    projectId: 'P010',
    title: 'Research Paper Recommendation Engine',
    projectType: 'Research',
    department: 'Computer Science',
    description: 'A recommendation system that suggests relevant research papers to students and mentors based on their profile and past interests.',
    requiredSkills: ['Machine Learning', 'Python', 'Data Mining', 'APIs'],
    teamSize: 3,
    currentMembers: 1,
    openRoles: ['Data Scientist', 'Backend Developer'],
    difficulty: 'Intermediate',
    duration: '10 Weeks',
    status: 'Open',
    createdBy: 'Krishay G',
  }),
];

export const SAMPLE_PROJECTS_BY_ID = Object.fromEntries(SAMPLE_PROJECTS.map((p) => [p.id, p]));
