# Plan (not built yet)

## v0.5.3 candidates
- Auction: seller sets own starting bid (required) and optional buy-now price. No % of value button, no auto buy-now x2.
- Auction has NO ending time: listing stays open until the seller accepts the top bid (or buy-now sells instantly). Cancel only while no bids. Keep 5-listing limit and 5% fee. Idea: return listing by mail after 30 days seller inactivity.
- Outbid: gold returns automatically with a message, no confirmation, shown only when the player opens the Trade House (also if they were offline).
- Open (decide later): bidder withdraws own bid? Seller sees new-bid notice on opening Trade House.
- Area name: remove the permanent caption; show a one-time fading "Entering (name of area)" when crossing into a different area (towns, villages, dungeon, wizard chamber).
- Sleeping-player size bug: could not reproduce, needs a screenshot.

## Death & loot rework (DONE in v0.5.9; follow-ups: gold coins on floor, minimap markers)
- Items dropped on death must be much more visible (glow/beam/bounce, bigger icon, marker).
- Player death shows an animation, e.g. birds/stars circling the head while dead.
- PvP: killed player's items drop on the ground like any other drop; they do NOT transfer directly to the killer. Killer must pick them up.
- Mob loot works the same: stays on the floor until picked up, no direct transfer.
- Dropped items (PvP, mob, death) stay 10 minutes on the ground, then disappear. Server-owned timer.

## Server authority II (planned v0.6.2): server computes xp/gold/loot from kills, gathering, crafting and shops; client only sends actions. (Authority I = validation, done in v0.6.0.)

## World & audio expansion (now v0.6.2; LPC character graphics v0.6.3 if approved) (planned, user request)
- Music changes per village/area (own theme or mood per place). Combat music is always more jumpy and alert, and takes over while fighting.
- Area titles show ONCE when entering a place, then disappear (already listed as "Entering (area)").
- Use ALL 79 mobs from the Art Pack as real gameplay mobs (biome-based spawns).
- Bigger map (size to decide, 3x or 10x) and more dungeons.
- Final boss and his minions are 2x stronger.
- Magic/spell tuning: ON HOLD, no change for now.

## Character graphics v2 (DONE in v0.5.7; follow-up: hand-tune faces)
- More humanlike bodies: shoulders, arms, hands outlined; less "planked tree" look. Mockup: tools/art human3.py.
- Decision pending: hand-drawn 8-direction pixel sprites (recommended) vs pre-rendered 3D voxel look (demo map published; faces hard to read at game size).
- Applies to all players/NPCs, all armour tiers, held weapons and glow aligned; cells grow to about 22x30.

## Security upgrade (DONE in v0.5.8 items 1-5,7; 6 anti-cheat continues with v0.6.0/6.1; 8 is a manual step on the Linux box: docs/SERVER_HARDENING.md)
1. Fix spoofable IP: stop trusting X-Forwarded-For blindly; use only the proxy's real header (last hop), set CF=1 behind Cloudflare and block direct origin access.
2. Signup protection: CAPTCHA (Cloudflare Turnstile), global cap on new accounts per hour, optional email verification, block lookalike/odd usernames.
3. Login brute force: per-username lockout with backoff (not only per IP).
4. WebSocket flooding: per-connection message rate limit, connections per IP limit, drop sockets that do not log in within ~10s.
5. DB spam: per-account save rate limit and max save size, row caps per account (auction, mail), cleanup of never-played accounts, parameterised queries only.
6. Anti-cheat: server rejects impossible values (XP jumps, huge stacks, speed). Full fix comes with v0.6.0 / v0.6.1 server-owned economy and XP.
7. Basics: rate-limit public endpoints (leaderboard), body size caps, private DB network, strong ADMINS and secrets, nightly backups with tested restore, fail2ban / Cloudflare rules on repeated 429s.
8. Linux box (SSH): keys only, password login disabled, no root login, ufw firewall, fail2ban, DB/app ports not public, unattended upgrades, backups. Step-by-step guide: docs/SERVER_HARDENING.md. (User reported 1164 failed SSH logins.)
Order: 1+2, then 3+4, then 5+6 with the economy work.

## Magic weapons (DONE in v0.5.6; follow-ups)
- Glow/aura tiers by magic level: Plain, Enchanted (teal), Rare (blue), Epic (violet), Legendary (gold/fire). Higher tier = bigger glow, more sparkles.
- Applies to icons and in-hand weapon: sword, dagger, axe, staff, scepter, spear, bow, mace, wand.
- Follow-up: add scepter, spear, mace and wand as real items (art ready); dedicated enchant-level tiers; glow on dropped items on the ground.

## Later
- v0.6.0 server-owned gold/items; v0.6.1 server-validated XP/gathering/crafting.
- Graphics upgrade study (see chat).

## Spell tuning (v0.5.3 candidate, not built)
- Venom bolt: fires 3 bolts per cast, faster cast, poison damage over time (about 5s, ticks every second, ~60% of hit damage in total).
- Frost bolt: +20% direct damage; 20% chance to freeze for 2s (shorter on bosses); frozen enemies then take 3s of damage over time.
- Fireball: small splash (1.5 tiles); burning damage over time, also applied to nearby enemies.
- Confirmed by user: venom and frost and fireball defaults above. NOT decided yet: PvP behaviour (same or weaker vs players). Venom (user decision): damage is SPREAD across the 3 bolts, so the three bolts together do about the same direct damage as the old single bolt (each ~1/3), plus the poison over time. Open: mana cost; whether to keep poison at ~60% of hit damage.

## Dev button (v0.5.3 candidate, not built)
- The 🛠 dev button (all skills 99, all spells) must not show for non-admin players online. Only admins (ADMINS list) see it online. Also have the server ignore/reject saves flagged dev for non-admins. Open: keep it in offline single-player mode?

## Art Pack (v0.5.3 offline preview) – follow-ups
- Enable online (`ART_ONLINE=true`) after offline review; same variants must show for all players (biome is derived from position, so it already matches).
- Autotile edge blending between biomes (edge overlays already in the bundle).
- Make biomes real: lava hazard, ice slow, desert heat, swamp poison; biome-specific mob spawns on the server; new mobs' drops/stats.
- Bigger world (10x) + new items/weapons/armor tiers (mithril, dragon) as real gameplay content.
- Real walk/attack animation frames for mobs (currently 2 frames) and per-direction attack poses; skin/hair choices from the pack.
- Texture-pack selector (Classic / Art Pack) and optional lighting layer at dusk.

## Audio & scenes additions (v0.6.2, from user 17 Nov)
- Music rule (confirmed by user): the existing **Cloister Hymn** track (x.js `MED.cloister`) is the default music everywhere (overworld, villages, dungeons when not in combat). The existing **Tavern Dance** track (`MED.tavern`) plays only inside the **bank and shops** (and the inn). Both are already in the game, original and synthesized, so no new licensing. Combat keeps its own jumpier music; houses are silent.
- Inn / tavern scene: patrons dancing, lots of beer mugs on tables, a bard playing on a stage (animated NPCs, instrument sprite, floating notes).
- **Inn details (user, 17 Nov):** furnished with tables and seats, beer mugs everywhere, dancing patrons, a bard on a stage. **Beer can be bought** at the bar. Effect: after **3 beers** you are *drunk* and move with a wobbling, staggering walk, but your **power is x1.3** (applies to both magic and melee damage; confirm that "both" means melee + magic). Proposed defaults, to be confirmed: price ~15g, effect lasts 3 min and refreshes per beer, max 5 beers before you "pass out" for 5 s, no drunk effect inside safe-zone PvP. Buff is applied server-side once Server authority II exists (until then client-side and clamped by the save validator).
- No music inside houses (quiet interior ambience only: fire crackle).
- Resting/sleeping in a house: flying sheep drift above the sleeper (the same sheep sprites already in the game), "counting sheep" effect.
- Keeps the earlier items: per-area music, jumpy combat music, area titles shown once, all 79 mobs, bigger map + dungeons, final boss and minions 2x.

## Process rule (user, 17 Nov)
- Always ask before any deployment: I only deliver bundles and instructions; no deploy step is assumed without the user saying so.

## Version order (current)
v0.6.1 done (Art Pack default, fire vs lightning). Next: v0.6.2 audio + scenes + world expansion, v0.6.3 LPC characters/monsters (needs approval), then Server authority II, then small items.

## v0.6.2 DONE
Music rule, inn scene + beer/drunk, house sheep, area titles once. World expansion (79 mobs, bigger map, dungeons, boss x2) is next as v0.6.3; LPC after.
