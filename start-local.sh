#!/bin/sh

set -eu

ENV_FILE="${ENV_FILE:-.env.local}"

if [ ! -f "$ENV_FILE" ]; then
    echo "Missing $ENV_FILE. Copy .env.example and fill in its values." >&2
    exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker CLI is not available in PATH." >&2
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running." >&2
    exit 1
fi

docker compose --env-file "$ENV_FILE" up --build --watch "$@"
