import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, MapPin, MessageSquare, UserPlus, Check } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { MatchScore } from '@/components/MatchScore';
import { Profile } from '@/lib/types';
import { calculateMatch } from '@/lib/match';
import { DEPARTMENTS, SKILL_OPTIONS, ACADEMIC_YEARS, AVAILABILITY_OPTIONS } from '@/lib/types';
import { toast } from '@/lib/toast';
import { isSampleId, mergeStudents } from '@/lib/sampleData';

interface StudentWithMeta extends Profile {
  skills: string[];
  interests: string[];
}

export function DiscoverPage() {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState<StudentWithMeta[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [myInterests, setMyInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', skill: '', year: '', availability: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [{ data: ms }, { data: mi }] = await Promise.all([
        supabase.from('profile_skills').select('skill_name').eq('profile_id', user!.id),
        supabase.from('profile_interests').select('interest_name').eq('profile_id', user!.id),
      ]);
      setMySkills((ms || []).map((s: any) => s.skill_name));
      setMyInterests((mi || []).map((i: any) => i.interest_name));

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user!.id)
        .order('created_at', { ascending: false });
      const live = await Promise.all(((profiles || []) as Profile[]).map(async (p) => {
        const [{ data: ts }, { data: ti }] = await Promise.all([
          supabase.from('profile_skills').select('skill_name').eq('profile_id', p.id),
          supabase.from('profile_interests').select('interest_name').eq('profile_id', p.id),
        ]);
        return { ...p, skills: (ts || []).map((s: any) => s.skill_name), interests: (ti || []).map((i: any) => i.interest_name) };
      }));
      setStudents(mergeStudents(live, { id: user!.id, full_name: profile?.full_name }) as StudentWithMeta[]);

      const { data: conns } = await supabase
        .from('connections')
        .select('receiver_id')
        .eq('requester_id', user!.id);
      setConnectedIds(new Set((conns || []).map((c: any) => c.receiver_id)));
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (search && !s.full_name.toLowerCase().includes(search.toLowerCase()) && !s.department.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.department && s.department !== filters.department) return false;
      if (filters.skill && !s.skills.includes(filters.skill)) return false;
      if (filters.year && s.academic_year !== filters.year) return false;
      if (filters.availability && s.availability_status !== filters.availability) return false;
      return true;
    });
  }, [students, search, filters]);

  async function connect(studentId: string) {
    if (!user) return;
    if (isSampleId(studentId)) {
      setConnectedIds((prev) => new Set(prev).add(studentId));
      toast.success('Demo profile — connection saved locally for this session');
      return;
    }
    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      receiver_id: studentId,
    });
    if (error) {
      toast.error('Already connected or request pending');
      return;
    }
    await supabase.from('notifications').insert({
      user_id: studentId,
      type: 'connection',
      title: 'New connection request',
      body: `${profile?.full_name} wants to connect with you`,
      link: `/app/profile/${user.id}`,
    });
    setConnectedIds((prev) => new Set(prev).add(studentId));
    toast.success('Connection request sent!');
  }

  return (
    <div>
      <AppHeader title="Discover Talent" subtitle="Find collaborators across your campus" />
      <div className="container-px mx-auto max-w-container py-8">
        {/* Search + filters bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slatey-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or department..."
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary ${showFilters ? 'border-brand-500 text-brand-600' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <div className="flex rounded-xl border border-slatey-200 bg-white p-1">
            <button onClick={() => setView('grid')} className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-slatey-400'}`}>
              <Grid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${view === 'list' ? 'bg-brand-600 text-white' : 'text-slatey-400'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="card mb-6 grid gap-4 p-5 animate-fade-up sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slatey-500">Department</label>
              <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="input-field py-2.5 text-sm">
                <option value="">All</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slatey-500">Skill</label>
              <select value={filters.skill} onChange={(e) => setFilters({ ...filters, skill: e.target.value })} className="input-field py-2.5 text-sm">
                <option value="">All</option>
                {SKILL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slatey-500">Academic Year</label>
              <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="input-field py-2.5 text-sm">
                <option value="">All</option>
                {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slatey-500">Availability</label>
              <select value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })} className="input-field py-2.5 text-sm">
                <option value="">All</option>
                {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        )}

        <p className="mb-4 text-sm text-slatey-500">{filtered.length} students found</p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-56" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Search className="mx-auto h-12 w-12 text-slatey-300" />
            <p className="mt-4 text-slatey-500">No students match your filters. Try adjusting your search.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const match = calculateMatch(mySkills, myInterests, profile?.availability_status || '', s.skills, s.interests, s.availability_status);
              return (
                <div key={s.id} className="card p-5 hover:shadow-card-hover hover:-translate-y-1 group">
                  <div className="flex items-start gap-4">
                    <Link to={`/app/profile/${s.id}`}>
                      <Avatar name={s.full_name} src={s.avatar_url} size="lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/app/profile/${s.id}`}>
                        <h3 className="font-display font-semibold text-slatey-900 hover:text-brand-600 truncate">{s.full_name}</h3>
                      </Link>
                      <p className="text-sm text-slatey-500 truncate">{s.department}</p>
                      <p className="text-xs text-slatey-400 mt-0.5">{s.academic_year}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${s.availability_status === 'Open to collaborate' ? 'bg-tealx-500' : 'bg-slatey-300'}`} />
                        <span className="text-xs text-slatey-500">{s.availability_status}</span>
                      </div>
                    </div>
                    <MatchScore score={match.overall} size="sm" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="tag bg-brand-50 text-brand-600">{skill}</span>
                    ))}
                  </div>
                  {s.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.interests.slice(0, 3).map((interest) => (
                        <span key={interest} className="tag bg-cyanx-50 text-cyanx-700">{interest}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Link to={`/app/messages?to=${s.id}`} className="btn-ghost flex-1 border border-slatey-200 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                    <button
                      onClick={() => connect(s.id)}
                      disabled={connectedIds.has(s.id)}
                      className="btn-primary flex-1 text-sm disabled:opacity-60"
                    >
                      {connectedIds.has(s.id) ? <><Check className="h-4 w-4" /> Connected</> : <><UserPlus className="h-4 w-4" /> Connect</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => {
              const match = calculateMatch(mySkills, myInterests, profile?.availability_status || '', s.skills, s.interests, s.availability_status);
              return (
                <div key={s.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover">
                  <Link to={`/app/profile/${s.id}`}>
                    <Avatar name={s.full_name} src={s.avatar_url} size="md" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/app/profile/${s.id}`}>
                      <h3 className="font-display font-semibold text-slatey-900 hover:text-brand-600">{s.full_name}</h3>
                    </Link>
                    <p className="text-sm text-slatey-500">{s.department} · {s.academic_year}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {s.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="tag bg-slatey-100 text-slatey-600">{skill}</span>
                      ))}
                      {s.interests.slice(0, 2).map((interest) => (
                        <span key={interest} className="tag bg-cyanx-50 text-cyanx-700">{interest}</span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.availability_status === 'Open to collaborate' ? 'bg-tealx-500' : 'bg-slatey-300'}`} />
                    <span className="text-xs text-slatey-500">{s.availability_status}</span>
                  </div>
                  <MatchScore score={match.overall} size="sm" />
                  <div className="flex gap-2">
                    <Link to={`/app/messages?to=${s.id}`} className="btn-ghost border border-slatey-200">
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => connect(s.id)}
                      disabled={connectedIds.has(s.id)}
                      className="btn-primary text-sm disabled:opacity-60"
                    >
                      {connectedIds.has(s.id) ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
