/* v0.6.0 server authority I: the server decides what a save may contain.
 * The client is never trusted: unknown items are stripped, xp/gold/items can only grow at plausible rates,
 * dev mode is admin-only. Anything over the allowance is clamped, logged and sent back to the client ("fix").
 * AUTHORITY=off|log|on (default on).  Tunables: XP_BURST, XP_RATE, GOLD_BURST, GOLD_RATE, NEWITEM_BURST. */
import { readFileSync } from 'node:fs';
const cat = JSON.parse(readFileSync(new URL('./items.json', import.meta.url), 'utf8'));
const ITEMS = cat.items, SKILLS = new Set(cat.skills), RVAL = [1, 2.5, 6, 20];
const num = (v, d = 0) => Number.isFinite(+v) ? +v : d;
const E = k => num(process.env[k], 0);
export function createAuthority({ mode = process.env.AUTHORITY || 'on', log = console.log, isAdmin = () => false } = {}) {
  const XP_BURST = E('XP_BURST') || 3000, XP_RATE = E('XP_RATE') || 25, GOLD_BURST = E('GOLD_BURST') || 2000, GOLD_RATE = E('GOLD_RATE') || 30, NEW_BURST = E('NEWITEM_BURST') || 14;
  const credit = new Map(); // uid -> gold the server itself handed out (mail claims, pvp spoils) since last save
  const pools = new Map(); // `${uid}:${key}` -> {v,t}: token bucket so the 'burst' cannot be re-used on every save
  const take = (key, want, burst, rate, now) => { let p = pools.get(key); if (!p) { p = { v: burst, t: now }; pools.set(key, p) } p.v = Math.min(burst, p.v + (now - p.t) / 1000 * rate); p.t = now; const got = Math.min(want, p.v); p.v -= got; return got };
  const lastAt = new Map(); // uid -> ms of last accepted save
  const val = it => { const b = ITEMS[it.id]; if (!b) return 0; if (!b.s) return b.v * (it.n || 1); return Math.round(b.v * RVAL[Math.max(0, Math.min(3, it.rar | 0))] + (it.ench ? b.v * .5 : 0)) };
  const all = c => [...(c.inv || []), ...((c.bank && c.bank.items) || [])];
  function sanitize(uid, name, prev, ch, registry) {
    if (mode === 'off') return { ch, fix: null, flags: [] };
    const flags = [], now = Date.now(), dt = Math.min(900, Math.max(1, (now - (lastAt.get(uid) || now - 30000)) / 1000)), adm = isAdmin(name);
    const pv = prev || null;
    // 1. dev mode is an admin tool: strip it (and restore real xp) for everyone else
    if (!adm && (ch.dev || ch.devBak)) { flags.push('dev'); if (ch.devBak && typeof ch.devBak === 'object') ch.xp = ch.devBak; delete ch.dev; delete ch.devBak; delete ch.devT }
    // 2. skills: only known ones, finite, non-negative, growth bounded
    for (const k of Object.keys(ch.xp)) if (!SKILLS.has(k)) { delete ch.xp[k]; flags.push('xp_unknown:' + k) }
    for (const k of SKILLS) {
      let v = Math.max(0, Math.floor(num(ch.xp[k], 0))); const was = Math.max(0, num(pv && pv.xp && pv.xp[k], 0));
      if (!adm && pv && v > was) { const got = take(uid + ':xp:' + k, v - was, XP_BURST, XP_RATE, now); if (got < v - was) { flags.push(`xp_${k}+${Math.round(v - was)}>${Math.round(got)}`); v = Math.floor(was + got) } }
      if (!pv && !adm && v > 20000) { flags.push('xp_new:' + k); v = 0 } // brand-new character cannot start with xp
      ch.xp[k] = v;
    }
    // 3. items: known ids only, sane rarity / enchant, bag limits
    const clean = list => { const out = []; for (const it of list || []) { if (!it || typeof it.id !== 'string' || !ITEMS[it.id]) { if (it) flags.push('item_unknown:' + String(it.id).slice(0, 16)); continue }
      const b = ITEMS[it.id]; if (b.s) { it.n = 1; it.rar = Math.max(0, Math.min(3, it.rar | 0)); if (!it.rar) delete it.rar; if (it.ench) { const e = it.ench; if (typeof e !== 'object' || !e.t) { delete it.ench; flags.push('ench_bad') } else { e.v = Math.max(1, Math.min(60, e.v | 0)) } } } else { it.n = Math.max(1, Math.min(9999, it.n | 0)); delete it.rar; delete it.ench }
      out.push(it) } return out };
    ch.inv = clean(ch.inv).slice(0, 24);
    ch.bank = ch.bank && typeof ch.bank === 'object' ? ch.bank : { gold: 0, items: [] }; ch.bank.items = clean(ch.bank.items).slice(0, 200);
    if (pv && !adm) {
      // items created from nothing: only so many brand-new unique items per save
      const known = new Set(all(pv).map(i => i.u).filter(Boolean)), fresh = [];
      for (const it of ch.inv) if (ITEMS[it.id].s && it.u && !known.has(it.u) && !(registry && registry.get(it.u))) fresh.push(it);
      const allow = NEW_BURST + Math.floor(dt * .3);
      if (fresh.length > allow) { flags.push('new_items+' + fresh.length + '>' + allow); const drop = new Set(fresh.slice(allow)); ch.inv = ch.inv.filter(i => !drop.has(i)) }
      // stack growth per id
      const cnt = l => { const m = {}; for (const i of l) if (!ITEMS[i.id].s) m[i.id] = (m[i.id] || 0) + i.n; return m }, a0 = cnt(all(pv)), a1 = cnt(all(ch));
      for (const id in a1) { const cap = (a0[id] || 0) + 250 + Math.floor(dt * 2); if (a1[id] > cap) { flags.push(`stack_${id}+${a1[id] - (a0[id] || 0)}`); let ex = a1[id] - cap; for (const l of [ch.inv, ch.bank.items]) for (const it of l) if (it.id === id && ex > 0) { const t = Math.min(ex, it.n); it.n -= t; ex -= t } ch.inv = ch.inv.filter(i => i.n > 0); ch.bank.items = ch.bank.items.filter(i => i.n > 0) } }
    }
    // equipped uids must exist in the bag
    if (ch.eq && typeof ch.eq === 'object') for (const k of Object.keys(ch.eq)) if (ch.eq[k] && !ch.inv.some(i => i.u === ch.eq[k])) ch.eq[k] = null;
    // 4. gold: bounded growth, plus the value of items that left the bag (selling) and anything the server paid out
    ch.gold = Math.max(0, Math.floor(num(ch.gold, 0))); ch.bank.gold = Math.max(0, Math.floor(num(ch.bank.gold, 0)));
    if (pv && !adm) {
      const t0 = num(pv.gold) + num(pv.bank && pv.bank.gold), t1 = ch.gold + ch.bank.gold;
      const gone = new Map(); for (const it of all(pv)) gone.set(it.u || it.id, (gone.get(it.u || it.id) || 0) + 1);
      let sold = 0; const cur = new Set(all(ch).map(i => i.u || i.id)); for (const it of all(pv)) if (!cur.has(it.u || it.id)) sold += val(it);
      const free = sold + (credit.get(uid) || 0), gain = t1 - t0;
      if (gain > 0) { const need = Math.max(0, gain - free), got = take(uid + ':gold', need, GOLD_BURST, GOLD_RATE, now); if (got < need) { flags.push(`gold+${gain}>${Math.round(free + got)}`); ch.gold = Math.max(0, ch.gold - Math.ceil(need - got)) } }
    } else if (!pv && !adm && ch.gold + ch.bank.gold > 500) { flags.push('gold_new'); ch.gold = 0; ch.bank.gold = 0 }
    credit.delete(uid);
    lastAt.set(uid, now);
    if (flags.length) log(`AUTHORITY ${mode} user=${name} ${flags.join(' ')}`);
    if (mode === 'log') return { ch: null, fix: null, flags };
    return { ch, fix: flags.length ? { xp: ch.xp, gold: ch.gold, bank: ch.bank, inv: ch.inv, eq: ch.eq, dev: !!ch.dev } : null, flags };
  }
  return { sanitize, credit: (uid, g) => credit.set(uid, (credit.get(uid) || 0) + Math.max(0, g | 0)), mode };
}
