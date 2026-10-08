/** In-memory only. Route changes retain control of live jobs; reload discards credentials. */
export const localSession: {
  token: string;
  mode?: string;
  workbench?: Record<string, unknown>;
  workspace?: Record<string, unknown>;
  operationToken?: string;
  operations?: Record<string, unknown>;
  investigation?: { run_id: string; status: string; label: string };
} = { token: '' };

if (typeof window !== 'undefined' && ['127.0.0.1', 'localhost'].includes(location.hostname)) {
  const token = new URLSearchParams(location.hash.slice(1)).get('local-session');
  if (token && /^[A-Za-z0-9_-]{24,128}$/.test(token)) {
    localSession.token = token;
    history.replaceState(null, '', location.pathname + location.search);
  }
}
