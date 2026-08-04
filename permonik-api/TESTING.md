# Testing Plan

## Infrastructure

### Shared Solr base class
All integration tests extend a common base class that:
- Starts a single `SolrContainer("solr:10.0.0")` per test suite (static, shared)
- Registers `solr.host` via `@DynamicPropertySource`
- Mocks Redis via `@MockitoBean` (not under test)
- Creates required Solr cores before tests run

### Test profiles
Tests run under a dedicated `test` Spring profile that disables Shibboleth
and enables form-based login so controllers can be called as an authenticated user.

---

## Test layers

### Layer 1 — Controller tests (`@WebMvcTest`)
No Solr, no Spring full context. Services are mocked with `@MockitoBean`.
Tests cover:
- HTTP method and path mapping
- Request/response serialization (JSON shape)
- Security rules — which endpoints require authentication
- Input validation and error responses (400, 403, 404, 500)

### Layer 2 — Service + Solr integration tests (`@SpringBootTest`)
Full Spring context + real `SolrContainer`. No HTTP layer.
Tests cover:
- CRUD operations hitting real Solr
- Soft-delete behaviour (`deleted` field)
- Solr query correctness (filters, sorting, pagination)
- Denormalization: updating embedded names in related cores on rename
- Cascade updates via `DenormalizationService`

### Layer 3 — API integration tests (`@SpringBootTest` + `MockMvc`)
Full stack: HTTP → Controller → Service → Solr container.
Tests cover end-to-end flows for the most critical paths.

---

## Coverage by domain

### Implemented test classes (current state)
| Domain | Controller layer (`@WebMvcTest`) | Service+Solr (`@SpringBootTest`) | API integration (`MockMvc`) | Note |
|---|---|---|---|---|
| Owner | `OwnerControllerTest` | `OwnerServiceTest` | - | Full CRUD/security split |
| Edition | `EditionControllerTest` | `EditionServiceTest` | - | Includes locale sort |
| Mutation | `MutationControllerTest` | `MutationServiceTest` | - | Includes locale sort |
| MetaTitle | `MetaTitleControllerTest` | `MetaTitleServiceTest` | - | Public/private behavior |
| Volume | - | `VolumeServiceTest` | `VolumeIntegrationTest` | Controller-only layer skipped intentionally; covered via full-stack flows |
| Specimen | - | `SpecimenServiceTest` | `SpecimenIntegrationTest` | Controller-only layer skipped intentionally; queries/facets validated E2E |
| User | `UserControllerTest` | `UserServiceTest` | - | Endpoint auth + update |
| Auth | - | - | `AuthIntegrationTest` | Dev profile only |
| Me | - | - | `MeIntegrationTest` | Endpoint is tiny; behavior covered E2E |

### Owner (`/api/owner`)
| Test | Layer | Notes |
|---|---|---|
| `GET /list/all` returns all non-deleted owners | 2 | insert 3, soft-delete 1, expect 2 |
| `POST /` creates owner | 2 | verify document appears in Solr |
| `POST /` rejects duplicate shorthand/sigla | 2 | expect exception |
| `PUT /{id}` updates owner and propagates to volumes/specimens | 2 | denormalization |
| `GET /list/all` requires no auth | 1 | permitAll |
| `POST /`, `PUT /` require auth | 1 | 403 when unauthenticated |

### Edition (`/api/edition`)
Same structure as Owner. Additionally:
| Test | Layer | Notes |
|---|---|---|
| Locale sort (`edition_name_cs_sort`) works correctly | 2 | Czech collation order |

### Mutation (`/api/mutation`)
Same structure as Edition.

### MetaTitle (`/api/metatitle`)
| Test | Layer | Notes |
|---|---|---|
| `GET /list/overview` returns overview DTO | 2 | |
| `GET /{id}` returns correct metatitle | 2 | |
| `POST /`, `PUT /` create and update | 2 | |

### Volume (`/api/volume`)
| Test | Layer | Notes |
|---|---|---|
| `POST /` creates volume with specimens | 2 | both cores written |
| `PUT /{id}` updates volume and its specimens | 2 | |
| `PUT /{id}/overgenerated` updates overgenerated specimens | 2 | |
| `DELETE /{id}` soft-deletes volume and all its specimens | 2 | |
| `GET /{id}/detail` returns full detail | 3 | authenticated vs public view |
| `GET /{id}/stats` returns stats | 3 | |
| Reference names resolved on save (not trusted from FE) | 2 | `resolveXxxReferenceNames()` |

### Specimen (`/api/specimen`)
| Test | Layer | Notes |
|---|---|---|
| `POST /{id}/list` returns paginated results | 3 | offset, rows |
| `POST /{id}/list` faceting works | 3 | facet counts match data |
| `POST /{id}/list/facets` returns facets only | 3 | |
| `GET /{id}/start-date` returns correct min date | 2 | pdate stats cast |
| `GET /names` returns distinct names | 2 | |
| `DELETE /{id}` soft-deletes specimen | 2 | |

### User (`/api/user`)
| Test | Layer | Notes |
|---|---|---|
| `GET /list/all` returns all users | 2 | |
| `PUT /{id}` updates user | 2 | |
| All endpoints require ADMIN role | 1 | 403 otherwise |

### Auth (`/api/auth`) — dev profile only
| Test | Layer | Notes |
|---|---|---|
| `POST /login/basic` with valid credentials returns session | 3 | |
| `POST /login/basic` with invalid credentials returns 401 | 3 | |
| `POST /logout` clears session | 3 | |

### Me (`/api/me`)
| Test | Layer | Notes |
|---|---|---|
| `GET /me` returns current user when authenticated | 3 | |
| `GET /me` returns 401 when anonymous | 1 | |

---

## Order of implementation

1. Solr base class + core setup
2. Owner (simplest schema, good baseline)
3. Edition + Mutation (identical pattern)
4. MetaTitle
5. Volume + Specimen (most complex, depends on reference entities)
6. User + Auth + Me
