import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FolderGit2, Users, MessageSquare, TrendingUp, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { MatchScore } from '@/components/MatchScore';
import { Profile } from '@/lib/types';
import { calculateMatch } from '@/lib/match';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ projects: 0, teams: 0, connections: 0, messages: 0 });
  const [suggestions, setSuggestions] = useState<(Profile & { mySkills: string[]; myInterests: string[]; theirSkills: string[]; theirInterests: string[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [proj, teams, conns, msgs] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('owner_id', user!.id),
        supabase.from('team_members').select('id', { count: 'exact' }).eq('user_id', user!.id),
        supabase.from('connections').select('id', { count: 'exact' }).or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`),
        supabase.from('messages').select('id', { count: 'exact' }).eq('receiver_id', user!.id).eq('read', false),
      ]);
      setStats({
        projects: proj.count || 0,
        teams: teams.count || 0,
        connections: conns.count || 0,
        messages: msgs.count || 0,
      });

      // Fetch suggestions with skills
      const { data: mySkills } = await supabase.from('profile_skills').select('skill_name').eq('profile_id', user!.id);
      const { data: myInterests } = await supabase.from('profile_interests').select('interest_name').eq('profile_id', user!.id);
      const myS = (mySkills || []).map((s: any) => s.skill_name);
      const myI = (myInterests || []).map((i: any) => i.interest_name);

      const { data: others } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user!.id)
        .limit(6);
      if (others) {
        const enriched = await Promise.all((others as Profile[]).map(async (p) => {
          const [{ data: ts }, { data: ti }] = await Promise.all([
            supabase.from('profile_skills').select('skill_name').eq('profile_id', p.id),
            supabase.from('profile_interests').select('interest_name').eq('profile_id', p.id),
          ]);
          return { ...p, mySkills: myS, myInterests: myI, theirSkills: (ts || []).map((s: any) => s.skill_name), theirInterests: (ti || []).map((i: any) => i.interest_name) };
        }));
        setSuggestions(enriched);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const statCards = [
    { icon: FolderGit2, label: 'My Projects', value: stats.projects, color: 'brand', link: '/app/projects' },
    { icon: Users, label: 'My Teams', value: stats.teams, color: 'cyanx', link: '/app/teams' },
    { icon: Users, label: 'Connections', value: stats.connections, color: 'tealx', link: '/app/discover' },
    { icon: MessageSquare, label: 'Unread Messages', value: stats.messages, color: 'brand', link: '/app/messages' },
  ];

  return (
    <div>
      <AppHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Student'}`}
        subtitle="Here's what's happening in your network today"
      />
      <div className="container-px mx-auto max-w-container py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Link key={s.label} to={s.link} className="card p-5 hover:shadow-card-hover hover:-translate-y-1 group">
              <div className="flex items-center justify-between">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-${s.color}-50 text-${s.color}-600 group-hover:bg-${s.color}-600 group-hover:text-white transition-all`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="font-display text-3xl font-bold text-slatey-900">{s.value}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-slatey-500">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/app/discover" className="card p-6 hover:shadow-card-hover hover:-translate-y-1 group">
            <Search className="h-8 w-8 text-brand-600" />
            <h3 className="mt-4 font-display font-semibold text-slatey-900">Discover Talent</h3>
            <p className="mt-1 text-sm text-slatey-500">Find teammates by skills, interests, and availability</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
              Search <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link to="/app/projects" className="card p-6 hover:shadow-card-hover hover:-translate-y-1 group">
            <FolderGit2 className="h-8 w-8 text-cyanx-600" />
            <h3 className="mt-4 font-display font-semibold text-slatey-900">Create Project</h3>
            <p className="mt-1 text-sm text-slatey-500">Start a new project and find the perfect team</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyanx-600 group-hover:gap-2 transition-all">
              Get started <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link to="/app/research" className="card p-6 hover:shadow-card-hover hover:-translate-y-1 group">
            <BookOpen className="h-8 w-8 text-tealx-600" />
            <h3 className="mt-4 font-display font-semibold text-slatey-900">Research Hub</h3>
            <p className="mt-1 text-sm text-slatey-500">Browse faculty research opportunities</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-tealx-600 group-hover:gap-2 transition-all">
              Explore <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {/* Suggested teammates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-slatey-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" />
              Suggested Teammates
            </h2>
            <Link to="/app/discover" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-48" />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.slice(0, 3).map((s) => {
                const match = calculateMatch(s.mySkills, s.myInterests, profile?.availability_status || '', s.theirSkills, s.theirInterests, s.availability_status);
                return (
                  <Link key={s.id} to={`/app/profile/${s.id}`} className="card p-5 hover:shadow-card-hover hover:-translate-y-1 group">
                    <div className="flex items-start gap-4">
                      <Avatar name={s.full_name} src={s.avatar_url} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-slatey-900 truncate">{s.full_name}</h3>
                        <p className="text-sm text-slatey-500 truncate">{s.department}</p>
                        <p className="text-xs text-slatey-400 mt-0.5">{s.academic_year}</p>
                      </div>
                      <MatchScore score={match.overall} size="sm" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {s.theirSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="tag bg-brand-50 text-brand-600">{skill}</span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
