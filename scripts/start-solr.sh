#!/usr/bin/env bash

set -euo pipefail

: "${SOLR_USERNAME:?SOLR_USERNAME is required}"
: "${SOLR_PASSWORD:?SOLR_PASSWORD is required}"
: "${SOLR_HOME:?SOLR_HOME is required}"

if [[ ! "$SOLR_USERNAME" =~ ^[A-Za-z0-9_.@-]+$ ]]; then
    printf '%s\n' 'SOLR_USERNAME must contain only letters, digits, _, ., @ or -' >&2
    exit 1
fi

umask 077
salt="$(openssl rand -base64 32)"
hash="$(
    { printf '%s' "$salt" | openssl base64 -d -A; printf '%s' "$SOLR_PASSWORD"; } |
        openssl dgst -sha256 -binary | openssl dgst -sha256 -binary | openssl base64 -A
)"
security_file="$(mktemp "$SOLR_HOME/security.json.XXXXXX")"
trap 'rm -f "$security_file"' EXIT
printf '{"authentication":{"class":"solr.BasicAuthPlugin","blockUnknown":true,"credentials":{"%s":"%s %s"}}}\n' \
    "$SOLR_USERNAME" "$hash" "$salt" > "$security_file"
mv "$security_file" "$SOLR_HOME/security.json"

exec solr-fg --user-managed
