# Test deployment

`docker-compose-test.yml` is a public template. The test server uses a manually
maintained copy with concrete deployment values. Keep that server-local file
outside the repository; neither it nor its secrets belong in GitLab or the public
GitHub mirror. An external env file or shell variables are also supported, but
are not required when every reference is replaced in the server-local YAML.

## Build the test images

After merging the deployment changes from `main` into `test`, run the three manual
test jobs in the pipeline for the resulting `test` commit:

- `test_permonik_api`
- `test_permonik_identity_gateway`
- `test_permonik_export_api`

The runner needs Java 25, Docker access for Testcontainers, and registry credentials
for Jib. Then run all five manual image jobs from that same pipeline:

- `build_permonik_api_test`
- `build_permonik_export_api_test`
- `build_permonik_identity_gateway_test`
- `build_permonik_web_admin_test`
- `build_permonik_web_public_test`

The jobs publish images under `eu.gcr.io/inqool-1301/permonik/test/`, tagged with
`CI_COMMIT_SHORT_SHA` and `latest`. The server Compose file uses fixed `latest`
tags for all five application images. Finish all five builds from the same test
pipeline before pulling on the server. CI builds images only; it does not deploy.

## Fill in the server-local Compose file

Replace each `${NAME...}` reference in the server copy with its concrete value:

| Value | Where it must match |
| --- | --- |
| `IDENTITY_JWT_SECRET` | Core API, export API and identity gateway; at least 32 UTF-8 bytes. |
| `IDENTITY_DATABASE_PASSWORD` | Identity gateway and identity PostgreSQL. |
| `EXPORT_API_DATABASE_PASSWORD` | Export API and export PostgreSQL. |
| `CORE_EXPORT_GRPC_TOKEN` | Core API and export API only; exactly 64 hexadecimal characters. |
| `SOLR_USERNAME` | Solr and core API; a technical account using letters, digits, `_`, `.`, `@` or `-`. |
| `SOLR_PASSWORD` | Solr and core API; also supply it when running the user import script. |
| `SENTRY_DSN` | Core error reporting; an empty string disables the DSN. |
| `SENTRY_RELEASE` | Optional core Sentry release identifier; use the actual built commit SHA or an empty string. |

Generate the gRPC token with `openssl rand -hex 32`; do not reuse the JWT secret.
Quote inline YAML secrets. If a literal value contains `$`, write `$$` in the
Compose file so Compose does not interpret it as variable interpolation.

Retain these non-secret service settings:

- Export database URL:
  `jdbc:postgresql://permonik-export-api-database:5432/permonik_export`.
- Core gRPC target: `static://permonik-api:9090`.
- Gateway export URL: `http://permonik-export-api:8080`.
- Identity PostgreSQL data: `/data/postgresql/identity:/var/lib/postgresql`.
- Export PostgreSQL data: `/data/postgresql/export:/var/lib/postgresql`.
- Core file logging: `/tmp/permonik-api.log`, writable by the non-root runtime.

Export API, export PostgreSQL and core gRPC have no published host ports. The
gateway remains the HTTP entry point on port 8080. The export service waits for
its PostgreSQL health check; Liquibase creates its schema on startup.

Prepare both host directories with permissions allowing the PostgreSQL image to
initialize its data. PostgreSQL 18 stores its versioned data directory beneath
`/var/lib/postgresql`, so mount that parent directory rather than the legacy
`/var/lib/postgresql/data` path. If either database already has data in a Docker
named volume, migrate or restore it to the corresponding host directory before
switching mounts; an empty host directory initializes a new database.

## Solr authentication

Solr remains in user-managed mode. Its Compose startup command reads `SOLR_USERNAME`
and `SOLR_PASSWORD`, generates a salted password hash with the image's OpenSSL,
atomically writes `$SOLR_HOME/security.json`, then executes `solr-fg --user-managed`.
No extra image or server-side script is needed. The plaintext password is not
written to `security.json` or printed by the startup command.

This deliberately provides one shared technical account with access to all Solr
operations; it enables authentication, not separate per-user authorization. The
env values are authoritative: every restart replaces the authentication file,
so change the server Compose values to rotate credentials rather than using the
Solr user-management API. Keep the same credentials in Solr and core API.

Anonymous and incorrect-password requests return 401. Solr Admin UI and direct
tools use the same credentials. Existing indexes stay in `/data/solr` and do not
need reindexing. Core API supports absent credentials for unauthenticated local
development/tests, but the test Compose template requires both values.

## First identity-gateway rollout

Replacing the old Apache/Shibboleth gateway also requires a separate user migration:

- Preserve the existing Solr data and back it up before the rollout.
- Provide readable `sp-key.pem` and `sp-cert.pem` under
  `/opt/shibboleth-sp-config`; the RSA key must use PKCS#8 (`BEGIN PRIVATE KEY`).
- Retain the test SAML entity ID, ACS and admin/public hostnames from the template.
- Verify access to eduID metadata and HTTPS forwarding from the external proxy.
- Create the identity schema through the gateway's Liquibase startup, then import
  existing users before reopening user traffic.

See `permonik-identity-gateway/migration/README.md`. The current import script
requires `curl`, `jq` and `psql`, reads Solr at `localhost:8983`, and defaults to
identity PostgreSQL at `localhost:5433`. The test Compose file does not publish
that PostgreSQL port: arrange a temporary migration connection and explicitly
supply `IDENTITY_DATABASE_URL`, PostgreSQL authentication, `SOLR_USERNAME` and
`SOLR_PASSWORD`. The script otherwise looks for
credentials in `.env.local`; it does not read values from the server Compose file.

## Apply the prepared server copy

In the directory containing the completed server-local `docker-compose-test.yml`:

```sh
docker compose -f docker-compose-test.yml config --quiet
docker compose -f docker-compose-test.yml pull
docker compose -f docker-compose-test.yml up -d --remove-orphans
docker compose -f docker-compose-test.yml ps
```

These commands do not need an env file when the server YAML contains every concrete
value. Keep the existing Compose project name so persistent volumes are reused.
The first gateway migration needs a maintenance window; complete user import and
verify SAML login, owner-restricted core writes and protected export operations
before reopening access. Do not remove database volumes when replacing containers.
