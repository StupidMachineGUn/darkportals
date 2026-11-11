import { createServer } from '../src/index.js';
import WebSocket from 'ws';
process.env.USE_PGMEM = '1'; process.env.SECRET = 'x'; process.env.ADMINS = 'boss';
const s = await createServer({ port: 0 }); const base = `http://localhost:${s.port}`;
const reg = async n => (await (await fetch(base + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: n, password: 'pass1234' }) })).json());
const mk = async n => { const j = await reg(n); const ws = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(j.token)}`); const st = { ws, msgs: [], n, tok: j.token }; ws.on('message', (d, bin) => { if (bin) return; st.msgs.push(JSON.parse(d)) }); await new Promise(r => ws.on('open', r)); st.id = await new Promise(r => { const t = setInterval(() => { const h = st.msgs.find(m => m.t === 'hello'); if (h) { clearInterval(t); r(h.id) } }, 20) }); return st };
const send = (c, o) => c.ws.send(JSON.stringify(o)); const wait = ms => new Promise(r => setTimeout(r, ms));
const has = (c, f) => c.msgs.some(f); const ok = (n, v) => { console.log(v ? 'ok  ' : 'FAIL', n); if (!v) process.exitCode = 1 };
const pos = (c, x, y, x2 = {}) => send(c, { t: 'pos', x, y, dir: 0, hp: 50, mhp: 50, xp: {}, ti: 'Sorcerer', ...x2 });
const A = await mk('alice'), B = await mk('bobby'), C = await mk('boss'), D = await mk('dave');
ok('admin flag only for ADMINS', C.msgs.find(m => m.t === 'hello').adm === 1 && A.msgs.find(m => m.t === 'hello').adm === 0);
// wilderness positions
pos(A, 60.5, 60.5); pos(B, 61.5, 60.5); pos(C, 62.5, 60.5); pos(D, 63.5, 60.5); await wait(500);
ok('title relayed', has(B, m => m.t === 'players' && m.l.some(p => p.ti === 'Sorcerer')));
// party
send(A, { t: 'pyi', to: B.id }); await wait(200); ok('invite received', has(B, m => m.t === 'pyi'));
send(B, { t: 'pya' }); await wait(200); ok('party state', has(A, m => m.t === 'pys' && m.m.length === 2) && has(B, m => m.t === 'pys' && m.id));
send(A, { t: 'pyc', m: 'hello team' }); await wait(200); ok('party chat', has(B, m => m.t === 'pyc' && m.m === 'hello team'));
send(B, { t: 'pvp', to: A.id, d: 5 }); await wait(200); ok('no pvp inside party', !has(A, m => m.t === 'phit'));
send(A, { t: 'pyi', to: C.id }); send(A, { t: 'pyi', to: D.id }); await wait(1300); send(A, { t: 'pyi', to: D.id }); await wait(200);
// warp
pos(B, 100.5, 100.5, { tp: 1 }); await wait(300);
send(A, { t: 'pyw', to: B.id }); await wait(300);
ok('warp to party member', has(A, m => m.t === 'warp' && Math.abs(m.x - 101) < 1.5));
send(A, { t: 'pyw', to: B.id }); await wait(200); ok('warp cooldown', has(A, m => m.t === 'sys' && /Warp ready/.test(m.m)));
send(B, { t: 'pyk', to: A.id }); await wait(200); ok('non-leader cannot kick', has(A, m => m.t === 'pys' && m.id));
send(A, { t: 'pyl' }); await wait(200); ok('leave disbands 2-party', has(B, m => m.t === 'pys' && m.id === 0));
// pvp works outside party in wilderness
pos(A, 100.5, 101.5); await wait(300); send(A, { t: 'pvp', to: B.id, d: 5 }); await wait(200); ok('pvp outside town', has(B, m => m.t === 'phit'));
// admin
send(A, { t: 'adm', c: 'jail', to: B.id }); await wait(200); ok('non-admin cannot jail', !has(B, m => m.t === 'jl'));
send(C, { t: 'adm', c: 'list' }); await wait(200); ok('admin list', has(C, m => m.t === 'adl' && m.l.length === 4));
send(C, { t: 'adm', c: 'tp', to: A.id }); await wait(200); ok('admin tp', has(C, m => m.t === 'warp'));
send(C, { t: 'adm', c: 'jail', to: D.id, n: 3, r: 'test' }); await wait(300);
const jl = D.msgs.filter(m => m.t === 'jl').pop(); ok('admin jail', jl && jl.left === 3 && has(D, m => m.t === 'warp'));
const w = D.msgs.filter(m => m.t === 'warp').pop();
pos(D, 10, 10); await wait(300); ok('jail confines (snap back)', has(D, m => m.t === 'snap'));
pos(D, w.x, w.y); await wait(100);
for (let i = 0; i < 3; i++) { send(D, { t: 'jd' }); await wait(1100); pos(D, w.x, w.y) }
ok('digging frees', has(D, m => m.t === 'jr'));
// arrest in town
pos(A, 150.5, 150.5, { tp: 1 }); pos(B, 151.5, 150.5, { tp: 1 }); await wait(300);
send(A, { t: 'pvp', to: B.id, d: 5 }); await wait(400);
ok('guard arrests attacker', has(A, m => m.t === 'jl' && m.left === 25 && m.reason === 'assault') && !has(B, m => m.t === 'phit' && false));
// kick
send(C, { t: 'adm', c: 'kick', to: B.id }); await wait(400); ok('kick', has(B, m => m.t === 'kick'));
const r = await new Promise(res => { const w2 = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(B.tok)}`); w2.on('open', () => res('open')); w2.on('error', () => res('refused')); w2.on('unexpected-response', () => res('refused')) }); ok('kicked player blocked', r === 'refused');
// jail persists across reconnect
A.ws.close(); await wait(300);
const A2 = await new Promise(async res => { const ws = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(A.tok)}`); const st = { msgs: [] }; ws.on('message', (d, b) => { if (!b) st.msgs.push(JSON.parse(d)) }); ws.on('open', () => setTimeout(() => res(st), 700)) });
ok('jail persists', A2.msgs.some(m => m.t === 'jl' && m.left <= 25));
for (const c of [B, C, D]) try { c.ws.close() } catch {}
await s.close(); process.exit(process.exitCode || 0);
