# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Communication And Code Language

- Respond in the same language the user is using.
- Keep code artifacts in English (identifiers, comments, commit messages).

## Project Overview

PerMonik is a tool for comparing copies of regional newspaper mutations, part of the Czech IN-PROVE project. It includes:

- a Spring Boot API backend
- a React/TypeScript frontend
- Apache Solr for data storage

## Architecture

- `permonik-api/` - Spring Boot 3.5.7 REST API (Java 25, virtual threads enabled)
- `permonik-web/` - React 19 + TypeScript frontend (Vite, MUI, Zustand, TanStack Query)
- `permonik-database/` - Solr 9.10 core configurations (`volume`, `specimen`, `edition`, `mutation`, `owner`, `metatitle`, `user`)
- `permonik-gateway/` - gateway service (Docker only)

Backend pattern:
- Controller -> Service -> Solr (`HttpSolrClient`)
- MapStruct for DTO mapping
- Lombok for boilerplate
- Domain models use `@Field` annotations mapped to constants in `*Definition` classes

Frontend pattern:
- pages in `src/pages/`
- API hooks with TanStack Query in `src/api/`
- Zustand stores in `src/slices/`
- Zod schemas in `src/schema/`
- i18n translations (`cs`, `sk`, `en`) in `src/lang/`

Auth:
- form login (dev profile only) + Shibboleth (prod)
- Redis-backed sessions (8h timeout)
- configuration in `config/security/auth/PermSecurityConfiguration.java`

## Build And Run Commands

Backend:
```bash
./gradlew :permonik-api:build
./gradlew :permonik-api:bootRun
./gradlew :permonik-api:test
```

Frontend:
```bash
cd permonik-web
yarn install
yarn dev
yarn dev-public
yarn build
yarn build-public
yarn lint
yarn lint-fix
yarn format
yarn test
```

Docker:
```bash
docker-compose up
```

## API Notes

Base path is `/api` with endpoints such as:
- `/volume`
- `/specimen`
- `/mutation`
- `/edition`
- `/metaTitle`
- `/owner`
- `/user`
- `/auth`
- `/me`

Swagger UI is available at `/swagger-ui.html` in the dev profile.

Authorization:
- GET endpoints are generally `permitAll()`
- POST/PUT/DELETE endpoints require authentication

## Solr Data Layer Notes

- No ORM; domain objects map directly to Solr documents
- Each entity has a `*Definition` class for field name constants
- Soft deletes use a `deleted` field
- Audit fields (`createdDate`, `modifiedDate`) come from `Auditable`

Denormalization write pattern:
- `Volume` and `Specimen` embed names from reference entities
- on save, `resolveXxxReferenceNames()` must refresh names via `ReferenceDataService`
- do not trust frontend-provided denormalized names

Cascade updates:
- `DenormalizationService` handles atomic updates when a reference entity is renamed
- use `SolrInputDocument` with `Map.of("set", value)` to patch specific fields

Circular-dependency avoidance:
- `ReferenceDataService` provides direct Solr lookups for reference entities

Locale-aware sorting:
- sort fields follow `{entity}_name_{lang}_sort` (example: `edition_name_cs_sort`)
- frontend sends `lang` (`cs`/`sk`/`en`) from `i18n.language`
- default language is `cs`

`pdate` stats:
- `FieldStatsInfo.getMin()/getMax()` returns `java.util.Date`
- cast and convert using `((Date) statsInfo.get(FIELD).getMin()).toInstant()`

## CI/CD

- Pipeline file: `.gitlab-ci.yml`
- Builds Docker images and pushes to `eu.gcr.io/inqool-1301/permonik/`
- Main branches: `main` (dev), `test`, `prod`
- Builds are manually triggered

## Frontend Build Modes

Vite mode is controlled by `VITE_APP_MODE`:

- `admin` (full interface, default)
- `public` (read-only)

Separate Docker builds exist for each mode.

## Legacy Claude Migration

Legacy Claude-specific config has been migrated to this file.
