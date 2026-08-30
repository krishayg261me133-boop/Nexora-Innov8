import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Search, MessageSquare, ArrowRight } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { Profile, Message } from '@/lib/types';
import { toast } from '@/lib/toast';

export function MessagesPage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTo = searchParams.get('to');
  const [conversations, setConversations] = useState<{ peer: Profile; lastMsg: Message; unread: number }[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadConversations();
    loadUsers();
    if (initialTo) startConversation(initialTo);
  }, [user, initialTo]);

  useEffect(() => {
    if (selectedPeer && user) loadMessages(selectedPeer.id);
  }, [selectedPeer, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    if (!user) return;
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (!msgs) return;
    const peerIds = new Set<string>();
    (msgs as Message[]).forEach((m) => peerIds.add(m.sender_id === user.id ? m.receiver_id : m.sender_id));
    const convos: { peer: Profile; lastMsg: Message; unread: number }[] = [];
    for (const peerId of peerIds) {
      const { data: peer } = await supabase.from('profiles').select('*').eq('id', peerId).maybeSingle();
      if (!peer) continue;
      const peerMsgs = (msgs as Message[]).filter((m) => m.sender_id === peerId || m.receiver_id === peerId);
      const unread = peerMsgs.filter((m) => m.receiver_id === user.id && !m.read).length;
      convos.push({ peer: peer as Profile, lastMsg: peerMsgs[0], unread });
    }
    convos.sort((a, b) => new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime());
    setConversations(convos);
  }

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').neq('id', user?.id).limit(50);
    setAllUsers((data || []) as Profile[]);
  }

  async function loadMessages(peerId: string) {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages((data || []) as Message[]);
    // Mark as read
    await supabase.from('messages').update({ read: true }).eq('sender_id', peerId).eq('receiver_id', user.id).eq('read', false);
  }

  async function startConversation(peerId: string) {
    const { data: peer } = await supabase.from('profiles').select('*').eq('id', peerId).maybeSingle();
    if (peer) setSelectedPeer(peer as Profile);
  }

  async function send() {
    if (!user || !selectedPeer || !content.trim()) return;
    const { data } = await supabase.from('messages').insert({
      sender_id: user.id, receiver_id: selectedPeer.id, content,
    }).select().single();
    if (data) {
      setMessages([...messages, data as Message]);
      setContent('');
      loadConversations();
    }
  }

  const filteredUsers = search
    ? allUsers.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div>
      <AppHeader title="Messages" subtitle="Direct messages with your connections" />
      <div className="container-px mx-auto max-w-container py-0">
        <div className="grid h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[320px_1fr]">
          {/* Sidebar - conversations */}
          <div className="border-r border-slatey-200/60 flex flex-col bg-white">
            <div className="p-4 border-b border-slatey-200/60">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slatey-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="input-field pl-10 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {search ? (
                <div>
                  <p className="px-4 py-2 text-xs font-semibold uppercase text-slatey-400">Search Results</p>
                  {filteredUsers.map((u) => (
                    <button key={u.id} onClick={() => { startConversation(u.id); setSearch(''); }} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slatey-50 transition-colors text-left">
                      <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
                      <div className="min-w-0"><p className="text-sm font-medium text-slatey-900 truncate">{u.full_name}</p><p className="text-xs text-slatey-400 truncate">{u.department}</p></div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && <p className="px-4 py-3 text-sm text-slatey-400">No students found.</p>}
                </div>
              ) : (
                conversations.map((c) => (
                  <button key={c.peer.id} onClick={() => setSelectedPeer(c.peer)} className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-slatey-50 transition-colors text-left ${selectedPeer?.id === c.peer.id ? 'bg-brand-50' : ''}`}>
                    <div className="relative">
                      <Avatar name={c.peer.full_name} src={c.peer.avatar_url} size="md" />
                      {c.unread > 0 && <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{c.unread}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between"><p className="text-sm font-medium text-slatey-900 truncate">{c.peer.full_name}</p><span className="text-xs text-slatey-400">{new Date(c.lastMsg.created_at).toLocaleDateString()}</span></div>
                      <p className="text-xs text-slatey-400 truncate">{c.lastMsg.content}</p>
                    </div>
                  </button>
                ))
              )}
              {!search && conversations.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-slatey-300" />
                  <p className="mt-3 text-sm text-slatey-400">No conversations yet. Search for a student to start chatting!</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-col bg-slatey-50">
            {selectedPeer ? (
              <>
                <div className="flex items-center gap-3 border-b border-slatey-200/60 bg-white px-5 py-3">
                  <Avatar name={selectedPeer.full_name} src={selectedPeer.avatar_url} size="md" />
                  <div className="flex-1">
                    <Link to={`/app/profile/${selectedPeer.id}`} className="font-medium text-slatey-900 hover:text-brand-600">{selectedPeer.full_name}</Link>
                    <p className="text-xs text-slatey-400">{selectedPeer.department}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-3">
                  {messages.length === 0 ? (
                    <div className="grid h-full place-items-center text-center">
                      <div><MessageSquare className="mx-auto h-10 w-10 text-slatey-300" /><p className="mt-3 text-sm text-slatey-400">Send a message to start the conversation!</p></div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}>
                        <Avatar name={msg.sender_id === user?.id ? profile?.full_name || '' : selectedPeer.full_name} src={msg.sender_id === user?.id ? profile?.avatar_url : selectedPeer.avatar_url} size="sm" />
                        <div className={`max-w-md rounded-2xl px-4 py-2.5 ${msg.sender_id === user?.id ? 'bg-brand-600 text-white' : 'bg-white text-slatey-700 shadow-card'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/60' : 'text-slatey-400'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-slatey-200/60 bg-white p-4 flex gap-3">
                  <input value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." className="input-field flex-1" />
                  <button onClick={send} className="btn-primary"><Send className="h-4 w-4" /></button>
                </div>
              </>
            ) : (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-600"><MessageSquare className="h-8 w-8" /></div>
                  <p className="mt-4 font-display text-lg font-semibold text-slatey-700">Your Messages</p>
                  <p className="mt-1 text-sm text-slatey-400">Select a conversation or search for a student to start chatting.</p>
                  <Link to="/app/discover" className="btn-secondary mt-6">Discover Talent <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
