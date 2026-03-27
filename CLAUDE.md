# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication & Code Language

Always respond in the same language the user is speaking. Code (variables, comments, commit messages) must always be written in English.

## Project Overview

PerMonik is a tool for comparing copies of regional newspaper mutations, part of the Czech IN-PROVE project. It consists of a Spring Boot API backend, a React/TypeScript frontend, and Apache Solr for data storage.

## Architecture

- **permonik-api/** — Spring Boot 3.5.7 REST API (Java 25, virtual threads enabled)
- **permonik-web/** — React 19 + TypeScript frontend (Vite, MUI, Zustand, TanStack Query)
- **permonik-database/** — Solr 9.10 core configurations (volume, specimen, edition, mutation, owner, metatitle, user)
- **permonik-gateway/** — Gateway service (Docker only)

**Backend pattern:** Controller → Service → Solr (via HttpSolrClient). MapStruct for DTO mapping. Lombok for boilerplate. Domain models use `@Field` annotations mapping to Solr field constants defined in `*Definition` classes.

**Frontend pattern:** Pages in `src/pages/`, API hooks via TanStack Query in `src/api/`, Zustand stores in `src/slices/`, Zod schemas in `src/schema/`, i18n translations (cs/sk/en) in `src/lang/`.

**Auth:** Form login (dev profile only) + Shibboleth (prod). Sessions stored in Redis (8h timeout). Security config in `config/security/auth/PermSecurityConfiguration.java`.

## Build & Run Commands

### Backend
```bash
./gradlew :permonik-api:build          # Build JAR
./gradlew :permonik-api:bootRun        # Run dev server (port 8080)
./gradlew :permonik-api:test           # Run tests
```

### Frontend
```bash
cd permonik-web
yarn install                            # Install dependencies
yarn dev                                # Dev server — admin mode (port 3000, proxies /api to :8080)
yarn dev-public                         # Dev server — public mode
yarn build                              # Production build (admin)
yarn build-public                       # Production build (public)
yarn lint                               # ESLint
yarn lint-fix                           # ESLint auto-fix
yarn format                             # Prettier
yarn test                               # Vitest
```

### Docker (full stack)
```bash
docker-compose up                       # API + Solr + Redis
```

## Key API Endpoints

All under `/api`: `/volume`, `/specimen`, `/mutation`, `/edition`, `/metaTitle`, `/owner`, `/user`, `/auth`, `/me`. Swagger UI available at `/swagger-ui.html` in dev profile.

GET endpoints are generally `permitAll()`. Mutations (POST/PUT/DELETE) require authentication.

## Solr Data Layer

No traditional ORM — domain objects map directly to Solr documents. Each entity has a `*Definition` class with field name constants (e.g., `VolumeDefinition.BAR_CODE_FIELD`). Queries use SolrQuery with these constants. Soft deletes via `deleted` field. Audit fields (`createdDate`, `modifiedDate`) via `Auditable` base class.

## CI/CD

GitLab CI (`.gitlab-ci.yml`) builds Docker images and pushes to GCR (`eu.gcr.io/inqool-1301/permonik/`). Branches: `main` (dev), `test`, `prod`. Builds are manual triggers.

## Frontend Build Modes

Vite uses `VITE_APP_MODE` env var: `admin` (full interface, default) or `public` (read-only). Separate Docker builds exist for each mode.