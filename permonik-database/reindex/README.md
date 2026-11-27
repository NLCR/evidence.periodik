# Solr schema and index migration

This is the production migration procedure for a Solr upgrade or a schema/data-model
change. It deliberately uses two local helper Solr instances:

1. an old-version instance containing a copy of the production data;
2. a new-version instance built from the current `permonik-database/cores/` configsets.

The migration script talks only to these helper instances. It does not connect directly
to the production Solr and it does not need authentication for the helper instances.
Production data is downloaded from production and the resulting index is uploaded to
production manually by the operator.

## Important data semantics

The current script is a production-oriented migration, not a byte-for-byte backup:

- it reads only documents without the `deleted` field;
- it applies the field-name and denormalized-field transformations in `reindex.py`;
- it drops specimens whose volume is missing;
- it drops volumes whose metatitle or specimen is missing;
- it excludes volumes and specimens belonging to the hard-coded `Mladá fronta`
  metatitles;
- it recalculates `number_sort_key` and target-schema fields.

Review the skipped-document output before switching production. If deleted documents,
excluded historical content, or orphaned documents must be retained, do not use this
script unchanged.

This filtering and transformation logic is intentionally a one-time migration step for
the current production data. After the first Solr 10.1/data-model migration is verified
in production, simplify `reindex.py` into a normal reindex: copy the source documents
from the old helper instance to a new instance built from the current configsets, with
no hard-coded `Mladá fronta` exclusion, orphan cleanup, or legacy field-name migration.
Keep only the target-index/schema rebuild logic that is still required.

## 1. Freeze and back up production

Before downloading anything:

1. announce a maintenance window and stop all writes to PerMonik;
2. keep the old production Solr data and the old production Compose/image version
   untouched until the new deployment has passed smoke checks;
3. take and verify a backup/snapshot of production `/data/solr`;
4. record document counts for every core and preserve the old production
   `docker-compose` file and Solr image tag for rollback.

The source must not change while the migration is reading it. Otherwise the cores can
represent different points in time.

## 2. Prepare local helper instances

Use the old Solr image/version for the downloaded production data. Do not start an old
Solr data directory with Solr 10.1. The old helper is normally exposed on `8983`.

The new helper is defined in `docker-compose.yml` and is exposed on `8990`:

```bash
cd permonik-database/reindex
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt
```

For inspecting upstream Solr changes before updating the project configsets, start the
disposable `permonik-database-precreate` service on port `8991`. It contains the
upstream `gettingstarted` config for Solr 10.1.0 and is only a comparison/reference
instance; it is not used by the migration wrapper and must not receive production data.

The whole local preparation and migration can be run with `migrate-local.sh`. The only
manual data step is copying the production `/var/solr` contents into
`reindex/old-solr-data/`. The script starts the old helper with `OLD_SOLR_IMAGE` (default
`solr:9.10.0`), prepares the new target and waits for all cores.

Prepare the new helper data directory with the current configsets before starting it.
The target must be empty or a disposable previous migration target:

```bash
mkdir -p new-solr-data/data

for core in metatitle edition mutation owner volume specimen user; do
  mkdir -p "new-solr-data/data/$core"
  cp -a "../cores/$core/conf" "new-solr-data/data/$core/"
  touch "new-solr-data/data/$core/core.properties"
done
```

Then start the new helper:

```bash
docker compose up -d permonik-database-new
```

Wait until the actual core endpoints respond; a running container alone is not enough:

```bash
for core in metatitle edition mutation owner volume specimen user; do
  until curl --fail --silent "http://localhost:8990/solr/$core/admin/ping?wt=json" >/dev/null; do
    sleep 2
  done
done
```

The helper Compose file uses Solr 10.1.0 and user-managed standalone mode. The old
helper must likewise run in user-managed mode with the old Solr version.

After copying the old production data into `old-solr-data/`, use the wrapper:

```bash
# Safe first pass: no target documents are written.
./migrate-local.sh --dry-run

# Actual rebuild after reviewing the dry-run output.
./migrate-local.sh --apply
```

Use `OLD_SOLR_IMAGE=solr:<actual-old-version>` when production used a different Solr
version. The wrapper leaves both helper instances running so their data can be checked
and the migration can be rerun; stop them manually after verification.

## 3. Validate the migration without writing

Run this first. It reads and transforms every selected source document, validates it
against the current target schemas, and writes nothing:

```bash
./.venv/bin/python reindex.py \
  --old-url http://localhost:8983/solr \
  --new-url http://localhost:8990/solr \
  --dry-run
```

Save the complete output. Resolve unexpected validation failures and review every
skipped-document reason before continuing.

## 4. Reindex into the new helper

Only run `--apply` against the disposable new helper. The wrapper removes and recreates
the complete `new-solr-data/` directory first. This is required when field index options
changed: deleting documents alone leaves old Lucene segments with the previous schema.

```bash
./migrate-local.sh --apply \
  2>&1 | tee migration-$(date +%Y%m%d-%H%M%S).log
```

The script migrates cores in dependency order:

`metatitle`, `edition`, `mutation`, `owner`, `volume`, `specimen`, `user`.

It commits each core and performs the final orphan cleanup on the target. Do not delete
the old helper data after this step.

## 5. Verify the new index

At minimum:

1. compare source and target counts for every core, accounting for the documented
   filters and skipped documents;
2. inspect the migration log for all skipped documents;
3. verify representative volume/specimen records and denormalized owner/metatitle,
   edition and mutation fields;
4. verify search, locale sorting, facets, number sorting and atomic updates;
5. run the backend regression check:

```bash
cd ../..
./gradlew :permonik-api:test --tests '*SolrIndexLayoutTest'
```

Keep the old and new count reports with the migration log as the rollout record.

## 6. Transfer and activate production

The operator performs the transfer. Copy the completed **new Solr 10.1 data** from
`new-solr-data/` to the production Solr data location only after the verification in
the previous step. Do not copy the old Lucene index files.

On production:

1. stop the application and Solr during the maintenance window;
2. preserve the old `/data/solr` as the rollback copy;
3. replace it with the verified Solr 10.1 helper data;
4. ensure the server-local Compose directory contains the matching read-only
   `scripts/start-solr.sh`;
5. start the Solr 10.1 service with the production Solr credentials;
6. wait for real core queries to stop returning `503`;
7. start the backend services and run application smoke checks.

The production Compose file recreates `security.json` on startup from
`SOLR_USERNAME` and `SOLR_PASSWORD`. The credentials must remain identical to those
used by the core API.

## 7. Rollback

If verification fails, stop the new stack and restore the saved old `/data/solr`.
Start it with the saved old production Compose file and old Solr image, not with Solr
10.1. Keep the old backup until the new application and all important user flows have
been verified in production.

## Local helper defaults

- old Solr: `http://localhost:8983/solr`;
- new Solr: `http://localhost:8990/solr`;
- batch size: `2000` documents;
- target configsets: `../cores/<core>/conf`.

Useful options:

```bash
# Migrate only selected cores; dependencies are added automatically.
./.venv/bin/python reindex.py --cores volume,specimen --delete-target

# Use a larger or smaller cursor page.
./.venv/bin/python reindex.py --batch-size 1000 --dry-run
```
