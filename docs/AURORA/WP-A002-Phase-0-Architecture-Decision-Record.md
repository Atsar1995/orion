# WP-A002 PHASE 0 ARCHITECTURE DECISION RECORD

**Work Package:** WP-A002 — Identity · Tenant · Configuration  
**Mission:** A-008  
**Specification:** ES-AURORA-006  
**Governing Program:** A-016.2  
**Repository HEAD:** `d7e8a4d` (WP-A001 merged)  
**Status:** Phase 0 — planning artifacts only (no implementation)

This document resolves five ambiguities identified in WP-A002 implementation planning before code work begins.

---

## ADR-001 Migration Numbering

### Problem

Three numbering schemes conflict:

| Source | Reference | Meaning |
|--------|-----------|---------|
| **ES-AURORA-005** | `lib/aurora/persistence/migrations/001_aurora_admin_tables.sql` | Aurora admin DDL (implemented in WP-A001) |
| **ES-AURORA-006 §9.1** | `002`–`005_aurora_*.sql` in same folder | Identity/config/secrets/RLS files |
| **A-016.2 §4.1** | Migration `005_platform.sql` | WP-A001 platform milestone (not present in repo) |
| **A-016.2 §4.2** | “migration 006” | WP-A002 RLS policy template deliverable |
| **A-016.2 §5.4** | “Migration 006 · 007 start” | Sprint 4: WP-A002 RLS + WP-A003 knowledge start |

Implementers could name RLS file `006_*.sql` (program) or `005_aurora_rls_policies.sql` (spec), or conflate ORION platform migration `005_platform.sql` with Aurora admin `001`.

### Authoritative specification references

- **ES-AURORA-006 §9.1** — canonical filenames under `lib/aurora/persistence/migrations/`
- **ES-AURORA-005 Appendix A** — `001_aurora_admin_tables.sql` only
- **A-016.2 §4.2, §5.4, Appendix C (EV-MIG)** — program milestone IDs for evidence tracking

### Existing implementation

- **Present:** `lib/aurora/persistence/migrations/001_aurora_admin_tables.sql` (WP-A001)
- **Absent:** `005_platform.sql`, `002`–`005` Aurora files, MigrationRunner integration for Aurora SQL
- **Present (ORION):** `lib/platform/persistence/MigrationRunner.ts` — platform domain migrations only

### What “migration 006” means

**A-016.2 “migration 006” is a program evidence milestone**, not an instruction to create `006_*.sql` in the Aurora folder. It denotes completion of the **WP-A002 persistence/RLS deliverable set**, which ES-AURORA-006 decomposes into files **002 through 005**, with RLS specifically in **`005_aurora_rls_policies.sql`**.

**A-016.2 “migration 005_platform.sql”** is a separate **ORION platform bootstrap milestone** referenced for WP-A001; it is **not** the same as Aurora `001` and was **not implemented** in WP-A001. It must not be renumbered into the Aurora admin sequence.

### Viable options

| Option | Description |
|--------|-------------|
| **A** | Follow ES-AURORA-006 filenames `002`–`005`; document A-016.2 “006” as milestone alias |
| **B** | Renumber Aurora folder to `006` for RLS only; skip 002–005 spec names |
| **C** | Single monolithic `006_aurora_identity.sql` combining all WP-A002 DDL |
| **D** | Adopt program numbering `006`–`009` for Aurora, superseding ES-AURORA-006 file names |

### Recommendation

**Option A** — ES-AURORA-006 sequential filenames in `lib/aurora/persistence/migrations/`:

| File | Content |
|------|---------|
| `001_aurora_admin_tables.sql` | Existing (WP-A001) — may require additive ALTER in `002` if schema drift |
| `002_aurora_business_entity.sql` | Business entity + FKs |
| `003_aurora_config_tables.sql` | Brand/workspace (and business) config tables |
| `004_aurora_secrets.sql` | `aurora_secrets` |
| `005_aurora_rls_policies.sql` | RLS enable + policies on all `aurora_*` tables |

Program tracking: record **EV-MIG-006** when migrations **002–005** are applied and verified (A-016.2 Appendix C pattern).

### Why

- ES-AURORA-006 is the **module engineering authority** for DDL layout; filenames are explicit in §9.1.
- A-016.2 uses **milestone ordinals** across the whole program (005 platform, 006 identity, 007 knowledge); conflating milestone ID with filename caused the ambiguity.
- Option A preserves WP-A001 artifact `001` without rename churn.

### Compatibility impact

- WP-A001 doc references `001` only — unchanged.
- A-016.2 checklist wording “migration 006” satisfied via evidence mapping, not filename.
- Future WP-A003 “migration 007” maps to **knowledge DDL** (separate folder/spec), not Aurora `006_*.sql`.

### Security implications

- RLS must ship in **`005_aurora_rls_policies.sql`** after tables exist (002–004); order enforced by migration runner.
- Applying RLS before repos use `app.tenant_id` would break runtime — sequence matters.

### Implementation consequences

- Introduce Aurora migration registration (integrate with PlatformStore bootstrap or dedicated Aurora runner).
- WP-A002 evidence bundle cites **milestone MIG-006** + file list 002–005.
- Update A-016.3 / WP-A002 doc with milestone↔filename mapping table (documentation only).

---

## ADR-002 ORION Identity Bridge

### Problem

ES-AURORA-006 requires `AuroraIdentityBridge` mapping ORION sessions to `AuroraRuntimeContext`. WP-A001 provides manual `createAuroraRuntimeContext()` with no ORION coupling. Unclear which ORION types are canonical inputs and whether Aurora may validate sessions independently.

### Authoritative specification references

- **ES-AURORA-006 §2.1, IP-1, IP-2, §5.1** — ORION auth sole source; bridge interface
- **ES-AURORA-006 Appendix F S1** — `AuroraIdentityBridge`, extended factory, `getAuroraApiContext()`
- **ES-009 / ES-037** — ORION identity architecture (parent platform specs)

### Existing ORION / Aurora implementation

| Component | Path | Role |
|-----------|------|------|
| Session type | `types/auth.ts` → `Session` | ORION authenticated session |
| Server session | `lib/identity/server-session.ts` → `getServerSession()` | Cookie → session + profile |
| Identity service | `lib/identity/` | Session validation (demo-capable) |
| Platform identity | `lib/platform/security/IdentityContext.ts` | `createIdentityContextFromSession(session)` |
| Service context | `types/services.ts` → `ServiceContext` | `organizationId`, `workspaceId`, `userId`, `role` |
| Aurora manual context | `lib/aurora/runtime/AuroraContextFactory.ts` | Test/manual context only |
| Spec type name | ES-AURORA-006 uses `OrionSession` | **No type by that name in codebase** — maps to `Session` |

### Viable options

| Option | Description |
|--------|-------------|
| **A** | `AuroraIdentityBridge` accepts ORION `Session`; delegates validation to existing identity service only at HTTP boundary |
| **B** | Bridge accepts `IdentityContext` from platform security layer |
| **C** | Bridge re-implements token/cookie parsing inside Aurora |
| **D** | Bridge accepts raw `ServiceContext` only (no session types) |

### Recommendation

**Option A + B composition:**

```typescript
// Contract (conceptual — not implemented here)

interface AuroraIdentityBridge {
  resolveUserIdentity(session: Session): Promise<AuroraUserIdentity>;
  buildContext(session: Session, options?: { brandId?: string }): Promise<AuroraRuntimeContext>;
  resolveTenant(orionOrganizationId: string): Promise<Tenant | null>;
}

// HTTP/API entry (Appendix F):
// getAuroraApiContext() → getServerSession() → bridge.buildContext(session)
```

- **Input authority:** ORION `Session` from `types/auth.ts` (document `OrionSession` in spec as alias).
- **Mapping rules (Phase 1):**
  - `session.user.organizationId` → `AuroraRuntimeContext.tenantId` (1:1, ES-AURORA-006 §2.3)
  - `session.user.id` → `userId`
  - `session.user.workspaceId` → `workspaceId` (new field on context)
  - ORION `RoleSlug` → Aurora roles via `aurora-role-permissions.ts`
  - `session.user.permissions` → Aurora permission set (extended, not replaced)
- **Platform admin:** ORION org-admin operations that require `AURORA_PLATFORM_SYSTEM_TENANT_ID` (`system`) remain explicit — not inferred from every org admin session automatically unless tenant record mapping says so (see Open Questions).
- **Service/agent identity:** Separate factory path using `AuroraServiceIdentity` (§2.6); not via session bridge.

### Why

- IP-1 forbids Aurora authentication; Option C violates spec.
- `getServerSession()` already centralizes cookie/token handling at ORION boundary.
- `IdentityContext` can be an internal optimization inside bridge implementation, not the public contract (avoids tying Aurora to CRM/HCM role resolver details).

### Compatibility impact

- `createAuroraRuntimeContext()` **remains** for tests and internal callers (WP-A001.1 tests use it extensively).
- Production/API path adds `buildContextFromSession()`; tests unchanged.
- Re-export factory from `lib/aurora/identity/` per ES-AURORA-006 §9.1; keep `@/lib/aurora/runtime/AuroraContextFactory` as deprecated re-export for one release if needed.

### Security implications

- Bridge must **never** trust client-supplied `tenantId` without session binding.
- `resolveTenant()` must confirm org exists and is active before returning tenant.
- Failed mapping → `AURORA_ERR_0403` or unauthenticated response at API layer — not silent default tenant.

### Implementation consequences

- New module `lib/aurora/identity/AuroraIdentityBridge.ts` (+ `DefaultAuroraIdentityBridge`).
- `AuroraAuthorizationService` consumes resolved permissions; does not parse cookies.
- Aurora API routes (future) call `getAuroraApiContext()` only — no duplicate auth middleware in Aurora.

---

## ADR-003 Configuration Cache Boundary

### Problem

ES-AURORA-006 §7.4 specifies `ConfigurationCache` with Redis backend and key format, but the repository has **no Redis client**. Unclear whether WP-A002 is blocked on Redis or may ship with in-memory cache only.

### Authoritative specification references

- **ES-AURORA-006 §7.4** — `ConfigurationCache` interface; Redis backend; TTL 300s; invalidation API
- **ES-AURORA-006 §11.2** — Redis listed as dependency for config cache
- **ES-AURORA-006 Appendix F S3** — “ConfigurationCache Redis backend”
- **ES-AURORA-005** — `AURORA_REDIS_URL` env; bootstrap degraded if missing (non-test)

### Existing implementation

- `DefaultConfigurationService` — read-only, no cache layer
- `AuroraRuntimeConfiguration.redisUrl` — env contract only
- `lib/aurora/platform/AuroraSecretsResolver.ts` — unrelated env lookup stub
- **No** `ConfigurationCache` type or Redis dependency in `package.json`

### Viable options

| Option | Description |
|--------|-------------|
| **A** | Define `ConfigurationCache` interface; default `InMemoryConfigurationCache`; optional `RedisConfigurationCache` when URL present |
| **B** | Require Redis before WP-A002 config phase merges |
| **C** | No cache in WP-A002; direct DB reads only |
| **D** | Embed cache inside ConfigurationService without interface |

### Recommendation

**Option A** — interface-first, Redis-pluggable:

```typescript
interface ConfigurationCache {
  get(cacheKey: string): Promise<unknown | undefined>;
  set(cacheKey: string, value: unknown, ttlSeconds: number): Promise<void>;
  invalidate(pattern: string): Promise<number>;
  invalidateTenant(tenantId: string): Promise<void>;
  invalidateBrand(brandId: string): Promise<void>;
}
```

| Implementation | When used |
|----------------|-----------|
| `InMemoryConfigurationCache` | `environment === "test"`, dev default, CI |
| `RedisConfigurationCache` | `AURORA_REDIS_URL` set and connectivity check passes |
| `NoOpConfigurationCache` | Explicit opt-out (not default) |

- **Key format (normative):** `aurora:config:{tenantId}:{brandId?}:{key}` per spec §7.4 — generated by cache wrapper, not callers.
- **TTL default:** 300 seconds.
- **Production posture:** If `environment === "production"` and Redis unavailable → **degraded** config reads (direct repository), emit health degraded reason; do **not** fail boot (aligns with WP-A001 bootstrap degraded pattern).
- **IP-8:** Domain services call `ConfigurationService.resolve()` only; cache is internal to config module.

### Why

- Spec defines **interface** in §7.4; Redis named as backend, not as the interface itself.
- In-memory satisfies development, tests, and Appendix F S3 functional requirements without infra blocker.
- ER-10 (replaceable providers) from ES-AURORA-005 supports pluggable backends.

### Compatibility impact

- `ConfigurationService` public methods from WP-A001 (`getTenantConfig`, `getFeatureFlags`, `validateConfig`) remain; may add optional methods (`resolve`, `updateTenantConfig`) without breaking callers.
- Wiring selects cache implementation from config — `createAuroraWiring` signature unchanged.

### Security implications

- Cache keys **must** include `tenantId` (and `brandId` when scoped) — no global shared keys for tenant data.
- `invalidateTenant` required on tier change to prevent cross-tenant stale reads (spec §7.6).
- In-memory cache is **process-local** — acceptable for dev; document that multi-instance prod requires Redis for coherence.

### Implementation consequences

- New `lib/aurora/config/ConfigurationCache.ts` + implementations.
- Move/extend `ConfigurationService` to `lib/aurora/config/` with re-export from old path during transition.
- Add `redis` (or `ioredis`) dependency **only when implementing `RedisConfigurationCache`** — not required for Phase 0 gate.
- Tests use `InMemoryConfigurationCache` exclusively.

---

## ADR-004 PostgreSQL Tenant Context / RLS

### Problem

ES-AURORA-006 requires PostgreSQL RLS via `app.tenant_id` session variable and repository tenant scoping (ISO-T1). WP-A001 uses in-memory Maps; PostgresPlatformStore still backs Aurora with in-memory store. Undefined: how `AuroraRuntimeContext.tenantId` reaches DB connections and how platform-admin (`system`) operations interact with RLS.

### Authoritative specification references

- **ES-AURORA-006 §3.6** — RLS template; `SET app.tenant_id`; ISO-T1–T6
- **ES-AURORA-006 §9.3 REP-1–REP-3** — repository contracts
- **ES-AURORA-005** — PlatformStore persistence integration

### Existing implementation

- `InMemoryAuroraRepository` — `assertTenantScope(ctx.tenantId, tenantId)` on mutations
- `tenantAuthorization.ts` — service-layer checks; `AURORA_PLATFORM_SYSTEM_TENANT_ID = "system"`
- `001_aurora_admin_tables.sql` — **no RLS**, no `tenant_id` on `aurora_tenant` (tenant table is global by nature)
- `PostgresPlatformStore` — pool exists; **no** `set_config` for Aurora
- ORION domain stores — app-layer `organization_id` filtering, not PostgreSQL RLS

### Viable options

| Option | Description |
|--------|-------------|
| **A** | `withAuroraTenantConnection(ctx, fn)` sets `SET LOCAL app.tenant_id` per transaction |
| **B** | RLS only; no app-layer assert (DB enforces alone) |
| **C** | App-layer assert only; defer RLS |
| **D** | Separate connection pools: `system` pool bypasses RLS for platform admin |

### Recommendation

**Option A + D (limited bypass) + mandatory ISO-T1:**

#### 1. Tenant context propagation

```text
AuroraRuntimeContext.tenantId
    ↓
AuroraTenantDbScope.run(ctx, async (client) => { ... })
    ↓
BEGIN;
SELECT set_config('app.tenant_id', ctx.tenantId, true);  -- LOCAL to transaction
-- repository operations using client
COMMIT;
```

- **`app.tenant_id` value:** UUID string matching Aurora tenant row `id` (= ORION `organizationId` in Phase 1).
- **Scope unit:** One transaction per service operation (or explicit unit-of-work boundary).
- **Background jobs:** Job payload carries `tenantId`; worker wraps execution in `AuroraTenantDbScope` — ISO-T3.

#### 2. RLS policies

- Enable RLS on tenant-scoped tables: `aurora_brand`, `aurora_tenant_config`, `aurora_schedule`, config tables, `aurora_secrets`, `aurora_business_entity`, etc.
- Policy pattern (spec §3.6):

```sql
USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
```

- **`aurora_tenant` table:** Global catalog; access controlled by **application authorization** (platform admin vs tenant admin), not tenant_id RLS on rows. Optional policy: tenants visible only when `id = current_setting('app.tenant_id')` for non-admin connections.

#### 3. Platform admin (`system` tenant)

- Operations with `ctx.tenantId === AURORA_PLATFORM_SYSTEM_TENANT_ID` use **`AuroraSystemDbScope`**:
  - Either `SET LOCAL app.tenant_id = ''` with separate **`aurora_platform_admin` ROLE** bearing `BYPASSRLS` (postgres role, not application role name), **or**
  - Dedicated read paths that query through controlled repository methods with explicit audit logging.
- **Recommendation:** Separate **`PostgresAuroraSystemRepository`** methods for `listTenants` / cross-tenant platform ops; normal tenant repos **always** require non-system tenant context + RLS.

#### 4. Repository mismatch prevention (ISO-T1)

Every Postgres repository method:

```text
if (ctx.tenantId !== tenantIdParam) throw AURORA_ERR_0403
→ AuroraTenantDbScope.run(ctx, ...)
→ SQL with tenant_id in WHERE (defense in depth)
```

- **REP-2:** not found → `null`
- **REP-3:** mismatch → `AURORA_ERR_0403`

### Why

- Option C alone fails DoD #5 and ISO-T6.
- Option B alone risks connection-pool leakage without `SET LOCAL` (transaction-scoped).
- Dual layer (RLS + app assert) matches spec §3.6 table and REP rules.

### Compatibility impact

- In-memory repos **retain** current assert logic for unit tests.
- Postgres repos added alongside; `createAuroraRepositories()` selects by store type.
- WP-A001 tests continue on in-memory path without PostgreSQL.

### Security implications

- **Critical:** Pool must not reuse connection with stale `app.tenant_id` — use `SET LOCAL` inside transaction or connection reset on release.
- System bypass must be **narrow** — only explicit platform-admin service methods; never from user-supplied tenantId.
- Integration tests must verify DB-level cross-tenant read fails even if service assert is removed (RLS regression test).

### Implementation consequences

- New `lib/aurora/persistence/AuroraTenantDbScope.ts` (name TBD).
- `PostgresAuroraRepository` implementations per entity.
- Migration `005_aurora_rls_policies.sql` after DDL 002–004.
- CI job: Postgres container + RLS isolation test (optional gate for merge).

---

## ADR-005 WP-A001 Compatibility Boundary

### Problem

WP-A002 extends types, services, and module layout. Unclear which surfaces are **frozen** vs **extensible** without breaking WP-A001 consumers, tests, and ES-AURORA-005 ER-1 public API rules.

### Authoritative specification references

- **ES-AURORA-005 ER-1** — `@/lib/aurora` public exports only
- **ES-AURORA-006 §10.1 #15** — extend without breaking wiring
- **WP-A001.1** — hardened behaviors (lifecycle, tenant auth, health singleton)

### Existing public API (`lib/aurora/index.ts`)

| Export | Kind |
|--------|------|
| `AuroraFacade` | class |
| `createAuroraWiring` | function |
| `AuroraWiring` | type |
| `createTestAuroraWiring` | function |
| `initializeAuroraModule` | function |
| `AuroraRuntimeContext` | type |
| `AuroraHealthReport`, `PlatformLifecycleState` | types (via `./types`) |
| `AuroraError` | class |
| `AURORA_MODULE_KEY`, `AURORA_IIL_SERVICE_ID` | constants |

### Facade operations frozen (signatures & error contracts)

**`facade.admin`** — `AdminOperations`:

- `createTenant(ctx, input) → Tenant`
- `getTenant(ctx, tenantId) → Tenant | null`
- `updateTenant(ctx, tenantId, input) → Tenant`
- `listTenants(ctx) → readonly Tenant[]`
- `createBrand(ctx, input) → Brand`
- `getBrand(ctx, brandId) → Brand | null`
- `updateBrand(ctx, brandId, input) → Brand`
- `listBrands(ctx, tenantId) → readonly Brand[]`
- `switchBrand(ctx, brandId) → AuroraRuntimeContext`

**`facade.health`** — `AuroraHealthOperations`:

- `getPlatformHealth()`, `getModuleHealth(moduleKey)`, `getLifecycleState()`

**`facade.config`** — `ConfigurationOperations`:

- `getTenantConfig(ctx)`, `getFeatureFlags(ctx)`

**Deferred modules** — must continue throwing `AURORA_ERR_0501` / HTTP 501 semantics:

- `content`, `knowledge`, `seo`, `campaign`, `analytics`, `publish`, `integrations`, `agents`, `workflows`, `notifications` (proxy stubs)

### Wiring & runtime frozen behaviors

| Surface | Frozen behavior |
|---------|-----------------|
| `createAuroraWiring(config, runtime)` | **Two-parameter** signature; runtime required (WP-A001.1) |
| `createTestAuroraWiring(overrides?)` | Returns immediately-ready wiring (`initialLifecycle: "ready"`) for tests |
| `initializeAuroraModule()` | Process singleton; respects `AURORA_ENABLED` |
| Bootstrap lifecycle | `initializing` until phase 10; no premature `ready` |
| `AURORA_PLATFORM_SYSTEM_TENANT_ID` | `"system"` — platform admin context (WP-A001.1) |
| Error codes | `AURORA_ERR_0403`, `0404`, `0501`, `0503`, `0509`, `5030` meanings unchanged |
| Health route | Uses singleton runtime, not `createTestAuroraWiring()` per request |

### Internal but stability-sensitive (deep imports in tests)

Tests import directly — breaking changes require test updates:

- `@/lib/aurora/admin/tenantAuthorization` — `AURORA_PLATFORM_SYSTEM_TENANT_ID`
- `@/lib/aurora/runtime/AuroraContextFactory` — `createAuroraRuntimeContext`
- `@/lib/aurora/runtime/initializeAuroraModule` — test helpers
- `@/lib/aurora/createAuroraWiring`, `AuroraRuntime`, etc.

**Policy:** Deep imports are **internal** per ER-1; WP-A002 may relocate files with **re-export shims** at old paths until WP-A003.

### Allowed extensions (non-breaking)

| Change | Rule |
|--------|------|
| Add optional fields to `AuroraRuntimeContext` | Additive only |
| Add fields to `Tenant`, `Brand`, `TenantConfig` types | Additive; preserve existing fields |
| Add new exports to `@/lib/aurora/index.ts` | Allowed |
| Add methods to services | Allowed if existing methods unchanged |
| Add configuration methods to facade | New property or optional methods — do not remove `getTenantConfig` / `getFeatureFlags` |
| Stricter authorization | Allowed if WP-A001 tests updated with correct system/admin context (already done in WP-A001.1) |

### Prohibited without major version bump

- Removing/rename public exports from `index.ts`
- Changing `createAuroraWiring` to single-parameter
- Removing facade admin methods or changing parameter order
- Changing deferred stub error code from `AURORA_ERR_0501`
- Removing `createTestAuroraWiring`
- Changing lifecycle truthfulness guarantees from WP-A001.1

### Recommendation

Maintain **WP-A001 regression suite (33 tests) as merge gate** for every WP-A002 PR. Add compatibility checklist to WP-A002 Definition of Done (§10).

### Compatibility impact

- Type extensions may require test fixture updates but not API removal.
- Moving `AuroraContextFactory` → `identity/` requires re-export from `runtime/AuroraContextFactory.ts`.

### Security implications

- Stricter RBAC must not weaken cross-tenant tests — tests already use explicit contexts.
- Platform admin (`system`) path must remain explicit — do not remove `AURORA_PLATFORM_SYSTEM_TENANT_ID`.

### Implementation consequences

- Add `tests/aurora/regression/wp-a001-compat.test.ts` in WP-A002 Phase 1 (optional guard).
- Document frozen surface in `WP-A002-*.md` implementation report when work starts.

---

## Cross-Decision Dependencies

```text
ADR-001 (migrations 002–005)
    ↓ enables
ADR-004 (RLS in 005 after tables)
    ↑ requires tenantId from
ADR-002 (bridge → AuroraRuntimeContext.tenantId)
    ↓ feeds
ADR-004 (AuroraTenantDbScope)
    ↓
ADR-003 (config repos in 003 → cache → invalidation on write)

ADR-005 (compatibility) constrains all:
    - createAuroraRuntimeContext preserved alongside bridge
    - facade admin signatures frozen
    - wiring two-parameter pattern frozen
```

| Decision | Depends on | Blocks |
|----------|------------|--------|
| ADR-001 | WP-A001 `001` | ADR-004 RLS file |
| ADR-002 | ORION `Session` API | ADR-004 tenant UUID source |
| ADR-003 | ADR-001 config tables (003) | None (in-memory OK) |
| ADR-004 | ADR-001, ADR-002 | WP-A002 isolation AC |
| ADR-005 | — | All implementation PRs |

---

## Open Questions

| ID | Question | Owner | Resolution target |
|----|----------|-------|-------------------|
| OQ-1 | **Platform admin mapping:** When ORION org-admin session should use `tenantId = organizationId` vs `tenantId = system` for `listTenants` / `createTenant` | Identity Lead + ARB | WP-A002 Phase 1 design note (recommend: keep `system` for platform catalog ops; org-admin uses own org as tenantId for tenant-scoped ops) |
| OQ-2 | **`005_platform.sql`:** Implement as ORION platform migration or defer; relationship to Aurora `001` | Platform Lead | Separate WP — not WP-A002 scope |
| OQ-3 | **Postgres RLS CI:** Mandatory for merge or staging-only initially | Engineering Lead | WP-A002 test strategy sign-off |
| OQ-4 | **`aurora_tenant` RLS:** Global catalog vs tenant-self visibility policy | Security Lead | ADR-004 implementation PR |
| OQ-5 | **Redis dependency package:** Add in WP-A002 or WP-A002.1 | Engineering Lead | Before production cache AC; not blocking dev |

---

## Phase 1.1 Hardening Decisions (WP-A002)

**Status:** Implemented on `feature/wp-a002` after Phase 1 review (`e2777f6`).

### ORION permission merge (ADR-002 completion)

Effective Aurora permissions are computed as:

```text
role-derived Aurora permissions UNION ORION session grants mapped from module "aurora"
```

ORION grants use `{ module: "aurora", action: "<permission>" }` where `<permission>` is either a full Aurora slug (e.g. `aurora.content.write`) or a short suffix (e.g. `content.write`). Role-derived permissions are never removed.

### Active tenant rule

`DefaultAuroraIdentityBridge.resolveTenant()` and `buildContext()` reject tenant records whose `status !== "active"`. Suspended tenants return `AURORA_ERR_0403`. Missing tenants preserve the existing `AURORA_ERR_0404` contract.

Authoritative tenant statuses (WP-A001 model): `active` | `suspended`.

### Authorization service adoption

`TenantService` and `BrandService` now depend on `AuroraAuthorizationService` for all authorization decisions. WP-A001 tenant scope helpers remain the isolation layer inside the authorization service.

| Operation | Permission |
|-----------|------------|
| `createTenant` / `listTenants` | `aurora.admin.tenant` + platform admin context |
| `getTenant` / `listBrands` | `aurora.content.read` + tenant access |
| `updateTenant` | `aurora.admin.config` + tenant access |
| `createBrand` / `updateBrand` | `aurora.admin.brand` (+ tenant access on create) |
| `switchBrand` | brand scope validation |

### API context rule

Production authenticated Aurora routes must obtain context via `getAuroraApiContext()` → ORION `getServerSession()` → `identityBridge.buildContext()`.

**Exception:** `GET /api/aurora/health` is infrastructure-only and intentionally does not require Aurora identity.

### Denial audit logging

`DefaultAuroraAuthorizationService` emits WARN-level structured logs (via `AuroraLoggingService`) on permission/tenant/brand denials with `userId`, `tenantId`, `permission`, and operation/resource metadata. Secrets and tokens are redacted by the logging sanitizer.

### Production vs test context

| Source | `contextSource` | Default role | Platform admin |
|--------|-----------------|--------------|----------------|
| ORION session (`buildContext`) | `orion-session` | mapped from ORION role | requires `tenantId = system` + `aurora.admin.tenant` + bound `sessionId` |
| Manual factory (`createAuroraRuntimeContext`) | `test-manual` | `aurora.viewer` | blocked unless explicit test helper used |
| Test helper (`createTestAuroraRuntimeContext`) | `test-manual` | `aurora.admin` | allowed for WP-A001 regression tests |

### Platform admin model (OQ-1 resolved)

- **Platform catalog operations** (`createTenant`, `listTenants`) require `AuroraRuntimeContext.tenantId === AURORA_PLATFORM_SYSTEM_TENANT_ID` (`system`) and `aurora.admin.tenant`.
- **Organization admin sessions** use `session.user.organizationId` as `tenantId` for tenant-scoped operations; they do **not** automatically receive platform catalog authority.
- Client-supplied `tenantId` cannot grant platform admin; catalog authority requires the system tenant context derived from authenticated platform operators only.

---

## Final Gate

**READY FOR WP-A002 IMPLEMENTATION**

All five Phase 0 ambiguities have explicit decisions. No specification contradiction remains unaddressed — A-016.2 milestone numbering is documented as **evidence ordinals**, not filename overrides for ES-AURORA-006. Open questions OQ-1–OQ-5 are bounded and do not block Phase 1 (identity bridge + authorization foundation) start.

**Do not proceed to implementation in this document.** Next step: create branch `feature/wp-a002` and begin Phase 1 per implementation plan, citing this ADR.

---

*Phase 0 complete · WP-A002 · Mission A-008 · ES-AURORA-006*
