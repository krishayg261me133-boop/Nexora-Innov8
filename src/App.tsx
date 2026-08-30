import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { TeamsPage } from '@/pages/TeamsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ResearchPage } from '@/pages/ResearchPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { AdminPage } from '@/pages/AdminPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slatey-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slatey-200 border-t-brand-600" />
          <p className="text-sm text-slatey-500">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (user && profile && !profile.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          } />

          {/* App routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <OnboardingGate>
                <AppShell><DashboardPage /></AppShell>
              </OnboardingGate>
            </ProtectedRoute>
          } />
          <Route path="/app/discover" element={
            <ProtectedRoute><AppShell><DiscoverPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/profile/:id" element={
            <ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/projects" element={
            <ProtectedRoute><AppShell><ProjectsPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/projects/:id" element={
            <ProtectedRoute><AppShell><ProjectDetailPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/teams" element={
            <ProtectedRoute><AppShell><TeamsPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/messages" element={
            <ProtectedRoute><AppShell><MessagesPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/research" element={
            <ProtectedRoute><AppShell><ResearchPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/community" element={
            <ProtectedRoute><AppShell><CommunityPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/notifications" element={
            <ProtectedRoute><AppShell><NotificationsPage /></AppShell></ProtectedRoute>
          } />
          <Route path="/app/admin" element={
            <ProtectedRoute><AppShell><AdminPage /></AppShell></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
