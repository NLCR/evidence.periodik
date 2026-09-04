# PerMonik - nástroj pro porovnávání exemplářů regionálních mutací periodik

Realizováno za podpory projektu IN-PROVE : budování INtegrovaného prostředí pro PRůzkum, Ochranu, Výzkum a Evidenci novodobých knihovních fondů (DG16P02H020), který je financován z dotačního mechanismu Ministerstva kultury ČR NAKI.

## Lokální vývoj

Lokální stack vyžaduje Docker Desktop s Docker Compose 2.32 nebo novějším. Verzi lze ověřit příkazem:

```bash
docker compose version
```

Vytvořte lokální `.env` podle `.env.example` a vyplňte všechny hodnoty. Náhodné secrets lze vygenerovat například pomocí:

```bash
openssl rand -base64 48
```

Celý backendový stack se spustí příkazem:

```bash
docker compose --env-file .env up --build --watch
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

Admin varianta frontendu je součástí lokálního Compose stacku a běží přes Vite. Gateway ji načítá přímo z kontejneru `permonik-web`. Public varianta se v lokálním Compose nespouští.

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
