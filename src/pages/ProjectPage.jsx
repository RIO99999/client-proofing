import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, timeAgo } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, ErrorNote, Spinner, StatusBadge } from '../components/ui';
import ActivityFeed from '../components/ActivityFeed';

function UploadBox({ projectId, onUploaded }) {
  const { token } = useAuth();
  const inputRef = useRef(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function pick(f) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  }

  async function upload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title || file.name);
      const data = await api(`/projects/${projectId}/proofs`, { method: 'POST', token, form });
      setFile(null);
      setTitle('');
      if (inputRef.current) inputRef.current.value = '';
      onUploaded(data.proof);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card stack" onSubmit={upload}>
      <h3>Upload a proof</h3>
      <label
        className={`dropzone ${over ? 'is-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
          onChange={(e) => pick(e.target.files[0])}
        />
        <strong>{file ? file.name : 'Drop a file or click to choose'}</strong>
        <span className="muted small">PNG, JPG, GIF, WEBP or PDF · up to 25 MB</span>
      </label>
      <div className="field">
        <label htmlFor="ptitle">Proof title</label>
        <input id="ptitle" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </div>
      <ErrorNote message={error} />
      <div className="row-end">
        <button className="btn btn-primary" type="submit" disabled={!file || busy}>
          {busy ? 'Uploading…' : 'Send for review'}
        </button>
      </div>
    </form>
  );
}

function InviteCard({ project, onUpdated }) {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState(project.clientEmail || '');
  const [name, setName] = useState(project.clientName || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(project.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed. Select the link and copy it manually.');
    }
  }

  async function saveClient(e) {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const data = await api(`/projects/${project.id}/invite`, {
        method: 'PATCH',
        token,
        body: { clientName: name, clientEmail: email }
      });
      setSaved(true);
      onUpdated(data.project);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="card side-card stack" style={{ gap: 14 }}>
      <h3>Client access</h3>
      {project.clientJoined ? (
        <p className="small" style={{ margin: 0 }}>
          <span className="badge badge-approved">Connected</span>{' '}
          <span className="muted">{project.clientName || 'Client'} can review this project.</span>
        </p>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          Send this link. The client creates an account and lands on the project.
        </p>
      )}
      <div className="invite-box">
        <input className="input" readOnly value={project.inviteLink} aria-label="Invite link" onFocus={(e) => e.target.select()} />
        <button className="btn btn-outline btn-sm" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <form className="stack" style={{ gap: 10 }} onSubmit={saveClient}>
        <div className="field">
          <label htmlFor="inv-name">Client name</label>
          <input id="inv-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="inv-email">Client email</label>
          <input id="inv-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <ErrorNote message={error} />
        {saved && <p className="small muted" style={{ margin: 0 }}>Saved.</p>}
        <div className="row-end">
          <button className="btn btn-ghost btn-sm" type="submit">
            Save client details
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProjectPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [project, setProject] = useState(null);
  const [proofs, setProofs] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('proofs');

  const isDesigner = user?.role === 'designer';

  useEffect(() => {
    let cancelled = false;
    Promise.all([api(`/projects/${id}`, { token }), api(`/projects/${id}/proofs`, { token })])
      .then(([p, pr]) => {
        if (cancelled) return;
        setProject(p.project);
        setProofs(pr.proofs);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  if (error) {
    return (
      <EmptyState title="We could not open this project">
        {error} <Link to="/app">Back to projects</Link>
      </EmptyState>
    );
  }
  if (!project || !proofs) return <Spinner label="Loading project" />;

  const c = project.counts || { total: proofs.length };
  const counts = proofs.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, revision: 0 }
  );

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">
            <Link to="/app" className="muted" style={{ textDecoration: 'none' }}>
              Projects
            </Link>{' '}
            / Project
          </span>
          <h1>{project.name}</h1>
          <p>{project.description || 'No brief yet.'}</p>
        </div>
        <div className="meta-row">
          <span className="badge badge-pending">{counts.pending} pending</span>
          <span className="badge badge-revision">{counts.revision} revision</span>
          <span className="badge badge-approved">{counts.approved} approved</span>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="section-title">
            <div className="segmented" style={{ width: 'auto', display: 'inline-grid', gridTemplateColumns: '1fr 1fr' }} role="tablist">
              <button type="button" role="tab" aria-pressed={tab === 'proofs'} onClick={() => setTab('proofs')}>
                Proofs ({proofs.length})
              </button>
              <button type="button" role="tab" aria-pressed={tab === 'activity'} onClick={() => setTab('activity')}>
                Activity
              </button>
            </div>
          </div>

          {tab === 'proofs' && (
            <>
              {proofs.length === 0 && (
                <EmptyState title="No proofs yet">
                  {isDesigner ? 'Upload the first graphic to start the review.' : 'The designer has not sent any proofs yet.'}
                </EmptyState>
              )}
              <div className="proof-list">
                {proofs.map((p) => (
                  <Link key={p.id} to={`/app/proofs/${p.id}`} className="proof-row">
                    <div className="proof-thumb">{p.file.isPdf ? 'PDF' : 'Image'}</div>
                    <div>
                      <div className="proof-title">
                        {p.title} <span className="muted small">v{p.version}</span>
                      </div>
                      <div className="proof-sub">
                        {p.file.originalName} · updated {timeAgo(p.updatedAt)}
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </>
          )}

          {tab === 'activity' && (
            <div className="card">
              <ActivityFeed projectId={id} />
            </div>
          )}
        </div>

        <aside className="stack">
          {isDesigner && (
            <>
              <UploadBox
                projectId={id}
                onUploaded={(proof) => setProofs((prev) => [proof, ...prev])}
              />
              <InviteCard project={project} onUpdated={(p) => setProject((prev) => ({ ...prev, ...p, counts: prev.counts }))} />
            </>
          )}
          {!isDesigner && (
            <div className="card side-card">
              <h3>How review works</h3>
              <dl className="dl">
                <dt>Approve</dt>
                <dd>Signs off the proof.</dd>
                <dt>Request changes</dt>
                <dt />
                <dd>Ask for a fix. Add a note.</dd>
              </dl>
            </div>
          )}
          <div className="card side-card">
            <h3>Details</h3>
            <dl className="dl">
              <dt>Client</dt>
              <dd>{project.clientName || 'Not set'}</dd>
              <dt>Status</dt>
              <dd>{project.clientJoined ? 'Client connected' : 'Waiting for client'}</dd>
              <dt>Proofs</dt>
              <dd>{c.total || 0}</dd>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
