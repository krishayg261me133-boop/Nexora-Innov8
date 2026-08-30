import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderGit2, Users, Clock, Target, X, ArrowRight } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { Project } from '@/lib/types';
import { PROJECT_TYPES, SKILL_OPTIONS, DEPARTMENTS } from '@/lib/types';
import { toast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';
import { isSampleId, mergeProjects } from '@/lib/sampleData';

const typeColors: Record<string, string> = {
  'Hackathon': 'bg-brand-50 text-brand-600',
  'Research': 'bg-cyanx-50 text-cyanx-600',
  'Academic': 'bg-tealx-50 text-tealx-600',
  'Project': 'bg-tealx-50 text-tealx-600',
  'Startup Idea': 'bg-amber-50 text-amber-600',
};

export function ProjectsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('');

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Hackathon');
  const [department, setDepartment] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(4);
  const [timeline, setTimeline] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadProjects(); }, [filterType]);

  async function loadProjects() {
    let q = supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (filterType) q = q.eq('project_type', filterType);
    const { data } = await q;
    const merged = mergeProjects((data || []) as Project[]);
    setProjects(filterType ? merged.filter((p) => p.project_type === filterType) : merged);
    setLoading(false);
  }

  function toggleSkill(s: string) {
    setRequiredSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function createProject() {
    if (!user) return;
    if (!title.trim()) { toast.error('Project title is required'); return; }
    setCreating(true);
    const { data, error } = await supabase.from('projects').insert({
      owner_id: user.id, title, description, project_type: projectType,
      department, required_skills: requiredSkills, team_size: teamSize,
      timeline, status: 'open',
    }).select().single();
    if (error) { toast.error('Failed to create project'); setCreating(false); return; }
    await supabase.from('project_members').insert({ project_id: data.id, user_id: user.id, role: 'owner', status: 'member' });
    setCreating(false);
    setShowCreate(false);
    setTitle(''); setDescription(''); setRequiredSkills([]); setDepartment(''); setTimeline('');
    toast.success('Project created!');
    loadProjects();
    navigate(`/app/projects/${data.id}`);
  }

  async function apply(projectId: string) {
    if (!user) return;
    if (isSampleId(projectId)) {
      toast.success('Demo project — application saved locally for this session');
      return;
    }
    const { error } = await supabase.from('project_applications').insert({
      project_id: projectId, user_id: user.id, status: 'pending',
    });
    if (error) { toast.error('Already applied or error occurred'); return; }
    toast.success('Application submitted!');
  }

  return (
    <div>
      <AppHeader
        title="Projects Hub"
        subtitle="Discover and create projects"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="h-5 w-5" /> Create Project
          </button>
        }
      />
      <div className="container-px mx-auto max-w-container py-8">
        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setFilterType('')} className={`tag px-4 py-2 text-sm ${!filterType ? 'bg-brand-600 text-white' : 'bg-white border border-slatey-200 text-slatey-600'}`}>All</button>
          {PROJECT_TYPES.map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`tag px-4 py-2 text-sm ${filterType === t ? 'bg-brand-600 text-white' : 'bg-white border border-slatey-200 text-slatey-600'}`}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-64" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderGit2 className="mx-auto h-12 w-12 text-slatey-300" />
            <p className="mt-4 text-slatey-500">No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="card p-5 hover:shadow-card-hover hover:-translate-y-1 group flex flex-col">
                <div className="flex items-start justify-between">
                  <span className={`tag ${typeColors[p.project_type] || 'bg-slatey-100 text-slatey-600'}`}>{p.project_type}</span>
                  <span className={`tag ${p.status === 'open' ? 'bg-tealx-50 text-tealx-600' : 'bg-slatey-100 text-slatey-500'}`}>{p.status}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-slatey-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slatey-500 line-clamp-2 flex-1">{p.description || 'No description'}</p>
                {p.department && <p className="mt-2 text-xs text-slatey-400">{p.department}</p>}
                {p.required_skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.required_skills.slice(0, 3).map((s) => (
                      <span key={s} className="tag bg-brand-50 text-brand-600">{s}</span>
                    ))}
                    {p.required_skills.length > 3 && <span className="tag bg-slatey-100 text-slatey-500">+{p.required_skills.length - 3}</span>}
                  </div>
                )}
                {p.open_roles && p.open_roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.open_roles.slice(0, 3).map((role) => (
                      <span key={role} className="tag bg-amber-50 text-amber-700">{role}</span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-slatey-400">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.current_members != null ? `${p.current_members}/${p.team_size}` : `${p.team_size}`} team</span>
                  {p.timeline && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {p.timeline}</span>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/app/projects/${p.id}`} className="btn-secondary flex-1 text-sm">View Details</Link>
                  {p.owner_id !== user?.id && (
                    <button onClick={() => apply(p.id)} className="btn-primary flex-1 text-sm">Apply</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slatey-900/40 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto scrollbar-thin p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slatey-900">Create New Project</h2>
              <button onClick={() => setShowCreate(false)} className="text-slatey-400 hover:text-slatey-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slatey-700">Project Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. AI-Powered Campus Navigation" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slatey-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field resize-none" placeholder="Describe your project..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slatey-700">Project Type</label>
                  <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="input-field">
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slatey-700">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field">
                    <option value="">Any</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slatey-700">Team Size</label>
                  <input type="number" min={1} max={20} value={teamSize} onChange={(e) => setTeamSize(parseInt(e.target.value) || 4)} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slatey-700">Timeline</label>
                  <input value={timeline} onChange={(e) => setTimeline(e.target.value)} className="input-field" placeholder="e.g. 4 weeks" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slatey-700">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((s) => (
                    <button key={s} onClick={() => toggleSkill(s)} className={`tag px-3 py-1.5 text-sm ${requiredSkills.includes(s) ? 'bg-brand-600 text-white' : 'bg-slatey-100 text-slatey-600'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={createProject} disabled={creating} className="btn-primary w-full">
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
