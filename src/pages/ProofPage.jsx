import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fileUrl } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, ErrorNote, Spinner, StatusBadge } from '../components/ui';
import CommentThread from '../components/CommentThread';

// Full-size proof viewer with decision controls (client) and status (designer).
export default function ProofPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [comments, setComments] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [decisionError, setDecisionError] = useState('');

  const isClient = user?.role === 'client';
  const isDesigner = user?.role === 'designer';

  useEffect(() => {
    let cancelled = false;
    Promise.all([api(`/proofs/${id}`, { token }), api(`/proofs/${id}/comments`, { token })])
      .then(([p, c]) => {
        if (cancelled) return;
        setData(p);
        setComments(c.comments);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  async function decide(decision) {
    setDeciding(true);
    setDecisionError('');
    try {
      const res = await api(`/proofs/${id}/decision`, {
        method: 'PATCH',
        token,
        body: { decision, comment: note }
      });
      setData((prev) => ({ ...prev, proof: res.proof }));
      const c = await api(`/proofs/${id}/comments`, { token });
      setComments(c.comments);
      setNote('');
    } catch (err) {
      setDecisionError(err.message);
    } finally {
      setDeciding(false);
    }
  }

  async function resetToPending() {
    setDecisionError('');
    try {
      const res = await api(`/proofs/${id}/reset`, { method: 'PATCH', token });
      setData((prev) => ({ ...prev, proof: res.proof }));
    } catch (err) {
      setDecisionError(err.message);
    }
  }

  if (error) {
    return (
      <EmptyState title="We could not open this proof">
        {error} <Link to="/app">Back to projects</Link>
      </EmptyState>
    );
  }
  if (!data || !comments) return <Spinner label="Loading proof" />;

  const { proof, project } = data;
  const src = fileUrl(proof, token);
  const hasDecided = proof.status !== 'pending';

  return (
    <>
      <div className="proof-nav">
        <div>
          <span className="eyebrow">
            <Link to={`/app/projects/${project.id}`} className="muted" style={{ textDecoration: 'none' }}>
              {project.name}
            </Link>
          </span>
          <div className="proof-name">
            {proof.title} <span className="muted small">v{proof.version}</span>
          </div>
        </div>
        <StatusBadge status={proof.status} />
      </div>

      <div className="viewer">
        <div className="stack">
          <div className="viewer-stage">
            {proof.file.isPdf ? (
              <iframe title={proof.title} src={src} />
            ) : (
              <img src={src} alt={proof.title} />
            )}
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            <a href={src} target="_blank" rel="noreferrer">
              Open the file in a new tab
            </a>{' '}
            · {proof.file.originalName}
          </p>
          <div className="card">
            <CommentThread
              proofId={id}
              comments={comments}
              onAdded={(c) => setComments((prev) => [...prev, c])}
            />
          </div>
        </div>

        <aside className="card decision-card stack" style={{ gap: 14 }}>
          <span className="eyebrow">{isClient ? 'Your decision' : 'Review status'}</span>
          <h2>{proof.status === 'approved' ? 'Approved' : proof.status === 'revision' ? 'Changes requested' : 'Waiting on the client'}</h2>
          <div className="decision-status">
            <StatusBadge status={proof.status} />
            {proof.decidedAt && <span className="muted small">decided {new Date(proof.decidedAt).toLocaleString('en-GB')}</span>}
          </div>

          {isClient && (
            <>
              <div className="field">
                <label htmlFor="decision-note">Note for the designer</label>
                <textarea
                  id="decision-note"
                  className="input"
                  rows={4}
                  placeholder="Optional when approving. Required when asking for changes."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={2000}
                />
              </div>
              <ErrorNote message={decisionError} />
              <div className="decision-actions">
                <button
                  className="btn btn-primary btn-lg btn-block"
                  onClick={() => decide('approved')}
                  disabled={deciding || proof.status === 'approved'}
                >
                  Approve proof
                </button>
                <button
                  className="btn btn-amber btn-lg btn-block"
                  onClick={() => decide('revision')}
                  disabled={deciding || !note.trim()}
                >
                  Request changes
                </button>
              </div>
              {!note.trim() && (
                <p className="small muted decision-note" style={{ margin: 0 }}>
                  Add a note to request changes. Approving does not need one.
                </p>
              )}
            </>
          )}

          {isDesigner && (
            <>
              <p className="small muted" style={{ margin: 0 }}>
                Upload a new version of this proof from the project page. Once you have fixed the requested changes,
                send it back to the client.
              </p>
              {proof.status === 'revision' && (
                <button className="btn btn-outline btn-block" onClick={resetToPending}>
                  Mark as sent for review again
                </button>
              )}
              {hasDecided && proof.status === 'approved' && (
                <p className="small" style={{ margin: 0 }}>
                  The client signed off this proof.
                </p>
              )}
              <ErrorNote message={decisionError} />
            </>
          )}
        </aside>
      </div>
    </>
  );
}
