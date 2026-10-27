import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, ErrorNote, Spinner } from '../components/ui';

function ProjectCard({ project, role }) {
  const c = project.counts || { total: 0, pending: 0, approved: 0, revision: 0 };
  const pct = (n) => (c.total ? `${(n / c.total) * 100}%` : '0%');
  return (
    <Link to={`/app/projects/${project.id}`} className="card project-card">
      <div className="meta-row" style={{ justifyContent: 'space-between' }}>
        <span className="small muted">
          {role === 'designer'
            ? project.clientJoined
              ? `Client: ${project.clientName || 'connected'}`
              : 'Waiting for client'
            : 'Project'}
        </span>
        {!project.clientJoined && role === 'designer' && <span className="badge badge-pending">Invite pending</span>}
      </div>
      <h3>{project.name}</h3>
      <p className="desc">{project.description || 'No description yet.'}</p>
      <div>
        <div className="count-bar" aria-hidden="true">
          <span className="b-approved" style={{ width: pct(c.approved) }} />
          <span className="b-revision" style={{ width: pct(c.revision) }} />
          <span className="b-pending" style={{ width: pct(c.pending) }} />
        </div>
      </div>
      <div className="project-stats">
        <div>
          <strong>{c.pending}</strong>pending
        </div>
        <div>
          <strong>{c.revision}</strong>revision
        </div>
        <div>
          <strong>{c.approved}</strong>approved
        </div>
      </div>
    </Link>
  );
}

function NewProjectModal({ onClose, onCreated }) {
  const { token } = useAuth();
  const [form, setForm] = useState({ name: '', description: '', clientName: '', clientEmail: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api('/projects', { method: 'POST', token, body: form });
      onCreated(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onClick={onClose}>
      <form className="modal stack" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div>
          <span className="eyebrow">New project</span>
          <h2 id="new-project-title">What are we reviewing?</h2>
        </div>
        <div className="field">
          <label htmlFor="pname">Project name</label>
          <input id="pname" className="input" value={form.name} onChange={update('name')} required maxLength={120} placeholder="e.g. Lagos Foods Q4 Campaign" />
        </div>
        <div className="field">
          <label htmlFor="pdesc">Short brief (optional)</label>
          <textarea id="pdesc" className="input" rows={3} value={form.description} onChange={update('description')} maxLength={1000} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="cname">Client name</label>
            <input id="cname" className="input" value={form.clientName} onChange={update('clientName')} />
          </div>
          <div className="field">
            <label htmlFor="cemail">Client email</label>
            <input id="cemail" type="email" className="input" value={form.clientEmail} onChange={update('clientEmail')} />
          </div>
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          After you create it, you get an invite link to send the client. They can also join by email.
        </p>
        <ErrorNote message={error} />
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !form.name.trim()}>
            {busy ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api('/projects', { token })
      .then((data) => {
        if (!cancelled) setProjects(data.projects);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isDesigner = user?.role === 'designer';

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">{isDesigner ? 'Designer dashboard' : 'Your review queue'}</span>
          <h1>{isDesigner ? 'Projects' : 'Proofs to review'}</h1>
          <p>
            {isDesigner
              ? 'Each project holds the proofs you send a client, with live status for every file.'
              : 'Open a project to see the proofs waiting for your decision.'}
          </p>
        </div>
        {isDesigner && (
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            New project
          </button>
        )}
      </div>

      {error && <ErrorNote message={error} />}
      {!projects && !error && <Spinner label="Loading projects" />}

      {projects && projects.length === 0 && (
        <EmptyState title={isDesigner ? 'No projects yet' : 'Nothing to review yet'}>
          {isDesigner
            ? 'Create a project, invite your client, and upload the first proof.'
            : 'When a designer invites you to a project, it will show up here.'}
        </EmptyState>
      )}

      {projects && projects.length > 0 && (
        <div className="grid-projects">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} role={user?.role} />
          ))}
        </div>
      )}

      {creating && (
        <NewProjectModal
          onClose={() => setCreating(false)}
          onCreated={(project) => {
            setCreating(false);
            navigate(`/app/projects/${project.id}`);
          }}
        />
      )}
    </>
  );
}
