#!/bin/sh
# Nightly DB backup:  0 4 * * * /opt/emberfall/deploy/backup.sh
cd "$(dirname "$0")" && mkdir -p ../backups
docker compose exec -T db pg_dump -U emberfall emberfall | gzip > ../backups/emberfall-$(date +%F).sql.gz
find ../backups -name '*.sql.gz' -mtime +14 -delete
