import { SAMPLE_PROJECTS, SAMPLE_PROJECTS_BY_ID } from '@/data/sampleProjects';
import { SAMPLE_QUESTIONS, SAMPLE_QUESTIONS_BY_ID, SampleQuestion } from '@/data/sampleQuestions';
import { SAMPLE_STUDENTS, SAMPLE_STUDENTS_BY_ID, SampleStudent } from '@/data/sampleStudents';
import { Profile, Project } from '@/lib/types';

export function isSampleId(id?: string | null) {
  return !!id && id.startsWith('sample-');
}

export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function getSampleStudent(id: string): SampleStudent | undefined {
  return SAMPLE_STUDENTS_BY_ID[id];
}

export function getSampleProject(id: string): Project | undefined {
  return SAMPLE_PROJECTS_BY_ID[id];
}

export function getSampleQuestion(id: string): SampleQuestion | undefined {
  return SAMPLE_QUESTIONS_BY_ID[id];
}

export function mergeStudents(live: (Profile & { skills?: string[]; interests?: string[] })[], currentUser?: { id?: string; full_name?: string } | null) {
  const liveIds = new Set(live.map((p) => p.id));
  const liveNames = new Set(live.map((p) => p.full_name?.toLowerCase()).filter(Boolean));
  const selfName = currentUser?.full_name?.toLowerCase();
  const samples = SAMPLE_STUDENTS.filter((s) => {
    if (currentUser?.id && s.id === currentUser.id) return false;
    if (selfName && s.full_name.toLowerCase() === selfName) return false;
    if (liveIds.has(s.id)) return false;
    if (liveNames.has(s.full_name.toLowerCase())) return false;
    return true;
  });
  return uniqueById([...samples, ...live.filter((p) => p.id !== currentUser?.id)]);
}

export function mergeProjects(live: Project[]) {
  const liveTitles = new Set(live.map((p) => p.title.toLowerCase()));
  const samples = SAMPLE_PROJECTS.filter((p) => !liveTitles.has(p.title.toLowerCase()));
  return uniqueById([...samples, ...live]);
}

export function mergeQuestions<T extends { id: string; title: string }>(live: T[]): (T | SampleQuestion)[] {
  const liveTitles = new Set(live.map((q) => q.title.toLowerCase()));
  const samples = SAMPLE_QUESTIONS.filter((q) => !liveTitles.has(q.title.toLowerCase()));
  return uniqueById([...samples, ...live]);
}

const VOTE_KEY = 'nexora-sample-votes';
const ACTIVITY_KEY = 'nexora-activity';

export function getSampleVotes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(VOTE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function bumpSampleVote(answerId: string) {
  const votes = getSampleVotes();
  votes[answerId] = (votes[answerId] || 0) + 1;
  localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
  return votes[answerId];
}

export function hasVotedSample(answerId: string) {
  const voted = JSON.parse(localStorage.getItem('nexora-sample-voted') || '[]') as string[];
  return voted.includes(answerId);
}

export function markVotedSample(answerId: string) {
  const voted = JSON.parse(localStorage.getItem('nexora-sample-voted') || '[]') as string[];
  if (!voted.includes(answerId)) {
    voted.push(answerId);
    localStorage.setItem('nexora-sample-voted', JSON.stringify(voted));
  }
}

export type ActivityItem = { type: 'profile' | 'project' | 'question'; id: string; title: string; href: string; at: string };

export function recordActivity(item: Omit<ActivityItem, 'at'>) {
  try {
    const prev = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]') as ActivityItem[];
    const next = [{ ...item, at: new Date().toISOString() }, ...prev.filter((p) => p.href !== item.href)].slice(0, 30);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getActivity(): ActivityItem[] {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
  } catch {
    return [];
  }
}

export { SAMPLE_STUDENTS, SAMPLE_PROJECTS, SAMPLE_QUESTIONS };
