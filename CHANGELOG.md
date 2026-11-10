# Changelog
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
