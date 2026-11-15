process.env.IP_LIMIT = '0'; process.env.USE_PGMEM = '1'; process.env.JWT_SECRET = 'test'; process.env.SAVES_PER_MIN = '200'; process.env.API_PER_MIN = '1000';
import assert from 'node:assert/strict';
const { createServer } = await import('../src/index.js');
const s = await createServer({ port: 0 }); const base = `http://127.0.0.1:${s.port}`;
const j = async (m, p, b, tok, base_) => { const r = await fetch(base + p, { method: m, headers: { 'content-type': 'application/json', ...(tok ? { authorization: 'Bearer ' + tok } : {}), ...(base_ !== undefined ? { 'x-base': String(base_) } : {}) }, body: b ? JSON.stringify(b) : undefined }); return { s: r.status, b: await r.json() } };
const u = (await j('POST', '/api/register', { username: 'Cheater', password: 'secret1' })).b;
const XP = { melee: 100, defense: 0, magic: 0, agility: 0, vitality: 0, woodcut: 0, mining: 0, fishing: 0, cooking: 0, crafting: 0, thief: 0 };
const mk = o => ({ name: 'Cheater', xp: { ...XP }, inv: [{ id: 'bread', n: 3 }, { id: 'sword0', n: 1, u: 'a1' }], gold: 100, bank: { gold: 0, items: [] }, eq: { w: 'a1' }, ...o });
let ver = (await j('PUT', '/api/save', mk({}), u.token)).b.ver;
let r = await j('PUT', '/api/save', mk({ xp: { ...XP, melee: 9999999, mining: 5e6 }, gold: 99999999, inv: [{ id: 'sword0', n: 1, u: 'a1' }, { id: 'godsword', n: 1, u: 'zz' }, { id: 'gem', n: 99999 }], dev: true, devBak: { ...XP, melee: 100 } }), u.token, ver);
assert.equal(r.s, 200); assert.ok(r.b.fix, 'fix returned'); ver = r.b.ver;
assert.ok(r.b.fix.xp.melee < 10000 && r.b.fix.xp.mining < 10000, 'xp clamped ' + JSON.stringify(r.b.fix.xp)); console.log('ok   xp clamped', r.b.fix.xp.melee);
assert.ok(r.b.fix.gold < 10000, 'gold clamped ' + r.b.fix.gold); console.log('ok   gold clamped', r.b.fix.gold);
assert.ok(!r.b.fix.inv.some(i => i.id === 'godsword'), 'unknown item stripped'); console.log('ok   forged item stripped');
assert.ok(r.b.fix.inv.find(i => i.id === 'gem').n <= 300, 'stack clamped'); console.log('ok   stack clamped');
assert.equal(r.b.fix.dev, false); console.log('ok   dev mode stripped for non-admin');
// without dev: pure xp inflation is rate-limited, and repeating it does not get a fresh burst
let x1 = await j('PUT', '/api/save', mk({ xp: { ...XP, melee: 5e6 }, gold: 101 }), u.token, ver); ver = x1.b.ver; const m1 = x1.b.fix.xp.melee; assert.ok(m1 <= 3200, 'xp pool ' + m1);
let x2 = await j('PUT', '/api/save', mk({ xp: { ...XP, melee: 5e6 }, gold: 101 }), u.token, ver); ver = x2.b.ver; assert.ok(x2.b.fix.xp.melee - m1 < 100, 'no second burst ' + (x2.b.fix.xp.melee - m1)); console.log('ok   xp token bucket', m1, x2.b.fix.xp.melee);
// legit: sell a sword (gold up by its value) and a modest xp gain pass untouched
const v2 = (await j('POST', '/api/register', { username: 'Honest', password: 'secret1' })).b; let vv = (await j('PUT', '/api/save', mk({ name: 'Honest' }), v2.token)).b.ver;
const ok = await j('PUT', '/api/save', mk({ name: 'Honest', xp: { ...XP, melee: 140 }, inv: [{ id: 'gem', n: 2 }], gold: 100 + 1 + 1 }), v2.token, vv); // sold a sword (+bread gone) for a little gold, gained 40 xp
assert.equal(ok.s, 200); assert.ok(!ok.b.fix, 'legit save untouched ' + JSON.stringify(ok.b.fix && ok.b.fix.gold)); console.log('ok   legit save untouched');
const h = await fetch(base + '/api/ping'); assert.ok(h.headers.get('strict-transport-security')); console.log('ok   HSTS header');
console.log('v060 done'); process.exit(0);
