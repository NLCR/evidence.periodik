# Identity User Migration

`import-users.sh` performs the one-time migration directly from the local Solr `user` core to the identity gateway PostgreSQL database. It preserves user UUIDs, BCrypt hashes and owner UUIDs. No CSV export or manual data transformation is needed.

## Requirements

- Solr is reachable at `http://localhost:8983/solr`.
- The identity schema has already been created by Liquibase.
- `curl`, `jq` and `psql` are installed.
- The repository root contains `../../.env` with `IDENTITY_DATABASE_PASSWORD`, or PostgreSQL authentication is available through another standard mechanism such as `.pgpass`.

## Run

Stop user administration writes, back up both databases, and run:

```bash
permonik-identity-gateway/migration/import-users.sh
```

For a non-local target, override `IDENTITY_DATABASE_URL` with a JDBC or PostgreSQL URL. The default is `postgresql://permonik@localhost:5433/permonik_identity`.

The script:

1. Reads all documents from the Solr `user` core.
2. Verifies that Solr did not truncate the result.
3. Normalizes usernames and emails and maps legacy `super_admin` to `admin`.
4. Treats accounts with a password hash as local accounts.
5. Maps passwordless federated accounts to one of the four allowed IdPs by the ePPN domain (`svkul.cz`, `mzk.cz`, `nkp.cz`, or `vkol.cz`).
6. Upserts users by UUID and replaces their owner assignments in one PostgreSQL transaction.

The migration fails without writing anything when it encounters an unsupported role, a duplicate normalized username, or a passwordless account whose ePPN domain cannot be mapped safely. Email addresses are not identity keys and may be shared by multiple legacy accounts. The script is idempotent and can be rerun.
