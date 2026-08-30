import { Profile } from './types';

export interface MatchBreakdown {
  overall: number;
  skills: number;
  interests: number;
  availability: number;
}

export function calculateMatch(
  mySkills: string[],
  myInterests: string[],
  myAvailability: string,
  theirSkills: string[],
  theirInterests: string[],
  theirAvailability: string
): MatchBreakdown {
  const skillScore = mySkills.length === 0
    ? 50
    : Math.round((mySkills.filter((s) => theirSkills.includes(s)).length / mySkills.length) * 100);

  const interestScore = myInterests.length === 0
    ? 50
    : Math.round((myInterests.filter((i) => theirInterests.includes(i)).length / myInterests.length) * 100);

  const availabilityScore = myAvailability === theirAvailability ? 100 : myAvailability === 'Open to collaborate' ? 70 : 40;

  const overall = Math.round(skillScore * 0.4 + interestScore * 0.3 + availabilityScore * 0.3);

  return { overall, skills: skillScore, interests: interestScore, availability: availabilityScore };
}

export function matchColor(score: number): string {
  if (score >= 80) return 'text-tealx-600';
  if (score >= 60) return 'text-brand-600';
  if (score >= 40) return 'text-cyanx-600';
  return 'text-slatey-500';
}

export function matchBg(score: number): string {
  if (score >= 80) return 'bg-tealx-500';
  if (score >= 60) return 'bg-brand-500';
  if (score >= 40) return 'bg-cyanx-500';
  return 'bg-slatey-400';
}

export function matchRing(score: number): string {
  if (score >= 80) return 'ring-tealx-300';
  if (score >= 60) return 'ring-brand-300';
  if (score >= 40) return 'ring-cyanx-300';
  return 'ring-slatey-300';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function avatarGradient(name: string): string {
  const gradients = [
    'from-brand-500 to-cyanx-500',
    'from-cyanx-500 to-tealx-500',
    'from-brand-600 to-tealx-500',
    'from-tealx-500 to-brand-500',
    'from-cyanx-600 to-brand-500',
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}
