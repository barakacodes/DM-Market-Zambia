const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || 'http://localhost:8000';

export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE}${path}`;
}
