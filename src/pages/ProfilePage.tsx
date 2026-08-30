import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageSquare, UserPlus, Check, MapPin, Calendar, Briefcase, Award, Trophy,
  Code2, Heart, FolderGit2, BookOpen, Mail, Pencil, X,
} from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { MatchScore, MatchBar } from '@/components/MatchScore';
import { Profile, Experience, Certification, Achievement, Project } from '@/lib/types';
import { calculateMatch } from '@/lib/match';
import { DEPARTMENTS, ACADEMIC_YEARS, AVAILABILITY_OPTIONS, EXPERIENCE_LEVELS, SKILL_OPTIONS, INTEREST_OPTIONS } from '@/lib/types';
import { toast } from '@/lib/toast';
import { getSampleStudent, isSampleId, recordActivity } from '@/lib/sampleData';
import { SAMPLE_PROJECTS } from '@/data/sampleProjects';

export function ProfilePage() {
  const { id } = useParams();
  const { user, profile: myProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [editSkills, setEditSkills] = useState<string[]>([]);

  const isOwn = user?.id === id;

  useEffect(() => {
    if (!id) return;
    async function load() {
      const sample = getSampleStudent(id!);
      if (sample || isSampleId(id)) {
        if (sample) {
          setProfile(sample);
          setEditData(sample);
          setSkills(sample.skills);
          setEditSkills(sample.skills);
          setInterests(sample.interests);
          setExperiences(sample.experiences);
          setCertifications(sample.certifications);
          setAchievements(sample.achievements);
          setProjects(SAMPLE_PROJECTS.filter((p) => p.owner_id === sample.id));
          recordActivity({ type: 'profile', id: sample.id, title: sample.full_name, href: `/app/profile/${sample.id}` });
        }
        if (user && sample && user.id !== sample.id) {
          const [{ data: ms }, { data: mi }] = await Promise.all([
            supabase.from('profile_skills').select('skill_name').eq('profile_id', user.id),
            supabase.from('profile_interests').select('interest_name').eq('profile_id', user.id),
          ]);
          setMySkills((ms || []).map((s: any) => s.skill_name));
          setMyInterests((mi || []).map((i: any) => i.interest_name));
        }
        setLoading(false);
        return;
      }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      setProfile(p as Profile | null);
      setEditData(p || {});

      const [sk, ins, exp, cert, ach, proj] = await Promise.all([
        supabase.from('profile_skills').select('skill_name').eq('profile_id', id),
        supabase.from('profile_interests').select('interest_name').eq('profile_id', id),
        supabase.from('experiences').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
        supabase.from('certifications').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
        supabase.from('achievements').select('*').eq('profile_id', id).order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('owner_id', id).order('created_at', { ascending: false }),
      ]);
      setSkills((sk.data || []).map((s: any) => s.skill_name));
      setEditSkills((sk.data || []).map((s: any) => s.skill_name));
      setInterests((ins.data || []).map((i: any) => i.interest_name));
      setExperiences((exp.data || []) as Experience[]);
      setCertifications((cert.data || []) as Certification[]);
      setAchievements((ach.data || []) as Achievement[]);
      setProjects((proj.data || []) as Project[]);
      if (p) {
        recordActivity({ type: 'profile', id: p.id, title: p.full_name, href: `/app/profile/${p.id}` });
      }

      if (user && !isOwn) {
        const [{ data: ms }, { data: mi }, { data: conn }] = await Promise.all([
          supabase.from('profile_skills').select('skill_name').eq('profile_id', user.id),
          supabase.from('profile_interests').select('interest_name').eq('profile_id', user.id),
          supabase.from('connections').select('id').eq('requester_id', user.id).eq('receiver_id', id).maybeSingle(),
        ]);
        setMySkills((ms || []).map((s: any) => s.skill_name));
        setMyInterests((mi || []).map((i: any) => i.interest_name));
        setConnected(!!conn);
      }
      setLoading(false);
    }
    load();
  }, [id, user, isOwn]);

  const match = profile ? calculateMatch(
    mySkills, myInterests, myProfile?.availability_status || '',
    skills, interests, profile.availability_status
  ) : null;

  async function connect() {
    if (!user || !profile) return;
    if (isSampleId(profile.id)) {
      setConnected(true);
      toast.success('Demo profile — connection saved locally for this session');
      return;
    }
    const { error } = await supabase.from('connections').insert({
      requester_id: user.id, receiver_id: profile.id,
    });
    if (error) { toast.error('Already connected or request pending'); return; }
    await supabase.from('notifications').insert({
      user_id: profile.id, type: 'connection',
      title: 'New connection request', body: `${myProfile?.full_name} wants to connect`,
      link: `/app/profile/${user.id}`,
    });
    setConnected(true);
    toast.success('Connection request sent!');
  }

  async function saveEdit() {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      full_name: editData.full_name, department: editData.department,
      academic_year: editData.academic_year, program: editData.program,
      about: editData.about, availability_status: editData.availability_status,
      experience_level: editData.experience_level,
    }).eq('id', user.id);
    if (error) { toast.error('Failed to save'); return; }

    await supabase.from('profile_skills').delete().eq('profile_id', user.id);
    if (editSkills.length > 0) {
      await supabase.from('profile_skills').insert(editSkills.map((s) => ({ profile_id: user.id, skill_name: s, proficiency: 3 })));
    }
    setSkills(editSkills);
    setProfile({ ...profile!, ...editData } as Profile);
    setEditing(false);
    toast.success('Profile updated!');
  }

  if (loading) {
    return (
      <div>
        <AppHeader title="Profile" />
        <div className="container-px mx-auto max-w-container py-8">
          <div className="skeleton h-64 mb-6" />
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <AppHeader title="Profile" />
        <div className="container-px mx-auto max-w-container py-8">
          <div className="card p-12 text-center">
            <p className="text-slatey-500">Profile not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="Profile" />
      <div className="container-px mx-auto max-w-container py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - main profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile header */}
            <div className="card overflow-hidden">
              <div className="h-28 gradient-bg" />
              <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-12">
                  <Avatar name={profile.full_name} src={profile.avatar_url} size="2xl" />
                  {isOwn && !isSampleId(profile.id) && (
                    <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
                      {editing ? <><X className="h-4 w-4" /> Cancel</> : <><Pencil className="h-4 w-4" /> Edit Profile</>}
                    </button>
                  )}
                </div>
                {editing ? (
                  <div className="mt-4 space-y-3">
                    <input value={editData.full_name || ''} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} className="input-field" placeholder="Full name" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select value={editData.department || ''} onChange={(e) => setEditData({ ...editData, department: e.target.value })} className="input-field">
                        <option value="">Department</option>
                        {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={editData.academic_year || ''} onChange={(e) => setEditData({ ...editData, academic_year: e.target.value })} className="input-field">
                        <option value="">Year</option>
                        {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <select value={editData.availability_status || ''} onChange={(e) => setEditData({ ...editData, availability_status: e.target.value })} className="input-field">
                      {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select value={editData.experience_level || ''} onChange={(e) => setEditData({ ...editData, experience_level: e.target.value })} className="input-field">
                      {EXPERIENCE_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <textarea value={editData.about || ''} onChange={(e) => setEditData({ ...editData, about: e.target.value })} rows={3} className="input-field resize-none" placeholder="About you" />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slatey-700">Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.map((s) => (
                          <button key={s} onClick={() => setEditSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                            className={`tag px-3 py-1.5 text-sm ${editSkills.includes(s) ? 'bg-brand-600 text-white' : 'bg-slatey-100 text-slatey-600'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={saveEdit} className="btn-primary w-full">Save Changes</button>
                  </div>
                ) : (
                  <>
                    <h1 className="mt-4 font-display text-2xl font-bold text-slatey-900">{profile.full_name}</h1>
                    <p className="text-slatey-500">{profile.department} · {profile.academic_year}</p>
                    {profile.bio && <p className="mt-2 text-sm text-slatey-600">{profile.bio}</p>}
                    {profile.program && profile.program !== profile.department && <p className="text-sm text-slatey-400 mt-0.5">{profile.program}</p>}
                    {'preferred_role' in profile && (profile as { preferred_role?: string }).preferred_role && (
                      <p className="mt-2 text-sm font-medium text-brand-600">{(profile as { preferred_role?: string }).preferred_role}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slatey-500">
                      <span className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${profile.availability_status === 'Open to collaborate' ? 'bg-tealx-500' : 'bg-slatey-300'}`} />
                        {profile.availability_status}
                      </span>
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {profile.experience_level}</span>
                      <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4" /> {profile.completed_projects} projects completed</span>
                    </div>
                    {profile.about && profile.about !== profile.bio && <p className="mt-4 text-slatey-600 leading-relaxed">{profile.about}</p>}
                    {!isOwn && (
                      <div className="mt-6 flex gap-3">
                        <Link to={`/app/messages?to=${profile.id}`} className="btn-secondary flex-1">
                          <MessageSquare className="h-4 w-4" /> Message
                        </Link>
                        <button onClick={connect} disabled={connected} className="btn-primary flex-1 disabled:opacity-60">
                          {connected ? <><Check className="h-4 w-4" /> Connected</> : <><UserPlus className="h-4 w-4" /> Connect</>}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900">
                <Code2 className="h-5 w-5 text-brand-600" /> Skills
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.length > 0 ? skills.map((s) => (
                  <span key={s} className="tag bg-brand-50 text-brand-700 px-3 py-1.5">{s}</span>
                )) : <p className="text-sm text-slatey-400">No skills added yet.</p>}
              </div>
            </div>

            {/* Interests */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900">
                <Heart className="h-5 w-5 text-cyanx-600" /> Interests
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.length > 0 ? interests.map((i) => (
                  <span key={i} className="tag bg-cyanx-50 text-cyanx-700 px-3 py-1.5">{i}</span>
                )) : <p className="text-sm text-slatey-400">No interests added yet.</p>}
              </div>
            </div>

            {/* Experience */}
            {experiences.length > 0 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900">
                  <Briefcase className="h-5 w-5 text-slatey-600" /> Experience
                </h2>
                <div className="mt-4 space-y-4">
                  {experiences.map((e) => (
                    <div key={e.id} className="border-l-2 border-brand-200 pl-4">
                      <h3 className="font-medium text-slatey-900">{e.title}</h3>
                      <p className="text-sm text-slatey-500">{e.organization}</p>
                      {e.description && <p className="mt-1 text-sm text-slatey-600">{e.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900">
                <FolderGit2 className="h-5 w-5 text-brand-600" /> Projects
              </h2>
              {projects.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {projects.map((p) => (
                    <Link key={p.id} to="/app/projects" className="rounded-xl border border-slatey-200 p-4 hover:border-brand-300 hover:shadow-card transition-all">
                      <h3 className="font-medium text-slatey-900">{p.title}</h3>
                      <p className="mt-1 text-sm text-slatey-500 line-clamp-2">{p.description}</p>
                      <span className="mt-2 inline-block tag bg-brand-50 text-brand-600">{p.project_type}</span>
                    </Link>
                  ))}
                </div>
              ) : <p className="mt-4 text-sm text-slatey-400">No projects yet.</p>}
            </div>
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-6">
            {/* Match score */}
            {!isOwn && match && (
              <div className="card p-6 text-center">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slatey-500">Match Score</h2>
                <div className="mt-4 flex justify-center">
                  <MatchScore score={match.overall} size="lg" showLabel />
                </div>
                <div className="mt-6 space-y-3">
                  <MatchBar label="Skills Match" value={match.skills} />
                  <MatchBar label="Interest Match" value={match.interests} />
                  <MatchBar label="Schedule Match" value={match.availability} />
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900">
                  <Award className="h-5 w-5 text-tealx-600" /> Certifications
                </h2>
                <div className="mt-4 space-y-3">
                  {certifications.map((c) => (
                    <div key={c.id}>
                      <h3 className="text-sm font-medium text-slatey-900">{c.title}</h3>
                      <p className="text-xs text-slatey-500">{c.issuer} · {c.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900">
                  <Trophy className="h-5 w-5 text-amber-500" /> Achievements
                </h2>
                <div className="mt-4 space-y-3">
                  {achievements.map((a) => (
                    <div key={a.id}>
                      <h3 className="text-sm font-medium text-slatey-900">{a.title}</h3>
                      {a.description && <p className="text-xs text-slatey-500">{a.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
