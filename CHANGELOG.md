# Changelog
## 0.6.5 - A bigger, stranger world
- The world grows from 300x300 to 420x420 tiles, with three new far-off hard towns: Mistfall, Cinderhold and Gloomspire (each with a bank). Existing characters are moved to the main town once because the map moved.
- All 79 art mobs are now in the game, spread by distance from the capital and by terrain (foxes, boars, yetis, giants, liches, wisps, ghosts, phoenixes, drakes...). Cows, pigs, deer, rabbits and camels roam as harmless animals. Gold slimes carry lots of gold.
- Magic mobs: fireball throwers, frost bolts that slow you, poison spitters, curse casters, summoners that raise minions, life-drainers, blinkers that teleport behind you, shielded knights and golems (hits do 85% less while the shield is up), area novas with a warning ring, healers, and jelly kings that split in two when killed. They work online too.
- New status effects on you: slowed, cursed and poisoned.
- Mob drops: many new mobs drop gems, essence, scales, pelts and other materials. Legendary gear still only from the final boss (coming).
## 0.6.4 - Town portal & village banks
- Scroll of Town Portal (90g at the shop): read it from the bag, stand still 3 s, and you arrive in the main town. No cooldown; one scroll is used up.
- Your portal spell now always opens to the main town (Hearthmoor), not the last village.
- Every village now has a small Bank (same vault as the capital's).
## 0.6.3 - Classic default, real drops, glow
- Classic graphics (no art pack) are the default again; the Art Pack stays optional in settings (one-time reset).
- Dropping an item puts it on the floor like loot: anyone can pick it up (you ignore it for 4 s so you don't re-grab it). Equipped items must be unequipped first.
- Bag full no longer deletes or silently banks things: gathered, crafted-drop, kill and PvP loot falls on the floor instead. Shop buying/crafting still refuse with "Bag full!". Mail and auction returns still go to your bank on purpose.
- Glow: staffs and other magic weapons glow arcane violet, enchanted weapons teal, rare/unique/legendary by rarity - on your equipped weapon, on the floor and in the bag.
## 0.6.2 - Music, inn & sheep dreams
- Music: the Cloister Hymn is now the default everywhere; the Tavern Dance plays only in shops, the bank and the inn; houses are silent; combat keeps its own tracks. Medieval tracks now follow the music volume setting.
- Inn: stage with a bard playing (floating notes), tables with seats and lots of beer, dancing patrons. Buy a beer at the bar (15g): 3 beers = drunk (wobbly walk, x1.3 attack and magic for 3 min, refreshed per beer). Beer number 6 makes you pass out for 5 s.
- Resting in a house: flying sheep drift above the sleeper.
- Area titles (e.g. "Hearthmoor Town") show for 5 seconds when you enter an area, then hide.
## 0.6.1 - Art Pack default + spell balance
- The Art Pack (new graphics) is now the default for everyone, including players who had switched to Classic before (one-time reset; it can still be switched back in settings).
- Fireball is faster (projectile speed 14 vs 9) and hits 60% harder; Inferno 13 speed and +90%. Chain Bolt and Storm Call stay slower (speed 8) and chain through many enemies at 70% each, so fire is the single-target/burst spell and lightning is the crowd spell.

## 0.6.0 - Server authority I
- The server now decides what a save may contain (`server/src/authority.js`, `AUTHORITY=on|log|off`, default on): items must exist in the catalog (`items.json`, regenerate with `tools/gen_items.py`), rarity/enchant are clamped, forged items are stripped.
- XP and gold can only grow at human rates (token buckets: XP 3000 burst + 25/s per skill, gold 2000 burst + 30/s, plus the value of items you sold and anything the server paid you). Inflated values are clamped, logged (`AUTHORITY ...`) and sent back; the client adopts the corrected numbers ("Server corrected your save").
- Brand-new items from nowhere, huge stack jumps and dev mode are removed for non-admins; admins (`ADMINS`) are exempt.
- HSTS header so browsers only ever use HTTPS.

## 0.5.9 - Death & loot rework
- Items dropped on death are far more visible: coloured light beam (red for death drops, rarity colours otherwise), pulsing ring, bigger bobbing icon, skull marker; blinks in its last 30 s.
- PvP kills no longer hand the item to the killer; it drops on the floor like any other drop (gold and skill % still transfer).
- Mob item loot (not gold/XP) now lands on the floor where the mob died and is picked up by walking over it (offline: local, online: server-owned shared ground).
- Everything on the ground disappears after 10 minutes (server-owned timer online; `GROUND_TTL_MS`).
- Death animation: birds and a star circle the head while knocked out (also shown for other players).
- Offline deaths now drop the item on the ground instead of deleting it.

## 0.5.8 - Security upgrade
- Spoof-proof client IP (last proxy hop / CF header), new `PROXY_HOPS` setting.
- Signup: reserved/lookalike names refused, global hourly cap, optional Cloudflare Turnstile captcha.
- Login: per-username lockout with backoff; constant-time check for unknown users; /api rate limit; save rate limit.
- WebSocket: connections per IP, connect rate, per-connection message rate, flood disconnect.
- Cleanup of never-played accounts and old claimed mail; security headers; greppable `SECURITY ...` log lines.
- Docs: docs/SECURITY.md.

## 0.5.7 - Character graphics v2 (8 directions)
- Players, NPCs and guards are now pre-rendered 3D-style sprites with 8 facing directions and 3 walk frames (diagonal movement shows real diagonal views).
- Armour tiers (cloth..mithril/dragon) and 16 NPC colours baked; weapons (sword, steel, mithril, dagger, axe, bow, staffs) are separate layers drawn in front of or behind the body per direction, with the five magic glow tiers.
- Facing (8-dir) is relayed to other players inside the look data (`lk.d8`, server clamps 0..7).
- Classic / Art Pack toggle still works; mobs unchanged.

## 0.1.1 – Dark Portals 1
- Game renamed to Dark Portals 1 (town: Hearthmoor)
- 12 Dark Portals around the world spawn monsters (stronger farther from towns)
- Slaying the Dark Wizard closes all portals for 10 min (their monsters vanish); then portals reopen and the wizard respawns
## 0.1.0 – online foundation
- Node server (HTTP + WebSocket) with PostgreSQL: accounts (scrypt), cloud character saves, shared Hall of Heroes
- Live presence of other players, global chat, server speed-hack snapback
- Docker Compose: Caddy (HTTPS) + game + Postgres, backup + release scripts
- Gameplay (still client-side): sheep added, chickens reduced, bank, trade house, dungeon & Dark Wizard, gore, music
## 0.0.0 – offline prototype (single-player, localStorage)

## 0.2.0
- Server-authoritative shared world: mobs, elites, Ember Wyrm, Rooster Lord, dungeon, Dark Wizard and Dark Portals now run once on the server (same game logic, headless) and stream to all players.
- Weapon swings and spell bolts are now visible to other players; other players show their real weapon.
- Real PvP between players (stance on): flags, spoils, bounty, relayed via server.
- Kill credit and loot go to the killer; Wyrm rewards by damage dealt; wizard-chamber world shake for everyone.
- Server caps hit damage and range (anti-cheat).
- Red ping readout (bottom-left).
- Known limits: spells don't hit players (melee PvP only), guards/shrooms stay client-side.

## 0.2.1
- Fix huge lag (ping tens of seconds): snapshots were resending every mob 10x/s (~220 KB/s per player) and queued up on slower links. Now delta-only, smaller view radius (24 tiles), rounded coords, and skipped when a client's send buffer is backed up (~37 KB/s).

## 0.3.0 – network optimisation
- Mobs halved (wild mobs; elites, dungeon, bosses, farm animals kept).
- Dead-reckoning: server sends position + velocity only when a mob deviates >0.3 tile from the client's prediction, or HP/state changes; client extrapolates in between.
- Binary updates (13 bytes/mob vs ~40 JSON), 20 Hz, distance-based rates (far mobs every 4th tick), 150 updates/tick cap nearest-first, backpressure.
- TCP_NODELAY on sockets.
- Ping readout (red) now also shows server loop delay, download KB/s and queued bytes.

## 0.3.1
- Server mob speed: fast mobs (bat, wolf, wraith, spider) and bosses/rooster keep their speed; all other mobs move at 50% speed (fewer position updates).

## 0.3.2
- Server no longer exits on a simulation/unhandled error; errors are logged (SIM ERROR / UNCAUGHT) instead of crash-looping.

## 0.3.3
- Other players now render with your real look: weapon (or none), weapon tint, armour tint, armour/helm/boots tiers.
- zZ above a player idle for 30s (server-decided); oO while chatting or in a shop. Shown on your own character too.

## 0.4.0 – shared buildings, trade, spells, fixes
**Fixes**
- Criminal status: orange / red / blue player names are now shown to other players.
- Chat now appears as a speech bubble above the player's head (the oO marker is only used inside shops).
- Inventory not saved on exit: saves are now forced when the page is closed / hidden, trailing saves are never dropped, and the server writes saves in order (no lost or out-of-order writes).
- Android "map or background disappears": render errors are caught and shown, tile/sprite canvases are rebuilt if the browser discards them (tab switch, memory pressure), canvas size is capped.
- Death: equipped items are never lost. One random backpack item drops on every death (ground loot anyone can pick up after 10 s; in PvP it goes to the killer).
- Server: kill/chat/ping reporting hardened.

**New**
- Shared interiors: players can enter shops, the inn, the bank, the Trade House and cottages together and see/chat with each other. Rooms are 50% bigger and NPCs are now player-sized. Visit a cottage when someone is home.
- Activity icons above the head (chopping, mining, fishing, cooking, foraging, fighting, casting, healing…).
- Real player-to-player trade at the Trade House (both sides confirm; any change resets confirmations).
- Spell book (📖): choose one attack and one support spell for the hotbar. Spells can fizzle (chance falls as your Magic level passes the spell level).
- Mage Tower (main town and the larger villages): attack spells to level 50 and early support spells for gold + ingredients.
- The Witch's Hut (forest, with a campfire safe zone and friendly goblin guards): higher-tier spells (level 50–100), and she buys/sells magic mushrooms and ingredients.
- New support spells: Ward Shield, Haste, Regrowth, Greater Mend, Aegis.
- Existing characters keep the attack spells they had already unlocked.

## 0.5.0 – parties, jail, admin tools, HTTPS docs
- Other players' titles ("the Swordsman") now show above their name, in the world and inside shops/houses
- Trade: stackable items (food, potions, ingredients…) can be offered with +1 / All, not only gear
- Autowalk watchdog: if a walk gets stuck it re-paths once, then cancels ("Path blocked"); paths clear on server correction, shop entry, death, jail
- Portal status (🌀 open / closed Nm) in the red ping line (portal spawning itself was verified working server-side)
- Parties (max 5): 👥 panel, invite/accept/leave/kick, member HP, `/p text` party chat, no PvP between members, free warp to a member (60s cooldown; blocked in combat, dungeon, jail, buildings)
- Admin tools (🛠 button, only for names in `ADMINS` env): player list, teleport to, bring, kick (5-min block), jail 25/50, unjail — enforced on the server
- Jail: fenced yard with potato plants in Hearthmoor; dig the sentence (25 potatoes, 50 if set higher) to go free; server-authoritative, confined to the yard, saved across logout, safe from mobs/PvP
- Town guards: attacking a non-red player inside a safe zone does no damage and gets the attacker jailed for assault
- Deploy: HTTPS/domain docs (Caddy auto-cert, own certificate, Cloudflare), `CF=1` makes rate limiting use the real client IP behind Cloudflare

## 0.5.1 – welcome screen, safer saves, balance, admin tools
- New welcome screen: animated night scene, ALPHA tag + version, slime mascot (green/smiling = server online, red/sad = offline, amber/sleepy = maintenance), Play online / Play offline (offline progress is separate and local)
- Log out button (⏻): saves, waits for confirmation, returns to the welcome screen (blocked during combat); closing the page still tries a final save
- Saves: server-side version check (an old tab/device can no longer overwrite newer progress), response is checked, failures retry, "💾 saved / ⚠ NOT SAVED" indicator, saves right after level-ups, shop/bank/trade actions and death, 5s interval, local backup, server logs every save
- Buttons moved to a column on the left under the HP bars
- Combat: armor now has diminishing returns (armor/(armor+60)), hits always do at least 12%, agility = capped dodge (25%) and capped speed (+25%), mob HP and damage scale with distance from town
- Fixed mobs showing ~1 HP while actually healthy (server now resyncs HP after every hit)
- 3 new medieval music tracks (Tavern Dance, Cloister Hymn, Knight's March) – pick one in Options > Track, or Auto
- Security: one account per IP (IP_LIMIT, IP_ALLOW exceptions)
- Admin: IP shown next to names, 📢 broadcast banner, maintenance mode (new logins refused; admins and players already online stay; rejoin allowed 5 min), admin action log table
- Kick: "You got kicked", back to the welcome screen, 10 second block

## 0.5.2 – thievery, real auction, server ledger
- 🗝️ Thievery skill: tap ✋ near a player or mob → 🔍 Snoop / 🤏 Pickpocket. Players need PvP stance, get the 🟠 criminal flag, and guards jail thieves in town. Mobs: gold only, no flag, failure may aggro them. Success rises with level; victim's client decides the outcome (relayed by the server).
- 🏠 Cottages online: free to rent, one owner per house server-wide (server-tracked, others see who rents it); no NPC occupants online.
- 🔨 Real player auction (online): server escrow, bids, buy-now, cancel, 5% fee; fake listings are gone online (offline mode keeps the simulation). 📬 Mail delivers wins/refunds/payouts and shows notices at login.
- 🧾 Server item/gold ledger: unique item registry, duplicate/forged item detection, gold/xp jump detection, `ledger` table. `SERVER_AUTH=off|log|on` (default `log`; `on` rejects saves with duplicated/forged items). Reversible, additive tables.
- Buffs (shield etc.) as icons with timers under the HP bar and effects on the character, visible to others.
- Fishing, mining, smithing cost stamina (no AFK macros).
- One-tap logout (no popup loops); welcome text "A tiny MMO that grows with you".
- 10s of silence → client saves and disconnects; server drops silent players. Local online backup removed (cheating risk).
- Music: a different tune per town/village, 4 combat tracks (heavier for bosses/dungeon), fade between tunes.
- Tutorial on first start (and in Options); 📱 low-detail mode for weak phones.
- Removed the yellow level/gold bar.

## 0.5.6 – Magic weapons
- Weapons glow by tier: Enchanted (teal), Rare (blue), Epic (violet), Legendary (gold). Higher tier = bigger glow and more sparkles, shimmering in-hand.
- Tier rule: Rare = tier 2, Unique = tier 3, Legendary = tier 4; an enchant adds one tier (an enchanted common weapon is tier 1). Capped at 4.
- Works for sword, dagger, axe, staff and bow, on the player and on other players online (server relays the tier in the look data, clamped 0-4).
- Sword-swing smear takes the tier colour. Inventory and equipment icons get a matching glow.
- Scepter, spear, mace and wand glow art is drawn (tools/art/magicwep.py) but those weapons do not exist as items yet.

## 0.5.5 – Sprite polish
- Polish pass on every player, mob and animal sprite: tinted (not flat black) outlines, light on upper-left edges, darker lower/right sides, softer colour banding.
- Players: nose, rosy cheeks, brows, hair strands, gold belt buckle, boot cuffs.
- Dragons redrawn bigger (dragon/wyrm drawn at 2x, drakes 1.7x): wings with bones, jaw and eyes, belly scales, spine spikes, clawed legs, spiked tail, real front/back/side views.
- Bats (also ice/fire bats): separate front, back and flapping side views.
- Plan: magic weapon glow tiers (Enchanted, Rare, Epic, Legendary) pending approval.

## 0.5.4 – Art Pack polish
- Terrain edges: grass fringes over sand, dirt and stone, sand shores with foam on water, shallow-to-deep water edges, and softer blending between biomes.
- New ground details: flower patches in several colours; lily pads (some with flowers) on shallow water.
- Trees, bushes, rocks and crystals redrawn with leafy clumps, highlights and mossy rocks; richer flower and reed props.
- Item icons: top-to-bottom shading and shine on potions, gems, crystals and metals.
- Buildings: shingled roofs, timber frames, window frames, flower boxes, doors with steps, brick chimneys; the Witch's Hut is now a mossy flowered log cabin; towers redrawn.
- New menu skin (with Art Pack on): wood panels, green title bars, tan item slots, green buttons, wood HUD buttons.
- Server: item registry upsert fix (no more duplicate-key log).

## 0.5.3 – Art Pack (offline preview)
- Fix: item registry no longer logs a harmless duplicate-key DB error (now an upsert).
- New original pixel-art pack ("Art Bundle Pack": 24 biomes, 79 mobs, 129 item icons, 71 props/buildings, 4-direction characters with 7 armor tiers and 11 weapon looks), baked into the client (`client/artdata.js`, generator in `tools/art`).
- Offline / single-player uses it: ground tiles, animated water/lava/ice, buildings, trees/rocks/bushes, players, NPCs, guards and all monsters, inventory/equipment item icons, paper-doll.
- Cosmetic biomes around the starting area: snow & tundra (north), lava/ash (north-east), canyon (east), desert (south-east), jungle (south), swamp (south-west). Trees, rocks and monster looks follow the biome (e.g. ice slime / frost spider in snow, scorpion in desert, lava golem in ash).
- Settings: "Art Pack (offline)" toggle returns to the old look any time.
- Online play is unchanged (`ART_ONLINE=false` in `client/art.js`); flip it to enable the pack online.
- Gameplay unchanged: biomes/variants are visual only for now.
- Art Pack: animated weapon swing – the blade/staff now sweeps through the arc with a fading slash smear (was a static sprite + arc), per weapon look.
- Art Pack: monster attack animations (wind-up, lunge, slime squash, flyer dive, claw/slash arc); player sword swing made smaller.
- Names, titles and bars now sit above the head of the taller Art Pack characters.
- Settings: separate SFX and Music volume sliders (saved per device).
- Art Pack: redrawn farm animals/wildlife (sheep, chicken, rooster, cow, pig, rabbit, fox, deer, wolves, bears, boar, camel) with real front/back/side views; richer trees, bushes and flowers; detailed terrain (tufts, flowers, pebbles, sand ripples, embers); weapon on back view no longer a white slab.
- Shop titles on buildings (Shop, Blacksmith, Inn, Bank, Trade House, Elder Hall, Mage Tower) as gold-framed signs over the roof.
- DEV button hidden for everyone except admins online (server `ADMINS` list). Offline testing: add `#dev` to the URL or set localStorage `dp.dev=1`.
- Sheep now say "meh" with a bleat sound instead of clucking like chickens.
- Art Pack is now ON for online play too (`ART_ONLINE=true`). Verified against a local server: world, shared mobs, players and UI render with the pack; the Settings switch still returns to the classic look. Server mob attack animations need a server `sw` field (planned); mobs lunge only in offline play for now.
