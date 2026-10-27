import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Brand, ErrorNote } from '../components/ui';

// Sign-in and sign-up share one page. The role toggle only matters on sign-up.
export default function AuthPage({ mode }) {
  const isSignUp = mode === 'sign-up';
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite') || '';
  const [role, setRole] = useState('designer');
  const [form, setForm] = useState({ name: '', email: '', password: '', studioName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = isSignUp
        ? await api('/auth/register', {
            method: 'POST',
            body: { ...form, role, inviteToken: inviteToken || undefined }
          })
        : await api('/auth/login', {
            method: 'POST',
            body: { email: form.email, password: form.password }
          });
      signIn(data.token, data.user);
      const from = location.state?.from;
      if (inviteToken) {
        navigate(`/invite/${inviteToken}`, { replace: true });
      } else {
        navigate(from && from.startsWith('/app') ? from : '/app', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Brand />
        <div>
          <span className="eyebrow">Client proofing</span>
          <h2>Every proof, every decision, one thread.</h2>
          <p>Designers send work. Clients approve or ask for changes. Nobody scrolls back through a group chat.</p>
        </div>
        <p className="small" style={{ opacity: 0.6 }}>
          Demo: amara@studioverde.ng · demo1234
        </p>
      </aside>

      <div className="auth-form-col">
        <div className="auth-card">
          <span className="eyebrow">{isSignUp ? 'Create an account' : 'Welcome back'}</span>
          <h1>{isSignUp ? 'Start reviewing.' : 'Sign in.'}</h1>
          {inviteToken && isSignUp && (
            <p className="muted small">You are joining a project as a client. Create your account to continue.</p>
          )}

          <form className="stack" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            {isSignUp && (
              <>
                <div className="field">
                  <span className="label">I am a</span>
                  <div className="segmented" role="group" aria-label="Account type">
                    <button type="button" aria-pressed={role === 'designer'} onClick={() => setRole('designer')}>
                      Designer
                    </button>
                    <button type="button" aria-pressed={role === 'client'} onClick={() => setRole('client')}>
                      Client
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" className="input" value={form.name} onChange={update('name')} required />
                </div>
                {role === 'designer' && (
                  <div className="field">
                    <label htmlFor="studio">Studio name (optional)</label>
                    <input id="studio" className="input" value={form.studioName} onChange={update('studioName')} />
                  </div>
                )}
              </>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={update('password')}
                required
                minLength={isSignUp ? 8 : undefined}
              />
              {isSignUp && <span className="muted small">At least 8 characters.</span>}
            </div>
            <ErrorNote message={error} />
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
              {busy ? 'One moment…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            {isSignUp ? 'Already have an account? ' : 'New here? '}
            <Link to={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link>
          </p>
          <p className="auth-switch">
            <Link to="/">Back to the homepage</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
