# Procurement Engineering Specification

**Document ID:** PROC-ENG-SPEC-001  
**Mission:** P-010.2 — Procurement Engineering Specification  
**Program:** P-010 — ORION Enterprise Procurement (Wave 3)  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Blueprint  
**Classification:** Engineering Specification · Procurement Domain  
**Authority:** Procurement Domain Lead · Chief Enterprise Architect · Architecture Review Board  
**Effective Date:** 5 August 2026  
**Architecture Baseline:** v2.0 Multi-Domain Baseline ([P-016.7](../00_Governance/P-016.7-Enterprise-Readiness-Update.md) @ `e73bc16`)

**Constitutional References:** [P-010.1 Domain Strategy](./Procurement-Reference-Domain-Strategy.md) · [P-014.1 Domain Strategy](../00_Governance/P-014.1-Enterprise-Domain-Strategy.md) · [P-014.2 Capability Matrix](../00_Governance/P-014.2-Enterprise-Capability-Matrix.md) · [P-014.3 Integration Architecture](../00_Governance/P-014.3-Enterprise-Integration-Architecture.md) · [P-014.4 Reference Architecture](../00_Governance/P-014.4-Enterprise-Reference-Architecture.md) · [CRM Reference Domain Architecture](../CRM/CRM-Reference-Domain-Architecture.md) · [Finance Domain Blueprint](../Finance/Blueprints/D-007_Finance_Domain_Blueprint.md) · [ES-HCM-001](../HCM/Engineering/ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)

**Implementation References:** [Procurement-Platform-Foundation.md](./Platform/Procurement-Platform-Foundation.md) · [Procurement-Repository-Infrastructure.md](./Platform/Procurement-Repository-Infrastructure.md)

**ADR Compliance:** [ADR-013](../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · [ADR-015](../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · [ADR-020](../11_Governance/ADR/ADR-020-Versioning-and-Domain-Compatibility.md) · [ADR-007](../11_Governance/ADR/ADR-007-Production-Persistence-Strategy.md)

**Scope:** Architecture and engineering specification only — no production code · no implementation authorization beyond documented missions  
**Audience:** Procurement engineering · platform engineering · certification · ARB · executive planning

> **Constitutional statement:** This document is the **authoritative engineering blueprint** for every future Procurement implementation mission. It translates [P-010.1](./Procurement-Reference-Domain-Strategy.md) into module structure, persistence strategy, security model, REST surface, canonical events, testing gates, and certification roadmap — replicating the HCM reference pattern and CRM/Finance platform discipline exactly.

---

## 1. Purpose

This Engineering Specification defines **how Procurement is implemented** in ORION v2.0 — the module layout, composition root, repository architecture, persistence strategy, security model, REST API groups, canonical event catalogue, cross-domain integration chains, platform service consumption, testing strategy, and mission roadmap.

| Question | Answer |
|----------|--------|
| **What does this document govern?** | All engineering missions from P-010.3 onward |
| **What does it not authorize?** | Business logic, REST routes, RBAC enforcement, canonical publishers, or workflow bindings |
| **Who must comply?** | Every Procurement PR · platform integration PR touching Procurement |
| **Replication template** | HCM (`ES-HCM-001`) · CRM (`CRM-Reference-Domain-Architecture`) · Finance persistence factories |

**Relationship to P-010.1:** P-010.1 defines *what* Procurement owns (domain strategy). P-010.2 defines *how* it is built. P-010.3 and P-010.4 have already delivered the platform foundation and repository infrastructure per this specification.

---

## 2. Engineering Principles

Procurement engineering MUST mirror Finance and CRM architecture. No alternate patterns without ARB waiver.

| Principle | Procurement Application |
|-----------|-------------------------|
| **Single composition root** | `createProcurementWiring()` is the only dependency injection entry point |
| **Single public facade** | `procurementFacade` from `@/lib/procurement` — no repository exports across boundaries |
| **Platform-first** | Consume PlatformStore · IIL · RBAC · Workflow · Observability — never reimplement |
| **Repository abstraction** | Domain services depend on repository interfaces — not Map backing or SQL |
| **PlatformStore only** | All aggregate persistence resolves through `PlatformStore.getProcurementBacking()` |
| **Organization isolation** | Every aggregate carries `organizationId` — enforced at repository and API layers |
| **Fail-closed security** | Missing permission → deny · missing context → deny |
| **IIL-only integration** | Cross-domain writes via canonical events — never foreign repository imports (ADR-015) |
| **SQL isolation** | SQL executes only in `ProcurementEntityPersister` — repositories remain synchronous Map adapters |
| **Certification first** | No production authorization without Gate 5 evidence |

### 2.1 Constitutional Engineering Laws

From [P-014.4 §1.1](../00_Governance/P-014.4-Enterprise-Reference-Architecture.md) — **mandatory for Procurement**:

| Law | Procurement Rule |
|-----|------------------|
| **L1 — Single source of truth** | Procurement owns vendor · requisition · PO · receipt · invoice capture |
| **L2 — No cross-domain repositories** | Finance MUST NOT import `@/lib/procurement/persistence/*` |
| **L3 — Platform capabilities only** | No custom message bus · no embedded auth |
| **L4 — Facade-only domain access** | External imports from `@/lib/procurement` index only |
| **L5 — IIL-only integration** | Procurement → Finance · Inventory · Warehouse via canonical events |
| **L6 — Finance hub** | All monetary posting through Finance ACL |
| **L7 — AI read-only** | Spend recommendations require human approval for PO/invoice |

### 2.2 Target Layer Stack

```mermaid
flowchart TB
  subgraph presentation [Presentation]
    PROCUI[Procurement Workspace UI]
  end

  subgraph api [API Layer]
    ROUTES[/api/procurement/*]
    CTX[getProcurementApiContext]
    RBAC[procurement-permission-catalog]
  end

  subgraph domain [Domain Layer]
    FAC[procurementFacade]
    SVC[Application Services]
    REPO[Repositories]
    PUB[ProcurementCanonicalEventPublisher]
  end

  subgraph platform [Platform Layer]
    IIL[Durable IIL ADR-013]
    WF[Workflow Engine]
    AUD[Audit]
    AI[AI Platform read-only]
  end

  subgraph persistence [Persistence]
    PS[PlatformStore]
    PER[ProcurementEntityPersister]
    ENT[procurement_entities]
  end

  PROCUI --> ROUTES
  ROUTES --> CTX --> RBAC --> FAC
  FAC --> SVC --> REPO --> PS
  SVC --> PUB --> IIL
  SVC --> WF
  SVC --> AUD
  AI -.->|read only| SVC
  PS --> PER --> ENT
```

---

## 3. Module Structure

### 3.1 Package Layout

```
lib/procurement/
├── index.ts                          ← procurementFacade ONLY public export
├── ProcurementFacade.ts              ← unified orchestration · domain status
├── createProcurementWiring.ts        ← composition root (authoritative DI)
├── constants.ts                      ← workspace · IIL service IDs
├── models/
│   └── workspace.ts                  ← capability descriptors
├── types/
│   └── procurement-core.ts           ← domain types · workspace bootstrap
├── persistence/                      ← ✅ P-010.3 · P-010.4 implemented
│   ├── index.ts                      ← persistence barrel
│   ├── ProcurementStoreBacking.ts    ← shared collection contract
│   ├── createProcurementStore.ts     ← store factory · org seed
│   ├── ProcurementPlatformBacking.ts ← PlatformStore resolver
│   ├── ProcurementPersistenceRepository.ts
│   ├── InMemoryProcurementRepository.ts
│   ├── PostgresProcurementRepository.ts
│   ├── createProcurementPersistenceRepositories.ts
│   ├── createProcurementRepositories.ts
│   ├── procurementBackingCollections.ts
│   └── procurementPostgresPersistence.ts
├── repositories/                     ← ⏳ P-010.7+ domain repository interfaces
│   ├── VendorRepository.ts
│   ├── RequisitionRepository.ts
│   ├── PurchaseOrderRepository.ts
│   └── …
├── services/                           ← ⏳ P-010.7+ application services
│   ├── procurementEventPipelineRegistry.ts  ← ✅ foundation placeholder
│   ├── VendorService.ts
│   ├── RequisitionService.ts
│   ├── PurchaseOrderService.ts
│   ├── GoodsReceiptService.ts
│   └── SupplierInvoiceService.ts
├── events/                             ← ⏳ P-010.6 canonical publisher
│   ├── ProcurementCanonicalEventPublisher.ts
│   ├── procurement-event-catalog.ts
│   └── procurement-event-schemas.ts
└── security/                           ← ⏳ P-010.5 RBAC
    ├── ProcurementAuthorizationService.ts
    ├── procurement-permission-catalog.ts
    └── procurement-api-context.ts
```

Platform persistence (outside domain package — ADR-007):

```
lib/platform/persistence/procurement/
├── ProcurementEntityPersister.ts       ← ✅ implemented
└── createPostgresProcurementStore.ts   ← ✅ implemented
```

API routes (future):

```
app/api/procurement/
├── vendors/
├── requisitions/
├── purchase-orders/
├── goods-receipts/
├── invoices/
├── contracts/
├── rfqs/
└── executive/
```

### 3.2 Module Ownership Matrix

| Package | Owner Mission | Status |
|---------|---------------|--------|
| `persistence/` | P-010.3 · P-010.4 | ✅ Implemented |
| `createProcurementWiring.ts` · `ProcurementFacade.ts` | P-010.3 | ✅ Foundation |
| `repositories/` (domain interfaces) | P-010.7+ | ⏳ Planned |
| `services/` (business logic) | P-010.7+ | ⏳ Planned |
| `events/` | P-010.6 | ⏳ Planned |
| `security/` | P-010.5 | ⏳ Planned |
| `app/api/procurement/` | P-010.8+ | ⏳ Planned |

### 3.3 Import Discipline (ADR-015)

| Caller | Allowed Import |
|--------|----------------|
| API routes | `@/lib/procurement` · `@/lib/procurement/security/*` (when shipped) |
| Other domains | `@/lib/procurement` facade methods only — **never** persistence |
| Procurement internal | Full `lib/procurement/**` tree |
| Platform | `@/lib/procurement/persistence/*` for PlatformStore wiring only |
| Tests | `@/lib/procurement` + `@/lib/procurement/persistence` for infrastructure tests |

**Forbidden:** `import { InMemoryProcurementRepository } from "@/lib/procurement/persistence/..."` from Finance, CRM, Inventory, or API routes.

---

## 4. Composition Root

### 4.1 Authoritative Wiring Chain

```
PlatformStore
  └── getProcurementBacking() → ProcurementStoreBacking
        └── createProcurementPersistenceRepositories()
              └── InMemoryProcurementRepository | PostgresProcurementRepository
                    └── createProcurementRepositories()
                          └── createProcurementWiring()
                                └── ProcurementFacade (procurementFacade)
```

### 4.2 Composition Root Contract

| Component | Path | Role |
|-----------|------|------|
| **createProcurementWiring** | `lib/procurement/createProcurementWiring.ts` | Centralized DI — sole wiring authority |
| **ProcurementFacade** | `lib/procurement/ProcurementFacade.ts` | Public entry · workspace bootstrap · domain status |
| **procurementFacade** | `lib/procurement/index.ts` | Process-wide singleton for development/CI |

### 4.3 Wiring Responsibilities

`createProcurementWiring(platformStore)` MUST:

1. Resolve backing via `ensureProcurementPlatformBacking(platformStore)`
2. Select persistence adapter via `createProcurementPersistenceRepositories()`
3. Build repository bundle via `createProcurementRepositories()`
4. Register event pipeline foundation state (placeholder until P-010.6)
5. Return immutable wiring object — no hidden singletons (TD-002 retired pattern)

**Future extension (P-010.7+):** Wiring will additionally instantiate application services and `ProcurementCanonicalEventPublisher`, injecting shared repository adapters.

### 4.4 Public Facade Contract

```typescript
import { procurementFacade } from "@/lib/procurement";
```

| Rule | Description |
|------|-------------|
| Single entry | `ProcurementFacade` + `procurementFacade` exported from `@/lib/procurement` |
| Context required | Every operational method accepts organization-scoped `ServiceContext` |
| Foundation ops | `getDomainStatus()` · `getWorkspaceBootstrap()` · `getWorkspaceView()` |
| Operational ops | Grouped services (e.g. `procurementFacade.suppliers.*`) when P-010.7+ ships |
| No internals | Repositories, backing maps, and wiring are not exported from index |

### 4.5 Target Wiring (Post P-010.7)

```
createProcurementWiring(platformStore)
  ├── backing: ProcurementStoreBacking
  ├── procurementRepository: ProcurementPersistenceRepository
  ├── suppliers / sourcing / requisitioning / ordering / receiving (shared adapter)
  ├── vendorService: VendorService
  ├── requisitionService: RequisitionService
  ├── purchaseOrderService: PurchaseOrderService
  ├── goodsReceiptService: GoodsReceiptService
  ├── supplierInvoiceService: SupplierInvoiceService
  ├── authorization: ProcurementAuthorizationService        [P-010.5]
  ├── canonicalEventPublisher: ProcurementCanonicalEventPublisher [P-010.6]
  └── procurementFacade surfaces above via namespaced methods
```

---

## 5. Repository Architecture

### 5.1 Repository Layers

| Layer | Interface | Implementation | Mission |
|-------|-----------|----------------|---------|
| **Persistence repository** | `ProcurementPersistenceRepository` | `InMemoryProcurementRepository` · `PostgresProcurementRepository` | ✅ P-010.4 |
| **Domain repositories** | `VendorRepository` · `PurchaseOrderRepository` · … | Delegate to persistence or specialized adapters | ⏳ P-010.7+ |
| **Bounded-context accessors** | `suppliers` · `sourcing` · `requisitioning` · `ordering` · `receiving` | Aliases to shared persistence adapter | ✅ P-010.4 |

### 5.2 Persistence Repository Contract

```typescript
type ProcurementPersistenceRepository = {
  readonly domain: "procurement";
  readonly persistenceAdapter?: "in-memory" | "postgresql";
  readonly infrastructureVersion: "P-010.4";
  getById(orgId, collection, entityId): ProcurementAggregateRecord | null;
  listByOrganization(orgId, collection): readonly ProcurementAggregateRecord[];
  upsert(collection, record): ProcurementAggregateRecord;
  remove(orgId, collection, entityId): boolean;
  registerIdempotencyKey(orgId, key, value): void;
  getIdempotencyKey(orgId, key): string | null;
  registerEntity(collection, entityId, organizationId): void;
};
```

**Rules:**

- No business validation in persistence repository — organization scoping only
- No SQL in repository implementations — Map-wrapper persistence via PlatformStore
- `PostgresProcurementRepository` extends `InMemoryProcurementRepository` — PostgreSQL is Map-wrapper driven

### 5.3 Factory Selection

`createProcurementPersistenceRepositories({ platformStore, connection })`:

| Condition | Adapter |
|-----------|---------|
| InMemory PlatformStore | `InMemoryProcurementRepository` |
| Initialized PostgreSQL/SQLite PlatformStore + connection | `PostgresProcurementRepository` |

Selection logic: `canUsePostgresProcurementPersistence()` in `procurementPostgresPersistence.ts`.

### 5.4 Shared Backing

Single `ProcurementStoreBacking` per PlatformStore instance — shared between:

- Composition root (`createProcurementWiring`)
- Persistence repository factory
- All bounded-context repository aliases

**Verification:** Mutations through any repository adapter reflect in `platformStore.getProcurementBacking()` collections immediately.

### 5.5 Organization Isolation

| Enforcement Point | Rule |
|-------------------|------|
| `getById` | Returns `null` when `record.organizationId !== organizationId` |
| `listByOrganization` | Filters collection values by `organizationId` |
| `remove` | Validates ownership before delete |
| Foundation markers | `organizationFoundations` map keyed by org ID |
| API layer (future) | `getProcurementApiContext()` validates tenant |

---

## 6. Persistence Strategy

### 6.1 PlatformStore Integration

| Provider | Backing Source | Hydration |
|----------|----------------|-----------|
| **InMemoryPlatformStore** | `createProcurementStore()` per instance | Seed org `org-orania` on first access |
| **PostgresPlatformStore** | `createPostgresProcurementStore()` at initialize | Load all collections from `procurement_entities` |

`PlatformStore.getProcurementBacking()` is mandatory on all providers (ADR-007 extension).

### 6.2 PostgreSQL Schema

Table: **`procurement_entities`**

| Column | Type | Purpose |
|--------|------|---------|
| `collection_name` | TEXT | Logical collection (e.g. `procurement_vendor`) |
| `entity_id` | TEXT | Aggregate ID |
| `organization_id` | TEXT | Tenant scope |
| `payload` | JSONB | Serialized aggregate |
| `updated_at` | TIMESTAMPTZ | Last mutation |

Primary key: `(collection_name, entity_id)`  
Indexes: `organization_id` · `collection_name`

Created in `bootstrapMigration` (platform schema).

### 6.3 JSONB Persistence Model

- Domain services mutate shared backing `Map` collections
- `ProcurementPersistingMap` wrappers queue upserts/deletes on `set`/`delete`
- `ProcurementEntityPersister.flushPending()` writes to `procurement_entities`
- Transaction boundaries coordinated via `PostgresTransactionManager` (includes procurement persister)

**No SQL outside persister** — repositories never import `DatabaseConnection`.

### 6.4 Entity Registry

On every `upsert`, persistence repository registers:

```
entityRegistry["{collection}::{entityId}"] = {
  collection, entityId, organizationId, registeredAt
}
```

PostgreSQL collection: `procurement_entity_registry`

**Purpose:** Cross-collection integrity tracking · certification queries · future cascade operations.

### 6.5 Idempotency Registry

Scoped by organization ID:

```
idempotencyKeys[organizationId][key] = value
```

Used for:

- REST mutation deduplication (future)
- Canonical event publish deduplication (P-010.6)
- Cross-domain consumer alignment with ADR-014 `idempotencyKey` field

### 6.6 Hydration and Restart Survival

At `PostgresPlatformStore.initialize()`:

1. `createPostgresProcurementStore(connection)` hydrates all 18 collections
2. Organization foundations restored from `procurement_organization_foundation`
3. Aggregate maps populated from JSONB payloads
4. Health check reports `procurement_platform` healthy when backing available

**Certification requirement (Gate 5):** Restart test — mutate aggregates · shutdown · initialize · verify survival.

---

## 7. Security Architecture

**Status:** Specification only — implementation in P-010.5.

### 7.1 RBAC Model

Procurement adopts CRM fail-closed RBAC pattern:

| Component | Path (target) | Role |
|-----------|-------------|------|
| Permission catalog | `lib/procurement/security/procurement-permission-catalog.ts` | Declarative permission definitions |
| Authorization service | `lib/procurement/security/ProcurementAuthorizationService.ts` | Domain-level permission checks |
| API context | `lib/procurement/security/procurement-api-context.ts` | Fail-closed route context extraction |

### 7.2 Permission Catalog (Target)

| Resource | Permissions |
|----------|-------------|
| **Vendor** | `procurement.vendor.read` · `.create` · `.update` · `.deactivate` |
| **Requisition** | `procurement.requisition.create` · `.approve` · `.cancel` |
| **Purchase Order** | `procurement.purchaseorder.create` · `.approve` · `.amend` |
| **Receiving** | `procurement.goods.receive` · `.reverse` |
| **Invoice** | `procurement.invoice.create` · `.approve` |
| **Contract** | `procurement.contract.read` · `.manage` |
| **RFQ** | `procurement.rfq.create` · `.send` |
| **Admin** | `procurement.admin` · `procurement.configuration.manage` |

### 7.3 Organization Isolation

- Every REST route extracts `organizationId` from authenticated context
- Cross-tenant access returns `ORGANIZATION_MISMATCH` — no default org fallback
- Vendor codes unique per organization — not globally unique

### 7.4 Approval Hierarchy

| Approval Type | Rule |
|---------------|------|
| Requisition | Amount thresholds · cost centre · category delegation |
| Purchase Order | Separate from requisition when amount exceeds threshold |
| Invoice | Three-way match required · separate approver from PO creator |
| Financial authorization | Materiality limits align with Finance posting rules |

### 7.5 Audit Requirements

| Event Category | Requirement |
|----------------|-------------|
| Vendor master changes | Immutable audit trail · who/when/what |
| Approval decisions | Stored on aggregate + platform audit |
| Cross-domain publishes | IIL envelope + lineage correlation |
| Failed Finance posts | Dead letter + operational alert |

### 7.6 Fail-Closed Rules

| Condition | Result |
|-----------|--------|
| Missing API context | `401 Unauthorized` |
| Missing permission | `403 Forbidden` |
| Organization mismatch | `403 ORGANIZATION_MISMATCH` |
| Unregistered org in backing | `404` or foundation registration required |

---

## 8. REST Architecture

**Status:** Specification only — implementation in P-010.8+.

### 8.1 Route Namespace

All Procurement REST endpoints live under **`/api/procurement/*`**.

### 8.2 Route Groups

| Group | Base Path | Operations (target) |
|-------|-----------|----------------------|
| **Supplier** | `/api/procurement/vendors` | CRUD · deactivate · contacts · scorecards |
| **RFQ** | `/api/procurement/rfqs` | Create · send · list quotations |
| **Purchase Requisition** | `/api/procurement/requisitions` | Create · submit · approve · cancel |
| **Purchase Order** | `/api/procurement/purchase-orders` | Create · approve · amend · cancel |
| **Goods Receipt** | `/api/procurement/goods-receipts` | Receive · partial · reverse |
| **Invoice** | `/api/procurement/invoices` | Capture · match · approve |
| **Contracts** | `/api/procurement/contracts` | CRUD · renew · terms |
| **Catalog** | `/api/procurement/catalogs` | Catalog · catalog items · items |
| **Analytics** | `/api/procurement/analytics` | Spend · vendor performance *(read)* |
| **Executive** | `/api/procurement/executive` | Dashboard · KPIs · alerts *(read)* |

### 8.3 Request Flow

```
HTTP Request
  → getProcurementApiContext()        [fail-closed]
  → resolveProcurementRoutePermission()
  → procurementFacade.{service}.method(context, …)
  → application service
  → repository (organization-scoped)
  → PlatformStore backing
```

### 8.4 Response Conventions

Mirror CRM/Finance API envelopes:

- `{ success: true, data: T }` for reads/writes
- `{ success: false, error: { code, message } }` for domain errors
- Correlation ID propagated from request context

---

## 9. Canonical Events

**Status:** Catalog and schema specification only — no implementation until P-010.6.

All cross-domain Procurement events MUST comply with [ADR-014](../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · `eventVersion: 1` per [ADR-020](../11_Governance/ADR/ADR-020-Versioning-and-Domain-Compatibility.md).

**Publish-only:** Procurement publishes authoritative facts. Procurement does not consume Inventory or Finance repository state.

### 9.1 Envelope (Required)

| Field | Procurement Example |
|-------|---------------------|
| `canonicalEventType` | `procurement.purchaseorder.approved` |
| `eventVersion` | `1` |
| `idempotencyKey` | `{orgId}:procurement-workspace:procurement-po-{poId}-approved-v1` |
| `organizationId` | Tenant scope |
| `sourceDomain` | `procurement` |
| `sourceService` | `procurement-workspace` |
| `entityType` | `purchaseorder` |
| `entityId` | PO UUID |
| `correlationId` | Workflow correlation |
| `causationId` | Prior event reference *(optional)* |
| `payload` | Versioned schema body |

### 9.2 Version 1 Event Catalog

| Event Type | Version | Trigger | Primary Consumer | Priority |
|------------|---------|---------|------------------|----------|
| `procurement.vendor.created` | 1 | Vendor onboard | Intelligence · Search | P2 |
| `procurement.vendor.updated` | 1 | Vendor master change | Intelligence | P3 |
| `procurement.requisition.created` | 1 | Requisition submit | Intelligence · Workflow | P2 |
| `procurement.requisition.approved` | 1 | Approval complete | Intelligence | P2 |
| `procurement.rfq.sent` | 1 | RFQ dispatch | Intelligence | P3 |
| `procurement.quotation.received` | 1 | Supplier quote logged | Intelligence | P3 |
| `procurement.purchaseorder.created` | 1 | PO draft finalized | Intelligence | P2 |
| `procurement.purchaseorder.approved` | 1 | PO approval complete | **Finance** · Intelligence | **P1** |
| `procurement.goods.received` | 1 | Receipt posted | **Inventory** · Warehouse · Intelligence | **P0** |
| `procurement.invoice.received` | 1 | Invoice captured | Intelligence | P2 |
| `procurement.invoice.approved` | 1 | Three-way match + approval | **Finance** | **P0** |
| `procurement.contract.created` | 1 | Contract executed | Intelligence | P2 |

### 9.3 Example Payloads (Non-Normative)

**`procurement.purchaseorder.approved`**

| Field | Required | Notes |
|-------|----------|-------|
| `purchaseOrderId` | ✅ | PO aggregate ID |
| `vendorId` | ✅ | Supplier reference |
| `totalAmount` | ✅ | PO total |
| `currencyCode` | ✅ | ISO 4217 |
| `approvedBy` | ✅ | Approver identity |
| `approvedAt` | ✅ | ISO timestamp |
| `lines` | ✅ | `{ itemId, quantity, unitPrice }[]` |

**`procurement.goods.received`**

| Field | Required | Notes |
|-------|----------|-------|
| `goodsReceiptId` | ✅ | Receipt aggregate ID |
| `purchaseOrderId` | ✅ | Source PO |
| `lines` | ✅ | `{ itemId, quantityReceived, unitOfMeasure }[]` |
| `receivedAt` | ✅ | ISO timestamp |
| `warehouseId` | ◐ | Required when Warehouse domain active |

**`procurement.invoice.approved`**

| Field | Required | Notes |
|-------|----------|-------|
| `invoiceId` | ✅ | Supplier invoice aggregate ID |
| `purchaseOrderId` | ✅ | Linked PO |
| `vendorId` | ✅ | Supplier reference |
| `amount` | ✅ | Total invoice amount |
| `currencyCode` | ✅ | ISO 4217 |
| `lineItems` | ✅ | `{ itemId, quantity, unitPrice, accountId }[]` |

### 9.4 Publisher Architecture (Target — P-010.6)

```
Application Service (e.g. SupplierInvoiceService.approve)
  → ProcurementCanonicalEventPublisher.publish(event)
  → procurementEventPipelineRegistry (initialized check)
  → Durable IIL (ADR-013)
  → FinanceEventConsumer / InventoryEventConsumer
```

**No implementation in P-010.2.** Publisher skeleton authorized in P-010.6.

---

## 10. Cross-Domain Integration

### 10.1 Integration Law Summary

| Pattern | Allowed | Forbidden |
|---------|---------|-----------|
| Procurement publishes → Finance consumes | ✅ | — |
| Procurement publishes → Inventory consumes | ✅ | — |
| Finance reads Procurement repository | — | ❌ ADR-015 |
| Inventory writes Procurement PO | — | ❌ ADR-015 |
| Shared PostgreSQL table across domains | — | ❌ Constitutional |
| Synchronous cross-domain mutation | — | ❌ Default forbidden |

### 10.2 Procurement → Finance

Procurement aims to become the **third certified inbound chain to Finance** (after HCM and CRM):

```
ProcurementCanonicalEventPublisher
  → Durable IIL (ADR-013)
  → FinanceEventConsumer (procurement-chain)
  → FinanceInboundProcessor
  → Posting Pipeline → General Ledger / AP
```

| Event | Finance Effect | Priority |
|-------|----------------|----------|
| `procurement.invoice.approved` | AP accrual journal — Dr Expense/Asset · Cr AP (2100) | **P0** |
| `procurement.purchaseorder.approved` | Commitment register *(optional v2.2)* | P1 |

**Prerequisite:** FIN-R-001 closure plan OR ARB waiver for AP-only sub-ledger (see P-010.1 §4.3).

### 10.3 Procurement → Inventory

```
procurement.goods.received
  → InventoryEventConsumer
  → StockMovementService
  → Inventory aggregate mutation
```

Eventual consistency — Inventory MUST implement idempotent consumption keyed on `goodsReceiptId`.

### 10.4 Procurement → Warehouse

```
procurement.goods.received
  → WarehouseEventConsumer
  → ReceivingTaskService
  → Put-away workflow
```

Warehouse consumes the same event as Inventory with operational semantics.

### 10.5 Procurement → Intelligence

| Signal | Source Event | Projection |
|--------|--------------|------------|
| Spend by category | `procurement.invoice.approved` | Brief KPI tile |
| Vendor performance | `procurement.goods.received` · invoice timeliness | Vendor scorecard |
| PO pipeline | `procurement.purchaseorder.*` | Operational dashboard |

**Rule:** Intelligence is **read-only** — no authoritative mutations.

### 10.6 Vendor vs CRM Party Boundary (PROC-R-005)

| Entity | Domain | Rule |
|--------|--------|------|
| `Vendor` | Procurement | Supplier · spend relationship |
| `Organisation` / `Account` | CRM | Customer · revenue relationship |

No automatic sync. Explicit integration mission required if commercial partner unification is needed.

---

## 11. Platform Services

Procurement MUST consume platform capabilities — never reimplement ([P-014.2](../00_Governance/P-014.2-Enterprise-Capability-Matrix.md)).

| Platform Service | Procurement Usage | Reference | Status |
|------------------|-------------------|-----------|--------|
| **PlatformStore** | All aggregate persistence | HCM · CRM · Finance | ✅ P-010.3 |
| **PostgreSQL persistence** | `ProcurementEntityPersister` Map-wrapper | CRM P-008.17 | ✅ P-010.4 |
| **Composition root** | `createProcurementWiring()` → `procurementFacade` | CRM P-008.18 | ✅ P-010.3 |
| **Transaction Manager** | Receipt + invoice UoW | Finance | ✅ Wired |
| **Durable IIL** | Canonical event publish + subscribe | ADR-013 | ⏳ P-010.6 |
| **RBAC** | Permission catalog · fail-closed API | CRM P-008.11 | ⏳ P-010.5 |
| **Workflow Engine** | Approval bindings · state machines | HCM · CRM | ⏳ P-010.7+ |
| **Observability** | `procurement_platform` health check | Platform | ✅ P-010.3 |
| **Certification** | Gate 1–7 evidence · doc tests | ES-096 | ⏳ P-010.21+ |
| **Intelligence** | Brief provider · spend projections | Read-only | ⏳ Post-events |
| **Search** | Vendor · PO inquiry | Platform index | ⏳ v2.2 |
| **Documents** | Contract attachments | Platform storage | ⏳ P-010.4 doc svc |

---

## 12. Testing Strategy

### 12.1 Test Layers

| Layer | Scope | Location | Mission |
|-------|-------|----------|---------|
| **Unit** | Repository · collection resolver · org isolation | `tests/lib/procurement/` | ✅ P-010.4 |
| **Integration** | PlatformStore lifecycle · shared backing · factory | `tests/lib/procurement/` · `tests/lib/platform/store/` | ✅ P-010.3 · P-010.4 |
| **Platform** | Contract tests · health · PostgreSQL adapter | `PlatformStoreContract.test.ts` | ✅ |
| **Restart** | Hydration · shutdown flush · survival | `tests/lib/procurement/` *(future)* | ⏳ Gate 5 |
| **Cross-domain** | Procurement → Finance chain | `tests/lib/finance/` *(future)* | ⏳ P-010.19 |
| **Certification** | GA-001 operational scenarios | `tests/certification/` *(future)* | ⏳ Gate 6 |

### 12.2 Current Test Suite

| Test File | Coverage |
|-----------|----------|
| `ProcurementPlatformFoundation.test.ts` | PlatformStore · wiring · health · org isolation |
| `ProcurementRepositoryInfrastructure.test.ts` | Collections · factory · registry · PostgreSQL selection |
| `PlatformStoreContract.test.ts` | Procurement backing contract on all providers |

### 12.3 Validation Gates (Every Mission)

| Gate | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit + integration | `npm test -- tests/lib/procurement/` |
| Platform contract | `npm test -- tests/lib/platform/store/PlatformStoreContract.test.ts` |
| Build | `npm run build` |

### 12.4 GA-001 Certification Scenarios (Target)

| Scenario | Validates |
|----------|-----------|
| Source-to-pay happy path | Requisition → PO → receipt → invoice → Finance event |
| Restart survival | PostgreSQL hydration after platform shutdown |
| Organization isolation | Cross-tenant denial on all aggregates |
| Idempotency | Duplicate event/REST mutation handling |
| Approval workflow | RBAC + workflow binding |
| Failed Finance post | Dead letter + alert |

---

## 13. Implementation Roadmap

### 13.1 Completed Missions

| Mission | Deliverable | Status | Commit |
|---------|-------------|--------|--------|
| **P-010.1** | Domain strategy | ✅ Ratified | `0ca6dcb` |
| **P-010.2** | Engineering specification *(this document)* | ✅ Ratified | — |
| **P-010.3** | Platform foundation · PlatformStore · composition root | ✅ Implemented | `896b5cb` |
| **P-010.4** | Repository infrastructure · PostgreSQL adapters | ✅ Implemented | `b036a52` |

### 13.2 Authorized Next Missions

| Mission | Deliverable | Gate | Dependency |
|---------|-------------|------|------------|
| **P-010.5** | RBAC · permission catalog · `ProcurementAuthorizationService` | Gate 4 | P-010.4 |
| **P-010.6** | Canonical event publisher skeleton · ADR-014 catalogue | Gate 4 | P-010.5 |
| **P-010.7** | Vendor master · supplier management services | Gate 4 | P-010.4 |
| **P-010.8** | REST API routes (`/api/procurement/*`) | Gate 4 | P-010.5 |
| **P-010.9** | Purchase requisition + approval workflow | Gate 4 | P-010.7 · Workflow |
| **P-010.10** | RFQ · quotation services | Gate 4 | P-010.7 |
| **P-010.11** | Purchase order lifecycle | Gate 4 | P-010.9 |
| **P-010.12** | Goods receipt | Gate 5 | P-010.11 |
| **P-010.13** | Supplier invoice + three-way match | Gate 5 | P-010.12 |
| **P-010.14** | Purchase contracts | Gate 5 | P-010.7 |
| **P-010.15** | Catalog management | Gate 5 | P-010.7 |
| **P-010.16** | Workflow event emission bindings | Gate 5 | P-010.6 |

### 13.3 Certification Missions

| Mission | Deliverable | Gate |
|---------|-------------|------|
| **P-010.17** | Finance procurement consumer (`procurement.invoice.approved`) | Gate 6 |
| **P-010.18** | Inventory goods receipt consumer | Gate 6 |
| **P-010.19** | Gate 5 enterprise certification | Gate 5 |
| **P-010.20** | Gate 6 integration certification | Gate 6 |
| **P-010.21** | GA-001 procurement operational scenarios | Gate 6 |
| **P-010.22** | Gate 7 operational ERP bundle | Gate 7 |

**Gate 5 exit criteria:** `procurement.invoice.approved` → Finance GL mutation certified · restart replay · org isolation · GA-001 procurement scenarios.

### 13.4 Timeline

| Phase | Target | Verdict Gate |
|-------|--------|--------------|
| Architecture (P-010.1 · P-010.2) | Aug 2026 | **GO** |
| Foundation (P-010.3 · P-010.4) | Aug 2026 | **GO** — implemented |
| Security + Events (P-010.5 · P-010.6) | 2027 Q1 | Gate 4 |
| Business Services (P-010.7 – P-010.16) | 2027 Q1–Q2 | Gate 5 |
| Certification (P-010.17 – P-010.22) | 2027 Q3–Q4 | Gate 6 · Gate 7 |

---

## 14. Engineering Readiness

### 14.1 Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| PlatformStore (ADR-007) | ✅ Operational | Foundation complete |
| CRM composition root pattern | ✅ Reference | Replication template |
| Finance Gate 5 Wave A | ✅ CONDITIONAL GO | AP consumer path |
| FIN-R-001 GL PostgreSQL | ⏳ Open | Blocks full Gate 5 authorization |
| ADR-014 event registry | ⏳ Draft | Blocks P-010.6 certification |
| Inventory domain strategy | ⏳ Not started | Blocks P-010.18 consumer |
| Workflow engine | ✅ Platform | Approval bindings ready |

### 14.2 Risk Register

| ID | Risk | Severity | Mitigation | Mission |
|----|------|----------|------------|---------|
| **PROC-R-001** | Finance GL not PostgreSQL-durable (FIN-R-001) | High | Coordinate Finance GL mission OR AP-only waiver | P-010.17 |
| **PROC-R-002** | Inventory domain not architected | Medium | Define Inventory strategy before goods receipt consumer | P-010.18 |
| **PROC-R-003** | Three-way match complexity | Medium | Phased match rules · manual override workflow | P-010.13 |
| **PROC-R-004** | ADR-014 registry absent | Medium | Publisher skeleton + schema draft in P-010.6 | P-010.6 |
| **PROC-R-005** | Vendor vs CRM party overlap | Low | Explicit boundary — vendor ≠ customer | P-010.2 *(resolved)* |
| **PROC-R-006** | Budget validation on PO approval | Medium | Reuse Finance budget stage pattern | P-010.17 |

### 14.3 Prerequisites for Gate 5 Authorization

1. P-010.5 RBAC catalog operational on all REST routes
2. P-010.6 canonical publisher emitting ADR-014 envelopes
3. P-010.12 goods receipt + P-010.13 invoice services complete
4. FIN-R-001 closure plan accepted OR ARB AP-only waiver recorded
5. Restart survival test passing on PostgreSQL PlatformStore

### 14.4 Architecture Review Checklist (Every Procurement PR)

- [ ] Imports only `@/lib/procurement` from outside domain
- [ ] No Finance/CRM/Inventory repository imports
- [ ] New events registered in procurement event catalogue
- [ ] Permission added to catalog if new route
- [ ] Organization isolation tested
- [ ] Cross-domain effect via IIL publish only
- [ ] No SQL outside `ProcurementEntityPersister`

---

## 15. Executive Summary

P-010.2 establishes the **authoritative engineering specification** for ORION Procurement — the fourth Enterprise Domain in the v2.0 multi-domain baseline.

| Assessment | Verdict |
|------------|---------|
| **P-010.2 engineering specification** | **GO** |
| **Constitutional alignment (P-014 · ADR-013–015 · ADR-020)** | **GO** |
| **Finance/CRM/HCM architecture replication** | **GO** |
| **Platform foundation (P-010.3)** | **GO** — implemented |
| **Repository infrastructure (P-010.4)** | **GO** — implemented |
| **Gate 5 implementation authorization** | **CONDITIONAL GO** — RBAC · canonical events · FIN-R-001 |
| **Production Procurement authorization** | **NO-GO** — business services · certification incomplete |

**Current state:** Platform foundation and repository infrastructure are **engineering-complete** (`896b5cb` · `b036a52`). Composition root, shared backing, PostgreSQL-ready persistence, health monitoring, and organization isolation are certified at the infrastructure layer.

**Next authorized missions:** **P-010.5** (RBAC) and **P-010.6** (canonical event publisher skeleton) in parallel with **P-010.7** (supplier management services) once security and event contracts are specified.

**Strategic outcome:** Procurement completes the operational ERP architecture blueprint — enabling design partners to manage workforce cost (HCM), revenue (CRM), and spend (Procurement) within a single governed Executive Operating System, with Finance holding monetary truth.

---

*Procurement Engineering Specification · P-010.2 · Architecture only · No implementation authorization beyond documented missions*
