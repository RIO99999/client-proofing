import { useEffect, useState } from 'react';
import { api, timeAgo } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, Spinner } from './ui';

const ICONS = {
  project_created: 'Created',
  client_joined: 'Joined',
  proof_uploaded: 'Uploaded',
  proof_approved: 'Approved',
  proof_revision: 'Revision',
  comment_added: 'Comment',
  proof_reuploaded: 'Re-upload'
};

// Per-project timeline of everything that happened, newest first.
export default function ActivityFeed({ projectId }) {
  const { token } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api(`/projects/${projectId}/activity`, { token })
      .then((data) => {
        if (!cancelled) setItems(data.activity);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, token]);

  if (error) return <p className="error-note">{error}</p>;
  if (!items) return <Spinner label="Loading activity" />;
  if (items.length === 0) return <EmptyState title="No activity yet">Uploads, decisions and comments show up here.</EmptyState>;

  return (
    <ol className="activity">
      {items.map((item) => (
        <li key={item.id} className={`activity-item activity-${item.type}`}>
          <span className="activity-tag">{ICONS[item.type] || 'Update'}</span>
          <p>{item.message}</p>
          <time className="muted small" dateTime={item.createdAt}>
            {timeAgo(item.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
}
