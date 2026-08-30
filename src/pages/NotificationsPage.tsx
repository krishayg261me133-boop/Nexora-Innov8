import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Users, MessageSquare, Target, Sparkles, Megaphone, UserPlus } from 'lucide-react';
import { AppHeader } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/lib/types';

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  connection: { icon: UserPlus, color: 'bg-brand-50 text-brand-600' },
  team: { icon: Users, color: 'bg-cyanx-50 text-cyanx-600' },
  project: { icon: Target, color: 'bg-tealx-50 text-tealx-600' },
  message: { icon: MessageSquare, color: 'bg-brand-50 text-brand-600' },
  match: { icon: Sparkles, color: 'bg-amber-50 text-amber-600' },
  announcement: { icon: Megaphone, color: 'bg-slatey-100 text-slatey-600' },
};

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => { loadNotifications(); }, [user]);

  async function loadNotifications() {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <AppHeader title="Notifications" subtitle={`${unreadCount} unread notifications`}
        action={unreadCount > 0 ? <button onClick={markAllRead} className="btn-secondary text-sm"><Check className="h-4 w-4" /> Mark all read</button> : undefined}
      />
      <div className="container-px mx-auto max-w-2xl py-8">
        <div className="mb-6 flex gap-2">
          <button onClick={() => setFilter('all')} className={`tag px-4 py-2 text-sm ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-slatey-200 text-slatey-600'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`tag px-4 py-2 text-sm ${filter === 'unread' ? 'bg-brand-600 text-white' : 'bg-white border border-slatey-200 text-slatey-600'}`}>Unread ({unreadCount})</button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="skeleton h-20" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center"><Bell className="mx-auto h-12 w-12 text-slatey-300" /><p className="mt-4 text-slatey-500">No notifications{filter === 'unread' ? ' unread' : ''}. You're all caught up!</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig['announcement'];
              return (
                <div key={n.id} className={`card p-4 flex items-center gap-4 transition-all ${!n.read ? 'border-brand-200 bg-brand-50/30' : ''}`}>
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${cfg.color}`}><cfg.icon className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-slatey-900' : 'font-medium text-slatey-600'}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-slatey-500 mt-0.5">{n.body}</p>}
                    <p className="text-xs text-slatey-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.link && <Link to={n.link} className="btn-ghost border border-slatey-200 text-xs px-3 py-1.5">View</Link>}
                    {!n.read && <button onClick={() => markAsRead(n.id)} className="grid h-8 w-8 place-items-center rounded-lg text-slatey-400 hover:bg-slatey-100 hover:text-slatey-600"><Check className="h-4 w-4" /></button>}
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
