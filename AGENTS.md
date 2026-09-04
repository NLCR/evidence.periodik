# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Communication And Code Language

- Respond in the same language the user is using.
- Keep code artifacts in English (identifiers, comments, commit messages).

## Project Overview

PerMonik is a tool for comparing copies of regional newspaper mutations, part of the Czech IN-PROVE project. It includes:

- a Spring Boot Solr API backend
- a Kotlin export and integration API
- a React/TypeScript frontend
- Apache Solr for data storage

## Architecture

- `permonik-api/` - Spring Boot 4.1 REST API (Java 25, virtual threads enabled)
- `permonik-export-api/` - Spring Boot 4.1 export and integration API (Kotlin, PostgreSQL, Liquibase)
- `permonik-identity-gateway/` - Spring identity gateway/BFF (PostgreSQL users, Redis sessions, SAML, internal JWT)
- `permonik-web/` - React 19 + TypeScript frontend (Vite, MUI, Zustand, TanStack Query)
- `permonik-database/` - Solr 9.10 core configurations (`volume`, `specimen`, `edition`, `mutation`, `owner`, `metatitle`, `user`)

Core API pattern:
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
- `permonik-identity-gateway` owns users, login, logout, `/api/me`, `/api/user/**`, browser sessions and SAML
- basic login exists only in the `dev` profile; test/prod use Spring Security SAML with eduID discovery
- browser authentication uses an 8h Redis session and CSRF protection
- the gateway emits short-lived, audience-specific internal JWTs
- `permonik-api` and `permonik-export-api` are stateless OAuth2 Resource Servers and never read browser sessions

## Code Style And Configuration

- Prefer Lombok for Java boilerplate. Use final dependency fields with `@RequiredArgsConstructor` instead of handwritten assignment-only constructors.
- Preserve explicit constructors only when they contain real initialization, conversion or validation logic that Lombok cannot express safely.
- Use `@Getter` and `@Setter` selectively. Do not use `@Data` on mutable JPA entities because generated equality and string methods can traverse persistence state.
- Prefer typed `@ConfigurationProperties` records/classes over scattered `@Value` injection. Enable the Spring Boot configuration processor so custom properties are discoverable by IDEs.
- Keep explicit Gradle plugin and dependency versions in the root `build.gradle`; subprojects must consume the shared versions instead of declaring their own.
- Treat IDE deprecation, nullability, visibility and unresolved-configuration warnings as defects. Fix their cause rather than suppressing them or adding unsafe assertions.
- Prefer Java records for immutable DTOs and configuration values when they need no mutable lifecycle.
- Keep implementations minimal. Use standard Spring/Security/Gateway behavior before creating custom frameworks, filters, metadata loaders or compatibility layers.
- Stable protocol constants may be hardcoded. Deployment-specific URLs, credentials and secrets must be mandatory configuration without repository fallback values.
- This is a public repository. Never commit `.env` files, private keys, certificates, passwords or usable development credentials.
- New relational schemas use PostgreSQL 18.6 and Liquibase. Do not introduce Flyway.
- Java runtime images use Google's Distroless Java 25 non-root image unless a concrete runtime requirement prevents it.

Permissions:
- roles are `user`, `admin` and `digitalization`; do not introduce a super-administrator role
- keep the permission set small and operation-oriented; do not regenerate unused CRUD/read matrices
- permissions must be enforced by the owning backend; frontend checks are presentational only
- `admin` receives all application permissions, `digitalization` receives only `TEMPLATE_*`, and `user` receives no protected-operation permissions
- `USER_*` and `REFERENCE_WRITE` are global administration permissions, but volume, specimen and template operations must also match one of the principal's owner IDs for every role, including `admin`

## Build And Run Commands

Backend:
```bash
./gradlew :permonik-api:build
./gradlew :permonik-api:bootRun
./gradlew :permonik-api:test
./gradlew :permonik-export-api:test
./gradlew :permonik-export-api:bootRun
./gradlew :permonik-export-api:bootJar
./gradlew :permonik-identity-gateway:test
./gradlew :permonik-identity-gateway:bootRun
./gradlew :permonik-identity-gateway:bootJar
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
docker compose --env-file .env up --build --watch

# Deployment images
./gradlew --no-configuration-cache :permonik-api:jibDockerBuild
./gradlew --no-configuration-cache :permonik-export-api:jibDockerBuild
./gradlew --no-configuration-cache :permonik-identity-gateway:jibDockerBuild
```

Local Docker development:
- requires Docker Compose 2.32+ because backend reload uses `sync+exec`
- `./start-local.sh` is the convenience entry point and reads `.env` by default
- all Spring services run Gradle `bootRun` from the shared Java 25 development image in `infra/development/backend.Dockerfile`
- source changes are synchronized into the container, compiled with the affected module's `classes` task, and applied by Spring DevTools through `.reloadtrigger`
- `initial_sync` intentionally reconciles host sources with reused containers before watch begins; do not remove it unless `docker compose watch --no-up` is no longer supported
- Gradle configuration changes use `sync+restart`; development Dockerfile changes require `up --build --watch`
- each Spring service has a separate Gradle cache volume to avoid concurrent cache contention
- the admin frontend runs through Vite in a Node 24 Alpine development container from `infra/development/frontend.Dockerfile`; the public frontend is not started locally
- frontend files are synchronized for Vite HMR, while changes to `package.json`, `yarn.lock` or `.yarnrc.yml` rebuild the frontend image
- the gateway reaches the frontend directly through the Compose service name `permonik-web`
- local development images are not deployment artifacts; deployment images must continue to use Jib and Distroless Java 25

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
- protected operations require their specific permission, not merely an authenticated principal

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

## Verification Integrity

Source: <https://gist.github.com/vetteforspam-dot/b5bab1e567d318496ae9cbcfa2590c79>

When you catch yourself considering a large number of mechanical tests around the code, treat that instinct as a failure signal. Discard the proposed tests and work through the following reasoning loop instead:

1. To the best of your understanding, what is the desired outcome that needs to be proven?
2. Do the prior direction and context of the session refine, narrow, or simplify that outcome?
3. More broadly, what is the user trying to make work here? Does that understanding further change or simplify the desired outcome?
4. What must be true for a verification method to faithfully demonstrate the integrity of that outcome?
5. What different verification ideas would you consider if asked to look at it with fresh eyes, without being anchored to the current implementation?

Designing valuable verification is an expensive, careful, and intellectually demanding process. A test is only as valuable as its integrity with respect to the desired outcome. Fixtures and assertions that merely restate the implementation should be treated as unnecessary and wasteful by default. Proving that the code behaves like itself should remain a narrow, justified exception only when it adds real value.
