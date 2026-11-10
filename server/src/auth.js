import crypto from 'node:crypto';
const SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) console.warn('[warn] JWT_SECRET not set: sessions reset on restart');

export const hashPw = (pw, salt = crypto.randomBytes(16).toString('hex')) =>
  new Promise((res, rej) => crypto.scrypt(pw, salt, 64, { N: 16384 }, (e, k) => e ? rej(e) : res({ salt, hash: k.toString('hex') })));
export const checkPw = async (pw, salt, hash) => {
  const { hash: h } = await hashPw(pw, salt);
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(hash, 'hex'));
};
export function makeToken(uid, name, days = 30) {
  const body = Buffer.from(JSON.stringify({ uid, name, exp: Date.now() + days * 864e5 })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return body + '.' + sig;
}
export function readToken(tok) {
  if (!tok || typeof tok !== 'string') return null;
  const [body, sig] = tok.split('.');
  if (!body || !sig) return null;
  const ok = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(ok))) return null;
  try { const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() ? p : null; } catch { return null; }
}
