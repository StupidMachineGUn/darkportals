// Server-side economy (v0.5.2): item registry, gold ledger, real auction with escrow, mail.
// SERVER_AUTH=off   -> nothing checked (auction/mail still work)
// SERVER_AUTH=log   -> save blobs are checked and suspicious ones are logged to the ledger (default)
// SERVER_AUTH=on    -> saves with duplicated / forged item ids are rejected
// Everything is additive and can be switched off without data loss.
export function createEcon(db, { mode = 'log', log = console.log } = {}) {
  const FEE = 0.05, GOLD_JUMP = +process.env.GOLD_JUMP || 20000, XP_JUMP = +process.env.XP_JUMP || 60000;
  const reg = new Map(); // item u -> { uid, ts }
  let auc = [];
  const led = (uid, kind, gold, info) => { db.query('INSERT INTO ledger(uid,ts,kind,gold,info) VALUES($1,$2,$3,$4,$5)', [uid, Date.now(), kind, gold | 0, String(info || '').slice(0, 300)]).catch(() => {}) };
  const clean = it => { try { if (!it || typeof it.id !== 'string' || it.id.length > 24) return null; const j = JSON.stringify(it); if (j.length > 500) return null; const o = JSON.parse(j); o.n = Math.max(1, Math.min(+o.n || 1, 9999)); return o } catch { return null } };
  async function init() {
    if (mode !== 'off') { const r = await db.query('SELECT u,uid,ts FROM item_reg'); for (const x of r.rows) reg.set(x.u, { uid: x.uid, ts: +x.ts }) }
    const a = await db.query('SELECT * FROM auctions WHERE done=0'); auc = a.rows.map(x => ({ id: x.id, seller: x.seller, sn: x.seller_n, it: JSON.parse(x.item), cur: x.cur, bidder: x.bidder, bn: x.bidder_n, buy: x.buy, exp: +x.exp }));
  }
  const own = (u, uid, iid) => { if (!u) return; const r = reg.get(u); if (r && r.uid === uid) return; reg.set(u, { uid, ts: Date.now() }); db.query('INSERT INTO item_reg(u,uid,iid,ts) VALUES($1,$2,$3,$4)', [u, uid, iid || '', Date.now()]).catch(() => db.query('UPDATE item_reg SET uid=$2,ts=$3 WHERE u=$1', [u, uid, Date.now()]).catch(() => {})) };
  // ---- save inspection ----
  function inspect(uid, name, prev, ch) {
    if (mode === 'off') return { ok: true, flags: [] };
    const flags = [], seen = new Set(), items = [...(ch.inv || []), ...((ch.bank && ch.bank.items) || [])], now = Date.now();
    for (const it of items) { if (!it || !it.u) continue; if (seen.has(it.u)) flags.push('dupe_u:' + it.u); seen.add(it.u); const r = reg.get(it.u); if (r && r.uid !== uid && now - r.ts > 60000) flags.push('foreign_u:' + it.u + '@' + r.uid) }
    const tot = c => (+c.gold || 0) + ((c.bank && +c.bank.gold) || 0);
    if (prev) {
      const dg = tot(ch) - tot(prev); if (dg > GOLD_JUMP) flags.push('gold+' + dg);
      for (const k in (ch.xp || {})) { const d = (+ch.xp[k] || 0) - (+(prev.xp || {})[k] || 0); if (d > XP_JUMP) flags.push('xp_' + k + '+' + d); if (d < -1 && !ch.dev && !prev.dev) flags.push('xp_' + k + d) }
    }
    if (flags.length) { log(`SUSPICIOUS save user=${name} ${flags.join(' ')}`); led(uid, 'flag', 0, flags.join(' ')) }
    const hard = flags.some(f => f.startsWith('dupe_u') || f.startsWith('foreign_u'));
    if (mode === 'on' && hard) return { ok: false, flags };
    for (const it of items) if (it && it.u) own(it.u, uid, it.id);
    return { ok: true, flags };
  }
  // ---- mail ----
  const mail = (uid, kind, msg, gold, item) => { led(uid, 'mail_' + kind, gold, msg); if (item && item.u) own(item.u, uid, item.id); return db.query('INSERT INTO mail(uid,kind,msg,gold,item,ts) VALUES($1,$2,$3,$4,$5,$6)', [uid, kind, msg, gold | 0, item ? JSON.stringify(item) : null, Date.now()]) };
  async function unclaimed(uid) { const r = await db.query('SELECT count(*) AS n FROM mail WHERE uid=$1 AND claimed=0', [uid]); return +r.rows[0].n }
  async function claim(uid) {
    const r = await db.query('UPDATE mail SET claimed=1 WHERE uid=$1 AND claimed=0 RETURNING id,kind,msg,gold,item', [uid]);
    const l = r.rows.sort((a, b) => a.id - b.id).map(x => ({ kind: x.kind, msg: x.msg, gold: x.gold | 0, item: x.item ? JSON.parse(x.item) : null }));
    for (const m of l) if (m.gold) led(uid, 'claim', m.gold, m.kind);
    return l;
  }
  // ---- auction ----
  const nextBid = l => l.bidder ? l.cur + Math.max(1, Math.round(l.cur * .06)) : l.cur;
  const pub = l => ({ id: l.id, it: l.it, sn: l.sn, s: l.seller, cur: l.cur, bn: l.bn || null, b: l.bidder || 0, buy: l.buy, exp: l.exp, nb: nextBid(l) });
  const list = () => auc.map(pub);
  const save = l => db.query('UPDATE auctions SET cur=$2,bidder=$3,bidder_n=$4,done=$5 WHERE id=$1', [l.id, l.cur, l.bidder || null, l.bn || null, l.done ? 1 : 0]);
  async function create(uid, name, m) {
    const it = clean(m.it); if (!it) return { ok: 0, why: 'Bad item' };
    if (auc.filter(l => l.seller === uid).length >= 5) return { ok: 0, why: 'Max 5 listings' };
    if (auc.length >= 300) return { ok: 0, why: 'Market is full' };
    if (it.u && auc.some(l => l.it.u === it.u)) return { ok: 0, why: 'Already listed' };
    if (it.u) { const r = reg.get(it.u); if (mode !== 'off' && r && r.uid !== uid && Date.now() - r.ts > 60000) { led(uid, 'flag', 0, 'list_foreign_u:' + it.u); return { ok: 0, why: 'Item rejected' } } }
    const mins = [10, 30, 60, 180].includes(m.mins | 0) ? m.mins | 0 : 30, cur = Math.max(1, Math.min(+m.price | 0, 1e7)), buy = Math.max(0, Math.min(+m.buy | 0, 1e8));
    if (buy && buy < cur) return { ok: 0, why: 'Buy price too low' };
    const exp = Date.now() + mins * 60000;
    const r = await db.query('INSERT INTO auctions(seller,seller_n,item,cur,buy,exp) VALUES($1,$2,$3,$4,$5,$6) RETURNING id', [uid, name, JSON.stringify(it), cur, buy, exp]);
    const l = { id: r.rows[0].id, seller: uid, sn: name, it, cur, bidder: null, bn: null, buy, exp };
    auc.push(l); own(it.u, 0, it.id); led(uid, 'list', 0, `${it.id} start ${cur}`); return { ok: 1, id: l.id };
  }
  async function bid(uid, name, m, buyNow) {
    const l = auc.find(x => x.id === (m.id | 0)); if (!l || l.exp <= Date.now()) return { ok: 0, why: 'Auction ended' };
    if (l.seller === uid) return { ok: 0, why: "That's your own listing" };
    if (!buyNow && l.bidder === uid) return { ok: 0, why: 'You already lead' };
    if (buyNow) { if (!l.buy) return { ok: 0, why: 'No buy-now price' } }
    const amt = buyNow ? l.buy : nextBid(l);
    if (!buyNow && (+m.amt | 0) < amt) return { ok: 0, why: 'Bid too low', nb: amt };
    const nt = [];
    if (l.bidder) { await mail(l.bidder, 'outbid', `📉 Outbid on ${l.it.id} – ${l.cur}g refunded.`, l.cur); nt.push(l.bidder) }
    if (buyNow) { await settle(l, uid, name, amt); nt.push(uid, l.seller); return { ok: 1, amt, now: 1, nt } }
    l.cur = amt; l.bidder = uid; l.bn = name; await save(l); led(uid, 'bid', -amt, `#${l.id}`); return { ok: 1, amt, nt };
  }
  async function settle(l, bUid, bName, amt) {
    l.done = 1; await save(l); auc = auc.filter(x => x !== l);
    const net = Math.round(amt * (1 - FEE));
    await mail(bUid, 'won', `🔨 You won ${l.it.id} for ${amt}g!`, 0, l.it);
    await mail(l.seller, 'sold', `💰 ${l.it.id} sold to ${bName} for ${amt}g (+${net}g after 5% fee).`, net);
    led(0, 'fee', amt - net, `#${l.id}`);
  }
  async function cancel(uid, m) {
    const l = auc.find(x => x.id === (m.id | 0)); if (!l || l.seller !== uid) return { ok: 0, why: 'Not yours' };
    if (l.bidder) return { ok: 0, why: 'Already has a bid' };
    l.done = 1; await save(l); auc = auc.filter(x => x !== l); await mail(uid, 'return', `📦 ${l.it.id} returned to you.`, 0, l.it); return { ok: 1 };
  }
  async function sweep() {
    const now = Date.now(), notify = new Set();
    for (const l of auc.filter(x => x.exp <= now)) {
      if (l.bidder) { await settle(l, l.bidder, l.bn, l.cur); notify.add(l.bidder); notify.add(l.seller) }
      else { l.done = 1; await save(l); auc = auc.filter(x => x !== l); await mail(l.seller, 'return', `📦 ${l.it.id} didn't sell – returned to you.`, 0, l.it); notify.add(l.seller) }
    }
    return notify;
  }
  return { init, inspect, list, create, bid, cancel, sweep, claim, unclaimed, mail, led, mode, reg, clean };
}
