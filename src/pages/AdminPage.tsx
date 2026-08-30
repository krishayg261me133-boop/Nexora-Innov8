import { useEffect, useState } from 'react';
import { Users, FolderGit2, CheckCircle2, MessageSquare, TrendingUp, UserCog, ShieldCheck, Target } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { Profile, Project, Team } from '@/lib/types';

export function AdminPage() {
  const [stats, setStats] = useState({ users: 0, profilesComplete: 0, projects: 0, teams: 0, messages: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, p, pr, t, m] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('onboarding_complete', true),
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('teams').select('*', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' }),
      ]);
      setStats({
        users: u.count || 0,
        profilesComplete: p.count || 0,
        projects: pr.count || 0,
        teams: t.count || 0,
        messages: m.count || 0,
      });
      setUsers((u.data || []) as Profile[]);
      setProjects((pr.data || []) as Project[]);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { icon: Users, label: 'Active Students', value: stats.users, color: 'brand' },
    { icon: CheckCircle2, label: 'Profiles Completed', value: stats.profilesComplete, color: 'tealx' },
    { icon: FolderGit2, label: 'Projects Created', value: stats.projects, color: 'cyanx' },
    { icon: Target, label: 'Teams Formed', value: stats.teams, color: 'brand' },
    { icon: MessageSquare, label: 'Messages Sent', value: stats.messages, color: 'cyanx' },
  ];

  return (
    <div>
      <AppHeader title="Admin Dashboard" subtitle="Platform overview and management" />
      <div className="container-px mx-auto max-w-container py-8 space-y-8">
        {/* Analytics cards */}
        <div>
          <h2 className="font-display text-lg font-semibold text-slatey-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600" /> Analytics Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`grid h-12 w-12 place-items-center rounded-xl bg-${s.color}-50 text-${s.color}-600`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-slatey-900">{s.value}</p>
                <p className="text-sm text-slatey-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User management */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900 mb-4">
              <UserCog className="h-5 w-5 text-brand-600" /> User Management
            </h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-16" />)}</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl border border-slatey-200 p-3">
                    <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slatey-900 truncate">{u.full_name}</p>
                      <p className="text-xs text-slatey-400 truncate">{u.email}</p>
                    </div>
                    {u.onboarding_complete ? (
                      <span className="tag bg-tealx-50 text-tealx-600 text-xs flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Verified</span>
                    ) : (
                      <span className="tag bg-amber-50 text-amber-600 text-xs">Pending</span>
                    )}
                  </div>
                ))}
                {users.length === 0 && <p className="text-sm text-slatey-400 text-center py-8">No users yet.</p>}
              </div>
            )}
          </div>

          {/* Project moderation */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slatey-900 mb-4">
              <FolderGit2 className="h-5 w-5 text-cyanx-600" /> Project Moderation
            </h2>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-16" />)}</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                {projects.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slatey-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slatey-900 truncate flex-1">{p.title}</p>
                      <span className={`tag text-xs ml-2 ${p.status === 'open' ? 'bg-tealx-50 text-tealx-600' : 'bg-slatey-100 text-slatey-500'}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-slatey-400 mt-1">{p.project_type} · {p.department || 'Any'}</p>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-sm text-slatey-400 text-center py-8">No projects yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
