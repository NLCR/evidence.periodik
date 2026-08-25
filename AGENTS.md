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

- `permonik-api/` - Spring Boot 4.1 REST API (Java 25, virtual threads enabled)
- `permonik-identity-gateway/` - Spring identity gateway/BFF (PostgreSQL users, Redis sessions, SAML, internal JWT)
- `permonik-web/` - React 19 + TypeScript frontend (Vite, MUI, Zustand, TanStack Query)
- `permonik-database/` - Solr 9.10 core configurations (`volume`, `specimen`, `edition`, `mutation`, `owner`, `metatitle`, `user`)

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
- `permonik-identity-gateway` owns users, login, logout, `/api/me`, `/api/user/**`, browser sessions and SAML
- basic login exists only in the `dev` profile; test/prod use Spring Security SAML with eduID discovery
- browser authentication uses an 8h Redis session and CSRF protection
- the gateway emits short-lived, audience-specific internal JWTs
- `permonik-api` is a stateless OAuth2 Resource Server and never reads browser sessions

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
./gradlew --no-configuration-cache :permonik-api:jibDockerBuild
./gradlew --no-configuration-cache :permonik-identity-gateway:jibDockerBuild
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

When considering a large number of mechanical tests around a change, treat that instinct as a failure signal. Discard the proposed tests and work through this reasoning loop instead:

1. To the best of your understanding, what is the desired outcome that needs to be proven?
2. Do the prior direction and context of the session refine, narrow, or simplify that outcome?
3. More broadly, what is the user trying to make work? Does that understanding further change or simplify the desired outcome?
4. What must be true for a verification method to faithfully demonstrate the integrity of that outcome?
5. What different verification ideas would you consider with fresh eyes, without being anchored to the current implementation?

Designing valuable verification is an expensive, careful, and intellectually demanding process. A test is only as valuable as its integrity with respect to the desired outcome. Fixtures and assertions that merely restate the implementation are unnecessary and wasteful by default. Proving that code behaves like itself should remain a narrow, justified exception only when it adds real value.

## Legacy Claude Migration

Legacy Claude-specific config has been migrated to this file.
