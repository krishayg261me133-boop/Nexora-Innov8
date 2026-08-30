import { CommunityAnswer, CommunityQuestion, Profile } from '@/lib/types';
import { SAMPLE_STUDENTS, SAMPLE_STUDENTS_BY_ID } from './sampleStudents';

export interface SampleAnswer extends CommunityAnswer {
  author: Profile;
}

export interface SampleQuestion extends CommunityQuestion {
  author: Profile;
  answers: SampleAnswer[];
}

function q(
  id: string,
  authorId: string,
  title: string,
  body: string,
  tags: string[],
  created_at: string,
  upvotes: number,
  answers: { id: string; authorId: string; body: string; upvotes: number; created_at: string }[]
): SampleQuestion {
  const author = SAMPLE_STUDENTS_BY_ID[authorId];
  return {
    id,
    author_id: authorId,
    title,
    body,
    tags,
    upvotes,
    created_at,
    author,
    answers: answers.map((a) => ({
      ...a,
      question_id: id,
      author_id: a.authorId,
      author: SAMPLE_STUDENTS_BY_ID[a.authorId],
    })),
  };
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  q(
    'sample-Q001',
    'sample-S005',
    'SIH 2026 — anyone forming a hardware + software team?',
    'Looking for teammates for Smart India Hackathon. We already have embedded/IoT covered. Need a Flutter or React Native person and someone decent at pitching. Prefer people who can stay on campus during the internal hackathon weekend. Problem statements we like: smart campus, waste management, and edge AI.',
    ['Hackathons'],
    '2026-08-12T09:30:00.000Z',
    24,
    [
      { id: 'sample-A001a', authorId: 'sample-S009', body: 'I can take mobile. Built a campus app in Flutter last sem. Free most weekends except placement tests. DM if you still need a Flutter lead.', upvotes: 11, created_at: '2026-08-12T11:00:00.000Z' },
      { id: 'sample-A001b', authorId: 'sample-S006', body: 'I can help with the pitch deck and UI. SIH judges care a lot about problem framing + demo polish, not just the hardware. Happy to join if the PS is campus-related.', upvotes: 8, created_at: '2026-08-12T14:20:00.000Z' },
    ]
  ),
  q(
    'sample-Q002',
    'sample-S001',
    'TCS NQT vs Infosys OA — what should 3rd years actually prepare?',
    'Placement cell said TCS NQT is in September and Infosys might open soon. I am decent at DSA but my verbal is mid. Anyone who sat last year — how much aptitude vs coding? Also, is the coding round still 2 questions in 45 mins?',
    ['Placements', 'Career Guidance'],
    '2026-08-18T08:00:00.000Z',
    41,
    [
      { id: 'sample-A002a', authorId: 'sample-S007', body: 'For TCS NQT: numerical + verbal + 1–2 coding. Don’t skip number systems and time-work. Coding is usually arrays/strings, not hard DP. Infosys OA is more DSA-heavy — practise 2-pointer, hashing, and easy graphs. Mock on Mettl/HackerRank if you can.', upvotes: 19, created_at: '2026-08-18T09:10:00.000Z' },
      { id: 'sample-A002b', authorId: 'sample-S010', body: 'If you want product companies later, don’t only grind NQT. Keep LeetCode medium going. For service companies, 150–200 easy/medium + aptitude mocks is enough. Resume should have 1 solid project you can explain end-to-end.', upvotes: 14, created_at: '2026-08-18T16:45:00.000Z' },
    ]
  ),
  q(
    'sample-Q003',
    'sample-S008',
    'How do you actually get good at DSA starting in 1st year?',
    'Seniors keep saying “start DSA early” but I don’t know the order. Should I finish C++ STL first? College lab is still on loops. I tried Striver sheet and froze at arrays. Need a realistic 45-min-a-day plan.',
    ['DSA'],
    '2026-08-05T18:00:00.000Z',
    33,
    [
      { id: 'sample-A003a', authorId: 'sample-S007', body: 'Month 1: arrays, strings, hashing. Month 2: recursion + linked lists. Month 3: stacks/queues + binary search. Don’t jump to DP. 1 topic, 5 problems, consistency > 50 problems in a panic weekend. GFG basics then LeetCode Easy.', upvotes: 22, created_at: '2026-08-05T19:30:00.000Z' },
      { id: 'sample-A003b', authorId: 'sample-S004', body: 'Also implement each structure once yourself. Watching a YouTube playlist without coding is a trap. If you’re stuck 20 mins, read editorial, then re-solve next day without notes.', upvotes: 9, created_at: '2026-08-06T07:15:00.000Z' },
    ]
  ),
  q(
    'sample-Q004',
    'sample-S006',
    'React + internships: is a portfolio site enough or do I need backend too?',
    'I have 3 UI clones and a Figma case study. Applying for frontend internships in Pune/Bangalore startups. Recruiters keep asking about APIs. Should I learn Node/Express properly or is Firebase fine for now?',
    ['Web Development', 'Career Guidance'],
    '2026-08-20T12:00:00.000Z',
    18,
    [
      { id: 'sample-A004a', authorId: 'sample-S001', body: 'For frontend internships, one full-stack project beats five clones. Even a notes app with auth + REST is enough. Firebase is fine if you can explain security rules and data modelling. Learn Express later when you have time.', upvotes: 12, created_at: '2026-08-20T13:40:00.000Z' },
      { id: 'sample-A004b', authorId: 'sample-S009', body: 'Put a live Vercel/Netlify link + GitHub. I got callbacks after I added a case study: problem, screens, and what I changed after user feedback (even if users were classmates).', upvotes: 7, created_at: '2026-08-20T17:05:00.000Z' },
    ]
  ),
  q(
    'sample-Q005',
    'sample-S002',
    'College GPU is a potato — how are people training models for mini-projects?',
    'Want to fine-tune a small NLP model for our department project. Colab disconnects, Kaggle is okay-ish. Is it realistic to stick to classical ML + sklearn and still get a good grade? Guide said “use transformers”.',
    ['AI/ML', 'Research'],
    '2026-08-08T10:20:00.000Z',
    27,
    [
      { id: 'sample-A005a', authorId: 'sample-S004', body: 'Use Hugging Face inference or a distilled model (DistilBERT). Fine-tune 2–3 epochs on a tiny cleaned dataset. Document preprocessing + evaluation properly — that’s what most viva panels actually probe. Don’t burn 3 weeks fighting CUDA.', upvotes: 16, created_at: '2026-08-08T11:00:00.000Z' },
      { id: 'sample-A005b', authorId: 'sample-S010', body: 'If the contribution is the problem (campus dataset, annotation, error analysis), sklearn baseline + one transformer comparison is a solid report. Kaggle notebooks + wandb screenshots help in the PPT.', upvotes: 10, created_at: '2026-08-08T15:22:00.000Z' },
    ]
  ),
  q(
    'sample-Q006',
    'sample-S010',
    'How do you approach a professor for a research internship without a CGPA of 9?',
    'CGPA is 8.1, have one IEEE student paper in progress. Want to work on computer vision this semester. Do I email with a CV or show up after class? What should the mail even say so it doesn’t look like spam?',
    ['Research', 'Career Guidance'],
    '2026-08-14T07:45:00.000Z',
    36,
    [
      { id: 'sample-A006a', authorId: 'sample-S002', body: 'Read 1–2 of their recent papers. Mail subject: “Interest in [paper title] — 3rd/4th year student”. 8 lines max: who you are, what you understood, what you can help with (annotation, experiments, lit review), attach 1-page CV. Follow up once after 7 days.', upvotes: 21, created_at: '2026-08-14T09:00:00.000Z' },
      { id: 'sample-A006b', authorId: 'sample-S004', body: 'Lab meetings are better than cold email if they have one. Offer 8–10 hours/week so they know you’re serious. CGPA matters less if you can show a GitHub notebook reproducing a figure from their paper.', upvotes: 13, created_at: '2026-08-14T19:10:00.000Z' },
    ]
  ),
  q(
    'sample-Q007',
    'sample-S009',
    'Campus startup idea: notes marketplace — legal/ethics issues?',
    'We want to let students upload notes and PYQs. A few seniors said university might have copyright issues, and some faculty hate paid notes. Has anyone shipped something like this on campus? Free vs paid? Moderation?',
    ['Startups', 'Web Development'],
    '2026-08-22T16:00:00.000Z',
    15,
    [
      { id: 'sample-A007a', authorId: 'sample-S003', body: 'Don’t sell faculty slides. Student-made summaries + crowdsourced doubts is safer. Add a report button and ban watermarks of coaching institutes. Start as a club tool, not a company, until you talk to the student council.', upvotes: 9, created_at: '2026-08-22T17:30:00.000Z' },
      { id: 'sample-A007b', authorId: 'sample-S001', body: 'MVP: course code + semester + rating. Keep it free first to get supply. Payments will bring UPI/GST headaches you don’t need in v0. See if the library already has a repository you can integrate with.', upvotes: 6, created_at: '2026-08-23T08:12:00.000Z' },
    ]
  ),
  q(
    'sample-Q008',
    'sample-S003',
    'CTF vs placements — can I do both in 3rd year?',
    'I enjoy cybersecurity and we have a decent CTF record, but placement season is coming. Recruiters in service companies barely look at CTF. Is it worth continuing Nationals or should I switch fully to DSA + projects?',
    ['Hackathons', 'Placements', 'Career Guidance'],
    '2026-08-11T21:00:00.000Z',
    22,
    [
      { id: 'sample-A008a', authorId: 'sample-S007', body: 'If you want security roles (product/consulting), CTF + a writeup blog is a differentiator. For generic SDE, keep CTF as a weekend thing and don’t skip weekly contests. Put “Top X in National CTF” as one bullet, not your whole resume.', upvotes: 14, created_at: '2026-08-12T06:40:00.000Z' },
      { id: 'sample-A008b', authorId: 'sample-S005', body: 'Same boat with hardware. Companies care about what you can explain in 8 minutes. One SIH + one CTF + DSA practice is a better story than only grinding sheets.', upvotes: 5, created_at: '2026-08-12T10:05:00.000Z' },
    ]
  ),
  q(
    'sample-Q009',
    'sample-S004',
    'Off-campus AI internships — where are 2nd years actually getting callbacks?',
    'Applied on LinkedIn to 40 “ML intern” posts. Ghosted. College hasn’t opened internships for 2nd year. Any internships that don’t require “2 years PyTorch in production”? Open source? Research labs?',
    ['AI/ML', 'Career Guidance'],
    '2026-08-16T11:30:00.000Z',
    29,
    [
      { id: 'sample-A009a', authorId: 'sample-S002', body: 'Warm intros > cold apply. Message alumni from your department who are in startups. Attach a 60-second demo of a notebook. Also check IIT/NIT summer intern portals and company early-talent programs, not only LinkedIn Easy Apply.', upvotes: 17, created_at: '2026-08-16T12:15:00.000Z' },
      { id: 'sample-A009b', authorId: 'sample-S010', body: 'Contribute to a small OSS repo (issues labelled good-first-issue in sklearn/huggingface adjacent tools). One merged PR plus a campus project got me more replies than 40 generic applications.', upvotes: 11, created_at: '2026-08-16T20:00:00.000Z' },
    ]
  ),
  q(
    'sample-Q010',
    'sample-S007',
    'Should I take a research-heavy final year or grind for intern + PPO?',
    'Confused between a publication-oriented project with a prof vs a 6-month internship. Family wants a package. I like data engineering more than papers. GATE is also in the mix. How are people deciding?',
    ['Research', 'Placements', 'Career Guidance'],
    '2026-08-25T09:00:00.000Z',
    31,
    [
      { id: 'sample-A010a', authorId: 'sample-S010', body: 'If you want MS/PhD, paper + prof recommendation wins. If you want industry DE/SDE, internship + PPO is the clearer path. GATE if you want PSU/MTech as a backup — don’t prepare it half-heartedly alongside both.', upvotes: 18, created_at: '2026-08-25T10:20:00.000Z' },
      { id: 'sample-A010b', authorId: 'sample-S001', body: 'You can do a lighter research project (lit review + small experiment) and still intern in summer. Don’t sign up for a 4th-year project that needs daily lab presence if you’re sitting companies in July–Dec.', upvotes: 8, created_at: '2026-08-25T14:55:00.000Z' },
    ]
  ),
  q(
    'sample-Q011',
    'sample-S006',
    'Best first hackathon as a designer who barely codes?',
    'I can Figma fast but my JavaScript is shaky. Friends say I’ll be “just the PPT person”. Want a hackathon where design actually matters. Any campus or national ones worth it? How do I not get sidelined?',
    ['Hackathons', 'Web Development'],
    '2026-08-09T15:10:00.000Z',
    20,
    [
      { id: 'sample-A011a', authorId: 'sample-S009', body: 'Join a team that already has two developers. Own user flow, component library, and demo script. Unstop/Devfolio have plenty of student hacks. Bring a design system so the UI doesn’t collapse at 3am.', upvotes: 12, created_at: '2026-08-09T16:00:00.000Z' },
      { id: 'sample-A011b', authorId: 'sample-S003', body: 'Learn enough HTML/CSS/Tailwind to implement your screens. That one skill stops the “just PPT” label. We won a design track that way.', upvotes: 7, created_at: '2026-08-09T19:44:00.000Z' },
    ]
  ),
  q(
    'sample-Q012',
    'sample-S008',
    'AWS free tier + college club servers — am I going to get a surprise bill?',
    'IT club wants to host a small Docker app. I have Cloud Practitioner. Seniors scare me with stories of ₹12k bills. What’s a safe setup for a student club? Lightsail vs EC2 vs just Vercel + Supabase?',
    ['Web Development', 'Startups'],
    '2026-08-19T13:00:00.000Z',
    16,
    [
      { id: 'sample-A012a', authorId: 'sample-S001', body: 'For a club site: Vercel + Supabase/Firebase. Set AWS billing alarms at $1 if you still want to practise EC2. Never leave a t2.micro with a public 0.0.0.0 RDS. Turn off resources after demos.', upvotes: 13, created_at: '2026-08-19T13:40:00.000Z' },
      { id: 'sample-A012b', authorId: 'sample-S003', body: 'Also enable MFA on the root account and don’t share access keys in the club WhatsApp. That’s how bills happen, not Docker itself.', upvotes: 6, created_at: '2026-08-19T18:22:00.000Z' },
    ]
  ),
];

export const SAMPLE_QUESTIONS_BY_ID = Object.fromEntries(SAMPLE_QUESTIONS.map((q) => [q.id, q]));

export function sampleAuthor(id: string): Profile | undefined {
  return SAMPLE_STUDENTS_BY_ID[id] || SAMPLE_STUDENTS.find((s) => s.id === id);
}
