import { monitorEventLoopDelay } from 'node:perf_hooks';
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
const saveQ = new Map(); // per-user serialized saves (no lost/out-of-order writes)
const SCHEMA_V = 1;

export async function createServer({ port = +process.env.PORT || 8080 } = {}) {
  const db = await makeDb();
  const hits = new Map(); // ip -> [timestamps] for auth rate-limit
  const limited = ip => { const n = Date.now(), a = (hits.get(ip) || []).filter(t => n - t < 60000); a.push(n); hits.set(ip, a); return a.length > 12; };
  const send = (res, code, obj) => { const b = JSON.stringify(obj); res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(b); };
  const body = req => new Promise((res, rej) => { let s = '', n = 0; req.on('data', c => { n += c.length; if (n > MAX_BODY) { rej(new Error('big')); req.destroy() } else s += c }); req.on('end', () => { try { res(s ? JSON.parse(s) : {}) } catch (e) { rej(e) } }); });
  const authed = req => readToken((req.headers.authorization || '').replace(/^Bearer /, ''));
  const ip = req => (process.env.CF === '1' && req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const nameOk = s => typeof s === 'string' && /^[A-Za-z0-9_]{3,16}$/.test(s);

  const maint = { on: false, msg: '', allow: new Map() }; // maintenance: new logins refused except admins and recently-online players
  const ADM = new Set((process.env.ADMINS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean));
  const IP_LIMIT = process.env.IP_LIMIT === undefined ? 1 : +process.env.IP_LIMIT; // accounts per IP (0 = unlimited)
  const IP_ALLOW = new Set((process.env.IP_ALLOW || '').split(',').map(x => x.trim()).filter(Boolean));
  const maintBlocks = (uid, name) => maint.on && !ADM.has(String(name).toLowerCase()) && !((maint.allow.get(uid) || 0) > Date.now());
  const alog = (admin, action, target, info) => { console.log(`ADMIN ${admin} ${action} ${target || ''} ${info || ''}`); db.query('INSERT INTO admin_log(admin,action,target,info) VALUES($1,$2,$3,$4)', [admin, action, String(target || ''), String(info || '').slice(0, 200)]).catch(() => {}) };
  try { const r = await db.query("SELECT v FROM settings WHERE k='maint'"); if (r.rows[0]) { const m = JSON.parse(r.rows[0].v); maint.on = !!m.on; maint.msg = String(m.msg || '') } } catch {}
  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://x');
      if (u.pathname === '/api/ping') return send(res, 200, { ok: 1, version: VERSION, online: players.size, maint: maint.on, mmsg: maint.on ? maint.msg : '' });
      if (u.pathname === '/api/register' && req.method === 'POST') {
        if (limited(ip(req))) return send(res, 429, { err: 'Too many attempts, wait a minute' });
        const { username, password } = await body(req);
        if (maint.on) return send(res, 503, { err: 'Server under maintenance' + (maint.msg ? ': ' + maint.msg : ''), maint: 1 });
        if (!nameOk(username)) return send(res, 400, { err: 'Username: 3-16 letters, numbers or _' });
        if (typeof password !== 'string' || password.length < 6 || password.length > 100) return send(res, 400, { err: 'Password must be 6+ characters' });
        const ex = await db.query('SELECT id FROM users WHERE lower(username)=lower($1)', [username]);
        if (ex.rows.length) return send(res, 409, { err: 'Username taken' });
        const rip = ip(req);
        if (IP_LIMIT > 0 && !IP_ALLOW.has(rip)) { const n = await db.query('SELECT count(*) AS n FROM users WHERE ip=$1', [rip]); if (+n.rows[0].n >= IP_LIMIT) return send(res, 403, { err: 'This connection already has an account' }) }
        const { salt, hash } = await hashPw(password);
        const r = await db.query('INSERT INTO users(username,salt,hash,ip) VALUES($1,$2,$3,$4) RETURNING id', [username, salt, hash, rip]);
        return send(res, 200, { token: makeToken(r.rows[0].id, username), username, character: null });
      }
      if (u.pathname === '/api/login' && req.method === 'POST') {
        if (limited(ip(req))) return send(res, 429, { err: 'Too many attempts, wait a minute' });
        const { username, password } = await body(req);
        const r = await db.query('SELECT * FROM users WHERE lower(username)=lower($1)', [String(username || '')]);
        const row = r.rows[0];
        if (!row || !(await checkPw(String(password || ''), row.salt, row.hash))) return send(res, 401, { err: 'Wrong username or password' });
        if (maintBlocks(row.id, row.username)) return send(res, 503, { err: 'Server under maintenance' + (maint.msg ? ': ' + maint.msg : ''), maint: 1 });
        const c = await db.query('SELECT name,data,ver FROM characters WHERE user_id=$1', [row.id]);
        return send(res, 200, { token: makeToken(row.id, row.username), username: row.username, character: c.rows[0] ? { name: c.rows[0].name, data: JSON.parse(c.rows[0].data), ver: c.rows[0].ver | 0 } : null });
      }
      if (u.pathname === '/api/save' && req.method === 'PUT') {
        const a = authed(req); if (!a) return send(res, 401, { err: 'Not logged in' });
        const ch = await body(req);
        if (!ch || typeof ch !== 'object' || !ch.xp || typeof ch.name !== 'string' || !Array.isArray(ch.inv)) return send(res, 400, { err: 'Bad character' });
        if (ch.inv.length > 80) return send(res, 400, { err: 'Bad inventory' });
        const data = JSON.stringify(ch), baseH = req.headers['x-base'], base = baseH === undefined ? null : parseInt(baseH, 10);
        let out = null;
        saveQ.set(a.uid, (saveQ.get(a.uid) || Promise.resolve()).catch(() => {}).then(async () => {
          let u;
          if (base === null) u = await db.query('UPDATE characters SET name=$2,data=$3,schema_v=$4,ver=ver+1 WHERE user_id=$1 RETURNING ver', [a.uid, ch.name.slice(0, 12), data, SCHEMA_V]); // legacy client: no version check
          else u = await db.query('UPDATE characters SET name=$2,data=$3,schema_v=$4,ver=ver+1 WHERE user_id=$1 AND ver=$5 RETURNING ver', [a.uid, ch.name.slice(0, 12), data, SCHEMA_V, base]);
          if (u.rows.length) { out = u.rows[0].ver | 0; return }
          const ex = await db.query('SELECT ver FROM characters WHERE user_id=$1', [a.uid]);
          if (ex.rows.length) { out = -1; return } // someone else saved since this client loaded
          try { await db.query('INSERT INTO characters(user_id,name,data,schema_v,ver) VALUES($1,$2,$3,$4,1)', [a.uid, ch.name.slice(0, 12), data, SCHEMA_V]); out = 1 } catch { out = -1 }
        }));
        await saveQ.get(a.uid);
        console.log(`save user=${a.name} bytes=${data.length} ${out === -1 ? 'CONFLICT base=' + base : 'ver=' + out}`);
        if (out === -1) return send(res, 409, { err: 'Character was saved from another session' });
        return send(res, 200, { ok: 1, ver: out });
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
  const blocked = new Map(); // uid -> until (kicked)
  const players = new Map(); // uid -> {ws,name,x,y,dir,eq,t,lastChat}
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16384 });
  server.on('upgrade', (req, sock, head) => {
    const u = new URL(req.url, 'http://x');
    sock.setNoDelay?.(true);
    const a = u.pathname === '/ws' ? readToken(u.searchParams.get('token')) : null;
    if (!a) { sock.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); return sock.destroy(); }
    if (maintBlocks(a.uid, a.name)) { sock.write('HTTP/1.1 503 Service Unavailable\r\n\r\n'); return sock.destroy(); }
    if ((blocked.get(a.uid) || 0) > Date.now()) { sock.write('HTTP/1.1 403 Forbidden\r\n\r\n'); return sock.destroy(); }
    wss.handleUpgrade(req, sock, head, ws => wss.emit('connection', ws, a, req));
  });
  let sim = null;
  if (process.env.NO_SIM !== '1') { try { const { createSim } = await import('./sim.js'); sim = createSim(); console.log('world sim ready', sim.info) } catch (e) { console.error('sim disabled:', e.message) } }
  const eld = monitorEventLoopDelay({ resolution: 10 }); eld.enable(); setInterval(() => eld.reset(), 10000).unref();
  const MAX_SPEED = 14; // tiles/s incl. sprint + slack; anything faster is snapped back
  const cleanItem = it => { try { if (!it || typeof it.id !== 'string' || it.id.length > 24) return null; const j = JSON.stringify(it); if (j.length > 500) return null; return JSON.parse(j) } catch { return null } };
  const ground = new Map(); let gid = 0; // shared dropped items
  const trades = new Map(); // uid -> session
  const sendTo = (uid, o) => { const q = players.get(uid); if (q && q.ws.readyState === 1) q.ws.send(JSON.stringify(o)) };
  const endTrade = (uid, why) => { const t = trades.get(uid); if (!t) return; trades.delete(t.a); trades.delete(t.b); const other = t.a === uid ? t.b : t.a; sendTo(other, { t: 'tx', why }) };

  /* ---------- v0.5: jail, parties, admin ---------- */
  const isAdm = p => ADM.has(String(p.name).toLowerCase());
  const J = (() => { try { if (sim) return JSON.parse(sim.run('JSON.stringify({x0:JAIL.x0,y0:JAIL.y0,x1:JAIL.x1,y1:JAIL.y1,gx:JAIL.gx})')) } catch {} return { x0: 159, y0: 154, x1: 166, y1: 160, gx: 162 } })();
  const DUNR = (() => { try { if (sim) return JSON.parse(sim.run('JSON.stringify(DUN)')) } catch {} return { x0: 10, y0: 8, w: 106, h: 40 } })();
  const jStart = { x: (J.x0 + J.x1) / 2 + .5, y: (J.y0 + J.y1) / 2 + .5 }, jExit = { x: J.gx + .5, y: J.y0 - 1.5 };
  const inYard = (x, y) => x >= J.x0 + .9 && x <= J.x1 + .1 && y >= J.y0 + .9 && y <= J.y1 + .1;
  const inDun = p => p.x >= DUNR.x0 - 2 && p.x <= DUNR.x0 + DUNR.w + 2 && p.y >= DUNR.y0 - 2 && p.y <= DUNR.y0 + DUNR.h + 2;
  const sysTo = (p, m, c) => { if (p && p.ws.readyState === 1) p.ws.send(JSON.stringify({ t: 'sys', m, c })) };
  const safeXY = (x, y) => { try { return !!sim && sim.run(`safeAt(${+x || 0},${+y || 0})`) } catch { return false } };
  const jailSave = async (uid, j) => { try { if (!j) { await db.query('DELETE FROM jails WHERE user_id=$1', [uid]); return } const u = await db.query('UPDATE jails SET left_n=$2,total=$3,reason=$4,by=$5 WHERE user_id=$1', [uid, j.left, j.total, j.reason, j.by]); if (!u.rowCount) await db.query('INSERT INTO jails(user_id,left_n,total,reason,by) VALUES($1,$2,$3,$4,$5)', [uid, j.left, j.total, j.reason, j.by]) } catch (e) { console.error('jail save:', e.message) } };
  const place = (p, x, y) => { p.x = x; p.y = y; p.wu = Date.now() + 3000; if (p.sp) { p.sp.x = x; p.sp.y = y } p.ws.send(JSON.stringify({ t: 'warp', x, y })) };
  const jailMsg = p => p.ws.send(JSON.stringify({ t: 'jl', left: p.jail.left, total: p.jail.total, reason: p.jail.reason }));
  const doJail = (q, n, reason, by) => { endTrade(q.uid, 'jailed'); q.jail = { left: Math.max(1, Math.min(500, n | 0)), total: Math.max(1, Math.min(500, n | 0)), reason: String(reason || 'crime').slice(0, 30), by: String(by || 'Guard').slice(0, 16) }; jailSave(q.uid, q.jail); leaveParty(q); place(q, jStart.x, jStart.y); jailMsg(q); broadcast({ t: 'sys', m: `🔒 ${q.name} was thrown in jail (${q.jail.reason})`, c: '#fc6' }) };
  const unjail = (q, why) => { if (!q.jail) return; q.jail = null; jailSave(q.uid, null); place(q, jExit.x, jExit.y); q.ws.send(JSON.stringify({ t: 'jr', why })); broadcast({ t: 'sys', m: `🔓 ${q.name} was released from jail`, c: '#9fe3ff' }) };
  const parties = new Map(), invites = new Map(); let pid = 0;
  const pmem = pt => [...pt.m].map(u => players.get(u)).filter(Boolean);
  const pstate = pt => { const o = JSON.stringify({ t: 'pys', id: pt.id, lead: pt.lead, m: pmem(pt).map(p => ({ id: p.uid, n: p.name })) }); for (const p of pmem(pt)) if (p.ws.readyState === 1) p.ws.send(o) };
  function leaveParty(p, why) { const pt = parties.get(p.party); if (!pt) return; pt.m.delete(p.uid); p.party = 0; if (p.ws.readyState === 1) p.ws.send(JSON.stringify({ t: 'pys', id: 0, why })); if (pt.m.size < 2) { for (const u of pt.m) { const q = players.get(u); if (q) { q.party = 0; sysTo(q, '👥 Party disbanded', '#9fe3ff'); if (q.ws.readyState === 1) q.ws.send(JSON.stringify({ t: 'pys', id: 0 })) } } parties.delete(pt.id) } else { if (pt.lead === p.uid) pt.lead = [...pt.m][0]; pstate(pt); for (const q of pmem(pt)) sysTo(q, `👥 ${p.name} left the party`, '#9fe3ff') } }
  const sameParty = (a, b) => a.party && a.party === b.party;
  const social = (me, m, now) => {
    const t = m.t;
    if (t === 'jd') { const j = me.jail; if (!j || now - (me.lastJd || 0) < 1000 || !inYard(me.x, me.y)) return true; me.lastJd = now; j.left--; if (j.left <= 0) unjail(me, 'served'); else { jailMsg(me); if (j.left % 3 === 0) jailSave(me.uid, j) } return true }
    if (t === 'pyi') { const q = players.get(m.to); if (!q || q === me || now - (me.lastPy || 0) < 1000) return true; me.lastPy = now; if (me.jail || q.jail) return sysTo(me, 'Not possible right now', '#f99'), true; if (q.party) return sysTo(me, `${q.name} is already in a party`, '#f99'), true; let pt = parties.get(me.party); if (pt && pt.lead !== me.uid) return sysTo(me, 'Only the party leader can invite', '#f99'), true; if (pt && pt.m.size >= 5) return sysTo(me, 'Party is full (5)', '#f99'), true; invites.set(q.uid, { from: me.uid, exp: now + 30000 }); sendTo(q.uid, { t: 'pyi', from: me.uid, n: me.name }); sysTo(me, `👥 Invited ${q.name}`, '#9fe3ff'); return true }
    if (t === 'pya') { const iv = invites.get(me.uid); invites.delete(me.uid); if (!iv || iv.exp < now || me.party || me.jail) return true; const h = players.get(iv.from); if (!h || h.ws.readyState !== 1) return true; let pt = parties.get(h.party); if (!pt) { pt = { id: ++pid, lead: h.uid, m: new Set([h.uid]) }; parties.set(pt.id, pt); h.party = pt.id } if (pt.m.size >= 5) return sysTo(me, 'Party is full', '#f99'), true; pt.m.add(me.uid); me.party = pt.id; pstate(pt); for (const q of pmem(pt)) sysTo(q, `👥 ${me.name} joined the party`, '#9fe3ff'); return true }
    if (t === 'pyd') { invites.delete(me.uid); return true }
    if (t === 'pyl') { leaveParty(me, 'left'); return true }
    if (t === 'pyk') { const pt = parties.get(me.party); if (!pt || pt.lead !== me.uid) return true; const q = players.get(m.to); if (!q || q === me || q.party !== me.party) return true; leaveParty(q, 'kicked'); sysTo(q, '👥 You were removed from the party', '#f99'); return true }
    if (t === 'pyc' && typeof m.m === 'string') { const pt = parties.get(me.party); if (!pt || now - (me.lastPc || 0) < 700) return true; me.lastPc = now; const o = JSON.stringify({ t: 'pyc', n: me.name, m: m.m.slice(0, 120) }); for (const q of pmem(pt)) if (q.ws.readyState === 1) q.ws.send(o); return true }
    if (t === 'pyw') { const q = players.get(m.to); if (!q || q === me || !sameParty(me, q)) return true; const w = 60000 - (now - (me.lastWarp || 0)); if (w > 0) return sysTo(me, `Warp ready in ${Math.ceil(w / 1000)}s`, '#f99'), true; if (me.jail || q.jail) return sysTo(me, 'Not possible while jailed', '#f99'), true; if (me.bd || q.bd || me.rs || q.rs) return sysTo(me, 'Leave the building first (both of you)', '#f99'), true; if (inDun(me) || inDun(q)) return sysTo(me, 'Cannot warp to or from the dungeon', '#f99'), true; if (now - (me.hurtT || 0) < 10000) return sysTo(me, 'Cannot warp while in combat', '#f99'), true; me.lastWarp = now; place(me, q.x + .6, q.y + .3); sysTo(me, `✨ Warped to ${q.name}`, '#b9f'); return true }
    if (t === 'adm') { if (!isAdm(me)) return true; const q = players.get(m.to);
      if (m.c === 'list') { me.ws.send(JSON.stringify({ t: 'adl', l: [...players.values()].map(p => ({ id: p.uid, n: p.name, ip: p.ip, x: Math.round(p.x), y: Math.round(p.y), j: p.jail ? p.jail.left : 0 })), mt: maint.on ? 1 : 0, mm: maint.msg })); return true }
      if (m.c === 'bc') { const txt = String(m.m || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 120); if (!txt || now - (me.lastBc || 0) < 2000) return true; me.lastBc = now; broadcast({ t: 'bc', m: txt, by: me.name }); alog(me.name, 'broadcast', '', txt); return true }
      if (m.c === 'maint') { maint.on = !!m.on; maint.msg = String(m.msg || '').slice(0, 60); if (maint.on) for (const p of players.values()) maint.allow.set(p.uid, now + 300000); db.query("INSERT INTO settings(k,v) VALUES('maint',$1) ON CONFLICT (k) DO UPDATE SET v=$1", [JSON.stringify({ on: maint.on, msg: maint.msg })]).catch(() => {}); alog(me.name, 'maintenance', maint.on ? 'on' : 'off', maint.msg); broadcast({ t: 'bc', m: maint.on ? 'Server entering maintenance mode' + (maint.msg ? ': ' + maint.msg : '') : 'Maintenance mode ended', by: me.name }); me.ws.send(JSON.stringify({ t: 'adm_ok', mt: maint.on ? 1 : 0, mm: maint.msg })); return true }
      if (!q || q === me) return true;
      alog(me.name, m.c, q.name, m.c === 'jail' ? `n=${m.n} ip=${q.ip}` : `ip=${q.ip}`);
      if (m.c === 'tp') { place(me, q.x + .6, q.y + .3); sysTo(me, `Teleported to ${q.name}`, '#b9f') }
      else if (m.c === 'bring') { if (q.jail) return sysTo(me, 'Target is jailed – unjail first', '#f99'), true; place(q, me.x + .6, me.y + .3); sysTo(q, 'You were summoned by an admin', '#b9f') }
      else if (m.c === 'kick') { blocked.set(q.uid, now + 10000); sendTo(q.uid, { t: 'kick' }); try { q.ws.close(4001, 'Kicked by admin') } catch {} sysTo(me, `Kicked ${q.name} (10s block)`, '#fc6'); broadcast({ t: 'sys', m: `${q.name} was kicked by an admin`, c: '#fc6' }) }
      else if (m.c === 'jail') doJail(q, Number.isFinite(+m.n) ? +m.n : 25, m.r || 'admin order', 'Admin');
      else if (m.c === 'unjail') unjail(q, 'admin');
      return true }
    return false };
  wss.on('connection', (ws, a, req) => {
    const old = players.get(a.uid); if (old) { try { old.ws.close(4000, 'Logged in elsewhere') } catch {} }
    const me = { ws, ip: req ? ip(req) : '', uid: a.uid, name: a.name, x: 0, y: 0, dir: 0, eq: 0, t: Date.now(), lastChat: 0, init: false };
    players.set(a.uid, me);
    me.sp = sim ? sim.add(a.uid, a.name) : null;
    ws.send(JSON.stringify({ t: 'hello', id: a.uid, adm: isAdm(me) ? 1 : 0, online: players.size, world: sim ? sim.world() : null, gnd: [...ground.values()].map(g => ({ id: g.id, x: g.x, y: g.y, it: g.it })) }));
    broadcast({ t: 'sys', m: `${a.name} entered the world` }, me);
    db.query('SELECT left_n,total,reason,by FROM jails WHERE user_id=$1', [a.uid]).then(r => { const j = r.rows[0]; if (j && players.get(a.uid) === me) { me.jail = { left: j.left_n, total: j.total, reason: j.reason, by: j.by }; place(me, jStart.x, jStart.y); jailMsg(me) } }).catch(() => {});
    ws.on('message', raw => {
      let m; try { m = JSON.parse(raw) } catch { return }
      const now = Date.now();
      if (social(me, m, now)) return;
      if (m.t === 'pos' && Number.isFinite(m.x) && Number.isFinite(m.y)) {
        if (me.init) {
          const dt = Math.max(.05, (now - me.t) / 1000), d = Math.hypot(m.x - me.x, m.y - me.y);
          const tpOk = m.tp && now - (me.lastTp || 0) > 3000; if (tpOk) me.lastTp = now;
          if (me.jail && !inYard(m.x, m.y)) { ws.send(JSON.stringify({ t: 'snap', x: jStart.x, y: jStart.y })); me.x = jStart.x; me.y = jStart.y; return }
          if (d > MAX_SPEED * dt + 3 && !tpOk && now > (me.wu || 0)) { ws.send(JSON.stringify({ t: 'snap', x: me.x, y: me.y })); return; }
        }
        if (Math.hypot(m.x - me.x, m.y - me.y) > .05) me.mvT = now; me.x = m.x; me.y = m.y; me.dir = m.dir | 0; me.eq = m.eq | 0; me.name = a.name; me.t = now; me.init = true; me.hp = m.hp | 0; me.ch = m.ch ? 1 : 0; me.bz = m.bz ? 1 : 0; me.ac = typeof m.ac === 'string' ? m.ac.slice(0, 8) : ''; me.bd = Number.isFinite(m.bd) ? m.bd | 0 : 0; me.rd = m.rd | 0; me.rm = m.rm ? 1 : 0; me.rs = m.rs ? 1 : 0; if (Number.isFinite(m.rx) && Number.isFinite(m.ry)) { if (Math.hypot(m.rx - (me.rx || 0), m.ry - (me.ry || 0)) > .5) me.mvT = now; me.rx = +m.rx.toFixed(1); me.ry = +m.ry.toFixed(1) } if (me.ac) me.mvT = now; { const l = m.lk || {}, cs = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : null, ci = v => Number.isInteger(v) && v >= -1 && v < 20 ? v : 0; me.lk = { w: typeof l.w === 'string' ? l.w.slice(0, 16) : null, tw: cs(l.tw), ta: cs(l.ta), a: ci(l.a), h: ci(l.h), b: ci(l.b) } } me.mh = m.mhp | 0; me.ti = typeof m.ti === 'string' ? m.ti.replace(/[^A-Za-z ]/g, '').slice(0, 24) : ''; me.f = m.f === 'red' || m.f === 'orange' || m.f === 'blue' ? m.f : null; me.col = String(m.col || '').slice(0, 9);
        const sp = me.sp; if (sp) { sp.x = m.x; sp.y = m.y; sp.dir = m.dir | 0; sp.hp = m.hp | 0; sp.mhp = m.mhp | 0 || sp.mhp; sp.dead = m.dead ? 1 : 0; sp.inside = m.inside || me.jail ? 1 : 0; sp.ready = true; if (m.xp && typeof m.xp === 'object') { const x = {}; for (const k in m.xp) if (Number.isFinite(m.xp[k])) x[k] = Math.min(1e8, m.xp[k]); sp.xp = x } }
      } else if (m.t === 'ping') { ws.send(JSON.stringify({ t: 'pong', c: m.c, ld: Math.max(0, Math.round((eld.mean / 1e6 - 10) * 10) / 10), q: ws.bufferedAmount }));
      } else if (m.t === 'hit' && sim && me.sp) { sim.hit(me.sp, m.id | 0, +m.d);
      } else if (m.t === 'fx' && sim && me.sp) { sim.fx(me.sp, m.id | 0, String(m.sp), +m.d);
      } else if (m.t === 'act') { me.mvT = now; // swing / spell visuals for others
        const o = JSON.stringify({ t: 'act', id: a.uid, k: String(m.k || '').slice(0, 12), x: +m.x || 0, y: +m.y || 0, dir: m.dir | 0, sp: String(m.sp || '').slice(0, 16), w: String(m.w || '').slice(0, 16) });
        for (const q of players.values()) if (q !== me && q.ws.readyState === 1 && Math.hypot(q.x - me.x, q.y - me.y) < 45) q.ws.send(o);
      } else if (m.t === 'pvp') { // melee hit on another player; relayed to victim for them to apply
        const q = players.get(m.to); if (!q || q === me || !q.init || q.ws.readyState !== 1 || q.bd || me.bd) return;
        if (now - (me.lastPvp || 0) < 150) return; me.lastPvp = now;
        if (me.jail || q.jail || sameParty(me, q)) return;
        if (Math.hypot(q.x - me.x, q.y - me.y) > 4) return;
        if (safeXY(me.x, me.y) || safeXY(q.x, q.y)) { if (q.f !== 'red' && now - (me.lastArrest || 0) > 3000) { me.lastArrest = now; broadcast({ t: 'sys', m: `🛡 Guards seize ${me.name} for attacking ${q.name} in town!`, c: '#fc6' }); doJail(me, 25, 'assault', 'Guard') } return }
        q.hurtT = now; me.hurtT = now;
        q.ws.send(JSON.stringify({ t: 'phit', from: a.uid, fn: a.name, d: Math.max(1, Math.min(+m.d || 1, 400)) }));
      } else if (m.t === 'pkill') { // victim reports death by player
        const k = players.get(m.by); if (k && k.ws.readyState === 1) { const sx = {}; if (m.sx && typeof m.sx === 'object') for (const kk in m.sx) if (Number.isFinite(+m.sx[kk])) sx[kk.slice(0, 16)] = Math.min(+m.sx[kk], 1e6); k.ws.send(JSON.stringify({ t: 'pk', who: a.uid, n: a.name, g: Math.max(0, Math.min(+m.g || 0, 1e7)), sx, b: Math.max(0, Math.min(+m.b || 0, 5000)), fl: m.fl ? 1 : 0, it: cleanItem(m.it) })) }
        broadcast({ t: 'sys', m: `${a.name} was slain by ${k ? k.name : 'a player'}` });
      } else if (m.t === 'gd') { // drop an item on the ground
        const it = cleanItem(m.it); if (!it || !Number.isFinite(m.x) || !Number.isFinite(m.y) || ground.size > 300 || now - (me.lastGd || 0) < 500) return; me.lastGd = now;
        const g = { id: ++gid, x: +m.x, y: +m.y, it, exp: now + 180000, by: me.uid, free: now + 10000 }; ground.set(g.id, g);
        broadcast({ t: 'gd', g: { id: g.id, x: g.x, y: g.y, it } });
      } else if (m.t === 'gt') { // pick one up
        const g = ground.get(m.id | 0); if (!g || Math.hypot(g.x - me.x, g.y - me.y) > 3.5 || (g.by === me.uid && now < g.free)) return; ground.delete(g.id);
        ws.send(JSON.stringify({ t: 'gt', it: g.it })); broadcast({ t: 'gx', id: g.id });
      } else if (m.t === 'tq') { // trade request
        const q = players.get(m.to); if (!q || q === me || trades.has(me.uid) || trades.has(q.uid) || now - (me.lastTq || 0) < 1500) return; me.lastTq = now;
        sendTo(q.uid, { t: 'tq', from: me.uid, n: a.name });
      } else if (m.t === 'ta') { // accept request
        const q = players.get(m.to); if (!q || trades.has(me.uid) || trades.has(q.uid)) return;
        const t = { a: q.uid, b: me.uid, o: { [q.uid]: { items: [], gold: 0 }, [me.uid]: { items: [], gold: 0 } }, ok: {} }; trades.set(q.uid, t); trades.set(me.uid, t);
        sendTo(q.uid, { t: 'ts', who: me.uid, n: a.name }); sendTo(me.uid, { t: 'ts', who: q.uid, n: q.name });
      } else if (m.t === 'tu') { // update my offer
        const t = trades.get(me.uid); if (!t || !Array.isArray(m.items) || m.items.length > 12) return;
        const items = m.items.map(cleanItem).filter(Boolean), gold = Math.max(0, Math.min(1e9, m.gold | 0)); t.o[me.uid] = { items, gold }; t.ok = {};
        sendTo(t.a === me.uid ? t.b : t.a, { t: 'tu', items, gold });
      } else if (m.t === 'tk') { // confirm
        const t = trades.get(me.uid); if (!t) return; t.ok[me.uid] = 1; const other = t.a === me.uid ? t.b : t.a; sendTo(other, { t: 'tk' });
        if (t.ok[t.a] && t.ok[t.b]) { trades.delete(t.a); trades.delete(t.b); sendTo(t.a, { t: 'td', items: t.o[t.b].items, gold: t.o[t.b].gold }); sendTo(t.b, { t: 'td', items: t.o[t.a].items, gold: t.o[t.a].gold }) }
      } else if (m.t === 'tx') { endTrade(me.uid, 'cancelled');
      } else if (m.t === 'chat' && typeof m.m === 'string') {
        if (now - me.lastChat < 1000) return; me.lastChat = now; me.chT = now; me.mvT = now;
        broadcast({ t: 'chat', id: a.uid, n: a.name, m: m.m.slice(0, 120) });
      }
    });
    ws.on('close', () => { if (players.get(a.uid) === me) { endTrade(a.uid, 'left'); if (me.jail) jailSave(a.uid, me.jail); leaveParty(me); invites.delete(a.uid); players.delete(a.uid); sim?.remove(a.uid); broadcast({ t: 'sys', m: `${a.name} left the world` }) } });
  });
  function broadcast(obj, except) { const s = JSON.stringify(obj); for (const p of players.values()) if (p !== except && p.ws.readyState === 1) p.ws.send(s) }
  const gsweep = setInterval(() => { const now = Date.now(); for (const g of ground.values()) if (now > g.exp) { ground.delete(g.id); broadcast({ t: 'gx', id: g.id }) } }, 5000);
  let ptk = 0;
  const tick = setInterval(() => {
    const all = [...players.values()].filter(p => p.init); const now0 = Date.now();
    for (const p of players.values()) {
      if (p.ws.readyState !== 1 || !p.init) continue;
      const near = all.filter(q => q !== p && Math.hypot(q.x - p.x, q.y - p.y) < 45).map(q => ({ id: q.uid, n: q.name, x: +q.x.toFixed(2), y: +q.y.toFixed(2), d: q.dir, e: q.eq, h: q.hp, c: q.ch, k: q.col, l: q.lk, a: q.ac, bd: q.bd, rx: q.rx, ry: q.ry, rd: q.rd, rm: q.rm, rs: q.rs, s: q.bz ? 2 : (now0 - (q.mvT || now0) > 30000 ? 1 : 0), mh: q.mh, f: q.f, ti: q.ti }));
      p.ws.send(JSON.stringify({ t: 'players', l: near, online: players.size }));
    }
    if (++ptk % 5 === 0) for (const pt of parties.values()) { const ms = pmem(pt), o = JSON.stringify({ t: 'pyh', h: ms.map(q => [q.uid, q.hp | 0, q.mh | 0, Math.round(q.x), Math.round(q.y)]) }); for (const q of ms) if (q.ws.readyState === 1) q.ws.send(o) }
  }, 200);

  function encU(u) { if (!u.length) return null; const b = Buffer.allocUnsafe(3 + u.length * 13); b[0] = 1; b.writeUInt16LE(u.length, 1); let o = 3; for (const e of u) { b.writeUInt32LE(e[0], o); b.writeUInt16LE(Math.max(0, Math.min(65535, Math.round(e[1] * 16))), o + 4); b.writeUInt16LE(Math.max(0, Math.min(65535, Math.round(e[2] * 16))), o + 6); b.writeInt8(Math.round(e[3] * 8), o + 8); b.writeInt8(Math.round(e[4] * 8), o + 9); b.writeUInt16LE(Math.max(0, Math.min(65535, e[5])), o + 10); b[o + 12] = e[6]; o += 13 } return b }
  let st = 0;
  const simTick = sim ? setInterval(() => { try {
    if (![...players.values()].some(p => p.sp?.ready)) return;
    sim.step(.05); st++;
    const dr = sim.drain();
    for (const h of dr.hits) { const q = players.get(h.to); if (q) q.hurtT = Date.now(); if (q?.ws.readyState === 1) q.ws.send(JSON.stringify({ t: 'hurt', d: h.d })) }
    for (const g of dr.glob) broadcast(g);
    for (const e of dr.evs) broadcast(e);
    const ks = dr.kills.length ? JSON.stringify({ t: 'kill', l: dr.kills }) : null;
    for (const q of players.values()) {
      if (q.ws.readyState !== 1 || !q.sp?.ready) continue;
      if (ks) q.ws.send(ks);
      { if (q.ws.bufferedAmount > 65536) { q.slow = (q.slow || 0) + 1; continue } const sn = sim.snapshot(q.sp); const ub = encU(sn.u); delete sn.u; if (sn.a.length || sn.r.length || st % 40 === 0 || q.lpt !== sn.pt[0]) { q.lpt = sn.pt[0]; q.ws.send(JSON.stringify(sn)) } if (ub) q.ws.send(ub) }
    }
  } catch (e) { if (Date.now() - (globalThis.__le || 0) > 5000) { globalThis.__le = Date.now(); console.error('SIM ERROR:', e && e.stack || e) } } }, 50) : null;
  await new Promise(r => server.listen(port, r));
  const close = async () => { clearInterval(tick); clearInterval(gsweep); if (simTick) clearInterval(simTick); wss.close(); for (const p of players.values()) try { p.ws.terminate() } catch {} await new Promise(r => server.close(r)); await db.end?.() };
  return { server, port: server.address().port, close, db };
}

process.on('uncaughtException', e => console.error('UNCAUGHT:', e && e.stack || e));
process.on('unhandledRejection', e => console.error('UNHANDLED:', e && e.stack || e));
if (import.meta.url === `file://${process.argv[1]}`) {
  const s = await createServer();
  console.log(`Dark Portals server v${VERSION} listening on :${s.port}`);
  const stop = async () => { console.log('shutting down'); await s.close(); process.exit(0) };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
