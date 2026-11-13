# Dark Portals 1
Browser tile MMO. `client/` = game (built to one HTML file), `server/` = Node + WebSocket + Postgres, `deploy/` = Docker.

## Run locally (no Postgres needed)
    sh client/build.sh && cd server && npm i && USE_PGMEM=1 node src/index.js   # http://localhost:8080
    cd server && npm test

## Deploy (Linux with Docker + compose plugin)
    git clone <repo> /opt/darkportals && cd /opt/darkportals/deploy
    cp .env.example .env && nano .env        # domain, DB password, JWT secret (openssl rand -hex 32)
    docker compose up -d --build
    # firewall: open 80 and 443 only. Backup: add deploy/backup.sh to cron.

## Versioning / rollback
Every release is a git tag (`v0.1.0` …) and a Docker image `darkportals:<version>`.
    git tag -l                      # list versions
    git checkout v0.1.0 && cd deploy && VERSION=0.1.0 docker compose up -d --build
Create a release: `deploy/release.sh 0.2.0 "message"`. DB schema changes must be additive; restore data from `backups/`.

## Status / roadmap
v0.1: accounts, cloud saves, presence, chat. Game rules still run in each browser (not cheat-proof).
v0.2: server-authoritative world: mobs, combat, loot, PvP, bank/auction/trade between real players, parties + dungeon.

## HTTPS with your domain
1. Create an `A` record `game.yourdomain.com` -> your server's IP; open ports 80 and 443.
2. In `deploy/.env` set `DOMAIN=game.yourdomain.com`, then `docker compose up -d --build`. Caddy gets and renews a free certificate automatically.
3. Own certificate: see the comment at the bottom of `deploy/Caddyfile`.
4. Hiding the server IP: put the domain behind Cloudflare (proxied, SSL mode Full) or a Cloudflare Tunnel, and set `CF=1` in `.env`.

## Admins
Set `ADMINS=yourusername` (comma separated) in `deploy/.env` and rebuild; those accounts get a 🛠 button (teleport, bring, kick, jail, unjail).

## Security and maintenance
- `IP_LIMIT=1` allows one account per IP (needs Caddy's X-Forwarded-For, which the default setup provides); list exceptions in `IP_ALLOW`.
- 🛠 admin panel: broadcast, maintenance mode (survives restarts), kick (10s), jail. Actions are stored in the `admin_log` table.

## Server ledger (SERVER_AUTH)
`SERVER_AUTH=log` (default) inspects every save: duplicated or forged item ids, huge gold/xp jumps are logged (`SUSPICIOUS save …`) and stored in the `ledger` table. `on` additionally rejects saves with duplicated/forged items. `off` disables the checks. The real auction and mail always work. Full server-owned gold/items is planned for 0.6.x.
