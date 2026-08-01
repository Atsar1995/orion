# ES-DATA-001 — Enterprise Data Platform Engineering Specification

**Document ID:** ES-DATA-001  
**Domain:** Enterprise Data Platform (Cross-Cutting)  
**Version:** 1.0  
**Architecture Baseline:** v0.3  
**Status:** Draft — Pending Engineering Approval  
**Classification:** Engineering Specification  
**Authority:** Chief Enterprise Architect  
**Owner:** Platform Engineering Lead (to be assigned)  

**Prerequisites:** [D-011 — Enterprise Data Architecture Blueprint](../Blueprints/D-011_Enterprise_Data_Architecture_Blueprint.md) · [D-012 — Enterprise Master Data Model](../Blueprints/D-012_Enterprise_Master_Data_Model.md) *(planned)* · [D-013 — Enterprise Data Governance](../Governance/D-013_Enterprise_Data_Governance.md)

**Related Engineering:** [ES-011 — Platform Services Foundation](../../02_Engineering/ES-011-Platform-Services-Foundation.md) · [ES-033 — Event & Messaging Architecture](../../02_Engineering/ES-033-Event-Messaging-Architecture.md) · [ES-036 — Database & Persistence Architecture](../../02_Engineering/ES-036-Database-Persistence-Architecture.md) · [ES-056 — Data Governance & Information Architecture](../../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md)

**Related Platform Missions:** P-010.1 Organization · P-010.5 Search · P-010.6 Compliance · P-010.7 Integration

---

## 1. Engineering Objectives

ES-DATA-001 translates approved data architecture (D-011), master data model (D-012), and governance framework (D-013) into a **single engineering blueprint** for the Enterprise Data Platform.

| Objective | Description |
|-----------|-------------|
| **Unified master data access** | Domains consume master entities through public platform services — never through internal repositories |
| **Governed validation** | All master data mutations pass through a standardized validation pipeline |
| **Event-driven propagation** | Authoritative changes publish canonical events via IIL |
| **Organization isolation** | Every service operation, repository query, and event is tenant-scoped |
| **Extensibility without forks** | Domain and organization extensions use metadata-driven patterns |
| **Implementation consistency** | Same facade/repository/service patterns as P-010.x platform missions |

This specification defines **engineering structure only**. No code, database schemas, ORM models, or API route implementations are authorized by this document.

---

## 2. Platform Positioning

```
┌─────────────────────────────────────────────────────────────────┐
│  Business Domains (Finance, Hospitality, Commercial, HR…)       │
│  Consume master data via public Data Platform APIs only         │
├─────────────────────────────────────────────────────────────────┤
│  ENTERPRISE DATA PLATFORM (this specification)                  │
│  MasterData · Registry · Identity · Reference · Metadata        │
│  Validation · Synchronization · Governance                      │
├─────────────────────────────────────────────────────────────────┤
│  Shared Platform Services (P-010.x)                             │
│  Organization · Search · Compliance · Integration · Notification│
├─────────────────────────────────────────────────────────────────┤
│  Intelligence Integration Layer (P-006)                         │
├─────────────────────────────────────────────────────────────────┤
│  Persistence Foundation (ES-036) — future production tier       │
└─────────────────────────────────────────────────────────────────┘
```

Domains **must not** implement parallel master entity stores. The Data Platform is the **single engineering entry point** for master data, reference data, and governed metadata operations.

---

## 3. Internal Package Architecture

### 3.1 Root Package

```
lib/platform/data/
```

The Enterprise Data Platform lives under `lib/platform/data/` as a first-class platform module, consistent with `lib/platform/compliance/`, `lib/platform/notification/`, and `lib/platform/integration/`.

### 3.2 Package Layout

```
lib/platform/data/
├── index.ts                          # DataPlatformFacade — sole public export surface
├── DataPlatformFacade.ts             # Facade composition (optional alias via index)
│
├── services/                         # PUBLIC service implementations
│   ├── MasterDataService.ts
│   ├── EntityRegistryService.ts
│   ├── EntityIdentityService.ts
│   ├── ReferenceDataService.ts
│   ├── MetadataService.ts
│   ├── ValidationService.ts
│   ├── SynchronizationService.ts
│   ├── GovernanceService.ts
│   ├── SearchRegistrationService.ts
│   └── AuditRegistrationService.ts
│
├── repositories/                     # INTERNAL — interfaces + in-memory impl
│   ├── MasterEntityRepository.ts
│   ├── ReferenceDataRepository.ts
│   ├── MetadataRepository.ts
│   ├── ValidationRepository.ts
│   ├── SynchronizationRepository.ts
│   ├── GovernanceRepository.ts
│   ├── RegistryRepository.ts
│   └── InMemory*.ts
│
├── validation/                       # INTERNAL — pipeline stages
│   ├── DataValidationPipeline.ts
│   ├── OrganizationValidator.ts
│   ├── IdentityValidator.ts
│   ├── ReferenceValidator.ts
│   ├── DuplicateDetector.ts
│   ├── MetadataValidator.ts
│   ├── GovernanceValidator.ts
│   ├── PolicyValidator.ts
│   └── PublicationValidator.ts
│
├── synchronizers/                    # INTERNAL — event-driven sync strategies
│   ├── SynchronizationStrategy.ts
│   └── DomainSyncAdapter.ts
│
├── registry/                         # INTERNAL — entity type registry
│   ├── EntityTypeRegistry.ts
│   └── EntityOwnershipRegistry.ts
│
├── metadata/                         # INTERNAL — metadata resolution
│   └── MetadataResolver.ts
│
├── governance/                       # INTERNAL — governance rule adapters
│   └── GovernanceRuleEngine.ts
│
├── events/                           # INTERNAL — IIL event publishing
│   ├── data-platform-events.ts
│   └── register-data-subscribers.ts
│
├── models/                           # INTERNAL — view/DTO mappers (not canonical types)
│   └── master-data-views.ts
│
├── data/                             # INTERNAL — seed data
│   └── seed-master-data.ts
│
└── rules/                            # INTERNAL — shared rules engine
    └── DataRulesEngine.ts
```

### 3.3 Type Definitions

Canonical types reside in **`types/enterprise-data.ts`** (future). Domain-specific master entity shapes extend platform canonical bases defined in D-012.

```
types/
├── enterprise-data.ts                # Platform master data types
├── enterprise-data-events.ts         # Event payload contracts (optional split)
```

---

## 4. Public API Architecture

### 4.1 Facade Pattern

All external consumption flows through **`DataPlatformFacade`** exported from `lib/platform/data/index.ts`.

```typescript
// Conceptual public surface — no implementation in this ES
export class DataPlatformFacade {
  readonly masterData: MasterDataService;
  readonly registry: EntityRegistryService;
  readonly identity: EntityIdentityService;
  readonly referenceData: ReferenceDataService;
  readonly metadata: MetadataService;
  readonly validation: ValidationService;
  readonly synchronization: SynchronizationService;
  readonly governance: GovernanceService;
  readonly searchRegistration: SearchRegistrationService;
  readonly auditRegistration: AuditRegistrationService;
}

export const dataPlatformFacade = new DataPlatformFacade();
export const PLATFORM_MISSION_DATA = "P-011.0"; // future mission ID
```

### 4.2 Public Export Rules

| Rule | Description |
|------|-------------|
| PUB-01 | Only `index.ts` exports are public API |
| PUB-02 | Repository interfaces and in-memory implementations are **never** exported |
| PUB-03 | Validators, synchronizers, and internal rules engines are **never** exported |
| PUB-04 | Types consumed by domains are exported from `types/enterprise-data.ts` |
| PUB-05 | Singleton facade instances follow P-010.x convention (`dataPlatformFacade`) |

### 4.3 REST API Surface (Future Mission)

REST routes under `app/api/platform/data/` mirror public service boundaries:

| Route Prefix | Service |
|--------------|---------|
| `/api/platform/data/entities` | MasterDataService |
| `/api/platform/data/registry` | EntityRegistryService |
| `/api/platform/data/reference` | ReferenceDataService |
| `/api/platform/data/metadata` | MetadataService |
| `/api/platform/data/validate` | ValidationService |
| `/api/platform/data/sync` | SynchronizationService |

API design follows [ES-035 — API Design Standards](../../02_Engineering/ES-035-API-Design-Standards.md). Routes are **not** implemented by this specification.

---

## 5. Service Architecture

### 5.1 Service Catalog

| Service | Responsibility | Public |
|---------|----------------|--------|
| **MasterDataService** | CRUD lifecycle for governed master entities; soft delete; archive | Yes |
| **EntityRegistryService** | Register/query entity types, ownership, and schema contracts | Yes |
| **EntityIdentityService** | Surrogate ID assignment; business key resolution; merge lineage | Yes |
| **ReferenceDataService** | Governed code lists; versioned reference data CRUD | Yes |
| **MetadataService** | Entity metadata read/write; classification; retention class | Yes |
| **ValidationService** | Execute validation pipeline; return structured results | Yes |
| **SynchronizationService** | Coordinate cross-domain sync; track sync state | Yes |
| **GovernanceService** | Stewardship checks; policy enforcement; violation recording | Yes |
| **SearchRegistrationService** | Register entities with Search Platform (P-010.5) | Yes |
| **AuditRegistrationService** | Register significant changes with Compliance Platform (P-010.6) | Yes |

### 5.2 Service Contract Pattern

Every public service method:

1. Accepts `ServiceContext` as final parameter
2. Validates organization access via `DataRulesEngine`
3. Returns domain types or throws standardized error codes
4. Does not expose repository internals
5. Publishes events **after** successful authoritative mutation

```typescript
// Conceptual contract shape
type ServiceMethod<TInput, TOutput> = (
  input: TInput,
  context: ServiceContext,
) => TOutput | Promise<TOutput>;
```

### 5.3 Service Dependencies

```
MasterDataService
  ├── ValidationService
  ├── EntityIdentityService
  ├── MetadataService
  ├── GovernanceService
  ├── SynchronizationService
  ├── SearchRegistrationService
  └── AuditRegistrationService

ReferenceDataService
  ├── ValidationService
  └── GovernanceService

EntityRegistryService
  └── GovernanceService (registration approval)
```

Services are composed in the facade constructor via **dependency injection** (constructor parameters with default in-memory repository instances).

---

## 6. Repository Architecture

### 6.1 Repository Interfaces

Repositories are **internal**. Each interface defines organization-scoped operations.

| Repository | Responsibility |
|------------|----------------|
| **MasterEntityRepository** | Persist master entity records; find by ID, business key; soft delete |
| **ReferenceDataRepository** | Code list storage; version history; deprecation |
| **MetadataRepository** | Metadata attributes; classification; retention assignment |
| **ValidationRepository** | Validation result cache; duplicate fingerprints |
| **SynchronizationRepository** | Sync job state; last-synced timestamps; projection markers |
| **GovernanceRepository** | Policy references; violation records; exception grants |
| **RegistryRepository** | Entity type registrations; ownership assignments |

### 6.2 Repository Contract Rules

| Rule | Description |
|------|-------------|
| REPO-01 | All queries include `organizationId` filter |
| REPO-02 | Repositories expose `readonly domain = "platform"` identifier |
| REPO-03 | In-memory implementations seed from `data/seed-master-data.ts` |
| REPO-04 | Production implementations swap via facade constructor injection |
| REPO-05 | Repositories do not publish events — services do |
| REPO-06 | Master entity primary identity is immutable after insert |

### 6.3 Conceptual MasterEntityRepository

```typescript
type MasterEntityRepository = {
  readonly domain: string;
  create(record: MasterEntityRecord): MasterEntityRecord;
  update(record: MasterEntityRecord): MasterEntityRecord;
  findById(organizationId: string, entityType: string, entityId: string): MasterEntityRecord | null;
  findByBusinessKey(organizationId: string, entityType: string, businessKey: string): MasterEntityRecord | null;
  list(organizationId: string, entityType: string, query?: MasterEntityQuery): readonly MasterEntityRecord[];
  softDelete(organizationId: string, entityType: string, entityId: string): MasterEntityRecord | null;
  findDuplicateFingerprint(organizationId: string, fingerprint: string): MasterEntityRecord | null;
};
```

---

## 7. Master Data Registry Architecture

The **Entity Registry** is the authoritative catalog of entity types known to the platform.

### 7.1 Registry Record

| Field | Purpose |
|-------|---------|
| `entityType` | Canonical type key (e.g. `customer`, `vendor`) |
| `domainKey` | Owning domain |
| `owningService` | Authoritative platform or domain service |
| `businessOwner` | Governance accountability |
| `stewardRole` | Operational stewardship |
| `schemaVersion` | Contract version |
| `searchableFields` | Fields indexed by Search Platform |
| `classificationDefault` | Default security classification |
| `retentionClass` | Default retention policy |

### 7.2 Registration Flow

```
Domain blueprint approval
  → EntityRegistryService.registerEntityType()
  → GovernanceService.validateRegistration()
  → RegistryRepository.persist()
  → MetadataChanged event
```

No master entity may be created for an unregistered entity type in production.

---

## 8. Reference Data Architecture

Reference data is managed separately from master entities due to different lifecycle and versioning rules (D-013 Section 10).

| Tier | Service Operation | Versioning |
|------|-------------------|------------|
| System | `ReferenceDataService.registerSystemCode()` | Platform release |
| Organization | `ReferenceDataService.upsertOrgCode()` | Config version |
| Domain | `ReferenceDataService.upsertDomainCode()` | Domain steward approval |

Deprecated codes remain resolvable. `ReferenceDataUpdated` event emitted on material changes.

---

## 9. Metadata Architecture

**MetadataService** manages governed attributes attached to master entities:

- Classification (public → restricted)
- Retention class
- Custom organization attributes (metadata-driven extensions)
- Domain extension payloads (validated against registry schema)
- Correlation and source provenance

Metadata changes emit `MetadataChanged` events. Metadata validation is stage 5 of the validation pipeline.

---

## 10. Data Validation Architecture

### 10.1 Validation Pipeline

All master data **create**, **update**, **import**, and **merge** operations pass through `DataValidationPipeline`:

```
Input
  → 1. Organization Validation
  → 2. Identity Validation
  → 3. Reference Validation
  → 4. Duplicate Detection
  → 5. Metadata Validation
  → 6. Governance Validation
  → 7. Policy Validation
  → 8. Publication Validation
  → Output (ValidationResult)
```

### 10.2 Stage Definitions

| Stage | Validator | Failure Code Prefix |
|-------|-----------|---------------------|
| **Organization Validation** | `OrganizationValidator` | `ORG_` |
| **Identity Validation** | `IdentityValidator` | `ID_` |
| **Reference Validation** | `ReferenceValidator` | `REF_` |
| **Duplicate Detection** | `DuplicateDetector` | `DUP_` |
| **Metadata Validation** | `MetadataValidator` | `META_` |
| **Governance Validation** | `GovernanceValidator` | `GOV_` |
| **Policy Validation** | `PolicyValidator` | `POL_` |
| **Publication Validation** | `PublicationValidator` | `PUB_` |

### 10.3 ValidationResult Contract

```typescript
type ValidationResult = {
  readonly passed: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly stage: ValidationStage;
  readonly fingerprint?: string;
};

type ValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly severity: "error" | "warning";
};
```

Pipeline **short-circuits** on first error-severity failure unless `continueOnWarning` is explicitly set for preview/import operations.

`ValidationService.validate()` exposes the pipeline publicly. Internal validators remain private.

---

## 11. Synchronization Architecture

**SynchronizationService** coordinates eventual consistency across platform projections and domain consumers.

### 11.1 Sync Targets

| Target | Mechanism |
|--------|-----------|
| Search Platform | `SearchRegistrationService.register()` / reindex |
| Compliance Platform | `AuditRegistrationService.record()` |
| Domain subscribers | IIL event consumption |
| Integration Platform | Optional outbound sync jobs |

### 11.2 Sync State Model

```typescript
type SyncState = "pending" | "in_progress" | "completed" | "failed" | "retry_pending";
```

Synchronization is **idempotent**. Duplicate events produce no duplicate projections. Failed syncs retry with exponential backoff (framework — aligns with P-010.7 RetryManager patterns).

### 11.3 Synchronization Flow

```
MasterDataService.update() succeeds
  → SynchronizationService.enqueue(entityType, entityId)
  → Parallel: SearchRegistration + AuditRegistration
  → Publish MasterEntityUpdated via IIL
  → SynchronizationCompleted event on success
```

---

## 12. Event Publishing Architecture

Events publish through **Intelligence Integration Layer** (P-006) using `sourceService: "data-platform"`.

### 12.1 Outbound Event Catalog

| Event | Trigger | Payload Minimum |
|-------|---------|-----------------|
| **MasterEntityCreated** | New master entity persisted | entityType, entityId, domainKey, organizationId |
| **MasterEntityUpdated** | Master entity updated | entityType, entityId, changedFields, correlationId |
| **MasterEntityArchived** | Entity archived | entityType, entityId, archivedAt |
| **ReferenceDataUpdated** | Reference code created/deprecated | codeListKey, version, organizationId |
| **MetadataChanged** | Metadata mutation | entityType, entityId, metadataKeys |
| **SynchronizationCompleted** | Sync job success | entityType, entityId, targets |
| **ValidationFailed** | Pipeline failure | entityType, stage, issueCodes |
| **GovernanceViolationDetected** | Policy breach | policyReference, entityType, detail |

### 12.2 Event Rules

| Rule | Description |
|------|-------------|
| EVT-01 | Events publish **after** repository commit |
| EVT-02 | Every event includes `organizationId`, `correlationId`, `actorId` |
| EVT-03 | Event payloads are immutable once published |
| EVT-04 | `data-platform` registered in ServiceRegistry (P-006) |
| EVT-05 | Inbound handlers registered via `register-data-subscribers.ts` |

### 12.3 Inbound Events (Consumed)

| Event | Action |
|-------|--------|
| `EntityCreated` (domain) | Optional registry validation; audit registration |
| `EntityUpdated` (domain) | Sync state refresh if registered master type |
| `ImportCompleted` (integration) | Trigger validation pipeline for imported batch |

---

## 13. Governance Services

**GovernanceService** enforces D-013 policies at runtime:

| Operation | Description |
|-----------|-------------|
| `validateRegistration()` | Entity type registration approval |
| `checkPolicy()` | Policy reference evaluation |
| `recordViolation()` | Emit `GovernanceViolationDetected` |
| `recordException()` | Approved policy exception with expiry |
| `resolveMergeApproval()` | Material merge requires owner approval flag |

GovernanceService delegates to `GovernanceRuleEngine` internally and persists via `GovernanceRepository`. It integrates with P-010.6 Compliance Platform for violation audit.

---

## 14. Query Services

Read operations are exposed through public services — not repositories:

| Query | Service Method |
|-------|----------------|
| Find master entity by ID | `MasterDataService.get()` |
| Find by business key | `MasterDataService.findByBusinessKey()` |
| List with filters | `MasterDataService.list()` |
| Resolve reference code | `ReferenceDataService.resolve()` |
| Lookup entity type metadata | `EntityRegistryService.getEntityType()` |
| Validation preview | `ValidationService.validate()` |

Cross-domain modules **must** use these methods. Direct repository access from domains is prohibited.

---

## 15. Extension Strategy

### 15.1 Domain Extensions

Domains extend master entities via **metadata payloads** validated against registry schema — not by modifying platform types.

```typescript
// Conceptual — domain extends via metadata
type MasterEntityRecord = {
  readonly id: string;                    // immutable surrogate
  readonly organizationId: string;
  readonly entityType: string;
  readonly businessKey: string;
  readonly displayName: string;
  readonly status: MasterEntityStatus;
  readonly domainKey: string;
  readonly metadata: Readonly<Record<string, string>>;  // domain extensions
  readonly extensions?: Readonly<Record<string, unknown>>;  // typed per registry
};
```

### 15.2 Organization Extensions

Organizations configure custom attributes through `MetadataService.upsertOrgAttributeDefinition()`. Attributes appear in validation stage 5.

### 15.3 Future Entity Types

New entity types require:

1. D-012 blueprint amendment (or domain blueprint reference)
2. `EntityRegistryService.registerEntityType()`
3. Governance approval
4. Search and audit registration configuration

---

## 16. Dependency Rules

### 16.1 Allowed Dependencies

```
Business Domains
  → lib/platform/data (public facade only)
  → types/enterprise-data.ts

lib/platform/data
  → lib/platform/intelligence (IIL publish)
  → lib/platform/compliance (audit registration adapter)
  → lib/platform/search (search registration adapter)
  → types/services.ts (ServiceContext)
  → types/enterprise-data.ts

lib/platform/data/services
  → lib/platform/data/repositories (internal)
  → lib/platform/data/validation (internal)
  → lib/platform/data/events (internal)
```

### 16.2 Prohibited Dependencies

| Prohibition | Reason |
|-------------|--------|
| Domains → data repositories | Breaks encapsulation |
| Data platform → domain modules | Circular coupling |
| Data platform → finance/hospitality/crm internals | Domain isolation |
| Repositories → services | Inverted dependency |
| Public exports of validators/sync internals | Contract stability |

### 16.3 Circular Dependency Prevention

The Data Platform **references** Search, Compliance, and Integration platforms through **adapter interfaces** injected at facade construction — not through direct circular imports. Default adapters call P-010.5/P-010.6 public facades.

---

## 17. Testing Strategy

| Layer | Test Type | Location |
|-------|-----------|----------|
| Validation pipeline stages | Unit tests per validator | `tests/platform/data/validation/` |
| Services | Operations tests with in-memory repos | `tests/platform/data/DataPlatformOperations.test.ts` |
| Facade | Certification tests (public API surface) | `tests/platform/data/DataPlatformCertification.test.ts` |
| Events | Event publish/consume integration | `tests/platform/data/DataPlatformEvents.test.ts` |
| Organization isolation | Cross-tenant negative tests | Certification suite |

Test conventions match P-010.6 compliance tests: fresh `InMemory*Repository` per test suite, `ServiceContext` with `org-orania`.

---

## 18. Performance Considerations

| Concern | Engineering Approach |
|---------|---------------------|
| List queries | Pagination mandatory; default page size 50 |
| Duplicate detection | Fingerprint index on repository |
| Validation pipeline | Short-circuit on error; cache reference data per request |
| Sync | Async enqueue; non-blocking master data commit |
| Registry lookup | In-memory cache with registry version invalidation |
| Bulk import | Batch validation with preview mode |

Production-tier indexing and caching deferred to persistence mission (ES-036 implementation phase).

---

## 19. Security Considerations

| Control | Implementation Point |
|---------|---------------------|
| Organization isolation | `DataRulesEngine.validateOrganizationAccess()` on every operation |
| Classification enforcement | `GovernanceValidator` checks role against entity classification |
| Immutable identity | `EntityIdentityService` rejects primary ID mutation |
| Audit | `AuditRegistrationService` for all mutations |
| Credential isolation | No credentials in master data platform |
| Least privilege | Service methods validate `ServiceContext.role` for admin operations |

Aligns with [ES-059 — Platform Security](../../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) and D-013 privacy/classification rules.

---

## 20. Engineering Principles

| Principle | Application |
|-----------|-------------|
| **Facade Pattern** | `DataPlatformFacade` — single public entry |
| **Repository Pattern** | Internal persistence abstraction |
| **Service Layer** | Business logic in services; repos are dumb stores |
| **Strategy Pattern** | `SynchronizationStrategy` for sync targets |
| **Dependency Injection** | Constructor injection in facade |
| **SOLID** | Single responsibility per service; interface segregation on repos |
| **Organization Scoped** | Mandatory tenant filter |
| **Event-driven** | IIL publish after commit |
| **Immutable Identity** | Surrogate IDs never reused or mutated |

---

## 21. Future Expansion

| Mission | Scope |
|---------|-------|
| **P-011.1** | Master data platform implementation (core services + repos) |
| **P-011.2** | Reference data registry implementation |
| **P-011.3** | Metadata registry + organization attribute definitions |
| **P-011.4** | Validation pipeline implementation |
| **P-011.5** | Synchronization + search/compliance adapters |
| **P-011.6** | REST API routes |
| **P-011.7** | Production persistence tier (ES-036) |
| **P-011.8** | Data platform certification |

---

## 22. Architecture Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| ED-001-01 | Root package at `lib/platform/data/` | Consistent with P-010.x platform modules |
| ED-001-02 | Ten public services via facade | Matches mission scope; clear boundaries |
| ED-001-03 | Eight-stage validation pipeline | Covers D-013 governance requirements |
| ED-001-04 | Repositories internal; services public | ES-011 platform service pattern |
| ED-001-05 | Events via IIL with `data-platform` service ID | Unified event architecture |
| ED-001-06 | Adapter injection for Search/Compliance | Prevents circular dependencies |
| ED-001-07 | Types in `types/enterprise-data.ts` | Separates contracts from implementation |
| ED-001-08 | Entity registry required before production MDM | Governance gate from D-013 |
| ED-001-09 | Sync is async and idempotent | Eventual consistency without blocking writes |
| ED-001-10 | No implementation in ES-DATA-001 | Specification precedes P-011.x missions |

---

## 23. Canon Compliance

| Chapter | Alignment |
|---------|-----------|
| **C-003 Architecture** | Platform layer; domain isolation; shared data services |
| **C-006 Engineering** | Facade, repository, service layer, validation, testing strategy |
| **C-008 Integration** | Event-driven synchronization via IIL |
| **C-010 Security** | Organization isolation, classification, audit registration |

---

## 24. Document Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Chief Enterprise Architect | — | — | Pending |
| Platform Engineering Lead | — | — | Pending |
| Data Governance Lead | — | — | Pending |

---

*Engineering specification only. No implementation authorized by this document.*
