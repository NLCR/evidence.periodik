# Core Export Contract

`permonik/core/v1/core_export.proto` is the internal read-only boundary between
`permonik-api` (server) and `permonik-export-api` (caller). Data flows
from core to export; RPC requests flow in the opposite direction. This module
contains generated Java messages and gRPC stubs usable from both Java and Kotlin.
It has no Spring runtime, transport, handlers, client beans, Solr access or domain
calculations. The existing HTTP contract and export mock are unchanged.

## Build and Spring Integration

From the repository root:

```sh
./gradlew :permonik-core-contract:build
./gradlew :permonik-api:compileJava :permonik-export-api:compileKotlin
```

The protobuf Gradle plugin generates sources under `build/generated/sources/proto/main`
and automatically includes them in Java compilation. The ordinary library JAR
contains the messages, stubs and `.proto` resource; generated files are not committed.
The protobuf Gradle plugin version is centralized in the root `build.gradle`.
The contract imports `SpringBootPlugin.BOM_COORDINATES` using Spring's dependency
management plugin, without applying the Boot application plugin or adding Spring
runtime dependencies. Runtime dependencies are versionless; `protoc` and
`protoc-gen-grpc-java` use the imported BOM's `protobuf-java.version` and
`grpc-java.version` properties directly. No separately pinned gRPC BOM is needed.

Verified against the official [Spring Boot 4.1 gRPC documentation](https://docs.spring.io/spring-boot/4.1/reference/io/grpc.html)
and [Boot 4.1.1 BOM](https://repo.maven.apache.org/maven2/org/springframework/boot/spring-boot-dependencies/4.1.1/spring-boot-dependencies-4.1.1.pom):
Boot 4.1.1 manages Spring gRPC 1.1.1, gRPC Java 1.83.1 and protobuf 4.35.1.
Dependency resolution and clean generation verified these versions with protobuf
Gradle plugin 0.9.6.
Do not select an older community starter or add a separate Spring gRPC BOM override.

Core now includes `org.springframework.boot:spring-boot-starter-grpc-server` and
export includes `org.springframework.boot:spring-boot-starter-grpc-client`, both
resolved to 4.1.1 by existing Boot dependency management. Neither starter belongs
in this contract-only library. `CoreExportGrpcService` implements
`BatchGetVolumeContents` and `SearchReplacementVolumes`; the other declared RPCs are denied by the global
`CoreExportSecurityConfiguration` native Spring gRPC security chain, including for authenticated callers.
Reflection and health services are explicitly disabled. Netty listens on 9090,
separate from HTTP 8080; servlet gRPC is disabled and Compose does not publish 9090.

The handler uses `ReferenceDataService` and `SpecimenService`, with private wire-conversion methods:
one active-volume ID query and cursor-paged specimen
queries (1000 records/page, ID ascending). No REST calls, existence filtering,
calculation algorithms or duplicate Solr layer are involved. Both reads load full
stored documents, without field projections. Owner labels come from the required
denormalized volume fields, just like mutation names, not an optional active-owner
join. They reflect stored metadata; no separate guarantee of current reference names
or referential integrity is made, including when an owner has been deleted.

`CoreVolumeClient` uses Boot's managed named `core` channel and Spring's
`BearerTokenAuthenticationInterceptor`. Its target is mandatory. Calls get a fresh
10-second deadline; there are no application retries or automatic batch splitting.
The client maps every field to pure `StoredVolumeSnapshot`/`StoredSpecimenSnapshot`
values without protobuf or Spring dependencies. These retain raw required flags,
exact instants, unknown codes, list order and duplicate damage/page values.
These data classes live beside the client, not in the calculation package. Reusing
`VolumeSnapshot` would lose timestamp precision, metadata, unknown mark types and
duplicate damage codes.

`VolumeCalculationService` connects this client to the pure replacement calculator
for a primary volume and explicit replacement IDs in priority order. It splits reads
into batches of at most 20; a failed read fails the entire calculation, without partial
results. Separate batches are not a transactional snapshot of Solr.
Boundary conversion uses UTC calendar days, retains raw flags/page lists, and treats
damage codes as a set for calculation. Unsupported mutation-mark types fail explicitly
rather than changing matching semantics. The result contains recorded coverage and
data warnings, not a certified ideal-list coverage. This internal service performs no
end-user authorization; export HTTP entry points require the global `TEMPLATE_MANAGE` permission, not an owner check.
Its `findReplacementCandidates` operation drains all search pages, excludes selected
source IDs, loads candidate contents and invokes the existing `evaluateCandidates`
calculation once. Candidates are ranked against the same prioritized baseline, not
independently against the untouched primary volume. Failures propagate rather than
returning an incomplete ranking.
The client never generates missing issues or certifies historical completeness. Mock endpoints do not use this
client and remain unchanged. Jib/Distroless settings remain unchanged.

### Internal Service Authentication

This is an explicitly trusted, cross-owner service read, not a delegated user
operation. Both services require the same `CORE_EXPORT_GRPC_TOKEN`: exactly 64 random
hexadecimal characters, generated locally with `openssl rand -hex 32`. There is no
fallback credential. `.env.example` has a blank entry; never commit the populated
`.env`, log the token or pass it to the gateway/frontend. Compose supplies it only
to core and export. Rotate it by replacing the value in both services and applying
the configuration together; old and new tokens are not accepted simultaneously.

The client sends `authorization: Bearer <token>`, parsed by Spring's standard bearer
extractor. The global server interceptor uses `MessageDigest.isEqual` and permits only
the exact batch and replacement-search methods. Missing, wrong or user-JWT credentials return `UNAUTHENTICATED`;
other declared RPCs with valid credentials return `PERMISSION_DENIED`. There is no
service JWT issuer, audience or user-role claim here. Existing audience-specific
HTTP JWT security is unchanged and its tokens are not service credentials.

This deployment uses **plaintext on the trusted internal Compose network**. The
token authenticates the caller but does not encrypt traffic or authenticate the
server. Network access must remain restricted to trusted services; do not publish
or publicly route this port. TLS and other deployment platforms are not configured
by this change. No token is ever placed in a URL.

Trusted core source reads intentionally span owners. Export/template HTTP handlers
enforce the single global `TEMPLATE_MANAGE` permission, without primary-owner checks.
This user authorization is separate from RPC service authentication.
This service credential must never be treated as an end-user permission grant.

### Configuration and Verification

| Setting | Meaning |
| --- | --- |
| `CORE_EXPORT_GRPC_TOKEN` | Mandatory shared credential in core and export only. |
| `CORE_EXPORT_GRPC_TARGET` | Mandatory export target; Compose sets `static://permonik-api:9090`. Standalone callers must explicitly supply their reachable target. |
| `permonik.core-export.grpc.deadline` | Export per-call timeout, 10s by default; positive and at most 5 minutes. |
| `permonik.core-export.grpc.max-response-bytes` | Core protobuf response budget, 4194304 bytes by default. |
| `spring.grpc.client.channel.core.inbound.message.max-size` | Export receive limit, 4MB by default; align with the server if increased. |

The server counts retained protobuf payloads during collection and checks the exact
final response size before sending any data. Oversized batches fail atomically with
`RESOURCE_EXHAUSTED`; a smaller batch may work, but a single oversized volume still
fails. Cursor exhaustion and result counts are checked; partial or incomplete Solr
responses fail with `UNAVAILABLE`, not `NOT_FOUND` or an empty list. Malformed source
periodicity/timestamps fail visibly with `INTERNAL`. Cross-core transactional or
immutable snapshot guarantees are not provided.

The export adapter rejects invalid caller batches locally with
`IllegalArgumentException`. Remote failures retain native gRPC statuses rather than
a parallel exception hierarchy. Missing/reordered volume responses, duplicate/blank
specimen IDs, absent required fields (including nested owner/name/mark members),
and invalid timestamps produce `DATA_LOSS`. Missing required stored fields also
fail on the server with `DATA_LOSS` and the Solr field name. Future HTTP handlers own
safe HTTP translation; no new global HTTP behavior is installed on mocks.

Run the Docker-free boundary verification and export/contract tests with:

```sh
./gradlew :permonik-api:test --tests '*CoreVolumeGrpcIntegrationTest'
./gradlew :permonik-export-api:test :permonik-core-contract:build
./gradlew :permonik-api:bootJar :permonik-export-api:bootJar
```

`CoreVolumeGrpcIntegrationTest` lives in the normal core `src/test/java` tree. Its
non-transitive export-project dependency plus explicit Kotlin/gRPC test dependencies
keep export's JDBC/Liquibase runtime out of core test contexts, without disabling
their auto-configuration. It starts actual Boot-managed gRPC servers, runs
authenticated generated stubs and the export adapter in-process and over loopback,
and mocks only Solr at the read boundary. It checks auth denial (including signed
user JWTs), method denial, ordered complete cursor reads, optional/unknown source data,
required-field rejection on both sides, zero versus absent page counts,
whole-batch errors, response limits and deadlines. Test credentials are ephemeral.
Boot 4.1.1 requires a test-only virtual-target customizer for named in-process
channels; the production Netty named channel uses Boot's normal target resolution.
These tests do not verify a live Solr schema, deployment networking or a running
Compose stack. Existing Solr integration tests require Docker and are separate.

It runs with the standard `test` and `check` tasks and is not packaged in the
application JAR. There is no separate gRPC source set or test task.

The shared development image copies this module. Compose synchronizes it (excluding
build output) and restarts services, so Gradle regenerates/recompiles the library.
The gateway has no dependency on the contract but configures the same root build.
Alpine requires `gcompat` for the Maven-distributed native code generators.

## RPC Semantics

Batch reads and replacement search are implemented. Planning and barcode RPC descriptions specify
future semantics, not callable implementations.
All IDs are opaque nonblank strings, not parsed integers. All reads exclude soft
deletes. References are server-owned; callers cannot provide authoritative volume,
owner or specimen data. No RPC accepts arbitrary Solr queries or field masks.

| RPC | Purpose and result |
| --- | --- |
| `BatchGetVolumeContents` | Load 1..20 distinct volume IDs, including a single primary ID. Return complete metadata and all stored non-deleted specimens in request volume order. Missing or deleted IDs fail the entire RPC with `NOT_FOUND`; no silent omission or partial success. |
| `SearchReplacementVolumes` | Load the primary by ID, exclude it, require equal metatitle and inclusive overlap, then apply enabled owner/mutation/mutational-edition equality filters. Return paged metadata, never scores. |
| `QueryPlanningVolumes` | Filter by exact metatitle ID and inclusive stored `Volume.year` range (1..9999, from <= to), optionally mutation ID and mutational edition. No owner filter. Return paged metadata for export-side grouping and calculation. Stored year is required. |
| `ResolveVolumeBarcode` | Exact, case-sensitive barcode lookup with no trimming, numeric conversion or wildcard expansion. Blank input is invalid. No match returns `NOT_FOUND`; multiple active matches return `FAILED_PRECONDITION`, never the first match. Success returns only the internal volume ID. Export owns the finalized-template check and public response. |

Batch reads deliberately replace separate primary-volume, owner-lookup and
single-volume-content APIs. `Volume.owner` includes ID, name, shorthand and sigla;
`Volume.mutation_name` carries all three locales without a transport locale option.
Owner data is required stored denormalized metadata, not caller input. A missing
required owner field is invalid data, not a nullable reference or an invented label.
No separate ideal-list, fill-index or generic reference-data RPC is justified yet.

### Replacement Search

Metatitle equality and time overlap cannot be disabled. Enabled owner and mutation
filters compare required IDs exactly. Mutational-edition equality compares optional
mark text and required type, but not the human description. Unknown stored types must be reported by the
adapter, not mapped to `UNMARKED`.

Date comparisons use UTC calendar days (see below). Both stored boundaries are required:

```text
candidate.from <= primary.to AND candidate.to >= primary.from
```

A missing boundary is invalid source data, not an unbounded interval. An inverted
interval is invalid source data, not something to repair silently.

Search intentionally does not accept issues, source priorities or previously
computed indexes: core cannot rank a projected combined volume. Export drains all
pages, excludes already selected internal IDs, batch-loads contents and evaluates
each remaining candidate against the primary plus prior sources in priority order.
Only then does it sort by `dependentFillIndex` descending and volume ID ascending.
Specimen-level natural-number/attachment matching and ambiguity detection remain
in export's `SpecimenMatcher` and `ReplacementProjectionCalculator`.

### Planning Filter

Absent mutation ID means no filter; a present blank ID is invalid. An absent
`mutational_edition` means no filter. A nonblank mark is matched exactly; type, if
present, must be `MARK`, `NUMBER` or `UNMARKED` and also match exactly. An absent or
blank mark is allowed only with type `UNMARKED`, which then filters only by type.
Description never participates. Export translates the FE's empty filter object to
absence before calling core. Invalid combinations return `INVALID_ARGUMENT`.

Export drains the query, batch-loads contents, computes each volume's own fill index
and groups by stored year and owner ID. Core neither sums indexes nor returns a
combined index. `Volume` has first/last issue numbers, year and signature, but **no
volume `number` field**. The display rule for public planning `volumes[].number`
still needs clarification before a production planning adapter is written; this
contract does not invent a mapping from signature or first issue number.

### Pagination and Completeness

Both queries sort by unique volume ID ascending. Page size defaults to 20 and is
bounded at 100; negative or larger values are invalid. Empty page token starts a
query. Subsequent requests retain the same filters and page size and use the opaque
returned token. Invalid/mismatched tokens return `INVALID_ARGUMENT`. Only an empty
next token means exhaustion. No total count is needed for existing export workflows.
Replacement search uses Solr cursor pagination. The opaque token carries the cursor
bound to the normalized query and page size; it is not a client-supplied Solr expression
or an authorization credential. Pagination is not an immutable cross-request snapshot.

Within each volume, return all stored specimens in ascending specimen ID order;
export applies presentation ordering from volume metadata and specimen identity.
Do not reuse the existing `rows=100000` read without checking completeness. Batch
size bounds the ID query, not the byte size. Handlers must check their
configured response-size limit and fail with `RESOURCE_EXHAUSTED` rather than
truncate. A caller may reduce a multi-volume batch; a single oversized volume
remains an explicit failure and would require a later paged-content contract.
There is no fabricated Solr revision, cross-core transaction or snapshot guarantee.

## Source Data and the Ideal List Gap

Stored-field nullability comes from the current volume, specimen and owner
`managed-schema.xml` files. Unannotated mutable Java beans do not override the schemas,
and speculative historical sparsity is not a reason to weaken the validated model.
The contract's field selection was derived from `Volume`, `VolumeDTO`, `VolumePeriodicityDTO`, `Owner`,
`Specimen`, their services, export `VolumeSnapshot`/`SpecimenSnapshot` and sections
3, 5, 6 and 7 of `../exportni-modul-backend.md`.

`SpecimenService.getSpecimensForVolumeDetail` reads stored records. With `onlyPublic`
it filters `numExists=true OR numMissing=true`; without that option it returns all
non-deleted records. `getSpecimensForVolumeOverviewStats` uses the same existence
predicate for its list. Neither calculates a theoretical ideal publication schedule.
The frontend has generation logic in `useGenerateVolume.ts`, not a core service.

`GrpcVolumeContents.specimens` therefore means **stored records**, not a promised
complete theoretical ideal list. Both flags are required, including explicit false
values. For calculations, the existing expected-list
projection is records where either flag is true. Valid template items require exactly
one true flag; both true is inconsistent and both false is not an expected item.
The transport does not coerce missing flags into false or infer existence from a
damage code. Absent flags or attachment type are rejected before snapshot construction.

Whether the stored expected records fully represent the desired ideal list still
needs confirmation for production generation. If missing records must be derived
from periodicity/date bounds, core needs a separately agreed algorithm and stable
identity rules. This change does not invent that algorithm, synthesize IDs or label
stored data as calculated ideal data. This gap does not block a raw-data contract.

## Presence, Codes and Dates

- Proto3 `optional` also preserves presence for required-field validation; it does
  not imply Kotlin nullability. Missing, false, zero and empty string are not interchangeable.
- Required volume metadata: ID, barcode, date bounds, metatitle ID/name, mutation
  ID/all localized names, mutation-mark type, all owner fields, year, first/last
  number, attachment sort, periodicity, created and created-by. Optional: subname,
  signature, note, mutation-mark text/description, updated and updated-by.
- Required specimen metadata: ID, publication date, attachment flag, edition and
  mutation IDs, mutation-mark type, existence/missing flags and page count. Optional:
  number, attachment number, name, subname and mutation-mark text/description.
- Message fields have native presence. Required timestamps, owner, localized name,
  mutation mark and periodicity must be present. Empty periodicity is valid; missing
   or malformed JSON is not an empty schedule. Periodicity entries require all seven
   members per the frontend contract, confirmed by a full local data audit on
   2026-09-11 (1,469 volumes / 11,234 entries, none missing or null). Both gRPC
   boundaries validate their presence; false flags, zero page counts and empty text
   remain valid. Solr itself does not enforce this nested JSON structure.
- `pages_count=0` is a present stored value, never absence. Calculations retain the
  existing nonpositive-count warning and omit ratios that require a positive count.
  The nullable page-normalization bound is a derived calculation value, not nullable
  stored page count.
- Existing REST getters normalize some null strings/lists to empty. Internal mapping
  uses explicit raw text accessors so absent source text is not normalized. Existing
  REST getter behavior is unchanged.
- Damage/page lists follow core's existing null-to-empty collection semantics.
  Page lists retain invalid numbers and duplicates for calculation warnings; transport
  does not normalize, sort, deduplicate or discard their contents.
- `damage_types` contains exact `permonik-domain` `SpecimenDamageType.code` values:
  `OK`, `ChCC`, `ChS`, `PP`, `Deg`, `ChPag`, `ChCis`, `ChSv`, `Cz`, `NS`, `CzV`,
  `ChDatum`. Preserve unknown strings losslessly and let export issue warnings.
  No protobuf damage enum or parallel damage vocabulary is introduced.
- Mutation-mark types and attachment-sort values are source strings so unknown
  historical values survive transport. Requests, unlike source data, validate their
  accepted filter values. Unknown types must not silently become a known enum value.
- Every `Timestamp` preserves the exact source `java.util.Date.toInstant()` value,
  including milliseconds and dates before 1970. Audit timestamps are instants.
  Publication and coverage timestamps retain source precision on the wire; calculation
  adapters use `instant.atZone(ZoneOffset.UTC).toLocalDate()`, never the JVM default
  timezone or the deployment's `TZ=Europe/Prague`. Calendar overlap is inclusive.
  Non-midnight source values are not rewritten to midnight in transport.
- Genuinely optional metadata remains nullable even where the current FE model is
  stricter. No layer invents zero, empty or today's-date values for missing required data.

## Errors, Security and Evolution

Handlers use native gRPC statuses: `INVALID_ARGUMENT` for invalid requests,
`NOT_FOUND` for absent/deleted requested volumes, `FAILED_PRECONDITION` for ambiguous
barcode or unusable required reference data, `RESOURCE_EXHAUSTED` for response limits,
`UNAVAILABLE` for temporary core/Solr outages and `INTERNAL` for unexpected failures.
Outages never become empty results. HTTP error translation belongs to export.

This is not a public API. The implemented batch read has explicit service-token
authentication and trusted cross-owner authorization as described above. An owner
ID in a response does not authorize an end user. Candidates and planning may cross
owners; template operations require global `TEMPLATE_MANAGE`, not primary-owner access.
Public barcode integration must not expose private templates or internal identifiers.

The `v1` package is the evolution boundary. Add fields with new tags; reserve removed
tags and names rather than reusing them. Do not change field types or presence
semantics in place. This contract is independent of the direct FE/HTTP models; it
does not introduce parallel `*Dto`/`*Form` layers inside the export HTTP API.
