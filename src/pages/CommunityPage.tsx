import { useEffect, useState } from 'react';
import { MessageCircle, Plus, ArrowUp, X, Tag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { CommunityQuestion, CommunityAnswer, Profile } from '@/lib/types';
import { toast } from '@/lib/toast';

const TOPIC_TAGS = ['Hackathons', 'Research', 'Coding', 'Career', 'Projects'];

export function CommunityPage() {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<(CommunityQuestion & { author: Profile; answers: CommunityAnswer[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [activeTag, setActiveTag] = useState('');
  const [selectedQ, setSelectedQ] = useState<(CommunityQuestion & { author: Profile; answers: (CommunityAnswer & { author: Profile })[] }) | null>(null);
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '', tags: [] as string[] });
  const [newAnswer, setNewAnswer] = useState('');
  const [votedAnswers, setVotedAnswers] = useState<Set<string>>(new Set());

  useEffect(() => { loadQuestions(); }, [activeTag]);

  async function loadQuestions() {
    let q = supabase.from('community_questions').select('*').order('created_at', { ascending: false });
    const { data } = await q;
    if (!data) { setLoading(false); return; }
    const enriched = await Promise.all((data as CommunityQuestion[]).map(async (ques) => {
      const { data: author } = await supabase.from('profiles').select('*').eq('id', ques.author_id).maybeSingle();
      const { data: ans } = await supabase.from('community_answers').select('*').eq('question_id', ques.id).order('upvotes', { ascending: false });
      return { ...ques, author: author as Profile, answers: (ans || []) as CommunityAnswer[] };
    }));
    const filtered = activeTag ? enriched.filter((q) => q.tags.includes(activeTag)) : enriched;
    setQuestions(filtered);
    setLoading(false);
  }

  async function askQuestion() {
    if (!user) return;
    if (!newQuestion.title.trim()) { toast.error('Title is required'); return; }
    const { error } = await supabase.from('community_questions').insert({
      author_id: user.id, title: newQuestion.title, body: newQuestion.body, tags: newQuestion.tags,
    });
    if (error) { toast.error('Failed to post question'); return; }
    toast.success('Question posted!');
    setShowAsk(false);
    setNewQuestion({ title: '', body: '', tags: [] });
    loadQuestions();
  }

  async function openQuestion(ques: CommunityQuestion & { author: Profile; answers: CommunityAnswer[] }) {
    const { data: ans } = await supabase.from('community_answers').select('*').eq('question_id', ques.id).order('upvotes', { ascending: false });
    const enrichedAns = await Promise.all((ans || []).map(async (a: CommunityAnswer) => {
      const { data: author } = await supabase.from('profiles').select('*').eq('id', a.author_id).maybeSingle();
      return { ...a, author: author as Profile };
    }));
    setSelectedQ({ ...ques, answers: enrichedAns });
  }

  async function submitAnswer() {
    if (!user || !selectedQ || !newAnswer.trim()) return;
    const { data } = await supabase.from('community_answers').insert({
      question_id: selectedQ.id, author_id: user.id, body: newAnswer,
    }).select().single();
    if (data) {
      const { data: author } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      setSelectedQ({ ...selectedQ, answers: [...selectedQ.answers, { ...data, author: author as Profile }] });
      setNewAnswer('');
      toast.success('Answer posted!');
    }
  }

  async function upvote(answerId: string) {
    if (votedAnswers.has(answerId)) return;
    const ans = selectedQ?.answers.find((a) => a.id === answerId);
    if (!ans) return;
    await supabase.from('community_answers').update({ upvotes: ans.upvotes + 1 }).eq('id', answerId);
    setVotedAnswers((prev) => new Set(prev).add(answerId));
    if (selectedQ) {
      setSelectedQ({ ...selectedQ, answers: selectedQ.answers.map((a) => a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a) });
    }
  }

  if (selectedQ) {
    return (
      <div>
        <AppHeader title="Community Q&A" subtitle="Ask questions, share knowledge" />
        <div className="container-px mx-auto max-w-3xl py-8">
          <button onClick={() => setSelectedQ(null)} className="btn-ghost mb-6 text-sm">← Back to Questions</button>
          <div className="card p-6 mb-6">
            <div className="flex items-start gap-4">
              <Avatar name={selectedQ.author.full_name} src={selectedQ.author.avatar_url} size="md" />
              <div className="flex-1">
                <Link to={`/app/profile/${selectedQ.author_id}`} className="font-medium text-slatey-900 hover:text-brand-600">{selectedQ.author.full_name}</Link>
                <p className="text-xs text-slatey-400">{new Date(selectedQ.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-slatey-900">{selectedQ.title}</h1>
            {selectedQ.body && <p className="mt-3 text-slatey-600 leading-relaxed">{selectedQ.body}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedQ.tags.map((t) => <span key={t} className="tag bg-brand-50 text-brand-600">{t}</span>)}
            </div>
          </div>

          <h2 className="font-display text-lg font-semibold text-slatey-900 mb-4">{selectedQ.answers.length} Answers</h2>
          <div className="space-y-4">
            {selectedQ.answers.map((ans) => (
              <div key={ans.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <button onClick={() => upvote(ans.id)} className="flex flex-col items-center gap-1 text-slatey-400 hover:text-brand-600 transition-colors">
                    <ArrowUp className={`h-5 w-5 ${votedAnswers.has(ans.id) ? 'text-brand-600' : ''}`} />
                    <span className="text-sm font-bold">{ans.upvotes}</span>
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={ans.author.full_name} src={ans.author.avatar_url} size="xs" />
                      <Link to={`/app/profile/${ans.author_id}`} className="text-sm font-medium text-slatey-900 hover:text-brand-600">{ans.author.full_name}</Link>
                      <span className="text-xs text-slatey-400">{new Date(ans.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slatey-700 leading-relaxed">{ans.body}</p>
                  </div>
                </div>
              </div>
            ))}
            {selectedQ.answers.length === 0 && <p className="text-sm text-slatey-400 text-center py-8">No answers yet. Be the first to answer!</p>}
          </div>

          {user && (
            <div className="card mt-6 p-5">
              <div className="flex items-start gap-3">
                <Avatar name={profile?.full_name || ''} src={profile?.avatar_url} size="sm" />
                <div className="flex-1">
                  <textarea value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} rows={3} placeholder="Write your answer..." className="input-field resize-none" />
                  <button onClick={submitAnswer} className="btn-primary mt-3 text-sm">Post Answer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="Community Q&A" subtitle="Ask questions, share knowledge"
        action={<button onClick={() => setShowAsk(true)} className="btn-primary"><Plus className="h-5 w-5" /> Ask Question</button>}
      />
      <div className="container-px mx-auto max-w-3xl py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setActiveTag('')} className={`tag px-4 py-2 text-sm ${!activeTag ? 'bg-brand-600 text-white' : 'bg-white border border-slatey-200 text-slatey-600'}`}>All</button>
          {TOPIC_TAGS.map((t) => (
            <button key={t} onClick={() => setActiveTag(t)} className={`tag px-4 py-2 text-sm ${activeTag === t ? 'bg-brand-600 text-white' : 'bg-white border border-slatey-200 text-slatey-600'}`}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="skeleton h-32" />)}</div>
        ) : questions.length === 0 ? (
          <div className="card p-12 text-center"><MessageCircle className="mx-auto h-12 w-12 text-slatey-300" /><p className="mt-4 text-slatey-500">No questions yet. Ask the first one!</p></div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} onClick={() => openQuestion(q)} className="card p-5 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 group">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-slatey-50 px-3 py-2 text-center">
                    <span className="text-lg font-bold text-slatey-700">{q.answers.length}</span>
                    <span className="text-xs text-slatey-400">answers</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-slatey-900 group-hover:text-brand-600">{q.title}</h3>
                    {q.body && <p className="mt-1 text-sm text-slatey-500 line-clamp-2">{q.body}</p>}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={q.author.full_name} src={q.author.avatar_url} size="xs" />
                        <span className="text-xs text-slatey-400">{q.author.full_name}</span>
                      </div>
                      <span className="text-xs text-slatey-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(q.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-1.5">
                        {q.tags.map((t) => <span key={t} className="tag bg-brand-50 text-brand-600 text-xs">{t}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAsk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slatey-900/40 backdrop-blur-sm p-4" onClick={() => setShowAsk(false)}>
          <div className="card w-full max-w-lg p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-slatey-900">Ask a Question</h2>
              <button onClick={() => setShowAsk(false)} className="text-slatey-400 hover:text-slatey-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Title</label><input value={newQuestion.title} onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })} className="input-field" placeholder="What's your question?" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slatey-700">Details</label><textarea value={newQuestion.body} onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })} rows={3} className="input-field resize-none" placeholder="Add more context..." /></div>
              <div><label className="mb-2 block text-sm font-medium text-slatey-700 flex items-center gap-1"><Tag className="h-4 w-4" /> Topics</label><div className="flex flex-wrap gap-2">{TOPIC_TAGS.map((t) => <button key={t} onClick={() => setNewQuestion({ ...newQuestion, tags: newQuestion.tags.includes(t) ? newQuestion.tags.filter((x) => x !== t) : [...newQuestion.tags, t] })} className={`tag px-3 py-1.5 text-sm ${newQuestion.tags.includes(t) ? 'bg-brand-600 text-white' : 'bg-slatey-100 text-slatey-600'}`}>{t}</button>)}</div></div>
              <button onClick={askQuestion} className="btn-primary w-full">Post Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
