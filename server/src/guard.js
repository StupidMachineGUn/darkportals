/* v0.5.8 security helpers: real client IP, rate limits, lockout, signup caps, Turnstile */
export const PROXY_HOPS = process.env.PROXY_HOPS === undefined ? 1 : +process.env.PROXY_HOPS; // trusted reverse proxies in front (Caddy = 1)
export function clientIp(req) {
  const h = req.headers;
  if (process.env.CF === '1' && h['cf-connecting-ip']) return String(h['cf-connecting-ip']).trim();
  const sock = req.socket.remoteAddress || '';
  if (PROXY_HOPS > 0 && h['x-forwarded-for']) { // client-supplied entries are at the FRONT; only the last PROXY_HOPS entries were added by our proxies
    const a = String(h['x-forwarded-for']).split(',').map(s => s.trim()).filter(Boolean);
    const v = a[Math.max(0, a.length - PROXY_HOPS)]; if (v) return v;
  }
  return sock;
}
export function slidingLimiter(max, windowMs) {
  const m = new Map();
  const t = setInterval(() => { const n = Date.now(); for (const [k, a] of m) { while (a.length && n - a[0] > windowMs) a.shift(); if (!a.length) m.delete(k) } }, 30000); t.unref?.();
  return key => { const n = Date.now(), a = m.get(key) || []; while (a.length && n - a[0] > windowMs) a.shift(); a.push(n); m.set(key, a); return a.length > max };
}
/* per-username lockout with exponential backoff: 5 free fails, then 2^n seconds (max 15 min) */
export function createLockout() {
  const m = new Map();
  const t = setInterval(() => { const n = Date.now(); for (const [k, v] of m) if (v.until < n - 3600e3 && v.last < n - 3600e3) m.delete(k) }, 60000); t.unref?.();
  return {
    wait(u) { const v = m.get(String(u).toLowerCase()); return v && v.until > Date.now() ? Math.ceil((v.until - Date.now()) / 1000) : 0 },
    fail(u) { const k = String(u).toLowerCase(), v = m.get(k) || { n: 0, until: 0, last: 0 }; v.n++; v.last = Date.now(); if (v.n > 5) v.until = Date.now() + Math.min(900, 2 ** (v.n - 5)) * 1000; m.set(k, v) },
    ok(u) { m.delete(String(u).toLowerCase()) },
  };
}
/* global cap on new accounts per hour */
export function createSignupCap(max) { const a = []; return { hit() { const n = Date.now(); while (a.length && n - a[0] > 3600e3) a.shift(); if (max > 0 && a.length >= max) return false; a.push(n); return true } } }
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET; if (!secret) return true;
  if (!token || typeof token !== 'string' || token.length > 2048) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ secret, response: token, remoteip: ip }), signal: AbortSignal.timeout(5000) });
    return !!(await r.json()).success;
  } catch { return process.env.TURNSTILE_FAILOPEN === '1' }
}
/* usernames that look like staff / lookalikes are refused at signup */
const RESERVED = /^(admin|administrator|root|system|server|moderator|mod|gm|support|staff|guard|null|undefined)$/i;
export function nameLooksBad(n) { return RESERVED.test(n) || /^[_0-9]+$/.test(n) || /(.)\1{5,}/.test(n) || /^(admin|mod|gm)[_0-9]*$/i.test(n) }
/* per-connection token bucket for websocket messages */
export function bucket(rate, burst) { let tok = burst, t = Date.now(); return () => { const n = Date.now(); tok = Math.min(burst, tok + (n - t) / 1000 * rate); t = n; if (tok < 1) return false; tok--; return true } }
