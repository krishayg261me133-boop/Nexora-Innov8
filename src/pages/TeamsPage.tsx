import { useEffect, useState } from 'react';
import { Plus, Users, Target, X, LayoutGrid, UserCog, CheckSquare, MessageSquare } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { Team, TeamMember, Profile } from '@/lib/types';
import { SKILL_OPTIONS } from '@/lib/types';
import { toast } from '@/lib/toast';
import { Link } from 'react-router-dom';

type Tab = 'overview' | 'members' | 'tasks' | 'messages';

export function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<(Team & { memberCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<(Team & { members: (TeamMember & { profile: Profile })[]; messages: any[] }) | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  // Create form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(4);
  const [creating, setCreating] = useState(false);

  // Message
  const [msgContent, setMsgContent] = useState('');

  // Tasks (local state for demo)
  const [tasks, setTasks] = useState<{ id: string; title: string; done: boolean; assignee?: string }[]>([]);

  useEffect(() => { loadTeams(); }, [user]);

  async function loadTeams() {
    if (!user) return;
    const { data: myTeams } = await supabase.from('team_members').select('team_id').eq('user_id', user.id);
    const teamIds = (myTeams || []).map((t: any) => t.team_id);
    if (teamIds.length === 0) { setTeams([]); setLoading(false); return; }
    const { data: ts } = await supabase.from('teams').select('*').in('id', teamIds).order('created_at', { ascending: false });
    if (ts) {
      const enriched = await Promise.all((ts as Team[]).map(async (t) => {
        const { count } = await supabase.from('team_members').select('id', { count: 'exact' }).eq('team_id', t.id);
        return { ...t, memberCount: count || 0 };
      }));
      setTeams(enriched);
    }
    setLoading(false);
  }

  function toggleSkill(s: string) {
    setRequiredSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function createTeam() {
    if (!user) return;
    if (!name.trim()) { toast.error('Team name is required'); return; }
    setCreating(true);
    const { data, error } = await supabase.from('teams').insert({
      owner_id: user.id, name, description, purpose, required_skills: requiredSkills, team_size: teamSize, status: 'open',
    }).select().single();
    if (error) { toast.error('Failed to create team'); setCreating(false); return; }
    await supabase.from('team_members').insert({ team_id: data.id, user_id: user.id, role: 'owner', status: 'member' });
    setCreating(false);
    setShowCreate(false);
    setName(''); setDescription(''); setPurpose(''); setRequiredSkills([]);
    toast.success('Team created!');
    loadTeams();
  }

  async function openTeam(teamId: string) {
    const { data: team } = await supabase.from('teams').select('*').eq('id', teamId).maybeSingle();
    if (!team) return;
    const { data: mems } = await supabase.from('team_members').select('*').eq('team_id', teamId);
    const enrichedMems = await Promise.all((mems || []).map(async (m: any) => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', m.user_id).maybeSingle();
      return { ...m, profile: profile as Profile };
    }));
    const { data: msgs } = await supabase.from('team_messages').select('*').eq('team_id', teamId).order('created_at', { ascending: true });
    setSelectedTeam({ ...(team as Team), members: enrichedMems, messages: msgs || [] });
    setTab('overview');
  }

  async function sendMsg() {
    if (!user || !selectedTeam || !msgContent.trim()) return;
    const { data } = await supabase.from('team_messages').insert({
      team_id: selectedTeam.id, sender_id: user.id, content: msgContent,
    }).select().single();
    if (data) {
      setSelectedTeam({ ...selectedTeam, messages: [...selectedTeam.messages, data] });
      setMsgContent('');
    }
  }

  function addTask() {
    const title = prompt('Task title:');
    if (title) setTasks([...tasks, { id: crypto.randomUUID(), title, done: false }]);
  }

  if (selectedTeam) {
    return (
      <div>
        <AppHeader title={selectedTeam.name} subtitle={selectedTeam.purpose || selectedTeam.description} />
        <div className="container-px mx-auto max-w-container py-8">
          <button onClick={() => setSelectedTeam(null)} className="btn-ghost mb-6 text-sm">← Back to Teams</button>
          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-slatey-200 bg-white p-1">
            {([
              { id: 'overview', icon: LayoutGrid, label: 'Overview' },
              { id: 'members', icon: Users, label: 'Members' },
              { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
              { id: 'messages', icon: MessageSquare, label: 'Messages' },
            ] as { id: Tab; icon: any; label: string }[]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${tab === t.id ? 'bg-brand-600 text-white' : 'text-slatey-600 hover:bg-slatey-50'}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <h2 className="font-display text-lg font-semibold text-slatey-900">About This Team</h2>
                  <p className="mt-3 text-slatey-600">{selectedTeam.description || 'No description.'}</p>
                  {selectedTeam.purpose && <p className="mt-2 text-sm text-slatey-500"><strong>Purpose:</strong> {selectedTeam.purpose}</p>}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-slatey-50 p-4"><Users className="h-5 w-5 text-slatey-400" /><p className="mt-2 text-2xl font-bold text-slatey-900">{selectedTeam.members.length}/{selectedTeam.team_size}</p><p className="text-xs text-slatey-500">Members</p></div>
                    <div className="rounded-xl bg-slatey-50 p-4"><Target className="h-5 w-5 text-slatey-400" /><p className="mt-2 text-2xl font-bold text-slatey-900">{Math.round((selectedTeam.members.length / selectedTeam.team_size) * 100)}%</p><p className="text-xs text-slatey-500">Complete</p></div>
                  </div>
                </div>
                <div className="card p-6">
                  <h3 className="text-sm font-semibold text-slatey-700 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeam.required_skills.map((s) => {
                      const has = selectedTeam.members.some((m) => m.profile?.full_name && true);
                      return <span key={s} className={`tag px-3 py-1.5 ${has ? 'bg-tealx-50 text-tealx-600' : 'bg-amber-50 text-amber-600'}`}>{s}</span>;
                    })}
                    {selectedTeam.required_skills.length === 0 && <p className="text-sm text-slatey-400">No specific skills required.</p>}
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-display font-semibold text-slatey-900">Missing Roles</h3>
                <p className="mt-2 text-sm text-slatey-500">Roles still needed to complete the team:</p>
                <div className="mt-4 space-y-2">
                  {selectedTeam.required_skills.slice(selectedTeam.members.length).map((s) => (
                    <div key={s} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      <Plus className="h-4 w-4" /> {s} needed
                    </div>
                  ))}
                  {selectedTeam.required_skills.length <= selectedTeam.members.length && <p className="text-sm text-tealx-600">Team is fully skilled!</p>}
                </div>
              </div>
            </div>
          )}

          {tab === 'members' && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-slatey-900 mb-4">Team Members</h2>
              <div className="space-y-3">
                {selectedTeam.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 rounded-xl border border-slatey-200 p-3">
                    <Link to={`/app/profile/${m.user_id}`}><Avatar name={m.profile?.full_name || ''} src={m.profile?.avatar_url} size="md" /></Link>
                    <div className="flex-1">
                      <Link to={`/app/profile/${m.user_id}`}><h3 className="font-medium text-slatey-900 hover:text-brand-600">{m.profile?.full_name}</h3></Link>
                      <p className="text-sm text-slatey-500">{m.profile?.department} · {m.profile?.academic_year}</p>
                    </div>
                    <span className={`tag ${m.role === 'owner' ? 'bg-brand-100 text-brand-700' : 'bg-slatey-100 text-slatey-600'}`}>{m.role}</span>
                    <Link to={`/app/messages?to=${m.user_id}`} className="btn-ghost border border-slatey-200"><MessageSquare className="h-4 w-4" /></Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'tasks' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-slatey-900">Tasks</h2>
                <button onClick={addTask} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add Task</button>
              </div>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-slatey-200 p-3">
                    <button onClick={() => setTasks(tasks.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                      className={`grid h-5 w-5 place-items-center rounded border-2 transition-all ${t.done ? 'bg-tealx-500 border-tealx-500 text-white' : 'border-slatey-300'}`}>
                      {t.done && <CheckSquare className="h-3 w-3" />}
                    </button>
                    <span className={`text-sm ${t.done ? 'line-through text-slatey-400' : 'text-slatey-700'}`}>{t.title}</span>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-slatey-400 text-center py-8">No tasks yet. Add one to get organized!</p>}
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div className="card flex h-[600px] flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-3">
                {selectedTeam.messages.length === 0 ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <MessageSquare className="mx-auto h-10 w-10 text-slatey-300" />
                      <p className="mt-3 text-sm text-slatey-400">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  selectedTeam.messages.map((msg: any) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                      <Avatar name={selectedTeam.members.find((m) => m.user_id === msg.sender_id)?.profile?.full_name || ''} size="sm" />
                      <div className={`max-w-md rounded-2xl px-4 py-2.5 ${msg.sender_id === user?.id ? 'bg-brand-600 text-white' : 'bg-slatey-100 text-slatey-700'}`}>
                        <p className="text-xs font-medium opacity-70 mb-0.5">{selectedTeam.members.find((m) => m.user_id === msg.sender_id)?.profile?.full_name}</p>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slatey-200 p-4 flex gap-3">
                <input value={msgContent} onChange={(e) => setMsgContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="Type a message..." className="input-field flex-1" />
                <button onClick={sendMsg} className="btn-primary">Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="Teams" subtitle="Your teams and collaborations"
        action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="h-5 w-5" /> Create Team</button>}
      />
      <div className="container-px mx-auto max-w-container py-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-48" />)}</div>
        ) : teams.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slatey-300" />
            <p className="mt-4 text-slatey-500">No teams yet. Create one to start collaborating!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <div key={t.id} onClick={() => openTeam(t.id)} className="card p-5 cursor-pointer hover:shadow-card-hover hover:-translate-y-1 group">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600"><Users className="h-6 w-6" /></div>
                  <span className={`tag ${t.status === 'open' ? 'bg-tealx-50 text-tealx-600' : 'bg-slatey-100 text-slatey-500'}`}>{t.status}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-slatey-900">{t.name}</h3>
                <p className="mt-1 text-sm text-slatey-500 line-clamp-2">{t.description || t.purpose || 'No description'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-slatey-400">{t.memberCount}/{t.team_size} members</span>
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slatey-200">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min((t.memberCount / t.team_size) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slatey-900/40 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto scrollbar-thin p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slatey-900">Create New Team</h2>
              <button onClick={() => setShowCreate(false)} className="text-slatey-400 hover:text-slatey-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Team Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Hackathon Squad 2026" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input-field resize-none" placeholder="What is this team for?" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Purpose</label><input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="input-field" placeholder="e.g. Win the university hackathon" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Team Size</label><input type="number" min={1} max={20} value={teamSize} onChange={(e) => setTeamSize(parseInt(e.target.value) || 4)} className="input-field" /></div>
              <div><label className="mb-2 block text-sm font-medium text-slatey-700">Required Skills</label><div className="flex flex-wrap gap-2">{SKILL_OPTIONS.map((s) => (<button key={s} onClick={() => toggleSkill(s)} className={`tag px-3 py-1.5 text-sm ${requiredSkills.includes(s) ? 'bg-brand-600 text-white' : 'bg-slatey-100 text-slatey-600'}`}>{s}</button>))}</div></div>
              <button onClick={createTeam} disabled={creating} className="btn-primary w-full">{creating ? 'Creating...' : 'Create Team'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
