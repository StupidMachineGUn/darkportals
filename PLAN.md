# Plan (not built yet)

## v0.5.3 candidates
- Auction: seller sets own starting bid (required) and optional buy-now price. No % of value button, no auto buy-now x2.
- Auction has NO ending time: listing stays open until the seller accepts the top bid (or buy-now sells instantly). Cancel only while no bids. Keep 5-listing limit and 5% fee. Idea: return listing by mail after 30 days seller inactivity.
- Outbid: gold returns automatically with a message, no confirmation, shown only when the player opens the Trade House (also if they were offline).
- Open (decide later): bidder withdraws own bid? Seller sees new-bid notice on opening Trade House.
- Area name: remove the permanent caption; show a one-time fading "Entering (name of area)" when crossing into a different area (towns, villages, dungeon, wizard chamber).
- Sleeping-player size bug: could not reproduce, needs a screenshot.

## Later
- v0.6.0 server-owned gold/items; v0.6.1 server-validated XP/gathering/crafting.
- Graphics upgrade study (see chat).

## Spell tuning (v0.5.3 candidate, not built)
- Venom bolt: fires 3 bolts per cast, faster cast, poison damage over time (about 5s, ticks every second, ~60% of hit damage in total).
- Frost bolt: +20% direct damage; 20% chance to freeze for 2s (shorter on bosses); frozen enemies then take 3s of damage over time.
- Fireball: small splash (1.5 tiles); burning damage over time, also applied to nearby enemies.
- Confirmed by user: venom and frost and fireball defaults above. NOT decided yet: PvP behaviour (same or weaker vs players). Open: per-bolt damage of the 3 venom bolts (suggest each bolt ~40% of the old single bolt, so total is higher), and mana cost.
