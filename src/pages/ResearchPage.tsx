import { useEffect, useState } from 'react';
import { BookOpen, Bookmark, Send, Search, Plus, X, Clock, Users } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ResearchOpportunity } from '@/lib/types';
import { SKILL_OPTIONS } from '@/lib/types';
import { toast } from '@/lib/toast';

const areaColors: Record<string, string> = {
  'AI/ML': 'bg-brand-50 text-brand-600',
  'Data Science': 'bg-cyanx-50 text-cyanx-600',
  'Cybersecurity': 'bg-red-50 text-red-600',
  'Web Development': 'bg-tealx-50 text-tealx-600',
  'Other': 'bg-slatey-100 text-slatey-600',
};

export function ResearchPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', professor: '', research_area: '', duration: '', open_positions: 1, description: '', skills: [] as string[] });

  useEffect(() => { loadOpportunities(); }, [user]);

  async function loadOpportunities() {
    const { data } = await supabase.from('research_opportunities').select('*').order('created_at', { ascending: false });
    setOpportunities((data || []) as ResearchOpportunity[]);
    if (user) {
      const { data: apps } = await supabase.from('research_applications').select('research_id').eq('user_id', user.id);
      setAppliedIds(new Set((apps || []).map((a: any) => a.research_id)));
    }
    setLoading(false);
  }

  async function apply(opId: string, ownerId: string) {
    if (!user) return;
    const { error } = await supabase.from('research_applications').insert({ research_id: opId, user_id: user.id, status: 'pending' });
    if (error) { toast.error('Already applied or error'); return; }
    await supabase.from('notifications').insert({ user_id: ownerId, type: 'research', title: 'New research application', body: 'A student applied to your research opportunity', link: '/app/research' });
    setAppliedIds((prev) => new Set(prev).add(opId));
    toast.success('Application submitted!');
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function createOpportunity() {
    if (!user) return;
    if (!createForm.title.trim()) { toast.error('Title is required'); return; }
    const { error } = await supabase.from('research_opportunities').insert({
      owner_id: user.id, ...createForm, skills_needed: createForm.skills,
    });
    if (error) { toast.error('Failed to create'); return; }
    toast.success('Research opportunity posted!');
    setShowCreate(false);
    setCreateForm({ title: '', professor: '', research_area: '', duration: '', open_positions: 1, description: '', skills: [] });
    loadOpportunities();
  }

  const filtered = opportunities.filter((o) =>
    !search || o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.research_area.toLowerCase().includes(search.toLowerCase()) ||
    o.professor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AppHeader title="Research Hub" subtitle="Browse and apply for research opportunities"
        action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="h-5 w-5" /> Post Opportunity</button>}
      />
      <div className="container-px mx-auto max-w-container py-8">
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slatey-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, area, or professor..." className="input-field pl-11" />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-56" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center"><BookOpen className="mx-auto h-12 w-12 text-slatey-300" /><p className="mt-4 text-slatey-500">No research opportunities found.</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((o) => (
              <div key={o.id} className="card p-5 hover:shadow-card-hover hover:-translate-y-1 group flex flex-col">
                <div className="flex items-start justify-between">
                  <span className={`tag ${areaColors[o.research_area] || areaColors['Other']}`}>{o.research_area || 'Research'}</span>
                  <button onClick={() => toggleSave(o.id)} className={`transition-colors ${savedIds.has(o.id) ? 'text-brand-600' : 'text-slatey-300 hover:text-slatey-400'}`}>
                    <Bookmark className="h-5 w-5" fill={savedIds.has(o.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-slatey-900">{o.title}</h3>
                <p className="mt-1 text-sm text-slatey-500">Prof. {o.professor || 'TBD'}</p>
                <p className="mt-2 text-sm text-slatey-500 line-clamp-2 flex-1">{o.description || 'No description'}</p>
                {o.skills_needed.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {o.skills_needed.slice(0, 3).map((s) => <span key={s} className="tag bg-brand-50 text-brand-600">{s}</span>)}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-slatey-400">
                  {o.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {o.duration}</span>}
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {o.open_positions} open</span>
                </div>
                <button onClick={() => apply(o.id, o.owner_id)} disabled={appliedIds.has(o.id)} className="btn-primary mt-4 w-full text-sm disabled:opacity-60">
                  {appliedIds.has(o.id) ? 'Applied' : <><Send className="h-4 w-4" /> Apply</>}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slatey-900/40 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto scrollbar-thin p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slatey-900">Post Research Opportunity</h2>
              <button onClick={() => setShowCreate(false)} className="text-slatey-400 hover:text-slatey-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Title</label><input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="input-field" placeholder="Research project title" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Professor</label><input value={createForm.professor} onChange={(e) => setCreateForm({ ...createForm, professor: e.target.value })} className="input-field" placeholder="Professor name" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Research Area</label><input value={createForm.research_area} onChange={(e) => setCreateForm({ ...createForm, research_area: e.target.value })} className="input-field" placeholder="e.g. AI/ML" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Duration</label><input value={createForm.duration} onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })} className="input-field" placeholder="e.g. 3 months" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Open Positions</label><input type="number" min={1} value={createForm.open_positions} onChange={(e) => setCreateForm({ ...createForm, open_positions: parseInt(e.target.value) || 1 })} className="input-field" /></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Description</label><textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Describe the research..." /></div>
              <div><label className="mb-2 block text-sm font-medium text-slatey-700">Skills Needed</label><div className="flex flex-wrap gap-2">{SKILL_OPTIONS.map((s) => <button key={s} onClick={() => setCreateForm({ ...createForm, skills: createForm.skills.includes(s) ? createForm.skills.filter((x) => x !== s) : [...createForm.skills, s] })} className={`tag px-3 py-1.5 text-sm ${createForm.skills.includes(s) ? 'bg-brand-600 text-white' : 'bg-slatey-100 text-slatey-600'}`}>{s}</button>)}</div></div>
              <button onClick={createOpportunity} className="btn-primary w-full">Post Opportunity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
