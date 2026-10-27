// Thin fetch wrapper: JSON in/out, bearer token, friendly errors.
const RAW_BASE = import.meta.env.VITE_API_URL || '/api';
export const API_BASE = RAW_BASE.replace(/\/$/, '');
export const ORIGIN = API_BASE.replace(/\/api$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, form, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the API is running.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || 'Something went wrong. Try again.', res.status);
  }
  return data;
}

export function fileUrl(proof, token) {
  return `${ORIGIN}${proof.fileUrl}?token=${encodeURIComponent(token)}`;
}

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  revision: 'Revision'
};
