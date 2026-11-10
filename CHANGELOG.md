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
