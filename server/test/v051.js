process.env.USE_PGMEM = '1'; process.env.JWT_SECRET = 'test'; process.env.ADMINS = 'boss'; process.env.IP_ALLOW = '9.9.9.9';
import WebSocket from 'ws';
const { createServer } = await import('../src/index.js');
const s = await createServer({ port: 0 }); const base = `http://localhost:${s.port}`;
const J = (p, o = {}, tok) => fetch(base + p, { ...o, headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}), ...(o.headers || {}) }, body: o.body && JSON.stringify(o.body) }).then(async r => ({ s: r.status, j: await r.json().catch(() => ({})) }));
const wait = ms => new Promise(r => setTimeout(r, ms)); let bad = 0; const ok = (n, v) => { console.log(v ? 'ok  ' : 'FAIL', n); if (!v) bad = 1 };
const ch = (xp = 1) => ({ name: 'Hero', xp: { melee: xp }, inv: [] });
// one account per IP (X-Forwarded-For used)
const reg = (n, ip) => J('/api/register', { method: 'POST', body: { username: n, password: 'secret12' }, headers: { 'x-forwarded-for': ip } });
let r = await reg('anna1', '1.1.1.1'); ok('first account ok', r.s === 200);
const aTok = r.j.token;
r = await reg('anna2', '1.1.1.1'); ok('second account same IP refused', r.s === 403 && /already has an account/.test(r.j.err));
r = await reg('anna3', '2.2.2.2'); ok('other IP ok', r.s === 200);
r = await reg('fam1', '9.9.9.9'); const r2 = await reg('fam2', '9.9.9.9'); ok('IP_ALLOW exempt', r.s === 200 && r2.s === 200);
// versioned save
r = await J('/api/save', { method: 'PUT', body: ch(1), headers: { 'x-base': '0' } }, aTok); ok('first save ok ver 1', r.s === 200 && r.j.ver === 1);
r = await J('/api/save', { method: 'PUT', body: ch(2), headers: { 'x-base': '1' } }, aTok); ok('next save ver 2', r.s === 200 && r.j.ver === 2);
r = await J('/api/save', { method: 'PUT', body: ch(99), headers: { 'x-base': '1' } }, aTok); ok('stale save refused 409', r.s === 409);
r = await J('/api/login', { method: 'POST', body: { username: 'anna1', password: 'secret12' } }); ok('login returns ver 2 + newest data', r.j.character.ver === 2 && r.j.character.data.xp.melee === 2);
r = await J('/api/save', { method: 'PUT', body: ch(3) }, aTok); ok('legacy save without header still works', r.s === 200 && r.j.ver === 3);
// admin features
process.env.IP_LIMIT = '0';
const mk = async (n, ip) => { const x = await J('/api/register', { method: 'POST', body: { username: n, password: 'secret12' }, headers: { 'x-forwarded-for': ip } }); const ws = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(x.j.token)}`, { headers: { 'x-forwarded-for': ip } }); const st = { ws, msgs: [], tok: x.j.token, n }; ws.on('message', (d, b) => { if (!b) st.msgs.push(JSON.parse(d)) }); await new Promise(res => ws.on('open', res)); return st };
const boss = await mk('boss', '9.9.9.9'), pl = await mk('player1', '9.9.9.9');
await wait(300); const send = (c, o) => c.ws.send(JSON.stringify(o)); const has = (c, f) => c.msgs.some(f);
send(boss, { t: 'adm', c: 'list' }); await wait(200); const L = boss.msgs.find(m => m.t === 'adl'); ok('admin list shows IPs', L && L.l.some(p => p.n === 'player1' && p.ip === '9.9.9.9'));
send(pl, { t: 'adm', c: 'bc', m: 'hack' }); await wait(150); ok('non-admin cannot broadcast', !has(boss, m => m.t === 'bc'));
send(boss, { t: 'adm', c: 'bc', m: 'Server restarts in 5 minutes' }); await wait(200); ok('broadcast reaches everyone', has(pl, m => m.t === 'bc' && /restarts/.test(m.m)));
// maintenance
send(boss, { t: 'adm', c: 'maint', on: true, msg: 'Back soon' }); await wait(250);
r = await J('/api/ping'); ok('ping shows maintenance', r.j.maint === true && r.j.mmsg === 'Back soon');
const late = await J('/api/register', { method: 'POST', body: { username: 'latecomer', password: 'secret12' } }); ok('new sign-ups refused in maintenance', late.s === 503);
r = await J('/api/login', { method: 'POST', body: { username: 'anna3', password: 'secret12' } }); ok('normal login refused in maintenance', r.s === 503);
r = await J('/api/login', { method: 'POST', body: { username: 'boss', password: 'secret12' } }); ok('admin login allowed', r.s === 200);
pl.ws.close(); await wait(200);
const back = await new Promise(res => { const w = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(pl.tok)}`); w.on('open', () => { res('open'); w.close() }); w.on('unexpected-response', () => res('refused')); w.on('error', () => res('refused')) }); ok('current players may reconnect', back === 'open');
send(boss, { t: 'adm', c: 'maint', on: false }); await wait(250); r = await J('/api/ping'); ok('maintenance off', r.j.maint === false);
// kick: 10 seconds
const victim = await mk('victim1', '5.5.5.5'); await wait(200);
send(boss, { t: 'adm', c: 'list' }); await wait(200); const vid = boss.msgs.filter(m => m.t === 'adl').pop().l.find(p => p.n === 'victim1').id;
send(boss, { t: 'adm', c: 'kick', to: vid }); await wait(300); ok('kicked player told', has(victim, m => m.t === 'kick'));
const tryJoin = () => new Promise(res => { const w = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(victim.tok)}`); w.on('open', () => { res('open'); w.close() }); w.on('unexpected-response', () => res('refused')); w.on('error', () => res('refused')) });
ok('blocked right after kick', (await tryJoin()) === 'refused');
await wait(10200); ok('allowed again after 10s', (await tryJoin()) === 'open');
for (const c of [boss]) try { c.ws.close() } catch {}
await s.close(); process.exit(bad);
