process.env.IP_LIMIT = '0'; process.env.USE_PGMEM = '1'; process.env.JWT_SECRET = 'test'; process.env.GROUND_TTL_MS = '1500';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const { createServer } = await import('../src/index.js');
const s = await createServer({ port: 0 }); const base = `http://127.0.0.1:${s.port}`;
const j = async (m, p, b) => { const r = await fetch(base + p, { method: m, headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); return { s: r.status, b: await r.json() } };
const A = (await j('POST', '/api/register', { username: 'Alice', password: 'secret1' })).b, B = (await j('POST', '/api/register', { username: 'Bobby', password: 'secret2' })).b;
const open = tok => new Promise((res, rej) => { const w = new WebSocket(`ws://127.0.0.1:${s.port}/ws?token=${tok}`); const msgs = []; w.on('message', (d, bin) => { if (!bin) msgs.push(JSON.parse(d)) }); w.on('open', () => res({ w, msgs })); w.on('error', rej) });
const a = await open(A.token), b = await open(B.token);
a.w.send(JSON.stringify({ t: 'pos', x: 150, y: 150, dir: 0, eq: 0 })); b.w.send(JSON.stringify({ t: 'pos', x: 151, y: 150, dir: 0, eq: 0 }));
await new Promise(r => setTimeout(r, 400));
// PvP: Bobby killed by Alice; item must NOT be handed over, but dropped on the floor
b.w.send(JSON.stringify({ t: 'pkill', by: A.token ? JSON.parse(Buffer.from(A.token.split('.')[0], 'base64url')).uid : 0, g: 5, sx: {}, b: 0, it: { id: 'bread', n: 1 } }));
b.w.send(JSON.stringify({ t: 'gd', its: [{ id: 'bread', n: 1 }], x: 151, y: 150, dth: 1 }));
await new Promise(r => setTimeout(r, 500));
const pk = a.msgs.find(m => m.t === 'pk'); assert.ok(pk && !pk.it, 'killer gets no item'); console.log('ok   pvp item not transferred');
const gd = a.msgs.find(m => m.t === 'gd'); assert.ok(gd && gd.g.dth === 1 && gd.g.ttl === 1500, 'floor drop broadcast'); console.log('ok   death drop on floor');
// multi-item mob loot drop
a.w.send(JSON.stringify({ t: 'gd', its: [{ id: 'bread', n: 2 }, { id: 'bread', n: 3 }], x: 150, y: 151, mob: 1 }));
await new Promise(r => setTimeout(r, 500)); assert.equal(a.msgs.filter(m => m.t === 'gd').length, 3); console.log('ok   multi-item loot');
// too far from player is refused
a.w.send(JSON.stringify({ t: 'gd', its: [{ id: 'bread', n: 1 }], x: 10, y: 10, mob: 1 })); await new Promise(r => setTimeout(r, 500)); assert.equal(a.msgs.filter(m => m.t === 'gd').length, 3); console.log('ok   far drop refused');
// timer: items disappear (sweep runs every 5s)
await new Promise(r => setTimeout(r, 6500)); assert.ok(a.msgs.filter(m => m.t === 'gx').length >= 3, 'expired'); console.log('ok   ground timer expiry');
console.log('v059 done'); process.exit(0);
