#!/bin/sh
# Nightly DB backup:  0 4 * * * /opt/darkportals/deploy/backup.sh
cd "$(dirname "$0")" && mkdir -p ../backups
docker compose exec -T db pg_dump -U darkportals darkportals | gzip > ../backups/darkportals-$(date +%F).sql.gz
find ../backups -name '*.sql.gz' -mtime +14 -delete
