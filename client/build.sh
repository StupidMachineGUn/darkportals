#!/bin/sh
# Builds the single-file client into ../dist/index.html (and server/public/index.html)
set -e
cd "$(dirname "$0")"
V=$(cat ../VERSION)
mkdir -p ../dist ../server/public
cat a.html b.js c.js d.js f.js x.js n.js e.js | sed "s/__VERSION__/$V/g" > ../dist/index.html
cp ../dist/index.html ../server/public/index.html
echo "built v$V ($(wc -c < ../dist/index.html) bytes)"
