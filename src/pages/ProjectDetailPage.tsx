import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Target, MessageSquare, Check, UserPlus } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { Profile, Project, ProjectMember } from '@/lib/types';
import { toast } from '@/lib/toast';

export function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<(ProjectMember & { profile: Profile })[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data: p } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
      setProject(p as Project | null);
      const { data: mems } = await supabase.from('project_members').select('*').eq('project_id', id);
      if (mems) {
        const enriched = await Promise.all((mems as ProjectMember[]).map(async (m) => {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', m.user_id).maybeSingle();
          return { ...m, profile: profile as Profile };
        }));
        setMembers(enriched);
      }
      const { data: apps } = await supabase.from('project_applications').select('*').eq('project_id', id);
      setApplications(apps || []);
      setLoading(false);
    }
    load();
  }, [id]);

  const isOwner = project?.owner_id === user?.id;

  async function acceptApp(appId: string, userId: string) {
    const { error } = await supabase.from('project_members').insert({ project_id: id, user_id: userId, role: 'member', status: 'member' });
    if (error) { toast.error('Failed to add member'); return; }
    await supabase.from('project_applications').update({ status: 'accepted' }).eq('id', appId);
    toast.success('Member added to project!');
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    // Refresh members
    const { data: mems } = await supabase.from('project_members').select('*').eq('project_id', id);
    if (mems) {
      const enriched = await Promise.all((mems as ProjectMember[]).map(async (m) => {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', m.user_id).maybeSingle();
        return { ...m, profile: profile as Profile };
      }));
      setMembers(enriched);
    }
  }

  if (loading) return <div><AppHeader title="Project" /><div className="container-px mx-auto max-w-container py-8"><div className="skeleton h-96" /></div></div>;
  if (!project) return <div><AppHeader title="Project" /><div className="container-px mx-auto max-w-container py-8"><div className="card p-12 text-center"><p className="text-slatey-500">Project not found.</p></div></div></div>;

  return (
    <div>
      <AppHeader title="Project Details" />
      <div className="container-px mx-auto max-w-container py-8">
        <Link to="/app/projects" className="btn-ghost mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slatey-900">{project.title}</h1>
                  <span className="mt-2 inline-block tag bg-brand-50 text-brand-600">{project.project_type}</span>
                </div>
                <span className={`tag ${project.status === 'open' ? 'bg-tealx-50 text-tealx-600' : 'bg-slatey-100 text-slatey-500'}`}>{project.status}</span>
              </div>
              <p className="mt-4 text-slatey-600 leading-relaxed">{project.description || 'No description provided.'}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slatey-50 p-4">
                  <Users className="h-5 w-5 text-slatey-400" />
                  <p className="mt-2 text-2xl font-bold text-slatey-900">{members.length}/{project.team_size}</p>
                  <p className="text-xs text-slatey-500">Team Members</p>
                </div>
                {project.timeline && (
                  <div className="rounded-xl bg-slatey-50 p-4">
                    <Clock className="h-5 w-5 text-slatey-400" />
                    <p className="mt-2 text-sm font-bold text-slatey-900">{project.timeline}</p>
                    <p className="text-xs text-slatey-500">Timeline</p>
                  </div>
                )}
                {project.department && (
                  <div className="rounded-xl bg-slatey-50 p-4">
                    <Target className="h-5 w-5 text-slatey-400" />
                    <p className="mt-2 text-sm font-bold text-slatey-900">{project.department}</p>
                    <p className="text-xs text-slatey-500">Department</p>
                  </div>
                )}
              </div>
              {project.required_skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slatey-700 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.required_skills.map((s) => (
                      <span key={s} className="tag bg-brand-50 text-brand-600 px-3 py-1.5">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Team members */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slatey-900">Team Members</h2>
              <div className="mt-4 space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 rounded-xl border border-slatey-200 p-3">
                    <Link to={`/app/profile/${m.user_id}`}><Avatar name={m.profile?.full_name || ''} src={m.profile?.avatar_url} size="md" /></Link>
                    <div className="flex-1">
                      <Link to={`/app/profile/${m.user_id}`}><h3 className="font-medium text-slatey-900 hover:text-brand-600">{m.profile?.full_name}</h3></Link>
                      <p className="text-sm text-slatey-500">{m.profile?.department}</p>
                    </div>
                    <span className={`tag ${m.role === 'owner' ? 'bg-brand-100 text-brand-700' : 'bg-slatey-100 text-slatey-600'}`}>{m.role}</span>
                    <Link to={`/app/messages?to=${m.user_id}`} className="btn-ghost border border-slatey-200"><MessageSquare className="h-4 w-4" /></Link>
                  </div>
                ))}
                {members.length === 0 && <p className="text-sm text-slatey-400">No members yet.</p>}
              </div>
            </div>
          </div>

          {/* Applications sidebar */}
          {isOwner && applications.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slatey-900">Applications ({applications.length})</h2>
              <div className="mt-4 space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="rounded-xl border border-slatey-200 p-3">
                    <p className="text-sm font-medium text-slatey-900">{app.message || 'No message'}</p>
                    <p className="text-xs text-slatey-400 mt-1">Status: {app.status}</p>
                    {app.status === 'pending' && (
                      <button onClick={() => acceptApp(app.id, app.user_id)} className="btn-primary mt-2 w-full text-sm">
                        <Check className="h-4 w-4" /> Accept
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
