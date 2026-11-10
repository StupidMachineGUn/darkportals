#!/bin/sh
# Usage: deploy/release.sh 0.2.0 "what changed"   (bumps VERSION, commits, tags)
set -e
cd "$(dirname "$0")/.."
echo "$1" > VERSION; sh client/build.sh >/dev/null
git add -A && git commit -m "v$1: $2" && git tag -a "v$1" -m "$2"
echo "tagged v$1. Deploy: git push --follow-tags && ssh server 'cd /opt/darkportals && git pull && cd deploy && VERSION=$1 docker compose up -d --build'"
