# PerMonik - nástroj pro porovnávání exemplářů regionálních mutací periodik

Realizováno za podpory projektu IN-PROVE : budování INtegrovaného prostředí pro PRůzkum, Ochranu, Výzkum a Evidenci novodobých knihovních fondů (DG16P02H020), který je financován z dotačního mechanismu Ministerstva kultury ČR NAKI.

## Lokální vývoj

Lokální stack vyžaduje Docker Desktop s Docker Compose 2.32 nebo novějším. Verzi lze ověřit příkazem:

```bash
docker compose version
```

Vytvořte lokální `.env.local` podle `.env.example` a vyplňte všechny hodnoty. Náhodné secrets lze vygenerovat například pomocí:

```bash
openssl rand -base64 48
```

For `CORE_EXPORT_GRPC_TOKEN`, use `openssl rand -hex 32` instead. This separate,
mandatory credential is supplied only to core and export. Never commit the populated
`.env.local` or reuse the identity JWT secret.

Celý backendový stack se spustí příkazem:

```bash
docker compose --env-file .env.local up --build --watch
```

Stejný příkaz včetně kontroly dostupnosti Dockeru poskytuje skript:

```bash
./start-local.sh
```

První build vytvoří společný Java 25 development image a naplní oddělené Gradle cache. Další spuštění a inkrementální kompilace jsou rychlejší.

| Služba | Lokální adresa |
| --- | --- |
| Admin frontend | `http://localhost:3000` |
| Core API | `http://localhost:8080` |
| Identity gateway | `http://localhost:8081` |
| Export API | `http://localhost:8082` |
| Identity PostgreSQL | `localhost:5433` |
| Export PostgreSQL | `localhost:5434` |
| Redis | `localhost:6379` |
| Solr | `http://localhost:8983` |

### Local memory limits

Each backend development container is limited to 2 GiB, including the application,
Gradle and hot-reload compilation. `JAVA_TOOL_OPTIONS` caps each JVM heap at
512 MiB; this also applies to processes started by Compose Watch.

The frontend container is limited to 2 GiB, with Node old-space capped at 1 GiB
per process. Solr remains limited to 2 GiB with a 1 GiB heap, PostgreSQL to
512 MiB per database and Redis to 100 MiB. Container limits are ceilings, not
reserved memory; the Docker Desktop VM memory limit still bounds the whole stack.
Restart Compose Watch through `./start-local.sh` to apply changed limits and env.

Admin varianta frontendu je součástí lokálního Compose stacku a běží přes Vite. Gateway ji načítá přímo z kontejneru `permonik-web`. Public varianta se v lokálním Compose nespouští.

### Solr authentication

Set `SOLR_USERNAME` and `SOLR_PASSWORD` in the ignored `.env.local` file. The username
accepts letters, digits, `_`, `.`, `@` and `-`; generate a password with
`openssl rand -hex 32`. Compose supplies the same account to Solr and core API.
The Solr Admin UI at `http://localhost:8983` requires these credentials too.

Solr stays in user-managed mode and keeps its existing indexes in `solr-data/`.
Its startup command generates `solr-data/data/security.json` from the env values,
storing only a salted password hash. Restarting replaces that authentication file;
rotate the account in `.env.local`, not through the Solr user-management API.

After adding or changing credentials, restart Compose Watch through
`./start-local.sh` so both containers receive the updated environment. Backend
source changes continue to use Watch sync and DevTools; no manual image rebuild
is needed. If running core API directly from an IDE, supply the same credentials
in its run environment.

Frontend lze v případě potřeby spustit také samostatně mimo Compose:

```bash
cd permonik-web
yarn install
yarn dev
```

### Hot reload backendu

Backendové služby běží ve vývojovém kontejneru přes Gradle `bootRun`. Compose Watch při změně pod `src`:

1. synchronizuje změněné soubory do kontejneru,
2. spustí `classes` pouze pro změněný Gradle modul,
3. aktualizuje `.reloadtrigger`,
4. nechá Spring DevTools restartovat aplikační context bez restartu kontejneru.

`initial_sync` před zahájením sledování srovná zdroje na hostu s již existujícím kontejnerem. Chrání hlavně spuštění přes samostatné `docker compose watch --no-up`; při čerstvém `up --build --watch` jde o bezpečnostní pojistku.

Změna Gradle konfigurace restartuje příslušný vývojový kontejner. Změna development Dockerfile vyžaduje nový `docker compose up --build --watch`.

### Hot reload frontendu

Compose Watch synchronizuje změny z `permonik-web` do Node 24 Alpine development kontejneru a Vite je aplikuje přes HMR. `node_modules`, lokální Yarn cache a build outputs se nesynchronizují. Změna `package.json`, `yarn.lock` nebo `.yarnrc.yml` znovu sestaví frontend image a nainstaluje závislosti přes `yarn install --immutable`.

Stack se ukončí příkazem:

```bash
docker compose down
```

## Deployment image

Lokální development image není určený k nasazení. Deployment image používají Java 25 Distroless runtime a vytvářejí se přes Jib:

```bash
./gradlew --no-configuration-cache :permonik-api:jibDockerBuild
./gradlew --no-configuration-cache :permonik-export-api:jibDockerBuild
./gradlew --no-configuration-cache :permonik-identity-gateway:jibDockerBuild
```

## Export API

The internal `BatchGetVolumeContents` gRPC service and export stored-snapshot
client form the production export path. Compose supplies the explicit target
`static://permonik-api:9090`; the gRPC port is not published to the host. Authentication
uses the shared service token, not browser JWTs. Traffic is plaintext and must remain
on the trusted internal network. See [the contract README](permonik-core-contract/README.md)
for configuration, cross-owner service authorization, limits and Docker-free tests.
The export endpoints use PostgreSQL-backed templates, real core data and the production
calculation layer. Protected endpoints are under `/api/export/**`; finalized public
integration remains under `/api/integration/**`. PostgreSQL stores the versioned JSONB
snapshot, audit data and active-template uniqueness. `TemplateWorkflowService` provides
transactional editing and state transitions with finalization locks. Public integration
resolves barcodes directly against finalized template snapshots; it does not need a
separate barcode lookup RPC in core.

Vsechny `/api/export/**` operace vyzaduji jedinou permission `TEMPLATE_MANAGE`, kterou maji role `admin` a `digitalization`. Pristup je napric vsemi knihovnami bez owner kontrol; verejna integrace zustava bez autentizace. Owner omezeni core zapisu svazku a exemplaru tim nejsou zmenena. Po prechodu ze starych granularnich exportnich permissions je potreba nove prihlaseni, protoze session uchovava seznam authorities z okamziku prihlaseni.
