import { useState } from 'react';
import { api, timeAgo } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { ErrorNote } from './ui';

const KIND_LABEL = {
  approved: 'Approved',
  revision: 'Requested changes',
  comment: null
};

// Threaded feedback for one proof. Designers and clients both post here.
export default function CommentThread({ proofId, comments, onAdded }) {
  const { token, user } = useAuth();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError('');
    try {
      const data = await api(`/proofs/${proofId}/comments`, {
        method: 'POST',
        token,
        body: { body: body.trim() }
      });
      setBody('');
      onAdded(data.comment);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="thread" aria-label="Comments">
      <h3 className="serif-h3">Feedback</h3>
      {comments.length === 0 && <p className="muted">No comments yet. Start the thread below.</p>}
      <ul className="thread-list">
        {comments.map((c) => (
          <li key={c.id} className={`thread-item ${c.kind !== 'comment' ? `thread-${c.kind}` : ''}`}>
            <div className="thread-meta">
              <strong>{c.authorName}</strong>
              <span className="role-tag">{c.authorRole}</span>
              {KIND_LABEL[c.kind] && <span className={`kind-tag kind-${c.kind}`}>{KIND_LABEL[c.kind]}</span>}
              <time className="muted small" dateTime={c.createdAt}>
                {timeAgo(c.createdAt)}
              </time>
            </div>
            {c.body && <p className="thread-body">{c.body}</p>}
          </li>
        ))}
      </ul>
      <form className="thread-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="comment-body">
          Write a comment
        </label>
        <textarea
          id="comment-body"
          className="input"
          rows={3}
          placeholder={user?.role === 'client' ? 'Add a note for the designer…' : 'Reply to the client…'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
        />
        <ErrorNote message={error} />
        <div className="row-end">
          <button className="btn btn-primary" type="submit" disabled={busy || !body.trim()}>
            {busy ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
