import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles, LayoutDashboard, Search, FolderGit2, Users, MessageSquare,
  BookOpen, MessageCircle, Bell, Settings, LogOut, Menu, X, Home,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/lib/types';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/discover', icon: Search, label: 'Discover Talent' },
  { to: '/app/projects', icon: FolderGit2, label: 'Projects' },
  { to: '/app/teams', icon: Users, label: 'Teams' },
  { to: '/app/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/app/research', icon: BookOpen, label: 'Research Hub' },
  { to: '/app/community', icon: MessageCircle, label: 'Community' },
  { to: '/app/admin', icon: Settings, label: 'Admin' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    async function loadNotifications() {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', user!.id)
        .eq('read', false);
      setUnreadCount(count || 0);
    }
    loadNotifications();
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, loadNotifications)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slatey-50 flex">
      {/* Sidebar - desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slatey-200/60 bg-white transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-16 items-center justify-between border-b border-slatey-200/60 px-5">
          <Link to="/app" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-bg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold text-slatey-900">NEXORA</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slatey-400 hover:text-slatey-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slatey-600 hover:bg-slatey-50 hover:text-slatey-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3 border-t border-slatey-200/60">
          <Link
            to="/app/notifications"
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all mb-1 ${
              location.pathname === '/app/notifications' ? 'bg-brand-50 text-brand-700' : 'text-slatey-600 hover:bg-slatey-50'
            }`}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            Notifications
          </Link>
          <Link
            to={`/app/profile/${user?.id}`}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slatey-600 hover:bg-slatey-50 transition-all"
          >
            <Avatar name={profile?.full_name || user?.email || ''} src={profile?.avatar_url} size="xs" />
            {profile?.full_name || 'Profile'}
          </Link>
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slatey-600 hover:bg-slatey-50 transition-all mb-1">
            <Home className="h-5 w-5" />
            Home
          </Link>
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slatey-600 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slatey-900/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slatey-200/60 bg-white/80 px-5 backdrop-blur-xl lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slatey-600 hover:text-slatey-900">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/app" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg gradient-bg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-slatey-900">NEXORA</span>
          </Link>
          <Link to="/app/notifications" className="relative text-slatey-600">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
          </Link>
        </header>

        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">{children}</main>
      </div>
    </div>
  );
}

export function AppHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="border-b border-slatey-200/60 bg-white/60 backdrop-blur-sm">
      <div className="container-px mx-auto max-w-container flex items-center justify-between py-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slatey-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slatey-500">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
