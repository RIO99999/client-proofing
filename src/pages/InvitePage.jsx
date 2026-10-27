import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Brand, ErrorNote, Spinner } from '../components/ui';

// Public invite landing. Clients sign in or sign up, then get attached to the project.
export default function InvitePage() {
  const { token: inviteToken } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api(`/projects/invite/${inviteToken}`)
      .then((data) => {
        if (!cancelled) setProject(data.project);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  async function join() {
    setJoining(true);
    setError('');
    try {
      const data = await api('/projects/join', { method: 'POST', token, body: { token: inviteToken } });
      navigate(`/app/projects/${data.project.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <Brand />
      </div>
      {!project && !error && <Spinner label="Opening invite" />}
      {error && !project && (
        <div className="card invite-card">
          <h1>Invite not found</h1>
          <ErrorNote message={error} />
          <p className="muted" style={{ marginTop: 14 }}>Ask the designer to send a fresh link.</p>
        </div>
      )}
      {project && (
        <div className="card invite-card" style={{ margin: '24px 0 0' }}>
          <span className="eyebrow">You are invited to review</span>
          <h1>{project.name}</h1>
          <p className="muted">
            From {project.studioName}. {project.description}
          </p>
          {project.clientJoined && (
            <p className="small" style={{ marginTop: 12 }}>
              This project already has a client. If that is you, sign in to open it.
            </p>
          )}
          <ErrorNote message={error} />
          {token && user?.role === 'client' ? (
            <div className="btn-row">
              <button className="btn btn-primary btn-lg" onClick={join} disabled={joining}>
                {joining ? 'Joining…' : 'Open the project'}
              </button>
            </div>
          ) : token ? (
            <p className="muted" style={{ marginTop: 18 }}>
              You are signed in as a designer. Sign out and use a client account to review this project.
            </p>
          ) : (
            <div className="btn-row">
              <Link className="btn btn-primary btn-lg" to={`/sign-up?invite=${inviteToken}`}>
                Create a client account
              </Link>
              <Link className="btn btn-outline btn-lg" to="/sign-in" state={{ from: `/invite/${inviteToken}` }}>
                I have an account
              </Link>
            </div>
          )}
          {!token && (
            <p className="small muted" style={{ marginTop: 16 }}>
              Sign-in or sign-up is needed so your approvals and comments are attributed to you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
