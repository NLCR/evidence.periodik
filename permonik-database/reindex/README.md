# Solr Schema Migration Script

This folder contains a migration script for moving data from the old Solr schema/index to the new schema.

## What it does

- reads documents from the old Solr instance
- transforms fields from old naming to new naming
- fills required denormalized fields for `volume` and `specimen`
- validates transformed docs against target `managed-schema.xml`
- writes transformed docs to the new Solr instance
- filters out soft-deleted documents while reading every migrated core
- removes specimens without a valid volume and volumes without a valid metatitle or specimen
- keeps the `Mladá fronta` metatitles but excludes their volumes and specimens

## Default ports

- old Solr: `http://localhost:8983/solr`
- new Solr: `http://localhost:8990/solr`

## Run

```bash
cd permonik-database/reindex
./.venv/bin/python reindex.py --delete-target
```

## Useful options

```bash
# Validation only, no writes
./.venv/bin/python reindex.py --dry-run

# Migrate only selected cores (dependencies are auto-added)
./.venv/bin/python reindex.py --cores volume,specimen --delete-target

# Custom Solr URLs
./.venv/bin/python reindex.py \
  --old-url http://localhost:8983/solr \
  --new-url http://localhost:8990/solr
```

The final orphan cleanup runs against the target Solr. It is skipped in `--dry-run` mode.
