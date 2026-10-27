import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AppShell, Spinner } from './components/ui';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import InvitePage from './pages/InvitePage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ProofPage from './pages/ProofPage';
import NotFoundPage from './pages/NotFoundPage';

function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="page">
        <Spinner label="Checking your session" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function Protected({ children }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<AuthPage mode="sign-in" />} />
      <Route path="/sign-up" element={<AuthPage mode="sign-up" />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route
        path="/app"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/app/projects/:id"
        element={
          <Protected>
            <ProjectPage />
          </Protected>
        }
      />
      <Route
        path="/app/proofs/:id"
        element={
          <Protected>
            <ProofPage />
          </Protected>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
