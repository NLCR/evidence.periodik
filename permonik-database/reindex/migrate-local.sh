#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
readonly CORES=(metatitle edition mutation owner volume specimen user)
readonly OLD_URL_DEFAULT="http://localhost:8983/solr"
readonly NEW_URL_DEFAULT="http://localhost:8990/solr"
readonly WAIT_TIMEOUT_SECONDS=300

mode="dry-run"
old_url="$OLD_URL_DEFAULT"
new_url="$NEW_URL_DEFAULT"
batch_size="2000"
cores="$(IFS=,; echo "${CORES[*]}")"

usage() {
    cat <<'EOF'
Usage: ./migrate-local.sh [options]

Copies current configsets into a disposable Solr 10.1 target, starts the old and new
local helper instances, waits for all cores, and runs reindex.py. Production data must
be copied manually into old-solr-data/ first.

Options:
  --dry-run             Transform and validate without writing the target (default).
  --apply               Delete and rebuild documents in the disposable target.
  --old-url URL         Old helper Solr URL (default: http://localhost:8983/solr).
  --new-url URL         New helper Solr URL (default: http://localhost:8990/solr).
  --batch-size NUMBER   Cursor page size (default: 2000).
  --cores LIST          Comma-separated core list (default: all cores).
  -h, --help            Show this help.

Set OLD_SOLR_IMAGE when the copied production data came from a different old Solr
version. The default is solr:9.10.0.
EOF
}

die() {
    printf 'error: %s\n' "$1" >&2
    exit 1
}

wait_for_core() {
    local base_url="$1"
    local core="$2"
    local deadline=$((SECONDS + WAIT_TIMEOUT_SECONDS))
    while ((SECONDS < deadline)); do
        if curl --fail --silent --show-error \
            "$base_url/$core/admin/ping?wt=json" >/dev/null 2>&1; then
            return
        fi
        sleep 2
    done
    die "timed out waiting for $base_url/$core"
}

prepare_target_configsets() {
    [[ -d "$SCRIPT_DIR/../cores" ]] || die "current configsets are missing: $SCRIPT_DIR/../cores"
    mkdir -p "$SCRIPT_DIR/new-solr-data/data"

    local core
    for core in "${CORES[@]}"; do
        [[ -f "$SCRIPT_DIR/../cores/$core/conf/managed-schema.xml" ]] || \
            die "managed-schema.xml is missing for core '$core'"
        mkdir -p "$SCRIPT_DIR/new-solr-data/data/$core"
        rm -rf "$SCRIPT_DIR/new-solr-data/data/$core/conf"
        cp -a "$SCRIPT_DIR/../cores/$core/conf" "$SCRIPT_DIR/new-solr-data/data/$core/"
        touch "$SCRIPT_DIR/new-solr-data/data/$core/core.properties"
    done
}

while (($# > 0)); do
    case "$1" in
        --dry-run)
            mode="dry-run"
            ;;
        --apply)
            mode="delete-target"
            ;;
        --old-url)
            (($# >= 2)) || die "--old-url requires a value"
            old_url="$2"
            shift
            ;;
        --new-url)
            (($# >= 2)) || die "--new-url requires a value"
            new_url="$2"
            shift
            ;;
        --batch-size)
            (($# >= 2)) || die "--batch-size requires a value"
            batch_size="$2"
            shift
            ;;
        --cores)
            (($# >= 2)) || die "--cores requires a value"
            cores="$2"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            die "unknown option: $1"
            ;;
    esac
    shift
done

[[ -d "$SCRIPT_DIR/old-solr-data/data" ]] || \
    die "copy the production Solr data into $SCRIPT_DIR/old-solr-data first"
[[ -x "$SCRIPT_DIR/.venv/bin/python" ]] || \
    die "create the virtualenv first: python3 -m venv $SCRIPT_DIR/.venv"

prepare_target_configsets

cd "$SCRIPT_DIR"
docker compose -f "$COMPOSE_FILE" up -d permonik-database-old permonik-database-new

for core in "${CORES[@]}"; do
    wait_for_core "$old_url" "$core"
    wait_for_core "$new_url" "$core"
done

printf 'Source: %s\nTarget: %s\nCores: %s\nMode: %s\n' \
    "$old_url" "$new_url" "$cores" "$mode"

"$SCRIPT_DIR/.venv/bin/python" "$SCRIPT_DIR/reindex.py" \
    --old-url "$old_url" \
    --new-url "$new_url" \
    --batch-size "$batch_size" \
    --cores "$cores" \
    "--$mode"

printf '\nMigration finished. Keep both helper data directories until verification and rollback are complete.\n'
