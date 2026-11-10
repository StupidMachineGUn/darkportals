# Dark Portals 1
Browser tile MMO. `client/` = game (built to one HTML file), `server/` = Node + WebSocket + Postgres, `deploy/` = Docker.

## Run locally (no Postgres needed)
    sh client/build.sh && cd server && npm i && USE_PGMEM=1 node src/index.js   # http://localhost:8080
    cd server && npm test

## Deploy (Linux with Docker + compose plugin)
    git clone <repo> /opt/emberfall && cd /opt/emberfall/deploy
    cp .env.example .env && nano .env        # domain, DB password, JWT secret (openssl rand -hex 32)
    docker compose up -d --build
    # firewall: open 80 and 443 only. Backup: add deploy/backup.sh to cron.

## Versioning / rollback
Every release is a git tag (`v0.1.0` …) and a Docker image `emberfall:<version>`.
    git tag -l                      # list versions
    git checkout v0.1.0 && cd deploy && VERSION=0.1.0 docker compose up -d --build
Create a release: `deploy/release.sh 0.2.0 "message"`. DB schema changes must be additive; restore data from `backups/`.

## Status / roadmap
v0.1: accounts, cloud saves, presence, chat. Game rules still run in each browser (not cheat-proof).
v0.2: server-authoritative world: mobs, combat, loot, PvP, bank/auction/trade between real players, parties + dungeon.
