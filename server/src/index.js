import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { makeDb } from './db.js';
import { hashPw, checkPw, makeToken, readToken } from './auth.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(here, '..', 'public');
const VERSION = fs.existsSync(path.join(here, '..', 'VERSION')) ? fs.readFileSync(path.join(here, '..', 'VERSION'), 'utf8').trim() : 'dev';
const MAX_BODY = 512 * 1024;
const SCHEMA_V = 1;

export async function createServer({ port = +process.env.PORT || 8080 } = {}) {
  const db = await makeDb();
  const hits = new Map(); // ip -> [timestamps] for auth rate-limit
  const limited = ip => { const n = Date.now(), a = (hits.get(ip) || []).filter(t => n - t < 60000); a.push(n); hits.set(ip, a); return a.length > 12; };
  const send = (res, code, obj) => { const b = JSON.stringify(obj); res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(b); };
  const body = req => new Promise((res, rej) => { let s = '', n = 0; req.on('data', c => { n += c.length; if (n > MAX_BODY) { rej(new Error('big')); req.destroy() } else s += c }); req.on('end', () => { try { res(s ? JSON.parse(s) : {}) } catch (e) { rej(e) } }); });
  const authed = req => readToken((req.headers.authorization || '').replace(/^Bearer /, ''));
  const ip = req => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const nameOk = s => typeof s === 'string' && /^[A-Za-z0-9_]{3,16}$/.test(s);

  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://x');
      if (u.pathname === '/api/ping') return send(res, 200, { ok: 1, version: VERSION, online: players.size });
      if (u.pathname === '/api/register' && req.method === 'POST') {
        if (limited(ip(req))) return send(res, 429, { err: 'Too many attempts, wait a minute' });
        const { username, password } = await body(req);
        if (!nameOk(username)) return send(res, 400, { err: 'Username: 3-16 letters, numbers or _' });
        if (typeof password !== 'string' || password.length < 6 || password.length > 100) return send(res, 400, { err: 'Password must be 6+ characters' });
        const ex = await db.query('SELECT id FROM users WHERE lower(username)=lower($1)', [username]);
        if (ex.rows.length) return send(res, 409, { err: 'Username taken' });
        const { salt, hash } = await hashPw(password);
        const r = await db.query('INSERT INTO users(username,salt,hash) VALUES($1,$2,$3) RETURNING id', [username, salt, hash]);
        return send(res, 200, { token: makeToken(r.rows[0].id, username), username, character: null });
      }
      if (u.pathname === '/api/login' && req.method === 'POST') {
        if (limited(ip(req))) return send(res, 429, { err: 'Too many attempts, wait a minute' });
        const { username, password } = await body(req);
        const r = await db.query('SELECT * FROM users WHERE lower(username)=lower($1)', [String(username || '')]);
        const row = r.rows[0];
        if (!row || !(await checkPw(String(password || ''), row.salt, row.hash))) return send(res, 401, { err: 'Wrong username or password' });
        const c = await db.query('SELECT name,data FROM characters WHERE user_id=$1', [row.id]);
        return send(res, 200, { token: makeToken(row.id, row.username), username: row.username, character: c.rows[0] ? { name: c.rows[0].name, data: JSON.parse(c.rows[0].data) } : null });
      }
      if (u.pathname === '/api/save' && req.method === 'PUT') {
        const a = authed(req); if (!a) return send(res, 401, { err: 'Not logged in' });
        const ch = await body(req);
        if (!ch || typeof ch !== 'object' || !ch.xp || typeof ch.name !== 'string' || !Array.isArray(ch.inv)) return send(res, 400, { err: 'Bad character' });
        if (ch.inv.length > 80) return send(res, 400, { err: 'Bad inventory' });
        const data = JSON.stringify(ch);
        await db.query('DELETE FROM characters WHERE user_id=$1', [a.uid]);
        await db.query('INSERT INTO characters(user_id,name,data,schema_v) VALUES($1,$2,$3,$4)', [a.uid, ch.name.slice(0, 12), data, SCHEMA_V]);
        return send(res, 200, { ok: 1 });
      }
      if (u.pathname === '/api/board' && req.method === 'GET') {
        const r = await db.query('SELECT name,score,data FROM heroes ORDER BY score DESC LIMIT 50');
        return send(res, 200, r.rows.map(x => ({ ...JSON.parse(x.data), name: x.name, score: x.score })));
      }
      if (u.pathname === '/api/board' && req.method === 'POST') {
        const a = authed(req); if (!a) return send(res, 401, { err: 'Not logged in' });
        const e = await body(req);
        if (!e || typeof e.name !== 'string' || !Number.isFinite(e.score)) return send(res, 400, { err: 'Bad entry' });
        const img = typeof e.img === 'string' && e.img.length < 20000 ? e.img : '';
        const clean = { img, when: Date.now(), tl: e.tl | 0, mk: e.mk | 0, pk: e.pk | 0, pd: e.pd | 0, d: e.d | 0, gold: e.gold | 0, wiz: e.wiz | 0 };
        const old = await db.query('SELECT score FROM heroes WHERE name=$1', [e.name]);
        const score = Math.max(old.rows[0] ? old.rows[0].score : 0, Math.round(e.score));
        await db.query('DELETE FROM heroes WHERE name=$1', [e.name]);
        await db.query('INSERT INTO heroes(name,score,data) VALUES($1,$2,$3)', [e.name.slice(0, 12), score, JSON.stringify(clean)]);
        return send(res, 200, { ok: 1 });
      }
      // static
      let f = u.pathname === '/' ? '/index.html' : u.pathname;
      const full = path.join(PUB, path.normalize(f).replace(/^(\.\.[/\\])+/, ''));
      if (!full.startsWith(PUB) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'content-type': full.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream', 'cache-control': 'no-cache' });
      fs.createReadStream(full).pipe(res);
    } catch (e) { send(res, 400, { err: 'Bad request' }); }
  });

  /* ---------- realtime presence + chat ---------- */
  const players = new Map(); // uid -> {ws,name,x,y,dir,eq,t,lastChat}
  const wss = new WebSocketServer({ noServer: true, maxPayload: 4096 });
  server.on('upgrade', (req, sock, head) => {
    const u = new URL(req.url, 'http://x');
    const a = u.pathname === '/ws' ? readToken(u.searchParams.get('token')) : null;
    if (!a) { sock.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); return sock.destroy(); }
    wss.handleUpgrade(req, sock, head, ws => wss.emit('connection', ws, a));
  });
  const MAX_SPEED = 14; // tiles/s incl. sprint + slack; anything faster is snapped back
  wss.on('connection', (ws, a) => {
    const old = players.get(a.uid); if (old) { try { old.ws.close(4000, 'Logged in elsewhere') } catch {} }
    const me = { ws, uid: a.uid, name: a.name, x: 0, y: 0, dir: 0, eq: 0, t: Date.now(), lastChat: 0, init: false };
    players.set(a.uid, me);
    ws.send(JSON.stringify({ t: 'hello', id: a.uid, online: players.size }));
    broadcast({ t: 'sys', m: `${a.name} entered the world` }, me);
    ws.on('message', raw => {
      let m; try { m = JSON.parse(raw) } catch { return }
      const now = Date.now();
      if (m.t === 'pos' && Number.isFinite(m.x) && Number.isFinite(m.y)) {
        if (me.init) {
          const dt = Math.max(.05, (now - me.t) / 1000), d = Math.hypot(m.x - me.x, m.y - me.y);
          const tpOk = m.tp && now - (me.lastTp || 0) > 3000; if (tpOk) me.lastTp = now;
          if (d > MAX_SPEED * dt + 3 && !tpOk) { ws.send(JSON.stringify({ t: 'snap', x: me.x, y: me.y })); return; }
        }
        me.x = m.x; me.y = m.y; me.dir = m.dir | 0; me.eq = m.eq | 0; me.name = a.name; me.t = now; me.init = true; me.hp = m.hp | 0; me.ch = m.ch ? 1 : 0; me.col = String(m.col || '').slice(0, 9);
      } else if (m.t === 'chat' && typeof m.m === 'string') {
        if (now - me.lastChat < 1000) return; me.lastChat = now;
        broadcast({ t: 'chat', n: a.name, m: m.m.slice(0, 120) });
      }
    });
    ws.on('close', () => { if (players.get(a.uid) === me) { players.delete(a.uid); broadcast({ t: 'sys', m: `${a.name} left the world` }) } });
  });
  function broadcast(obj, except) { const s = JSON.stringify(obj); for (const p of players.values()) if (p !== except && p.ws.readyState === 1) p.ws.send(s) }
  const tick = setInterval(() => {
    const all = [...players.values()].filter(p => p.init);
    for (const p of players.values()) {
      if (p.ws.readyState !== 1 || !p.init) continue;
      const near = all.filter(q => q !== p && Math.hypot(q.x - p.x, q.y - p.y) < 45).map(q => ({ id: q.uid, n: q.name, x: +q.x.toFixed(2), y: +q.y.toFixed(2), d: q.dir, e: q.eq, h: q.hp, c: q.ch, k: q.col }));
      p.ws.send(JSON.stringify({ t: 'players', l: near, online: players.size }));
    }
  }, 200);

  await new Promise(r => server.listen(port, r));
  const close = async () => { clearInterval(tick); wss.close(); for (const p of players.values()) try { p.ws.terminate() } catch {} await new Promise(r => server.close(r)); await db.end?.() };
  return { server, port: server.address().port, close, db };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const s = await createServer();
  console.log(`Dark Portals server v${VERSION} listening on :${s.port}`);
  const stop = async () => { console.log('shutting down'); await s.close(); process.exit(0) };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
