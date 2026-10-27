import { useAuth } from '../hooks/useAuth';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import LogoMark from './LogoMark';

export function Brand({ to = '/' }) {
  return (
    <Link to={to} className="brand">
      <LogoMark className="brand-mark" size={30} />
      <span className="brand-name">Client Proofing</span>
    </Link>
  );
}

export function AppShell({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand to="/app" />
        <nav className="topbar-nav">
          <NavLink to="/app" end>
            {user?.role === 'designer' ? 'Projects' : 'My proofs'}
          </NavLink>
        </nav>
        <div className="topbar-user">
          <span className="muted small">
            {user?.name}
            <span className="role-tag">{user?.role}</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}

export function StatusBadge({ status }) {
  const label = { pending: 'Pending', approved: 'Approved', revision: 'Revision' }[status] || status;
  return <span className={`badge badge-${status}`}>{label}</span>;
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="muted small">{label}</span>
    </div>
  );
}

export function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <p className="error-note" role="alert">
      {message}
    </p>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {children && <p className="muted">{children}</p>}
    </div>
  );
}
