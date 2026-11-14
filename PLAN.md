# Plan (not built yet)

## v0.5.3 candidates
- Auction: seller sets own starting bid (required) and optional buy-now price. No % of value button, no auto buy-now x2.
- Auction has NO ending time: listing stays open until the seller accepts the top bid (or buy-now sells instantly). Cancel only while no bids. Keep 5-listing limit and 5% fee. Idea: return listing by mail after 30 days seller inactivity.
- Outbid: gold returns automatically with a message, no confirmation, shown only when the player opens the Trade House (also if they were offline).
- Open (decide later): bidder withdraws own bid? Seller sees new-bid notice on opening Trade House.
- Area name: remove the permanent caption; show a one-time fading "Entering (name of area)" when crossing into a different area (towns, villages, dungeon, wizard chamber).
- Sleeping-player size bug: could not reproduce, needs a screenshot.

## Death & loot rework (planned)
- Items dropped on death must be much more visible (glow/beam/bounce, bigger icon, marker).
- Player death shows an animation, e.g. birds/stars circling the head while dead.
- PvP: killed player's items drop on the ground like any other drop; they do NOT transfer directly to the killer. Killer must pick them up.
- Mob loot works the same: stays on the floor until picked up, no direct transfer.
- Dropped items (PvP, mob, death) stay 10 minutes on the ground, then disappear. Server-owned timer.

## World & audio expansion (planned, user request)
- Music changes per village/area (own theme or mood per place). Combat music is always more jumpy and alert, and takes over while fighting.
- Area titles show ONCE when entering a place, then disappear (already listed as "Entering (area)").
- Use ALL 79 mobs from the Art Pack as real gameplay mobs (biome-based spawns).
- Bigger map (size to decide, 3x or 10x) and more dungeons.
- Final boss and his minions are 2x stronger.
- Magic/spell tuning: ON HOLD, no change for now.

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
