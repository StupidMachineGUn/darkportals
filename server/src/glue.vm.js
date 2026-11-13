/* Runs INSIDE the game vm context, after the client files are loaded. Server-authoritative world. */
var SRV = { players: new Map(), idx: new Map(), hits: [], kills: [], glob: [], evs: [], EID: 0, roosterT: 90, wizIn: new Set(), tick: 0 };
muted = true;
P = { x: CX, y: CY, hp: 20, dead: 0, xp: {}, name: 'srv', flag: null, inside: 0, bossDmg: 0 };
const _mk = mkEnemy; mkEnemy = function (t, x, y) { const e = _mk(t, x, y); e.id = ++SRV.EID; return e };
gainXp = function () {}; toast = function () {}; fl = function () {}; burst = function () {};
chat = function (html) { SRV.glob.push({ t: 'sys', m: String(html).replace(/<[^>]*>/g, '') }) };
bigMsg = function (t, c) { SRV.glob.push({ t: 'big', m: t, c }) };
const RESP = e => e.temp ? 1e9 : e.t === 'wizard' ? 1e9 : e.dun ? ri(240, 360) : (e.t === 'wyrm' || e.t === 'rooster') ? 1e9 : ri(45, 70) * (e.el ? 4 : 1);
killEnemy = function (e) {
  if (e.dead) return;
  e.dead = clock + RESP(e);
  SRV.kills.push({ id: e.id, by: e.last || 0 });
  if (e.t === 'wizard') closePortals();
  if (e === boss) boss = null;
};
hurtEnemy = function (e, d, src) {
  if (e.dead) return;
  if (e.t === 'chicken' || e.t === 'sheep') e.flee = 5;
  e.hp -= d; e.flash = .18; e.st = 1;
  if (e.hp <= 0) killEnemy(e);
};
playerHit = function (d, by) { const p = CUR; if (p && !p.dead) SRV.hits.push({ to: p.id, d: Math.max(1, Math.round(d)) }) };
var CUR = null;
portalTick = function (dt) {
  if (!PT.open) { if (clock >= PT.reopen) reopenPortals(); return }
  const pls = [...SRV.players.values()].filter(q => q.ready);
  for (const p of PTS) {
    p.t -= dt; if (p.t > 0) continue; p.t = rnd(7, 11);
    if (!pls.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 70)) continue;
    let live = 0; for (const e of E) if (e.pt === p.id && !e.dead) live++; if (live >= 6) continue;
    const d = Math.hypot(p.x - CX, p.y - CY), t = pickMob(d, map[idx(p.x, p.y + 1)]);
    if (!t || !ESPEC[t] || ESPEC[t].pass) continue;
    const x = p.x + .5 + rnd(-1.5, 1.5), y = p.y + 1.6 + rnd(0, 1.5);
    if (solid[idx(Math.floor(x), Math.floor(y))]) continue;
    const m = mkEnemy(t, x, y); m.pt = p.id; m.temp = 1; E.push(m);
  }
  ptClean += dt; if (ptClean > 30) { ptClean = 0; E = E.filter(e => !(e.pt != null && e.dead > clock + 1e8)) }
};
SRV.init = function () {
  for (const t in ESPEC) if (ESPEC[t].spd < 3 && !['wyrm', 'wizard', 'rooster'].includes(t)) ESPEC[t].spd = +(ESPEC[t].spd * .5).toFixed(2);
  genWorld(); carveDungeon(); spawnEnemies(); spawnVillageMobs(); makeElites(); spawnChickens(); spawnSheep(); spawnDungeon(); spawnPortals();
  { let k = 0; E = E.filter(e => { if (e.dun || e.el || e.t === 'wizard' || e.t === 'wyrm' || e.t === 'rooster' || e.t === 'chicken' || e.t === 'sheep') return true; return (k++ & 1) === 0 }) }
  for (const e of E) if (e.t === 'wizard') { e.hx = e.x; e.hy = e.y }
  return { mobs: E.length, portals: PTS.length };
};
SRV.world = () => ({ pts: PTS.map(p => [p.x, p.y]) });
SRV.add = (id, name) => { const p = { id, name, x: CX, y: CY, dir: 0, hp: 20, mhp: 20, dead: 0, xp: {}, inside: 0, flag: null, fT: 0, ready: false, known: new Set(), seenP: new Map(), eq: 0, wid: 'sword0', col: '#8fd', ch: 0, tok: 14, xpv: 0 }; SRV.players.set(id, p); return p };
SRV.remove = id => { SRV.players.delete(id) };
SRV.cap = p => { let tl = 0; for (const s of SK) tl += lvOf(p.xp[s[0]] || 0); return 120 + tl * 12 };
SRV.hit = function (p, id, d) {
  const e = SRV.idx.get(id); if (!e || e.dead || !(d > 0) || !p.ready || p.dead) return;
  { const l = p.last && p.last.get(id); if (l) l.hp = -1 } // force HP resync so a rejected hit can't leave the client's predicted HP wrong
  d = Math.min(d, SRV.cap(p)); if (Math.hypot(e.x - p.x, e.y - p.y) > 9.5) return;
  if (!ESPEC[e.t].pass && safeAt(p.x, p.y)) return;
  e.last = p.id; hurtEnemy(e, Math.round(d));
};
SRV.fx = function (p, id, sp, d) { const e = SRV.idx.get(id); if (!e || e.dead || !SPELLS[sp]) return; if (Math.hypot(e.x - p.x, e.y - p.y) > 9.5) return; applyFx(e, SPELLS[sp], Math.min(+d || 1, SRV.cap(p))) };
SRV.step = function (dt) {
  clock += dt; SRV.tick++;
  SRV.idx.clear(); for (const e of E) SRV.idx.set(e.id, e);
  const pls = [...SRV.players.values()].filter(p => p.ready);
  SRV.roosterT -= dt; if (SRV.roosterT <= 0) { SRV.roosterT = rnd(300, 540); CUR = null; spawnRooster() }
  bossTimer -= dt; if (!boss && bossTimer <= 0) { bossTimer = 300; spawnBoss() }
  if (boss && clock - boss.born > 360) { E.splice(E.indexOf(boss), 1); boss = null; sys('The Ember Wyrm retreated into the mountains.', '#f99') }
  portalTick(dt);
  for (const e of E) if (e.dead && e.dead < 1e8 && clock > e.dead && e.t !== 'wyrm' && e.t !== 'rooster' && !pls.some(p => Math.hypot(e.hx - p.x, e.hy - p.y) < 6)) { e.dead = 0; e.hp = e.mhp; e.x = e.hx; e.y = e.hy; e.st = 0 }
  const live = pls.filter(p => !p.dead && !p.inside), groups = new Map();
  for (const e of E) { if (e.dead) continue; let b = null, bd = 45; for (const p of live) { const d = Math.max(Math.abs(p.x - e.x), Math.abs(p.y - e.y)); if (d < bd) { bd = d; b = p } } if (b) { if (!groups.has(b)) groups.set(b, []); groups.get(b).push(e) } }
  const master = E;
  for (const e of E) { e.px = e.x; e.py = e.y; e.sv = e.sv || [0, 0]; e.sv[0] *= .5; e.sv[1] *= .5 }
  for (const [p, list] of groups) { P = p; CUR = p; const n0 = list.length; E = list; updEnemies(dt); E = master; for (let i = n0; i < list.length; i++) master.push(list[i]) }
  E = master; CUR = null;
  for (const list of groups.values()) for (const e of list) { if (e.dead) { e.sv[0] = e.sv[1] = 0; continue } e.sv[0] = e.sv[0] * .5 + (e.x - e.px) / dt * .5; e.sv[1] = e.sv[1] * .5 + (e.y - e.py) / dt * .5 }
  // enemy projectiles
  for (let i = proj.length - 1; i >= 0; i--) {
    const q = proj[i]; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
    if (!q.sent) { q.sent = 1; SRV.evs.push({ t: 'ev', k: 'proj', x: q.x, y: q.y, vx: q.vx, vy: q.vy, life: q.life }) }
    let rm = q.life <= 0 || !inb(Math.floor(q.x), Math.floor(q.y)) || (solid[idx(Math.floor(q.x), Math.floor(q.y))] && isWater(Math.floor(q.x), Math.floor(q.y)) === false && !objAt.has(idx(Math.floor(q.x), Math.floor(q.y))));
    if (!rm) for (const p of live) if (Math.hypot(p.x - q.x, p.y - .3 - q.y) < .6) { SRV.hits.push({ to: p.id, d: Math.max(1, Math.round(q.dmg)) }); rm = true; break }
    if (rm) proj.splice(i, 1);
  }
  fxs.length = 0; parts.length = 0; floats.length = 0;
  // wizard chamber entry -> world shake
  const R5 = DR()[5];
  for (const p of pls) { const inW = !p.dead && p.x >= R5[0] && p.x < R5[0] + R5[2] && p.y >= R5[1] && p.y < R5[1] + R5[3]; if (inW && !SRV.wizIn.has(p.id)) { SRV.wizIn.add(p.id); SRV.glob.push({ t: 'shake' }); SRV.glob.push({ t: 'sys', m: "🌋 The earth trembles across the land… " + p.name + " has entered the Dark Wizard's chamber!" }); SRV.glob.push({ t: 'big', m: "⚠ THE WORLD TREMBLES ⚠\n" + p.name + " entered the Dark Wizard's chamber!", c: '#f6f' }) } else if (!inW) SRV.wizIn.delete(p.id) }
};
SRV.snapshot = function (p) {
  const a = [], cand = [], seen = new Set(), last = p.last || (p.last = new Map());
  for (const e of E) {
    if (e.dead) continue;
    const dx = Math.abs(e.x - p.x), dy = Math.abs(e.y - p.y), kn = p.known.has(e.id);
    if (dx > (kn ? 30 : 24) || dy > (kn ? 30 : 24)) continue;
    seen.add(e.id);
    const f = (e.sw > 0 ? 1 : 0) | (e.novaT > 0 ? 2 : 0) | (e.slow ? 4 : 0) | (e.dots && e.dots.length ? 8 : 0) | ((e.dir & 3) << 4) | ((e.st ? 1 : 0) << 6);
    const vx = Math.max(-15, Math.min(15, e.sv ? e.sv[0] : 0)), vy = Math.max(-15, Math.min(15, e.sv ? e.sv[1] : 0)), hp = Math.round(e.hp);
    if (!kn) { p.known.add(e.id); last.set(e.id, { x: e.x, y: e.y, vx, vy, hp, f, t: clock }); a.push([e.id, e.t, +e.x.toFixed(2), +e.y.toFixed(2), hp, e.mhp, e.dir, e.st, e.el || 0, e.sc || 1, e.dun ? 1 : 0, e.pt == null ? -1 : e.pt, +e.hx.toFixed(1), +e.hy.toFixed(1)]); continue }
    const l = last.get(e.id), age = clock - l.t, dev = Math.hypot(e.x - (l.x + l.vx * age), e.y - (l.y + l.vy * age)), dist = Math.max(dx, dy);
    const must = hp !== l.hp || f !== l.f;
    if (!must && !(dev > .3 || Math.abs(vx - l.vx) + Math.abs(vy - l.vy) > 2)) continue;
    if (!must && dist > 14 && ((SRV.tick + e.id) & 3) !== 0) continue;
    cand.push([dist, e, vx, vy, hp, f]);
  }
  if (cand.length > 150) cand.sort((m, n) => m[0] - n[0]);
  const u = [];
  for (let i = 0; i < cand.length && i < 150; i++) { const [, e, vx, vy, hp, f] = cand[i]; last.set(e.id, { x: e.x, y: e.y, vx, vy, hp, f, t: clock }); u.push([e.id, e.x, e.y, vx, vy, hp, f]) }
  const r = []; for (const id of p.known) if (!seen.has(id)) { r.push(id); p.known.delete(id); last.delete(id) }
  return { t: 'm', a, u, r, pt: [PT.open ? 1 : 0, Math.max(0, Math.round(PT.reopen - clock))] };
};
SRV.drain = function () { const o = { hits: SRV.hits, kills: SRV.kills, glob: SRV.glob, evs: SRV.evs }; SRV.hits = []; SRV.kills = []; SRV.glob = []; SRV.evs = []; return o };
