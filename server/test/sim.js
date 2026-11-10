import { createServer } from '../src/index.js';
import WebSocket from 'ws';
process.env.USE_PGMEM = '1'; process.env.SECRET = 'x';
const s = await createServer({ port: 0 }); const base = `http://localhost:${s.port}`;
const reg = async n => (await (await fetch(base + '/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: n, password: 'pass1234' }) })).json());
const mk = async n => { const j = await reg(n); const ws = new WebSocket(`ws://localhost:${s.port}/ws?token=${encodeURIComponent(j.token)}`); const st = { ws, msgs: [] }; ws.on('message', d => st.msgs.push(JSON.parse(d))); await new Promise(r => ws.on('open', r)); return st };
const A = await mk('alice'), B = await mk('bobby');
const pos = (c, x, y) => c.ws.send(JSON.stringify({ t: 'pos', x, y, dir: 0, hp: 50, mhp: 50, xp: {} }));
pos(A, 150.5, 160.5); pos(B, 151.5, 160.5);
await new Promise(r => setTimeout(r, 1500));
const hello = A.msgs.find(m => m.t === 'hello'); console.log('world pts', hello.world?.pts?.length);
const snapA = A.msgs.filter(m => m.t === 'm'), snapB = B.msgs.filter(m => m.t === 'm');
console.log('snaps', snapA.length, snapB.length, 'mobs seen', snapA[0].a.length);
const ids = new Set(snapA[0].a.map(x => x[0])); console.log('same mobs for B', snapB[0].a.filter(x => ids.has(x[0])).length > 0);
// ping
A.ws.send(JSON.stringify({ t: 'ping', c: 5 })); await new Promise(r => setTimeout(r, 200)); console.log('pong', A.msgs.some(m => m.t === 'pong' && m.c === 5));
// act relay
A.ws.send(JSON.stringify({ t: 'act', k: 'swing', dir: 2, x: 150, y: 160 })); await new Promise(r => setTimeout(r, 200)); console.log('B sees swing', B.msgs.some(m => m.t === 'act'));
// pvp
const idB = [...A.msgs.filter(m => m.t === 'players').pop().l][0]?.id; A.ws.send(JSON.stringify({ t: 'pvp', to: idB, d: 5 })); await new Promise(r => setTimeout(r, 200)); console.log('B phit', B.msgs.some(m => m.t === 'phit'));
// kill a mob
const mob = snapA[0].a.find(x => x[1] !== 'wizard' && x[1] !== 'wyrm' && Math.hypot(x[2] - 150.5, x[3] - 160.5) < 8);
if (mob) { A.ws.send(JSON.stringify({ t: 'hit', id: mob[0], d: 9999 })); await new Promise(r => setTimeout(r, 400)); console.log('kill msg', A.msgs.some(m => m.t === 'kill' && m.l.some(k => k.id === mob[0] && k.by === hello.id))) } else console.log('no mob near');
A.ws.close(); B.ws.close(); await s.close(); process.exit(0);
