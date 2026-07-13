# ORION PLATFORM

# ES-010

# ORION Persistence Foundation

---

## 1. Document Information

| Field | Value |
|-------|-------|
| **ID** | ES-010 |
| **Title** | ORION Persistence Foundation |
| **Version** | 1.0 |
| **Status** | Approved (Frozen) |
| **Sprint** | Sprint 10 |
| **Owner** | Mohammad Shafi Goroo — Founder & CEO |
| **Co-Owner** | ORION — Chief AI Architect & CTO |
| **Classification** | Internal |
| **Last Updated** | July 2026 |
| **Approval Date** | 13 July 2026 |
| **Approved By** | Mohammad Shafi Goroo — Founder & CEO; ORION — Chief AI Architect & CTO |

---

## 2. Purpose

Define the **Persistence Foundation** for the ORION Platform.

This specification establishes the platform's data access architecture — the engineering structure that governs how ORION reads, writes, validates, and isolates data across all modules.

Persistence is the substrate beneath Identity, Business Modules, AI Intelligence, and Integrations. Without a consistent data access model, every module would invent its own storage patterns, breaking tenant isolation, auditability, and long-term scalability.

This document defines **engineering structure and principles only**. It does not prescribe database vendors, schemas, migrations, or implementation code. Those belong in future Engineering Specifications once this foundation is approved.

**This ES answers:**

- How should ORION organize data access?
- Where do repositories, services, and domain models live?
- How is tenant isolation enforced at the data layer?
- How do modules consume persistence without coupling to storage technology?

---

## 3. Scope

### Included

- Persistence architecture principles
- Repository pattern definition
- Data access layer structure
- Domain model boundaries
- Service layer responsibilities
- Transaction principles
- Error handling conventions
- Audit strategy at the data layer
- Multi-tenant data rules
- Security principles for data access
- Future database integration guidelines

### Excluded

- Database vendor selection
- Database schema design
- Migration scripts
- ORM configuration
- API route implementation
- Connection pooling configuration
- Production infrastructure provisioning

---

## 4. Architecture Alignment

ES-010 implements the **Infrastructure layer** persistence services defined in PA-001.

### Platform Layer Position

```
Business Modules (ORANIA, ATSAR, CRM, Finance, Marketing, AI)
        ↓
Service Layer (business logic, orchestration)
        ↓
Repository Layer (data access contracts)
        ↓
Data Access Layer (adapters, future database drivers)
        ↓
Persistence Store (future — vendor TBD)
```

### Relationship to ES-009

ES-009 established Identity & Authentication foundation: users, organizations, workspaces, roles, permissions, sessions, and audit events. ES-010 defines how those identity concepts and all future domain entities are **persisted and retrieved** through a consistent architecture.

Identity services consume repositories. Business modules consume repositories. No module accesses storage directly.

### Relationship to PA-001 Data Ownership

Per PA-001:

- ORION owns orchestration data (tasks, settings, preferences, AI context, audit logs)
- Source systems own domain data (reservations, orders, campaigns)
- ORION stores synchronized copies for unified visibility
- Tenants are isolated at every layer

The persistence foundation must support all three data ownership models without architectural divergence.

### Current State

| Component | Status |
|-----------|--------|
| Identity Engine (ES-009) | Foundation complete — in-memory placeholders |
| Mission Control data | Static mock data in `lib/dashboard-data.ts` |
| Database connection | Not implemented |
| Repository layer | Not implemented |

### Target State

A vendor-agnostic persistence architecture where any module can declare a repository contract, receive tenant-scoped data through services, and remain testable without a live database.

---

## 5. Persistence Philosophy

ORION persistence follows the ORION Constitution and PA-001 architectural principles.

| Principle | Persistence Implication |
|-----------|------------------------|
| **Business First** | Data models reflect business entities, not database tables |
| **Simplicity** | The simplest data access pattern that delivers the outcome |
| **Security by Design** | Tenant isolation and access control are structural, not optional |
| **Reusability** | Shared repository and service patterns across all modules |
| **Integration Before Replacement** | Synced data is cached; source systems remain authoritative |
| **Continuous Improvement** | Persistence evolves incrementally without rewriting consumers |

### Core Beliefs

1. **Storage technology is an implementation detail.** Application code depends on interfaces, not databases.
2. **Every read and write is tenant-scoped.** No query executes without organizational context.
3. **Repositories are the only gateway to data.** Services never construct queries directly.
4. **Domain models are pure.** They carry no database driver knowledge.
5. **Auditability is mandatory.** Security-relevant mutations leave a trace.
6. **Testability is non-negotiable.** Every layer must be mockable in isolation.

---

## 6. Repository Pattern

The **Repository Pattern** is the primary data access abstraction in ORION.

### Definition

A repository encapsulates the logic required to access a specific aggregate or entity collection. It presents a collection-like interface to the service layer while hiding storage mechanics.

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Query** | Retrieve entities by identifier, filter, or relationship |
| **Persist** | Create and update entities |
| **Remove** | Soft-delete or hard-delete per domain rules |
| **Scope** | Enforce tenant and workspace boundaries on every operation |

### Repository Rules

1. One repository per aggregate root (e.g. `UserRepository`, `OrganizationRepository`, `TaskRepository`).
2. Repositories expose **interfaces**; implementations live in the data access layer.
3. Repositories accept a **tenant context** on every operation.
4. Repositories return **domain models**, not raw database rows.
5. Repositories do not contain business logic — only data access logic.
6. Repositories do not call other repositories — orchestration belongs in services.

### Interface Contract (Conceptual)

```
Repository<T>
  findById(id, context) → T | null
  findMany(filter, context) → T[]
  create(entity, context) → T
  update(entity, context) → T
  delete(id, context) → void
```

Concrete interfaces will be defined per entity in future ES documents.

### Dependency Direction

```
Service → Repository Interface → Repository Implementation → Data Access Layer
```

Services depend on abstractions. Implementations depend on the data access layer. Domain models depend on nothing.

---

## 7. Data Access Layer

The **Data Access Layer** is the lowest application tier. It translates repository operations into storage commands.

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Adapter implementation** | Fulfill repository interfaces |
| **Connection management** | Manage database connections (future) |
| **Query execution** | Execute reads and writes |
| **Mapping** | Translate between storage records and domain models |
| **Error translation** | Convert storage errors into domain errors |

### Structural Boundaries

```
lib/
  repositories/          # Repository interfaces (contracts)
  data/                  # Data access implementations (adapters)
    adapters/            # Future database-specific adapters
    mappers/             # Record ↔ domain model translation
```

### Rules

1. The data access layer is the **only** layer that may interact with storage drivers.
2. No UI component, API route, or service imports from the data access layer directly.
3. Adapters are swappable — replacing a database must not require service changes.
4. Mappers are explicit — no implicit ORM entity leakage into domain models.
5. Connection credentials are never hardcoded — environment variables only.

### Current Phase

During Sprint 10 foundation, repositories may use **in-memory adapters** for development and testing. These adapters implement the same interfaces as future database adapters, ensuring consumers are storage-agnostic from day one.

---

## 8. Domain Models

**Domain models** represent business entities in their purest form.

### Characteristics

| Characteristic | Rule |
|----------------|------|
| **Purity** | No imports from database drivers, ORMs, or frameworks |
| **Immutability preference** | Favor immutable data structures where practical |
| **Validation** | Self-validate on construction where appropriate |
| **Identity** | Every entity has a unique, typed identifier |
| **Tenant awareness** | Tenant-scoped entities carry `organizationId` |

### Domain Model Categories

| Category | Examples | Owner |
|----------|----------|-------|
| **Identity** | User, Organization, Workspace, Role, Permission | Platform Core |
| **Orchestration** | Task, Notification, Setting, AuditEvent | Platform Core |
| **Business** | Reservation, Order, Contact, Campaign | Business Modules |
| **Synced** | SyncedReservation, SyncedOrder, SyncedCampaign | Integration Layer |
| **AI** | Conversation, Memory, Recommendation | AI Intelligence |

### Separation from Storage

Domain models live in `types/` or `domain/` directories. They must not contain:

- SQL fragments
- ORM decorators
- Database column names
- Connection references

Storage record shapes (DTOs) belong in the data access layer and are mapped to domain models at the adapter boundary.

### Relationship to ES-009 Types

ES-009 defined identity types in `types/auth.ts`. These types serve as the initial domain models for identity. ES-010 establishes the pattern that all future entities follow the same separation.

---

## 9. Service Layer

The **Service Layer** contains business logic and orchestrates operations across repositories.

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Business rules** | Enforce domain logic and validation |
| **Orchestration** | Coordinate multiple repository operations |
| **Authorization** | Verify permissions before data access (via ES-009 RBAC) |
| **Transaction boundaries** | Define unit-of-work scope |
| **Audit triggers** | Record security-relevant mutations |

### Structural Boundaries

```
lib/
  services/              # Business logic services
    identity/            # User, organization, workspace services
    platform/            # Tasks, notifications, settings services
    audit/               # Audit recording services
```

### Service Rules

1. Services depend on **repository interfaces**, never implementations.
2. Services receive **session context** (user, organization, workspace) from the caller.
3. Services validate **permissions** before invoking repositories.
4. Services do not import UI components or API route handlers.
5. Services are **stateless** — all state comes from parameters and repositories.
6. One service per domain area (e.g. `UserService`, `OrganizationService`).

### Dependency Flow

```
API Route / Server Action
        ↓
Service (business logic + authorization)
        ↓
Repository Interface
        ↓
Repository Implementation
        ↓
Data Access Layer
```

---

## 10. Transaction Principles

Transactions define atomic units of work.

### Principles

| Principle | Rule |
|-----------|------|
| **Atomicity** | Related mutations succeed or fail together |
| **Service-owned boundaries** | Services define transaction scope, not repositories |
| **Minimal scope** | Transactions cover the smallest necessary operation set |
| **No nested transactions** | Flatten or use savepoints; avoid deep nesting |
| **Idempotency awareness** | Write operations should be safe to retry where possible |

### Unit of Work

A **Unit of Work** tracks changes within a transaction and commits or rolls back as a single operation.

```
Service.beginTransaction()
  → Repository.create(entity)
  → Repository.update(related)
  → AuditService.record(event)
Service.commit()
```

The Unit of Work pattern will be implemented in a future ES. ES-010 establishes the principle that services own transaction boundaries.

### Read vs Write

| Operation | Transaction Required |
|-----------|---------------------|
| Single read | No |
| Read with side effects (audit log) | Optional |
| Single write | Yes |
| Multi-entity write | Yes |
| Cross-repository orchestration | Yes |

---

## 11. Error Handling

Persistence errors must be handled consistently across the platform.

### Error Categories

| Category | Description | Example |
|----------|-------------|---------|
| **NotFound** | Entity does not exist within tenant scope | User ID not found |
| **Conflict** | Duplicate or constraint violation | Email already registered |
| **Validation** | Domain rule violation | Invalid organization slug |
| **Authorization** | Caller lacks permission | Staff accessing finance data |
| **TenantViolation** | Cross-tenant access attempted | Organization ID mismatch |
| **Storage** | Infrastructure failure | Connection timeout |
| **Unknown** | Unclassified failure | Unexpected adapter error |

### Error Handling Rules

1. Repositories throw **typed domain errors**, not raw storage exceptions.
2. Services catch repository errors and apply business context.
3. API routes translate service errors into HTTP responses.
4. Storage errors are **never** exposed to end users — generic messages only.
5. `TenantViolation` errors are logged as security events.
6. All errors include sufficient context for debugging without exposing sensitive data.

### Error Flow

```
Storage Error → Adapter translates → Domain Error → Service handles → API Response
```

---

## 12. Audit Strategy

Auditability is a platform requirement established in PRD-001 and ES-009.

### Auditable Events

| Event Category | Examples |
|----------------|----------|
| **Authentication** | Login, logout, password change, session expiry |
| **Authorization** | Permission denied, role change, access escalation |
| **Data mutation** | Entity created, updated, deleted |
| **Tenant operations** | Organization created, workspace switched |
| **Security** | Cross-tenant violation, credential access |

### Audit Principles

1. **Append-only** — audit records are never modified or deleted.
2. **Tenant-scoped** — audit logs belong to an organization.
3. **Actor-attributed** — every entry records who performed the action.
4. **Timestamped** — every entry records when the action occurred.
5. **Structured** — audit entries use typed event categories, not free text.
6. **Service-triggered** — services invoke audit recording; repositories do not.

### Audit Architecture

```
Service performs mutation
        ↓
AuditService.record(event, context)
        ↓
AuditRepository.persist(entry, context)
        ↓
Audit Store (future)
```

ES-009 established in-memory audit helpers in `lib/auth/audit.ts`. ES-010 defines the principle that audit persistence follows the same repository pattern as all other data.

---

## 13. Multi-tenant Data Rules

ORION is a multi-tenant platform. Every persistence operation must enforce tenant isolation.

### Tenant Hierarchy

```
Platform
  └── Organization (Tenant)
        └── Workspace
              └── Data (scoped)
```

### Rules

| Rule | Description |
|------|-------------|
| **MT-001** | Every query includes `organizationId` scope |
| **MT-002** | No repository method operates without tenant context |
| **MT-003** | Cross-tenant reads are prohibited |
| **MT-004** | Cross-tenant writes are prohibited |
| **MT-005** | Workspace-scoped data additionally requires `workspaceId` |
| **MT-006** | A user may hold different roles in different organizations |
| **MT-007** | Synced data from external systems is tenant-scoped on ingestion |
| **MT-008** | AI context and conversation history are tenant-scoped |
| **MT-009** | Audit logs are tenant-scoped and organization-attributed |
| **MT-010** | Platform-level data (if any) is explicitly marked and access-controlled |

### Tenant Context

Every service and repository operation receives a **TenantContext**:

```
TenantContext
  organizationId: string
  workspaceId: string
  userId: string
  role: RoleSlug
```

Tenant context originates from the authenticated session (ES-009) and propagates through every layer.

### Violation Response

Cross-tenant access attempts must:

1. Fail the operation immediately
2. Return a `TenantViolation` error
3. Record a security audit event
4. Never reveal whether the target data exists

---

## 14. Security Principles

Per ORION Constitution Article 9 — Security.

| Principle | Persistence Implementation |
|-----------|---------------------------|
| **Least privilege** | Repositories enforce scope; services enforce permissions |
| **No secrets in code** | Connection strings via environment variables only |
| **Encrypted credentials** | Integration tokens encrypted at rest (future) |
| **Input validation** | All data validated before persistence |
| **Parameterized access** | No string-constructed queries (future adapter rule) |
| **Immutable audit** | Audit records are append-only |
| **Privacy by default** | Data is scoped to the minimum necessary tenant context |

### Data Classification

| Classification | Handling |
|----------------|----------|
| **Public** | Platform metadata, non-sensitive configuration |
| **Internal** | Business operational data, scoped by tenant |
| **Sensitive** | Credentials, financial data, PII — encrypted at rest |
| **Restricted** | Authentication secrets, API keys — never logged, encrypted |

---

## 15. Future Database Integration

This section defines how a database will be integrated without prescribing vendor or schema.

### Integration Principles

1. **Interface-first** — repository interfaces exist before any database is connected.
2. **Adapter swap** — in-memory adapters are replaced by database adapters without service changes.
3. **Incremental adoption** — entities are persisted one at a time, not in a single migration event.
4. **Backward compatible** — mock data coexists during transition; modules degrade gracefully.
5. **Environment-driven** — database connection is configured via environment, not code.

### Integration Sequence (Future ES)

| Phase | Scope |
|-------|-------|
| Phase 1 | Identity entities — User, Organization, Workspace |
| Phase 2 | Platform entities — Audit, Settings, Notifications |
| Phase 3 | Business module entities — ORANIA, ATSAR |
| Phase 4 | Synced data — Integration cache tables |
| Phase 5 | AI entities — Conversations, Memory |

### Adapter Pattern

```
Repository Interface
        ↓
In-Memory Adapter (Sprint 10 — development)
        ↓
Database Adapter (future ES — production)
```

Both adapters implement the same interface. Services and API routes are unchanged during the transition.

### Configuration (Future)

Database connection will be configured through environment variables. No connection details will appear in source code, documentation, or version control.

---

# Success Criteria

The Persistence Foundation is considered complete when:

- Business services can store and retrieve domain entities through repository interfaces.
- Repository implementations can be replaced without modifying business services.
- Business modules remain unaware of persistence technology.
- Tenant isolation is enforced by default.
- Audit events can be generated for every persistence operation.
- All persistence components build successfully.
- TypeScript passes without errors.
- ESLint passes without warnings.

---

## 16. Out of Scope

The following are explicitly excluded from ES-010 and will be addressed in future specifications.

| Item | Future Document |
|------|-----------------|
| Database vendor selection | ES-011 or infrastructure ES |
| Schema design and ERD | ES-011 or domain-specific ES |
| Migration scripts | ES-011 |
| ORM / query builder selection | ES-011 |
| Connection pooling and caching | Infrastructure ES |
| API route implementation | Domain-specific ES |
| Real-time data sync | Integration ES |
| File and object storage | Document Service ES |
| Search indexing | Search Service ES |
| Backup and disaster recovery | Infrastructure ES |
| Performance benchmarking | Operations ES |

---

# Engineering Principles

The Persistence Foundation shall follow these engineering principles:

- Business modules must never access persistence directly.
- Business services coordinate all business rules.
- Repository interfaces encapsulate persistence operations.
- Persistence adapters encapsulate storage technology.
- Every persistence operation must be tenant-aware.
- Audit logging is append-only and initiated by the service layer.
- Domain models remain persistence-agnostic.
- Dependency inversion applies throughout the persistence layer.
- Strong typing is mandatory.
- Every repository implementation must be independently testable.

---

## 17. Related Documents

| Document | Location | Relationship |
|----------|----------|--------------|
| **PA-001** | `docs/03_Architecture/ORION_Platform_Architecture.md` | Master architecture — data ownership, tenant model, technology stack |
| **PRD-001** | `docs/01_Product/PRD-001-Identity-Authentication.md` | Identity product requirements — audit, multi-tenant rules |
| **ES-009** | `docs/02_Engineering/ES-009-Identity-Authentication-Foundation.md` | Identity engine — types, session, RBAC foundation |
| **ORION Constitution** | `docs/09_Standards/ORION_Constitution.md` | Governing principles — security, simplicity, reusability |
| **ORION Design System** | `docs/04_Design/ORION_Design_System.md` | UI layer — no direct persistence relationship |
| **ES-006** | `docs/02_Engineering/ES-006-Component-Architecture.md` | UI component architecture |
| **ES-008** | `docs/02_Engineering/ES-008-Design-System.md` | Design System implementation |
| **Engineering Standards** | `docs/09_Standards/Engineering_Standards.md` | Development rules and sprint requirements |
| **Product Backlog** | `docs/01_Product/ORION_Product_Backlog.md` | Business capabilities requiring persistence |

---

# Architecture Approval

Status

Approved (Frozen)

Implementation Status

Ready for Development

Frozen Date

13 July 2026

Governance

- This document is frozen.
- Changes require Founder approval.
- Engineering implementation must conform to this specification.
- Future revisions require a new version.

---

## Approval

| Role | Name | Status |
|------|------|--------|
| Founder & CEO | Mohammad Shafi Goroo | Pending Review |
| Chief AI Architect & CTO | ORION | Pending Review |

---

> *Persistence is the memory of the platform. Every module depends on consistent, secure, tenant-aware data access.*
