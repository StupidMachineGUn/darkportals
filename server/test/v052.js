import { createServer } from '../src/index.js';
import WebSocket from 'ws';
process.env.IP_LIMIT = '0'; process.env.USE_PGMEM = '1'; process.env.SECRET = 'x'; process.env.ADMINS = 'boss';
const s = await createServer({ port: 0 }); const base = `http://localhost:${s.port}`;
const reg = async n => (await (await fetch(base + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: n, password: 'pass1234' }) })).json());
const mk = async n => { const j = await reg(n); const ws = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(j.token)}`); const st = { ws, msgs: [], n, tok: j.token }; ws.on('message', (d, bin) => { if (bin) return; st.msgs.push(JSON.parse(d)) }); await new Promise(r => ws.on('open', r)); st.id = await new Promise(r => { const t = setInterval(() => { const h = st.msgs.find(m => m.t === 'hello'); if (h) { clearInterval(t); r(h.id) } }, 20) }); return st };
const send = (c, o) => c.ws.send(JSON.stringify(o)); const wait = ms => new Promise(r => setTimeout(r, ms));
const has = (c, f) => c.msgs.some(f); const ok = (n, v) => { console.log(v ? 'ok  ' : 'FAIL', n); if (!v) process.exitCode = 1 };
const pos = (c, x, y, x2 = {}) => send(c, { t: 'pos', x, y, dir: 0, hp: 50, mhp: 50, xp: {}, ...x2 });
const save = async (c, ch, base) => (await fetch(base0 + '/api/save', { method: 'PUT', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + c.tok, ...(base === undefined ? {} : { 'x-base': String(base) }) }, body: JSON.stringify(ch) }));
const base0 = base;
const A = await mk('alice'), B = await mk('bobby');
const ch = (name, gold, inv, xp = { melee: 100 }) => ({ name, xp, inv, gold, bank: { gold: 0, items: [] } });
pos(A, 60.5, 60.5); pos(B, 61.5, 60.5); await wait(400);
// ---- thievery relay ----
send(A, { t: 'steal', to: B.id, k: 'pick', lv: 10 }); await wait(250);
const stl = B.msgs.find(m => m.t === 'stl'); ok('steal relayed to victim', stl && stl.k === 'pick' && stl.lv === 10);
send(B, { t: 'stlr', to: A.id, k: 'pick', ok: 1, g: 12, fn: 'bobby' }); await wait(250);
const str = A.msgs.find(m => m.t === 'str'); ok('steal result to thief', str && str.ok === 1 && str.g === 12);
send(B, { t: 'stlr', to: A.id, k: 'pick', ok: 1, g: 999 }); await wait(200); ok('unsolicited reply ignored', A.msgs.filter(m => m.t === 'str').length === 1);
// ---- houses ----
send(A, { t: 'hrq', id: 3, m: 10 }); await wait(250); ok('rent ok', A.msgs.some(m => m.t === 'hrr' && m.ok === 1 && m.id === 3));
send(B, { t: 'hrq', id: 3, m: 10 }); await wait(250); ok('house owned by one player', B.msgs.some(m => m.t === 'hrr' && m.ok === 0 && m.why === 'taken'));
ok('rent table broadcast', B.msgs.some(m => m.t === 'hs' && m.l.some(r => r[0] === 3)));
send(A, { t: 'hrq', id: 4, m: 10 }); await wait(250); ok('only one house per player', A.msgs.some(m => m.t === 'hrr' && m.ok === 0 && m.why === 'other'));
// ---- save inspection / registry ----
let r = await save(A, ch('alice', 100, [{ id: 'sword', n: 1, u: 'U1' }]), 0); ok('save ok', r.status === 200);
r = await save(B, ch('bobby', 100, [{ id: 'sword', n: 1, u: 'U1' }]), 0); ok('dupe item accepted in log mode (flagged)', r.status === 200);
r = await save(A, ch('alice', 999999, [{ id: 'sword', n: 1, u: 'U1' }]), 1); ok('gold jump logged not blocked', r.status === 200);
// ---- real auction ----
send(A, { t: 'ac', it: { id: 'sword', n: 1, u: 'UA' }, price: 50, buy: 120, mins: 10 }); await wait(300);
ok('auction created', A.msgs.some(m => m.t === 'ao' && m.op === 'ac' && m.ok === 1));
send(B, { t: 'aq' }); await wait(200); const al = B.msgs.filter(m => m.t === 'al').pop(); ok('listing visible', al && al.l.length === 1 && al.l[0].nb === 50 && al.l[0].sn === 'alice');
const aid = al.l[0].id;
send(A, { t: 'ab', id: aid, amt: 60 }); await wait(500); ok('cannot bid own', A.msgs.some(m => m.t === 'ao' && m.op === 'ab' && m.ok === 0));
send(B, { t: 'ab', id: aid, amt: 50 }); await wait(500); ok('bid ok', B.msgs.some(m => m.t === 'ao' && m.op === 'ab' && m.ok === 1));
send(A, { t: 'acan', id: aid }); await wait(500); ok('cannot cancel with bid', A.msgs.some(m => m.t === 'ao' && m.op === 'acan' && m.ok === 0));
const C = await mk('carol'); pos(C, 62.5, 60.5); await wait(300);
send(C, { t: 'ab', id: aid, amt: 51 }); await wait(500); ok('low bid rejected', C.msgs.some(m => m.t === 'ao' && m.ok === 0 && m.why === 'Bid too low'));
send(C, { t: 'ab', id: aid, amt: 53 }); await wait(500);
send(C, { t: 'abuy', id: aid }); await wait(600);
ok('buy-now ok', C.msgs.some(m => m.t === 'ao' && m.op === 'abuy' && m.ok === 1));
ok('outbid user notified', B.msgs.some(m => m.t === 'mn' && m.n > 0));
send(B, { t: 'mc' }); await wait(300); const mb = B.msgs.filter(m => m.t === 'mb').pop();
ok('outbid refund mail (gold)', mb && mb.l.some(x => x.kind === 'outbid' && x.gold > 0));
send(B, { t: 'mc' }); await wait(300); ok('mail claimed once', B.msgs.filter(m => m.t === 'mb').pop().l.length === 0);
send(C, { t: 'mc' }); await wait(300); ok('winner gets item', C.msgs.filter(m => m.t === 'mb').pop().l.some(x => x.kind === 'won' && x.item && x.item.u === 'UA'));
send(A, { t: 'mc' }); await wait(300); const ma = A.msgs.filter(m => m.t === 'mb').pop();
ok('seller paid minus 5%', ma.l.some(x => x.kind === 'sold' && x.gold === Math.round(120 * .95)));
// cancel path
send(A, { t: 'ac', it: { id: 'log', n: 5 }, price: 5, buy: 0, mins: 10 }); await wait(500);
send(A, { t: 'aq' }); await wait(200); const al2 = A.msgs.filter(m => m.t === 'al').pop(); ok('stack listed', al2.l.length === 1);
send(A, { t: 'acan', id: al2.l[0].id }); await wait(500); send(A, { t: 'mc' }); await wait(300);
ok('cancel returns item by mail', A.msgs.filter(m => m.t === 'mb').pop().l.some(x => x.kind === 'return' && x.item.n === 5));
for (const c of [A, B, C]) try { c.ws.close() } catch {}
await s.close(); process.exit(process.exitCode || 0);
