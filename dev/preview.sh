#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-8080}"
docker run --rm -p ${PORT}:80 -v "$PWD/www":/usr/share/nginx/html:ro nginx:alpine
