// Serialize + restore the runtime surface a user would want to share:
// { category, algoId, input, index }. Intentionally does NOT include the
// step stream — steps are reconstructed deterministically from (algoId, input).
//
// Encoding: JSON → UTF-8-safe base64 → URL-safe (RFC 4648 §5). The hash
// fragment is used rather than the query string so the token never touches
// the server.

const VERSION = 1;

function toB64Url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(token) {
  const b64 = token.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice(0, (4 - (token.length % 4)) % 4);
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export function encodeState(state) {
  const payload = { v: VERSION, ...state };
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return toB64Url(bytes);
}

export function decodeState(token) {
  if (!token) return null;
  try {
    const bytes = fromB64Url(token);
    const json = new TextDecoder().decode(bytes);
    const obj = JSON.parse(json);
    if (!obj || obj.v !== VERSION) return null;
    return obj;
  } catch {
    return null;
  }
}

// Hash-fragment helpers. We namespace under `s=` so other tools can add
// fragments without collisions.
export function readSnapshotFromHash() {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash.replace(/^#/, '');
  if (!h) return null;
  const params = new URLSearchParams(h);
  return decodeState(params.get('s'));
}

export function writeSnapshotToHash(state) {
  if (typeof window === 'undefined') return '';
  const token = encodeState(state);
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  params.set('s', token);
  const newHash = `#${params.toString()}`;
  window.history.replaceState(null, '', newHash);
  return token;
}

export function buildShareUrl(state) {
  if (typeof window === 'undefined') return '';
  const token = encodeState(state);
  return `${window.location.origin}${window.location.pathname}#s=${token}`;
}

export function clearSnapshotFromHash() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  params.delete('s');
  const rest = params.toString();
  window.history.replaceState(null, '', rest ? `#${rest}` : window.location.pathname);
}
