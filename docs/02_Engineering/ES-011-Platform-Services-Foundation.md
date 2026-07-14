# ORION PLATFORM

# ES-011

# ORION Platform Services Foundation

---

## 1. Document Information

| Field | Value |
|-------|-------|
| **ID** | ES-011 |
| **Title** | ORION Platform Services Foundation |
| **Version** | 1.0 |
| **Status** | Approved (Frozen) |
| **Sprint** | Sprint 11 (proposed) |
| **Owner** | Mohammad Shafi Goroo — Founder & CEO |
| **Co-Owner** | ORION — Chief AI Architect & CTO |
| **Classification** | Internal |
| **Last Updated** | 14 July 2026 |
| **Approval Date** | 14 July 2026 |
| **Approved By** | Mohammad Shafi Goroo — Founder & CEO; ORION — Chief AI Architect & CTO |
| **Target Release** | v0.5.0 — Platform Services |

---

## 2. Purpose

Define the **Platform Services Foundation** for the ORION Platform.

This specification establishes the engineering architecture for shared platform capabilities that every business module depends on — notifications, activity logging, background processing, configuration, and cross-cutting orchestration services.

ES-009 delivered the Identity Platform. ES-010 delivered the Persistence Foundation. ES-011 defines the **service layer above persistence** that unifies platform behavior across all modules without duplicating infrastructure concerns.

This document defines **engineering structure and principles only**. It does not prescribe implementation code, vendor selections, queue infrastructure, or API routes. Those belong in future Engineering Specifications once this foundation is approved.

**This ES answers:**

- What constitutes a Platform Service versus a module service?
- How do platform services consume identity and persistence foundations?
- How do modules request notifications, activity records, and background processing?
- How are events, jobs, and audit trails coordinated across the platform?
- What contracts govern dependency injection and service boundaries?

---

## 3. Scope

### Included

- Platform Services architecture and taxonomy
- Service design principles and contracts
- Dependency rules between platform, persistence, and module layers
- Event-driven architecture principles
- Background job framework principles
- Notification framework principles
- Activity and audit service boundaries
- Configuration and feature flag principles
- Error handling conventions for platform services
- Multi-tenant rules for platform service operations
- Future integration guidelines

### Excluded

- Implementation code
- API route definitions
- Database schema design
- Queue or message broker vendor selection
- Email, SMS, and push provider configuration
- UI components for notification display
- Module-specific business logic
- Third-party integration connectors
- Production infrastructure provisioning

---

## 4. Architecture Alignment

ES-011 implements the **Platform Services layer** defined in PA-001, building on foundations delivered in v0.3.0 and v0.4.0.

### Platform Layer Position

```
Business Modules (ORANIA, ATSAR, CRM, Finance, Marketing, AI)
        ↓
Module Services (domain-specific business logic)
        ↓
Platform Services (notifications, activity, jobs, config)    ← ES-011
        ↓
Persistence Services (ES-010)
        ↓
Repository Layer (ES-010)
        ↓
Persistence Store (In-memory default; PostgreSQL target)
```

### Relationship to PA-001

Per PA-001 §9 Platform Services, the following capabilities are owned by the platform:

| Service | PA-001 Status | ES-011 Role |
|---------|---------------|-------------|
| Authentication | Foundation implemented (ES-009) | Consumed — not redefined |
| User Management | Foundation types implemented (ES-009) | Extended through platform APIs |
| Roles & Permissions | Foundation implemented (ES-009) | Consumed — authorization gate |
| Notifications | Planned | Defined by ES-011 |
| Activity Log | Planned | Defined by ES-011 |
| Settings | Planned | Partially addressed via Configuration |
| Audit Trail | Foundation helpers (ES-009, ES-010) | Unified by ES-011 |
| Search | Planned | Out of scope — future ES |

### Relationship to ES-009

ES-009 established identity types, session flow, RBAC, route protection, and authentication audit helpers in `lib/auth/`. Platform Services consume `TenantContext` and permission evaluation from the identity foundation. ES-011 does not redefine identity concepts.

### Relationship to ES-010

ES-010 established repository contracts, persistence services, tenant-scoped data access, audit placeholders, and transaction placeholders in `lib/persistence/`. Platform Services persist their domain entities through persistence services and repositories. ES-011 does not redefine persistence patterns.

### Relationship to PRD-001

PRD-001 defines audit requirements (FR-045 through FR-048), session security, and governance visibility. ES-011 Activity & Audit Services implement the platform-level fulfillment of these product requirements.

### Current State

| Component | Status |
|-----------|--------|
| Identity foundation (ES-009) | Complete (v0.3.0) |
| Persistence foundation (ES-010) | Complete (v0.4.0) |
| Platform Services layer | Not implemented |
| Notification service | Not implemented |
| Activity log service | Not implemented |
| Background job framework | Not implemented |
| Event bus | Not implemented |
| Configuration service | Not implemented |

### Target State

A unified Platform Services layer where any module can emit events, schedule jobs, deliver notifications, and record activity through stable service contracts — without coupling to infrastructure vendors or storage technology.

---

## 5. Platform Services Overview

Platform Services are **shared backend capabilities** required by every module. They are owned by the platform, not by individual business modules.

### Service Taxonomy

| Category | Services | Description |
|----------|----------|-------------|
| **Identity** | Authentication, User Management, RBAC | Delivered by ES-009 — consumed by ES-011 |
| **Persistence** | Repository access, tenant-scoped storage | Delivered by ES-010 — consumed by ES-011 |
| **Communication** | Notifications, Messaging (future) | User and system alerts across channels |
| **Observability** | Activity Log, Audit Trail | Event history and compliance records |
| **Orchestration** | Background Jobs, Event Bus | Async processing and cross-service coordination |
| **Configuration** | Settings, Feature Flags | Tenant and platform runtime configuration |

### Structural Boundaries

```
lib/
  platform/                  # Platform Services (ES-011 target)
    notifications/
    activity/
    audit/
    jobs/
    events/
    config/
  persistence/               # Persistence Foundation (ES-010)
  auth/                      # Identity Foundation (ES-009)
  services/                  # Module services (per business domain)
```

### Consumption Model

```
Module Service
    ↓
Platform Service Interface
    ↓
Platform Service Implementation
    ↓
Persistence Service (ES-010)
    ↓
Repository (ES-010)
```

Business modules request platform capabilities through **constructor-injected service interfaces**. Modules never invoke queue infrastructure, email providers, or storage adapters directly.

---

## 6. Service Design Principles

Platform Services follow the ORION Constitution and PA-001 architectural principles.

| Principle | Platform Service Implication |
|-----------|------------------------------|
| **Business First** | Services solve cross-module operational needs, not infrastructure curiosity |
| **Simplicity** | One service contract per capability; no composite god-services |
| **Security by Design** | Every operation is tenant-scoped and permission-aware |
| **Reusability** | Shared contracts consumed identically by all modules |
| **Integration Before Replacement** | External providers are adapters behind service interfaces |
| **Continuous Improvement** | Services evolve through versioned contracts, not breaking changes |

### Core Beliefs

1. **Platform Services orchestrate; they do not persist directly.** All storage flows through ES-010 persistence services.
2. **Every operation carries TenantContext.** No platform service executes without organizational and workspace scope.
3. **Services are stateless.** All state resides in repositories or external systems.
4. **Contracts precede implementations.** Interfaces are defined and approved before adapters are built.
5. **Side effects are explicit.** Events, notifications, and jobs are intentional — never implicit.
6. **Auditability is mandatory.** Security-relevant platform operations leave an immutable trace.
7. **Testability is non-negotiable.** Every service must be mockable with in-memory adapters.

### Service Rules

1. Platform Services depend on **persistence interfaces**, never storage implementations.
2. Platform Services receive **TenantContext** from the caller on every operation.
3. Platform Services validate **permissions** (via ES-009) before executing privileged operations.
4. Platform Services do not import UI components or API route handlers.
5. Platform Services do not contain module-specific business rules.
6. One service interface per platform capability area.

---

## 7. Service Contracts

Every Platform Service exposes a typed contract. Contracts define inputs, outputs, and error envelopes — not implementation.

### Contract Structure

| Element | Requirement |
|---------|-------------|
| **Service interface** | TypeScript interface defining all public operations |
| **Input types** | Strongly typed request objects with tenant context |
| **Result envelope** | `ServiceResult<T>` aligned with ES-010 `RepositoryResult<T>` pattern |
| **Error codes** | Typed error categories — not raw exceptions |
| **Idempotency** | Write operations declare idempotency expectations |

### Proposed Service Interfaces

| Service | Core Operations |
|---------|-----------------|
| **NotificationService** | `send`, `schedule`, `cancel`, `getDeliveryStatus` |
| **ActivityService** | `record`, `findByUser`, `findByModule`, `findByDateRange` |
| **AuditService** | `record`, `findByOrganization`, `findByWorkspace`, `findByActor` |
| **JobService** | `enqueue`, `schedule`, `cancel`, `getStatus`, `retry` |
| **EventService** | `publish`, `subscribe` (interface only — transport TBD) |
| **ConfigService** | `get`, `set`, `getFeatureFlag`, `isFeatureEnabled` |

### Result Envelope

Platform Services return a consistent result type aligned with persistence:

```
ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError }
```

`ServiceError` carries `code`, `message`, and optional `details` — mirroring ES-010 error factories.

### Contract Rules

1. Contracts are defined in `lib/platform/contracts/` (proposed).
2. Implementations live in `lib/platform/<service>/`.
3. Contracts do not reference vendor SDKs, ORM types, or HTTP frameworks.
4. Contracts are versioned when breaking changes are unavoidable.
5. In-memory implementations serve as reference adapters for development and testing.

---

## 8. Dependency Rules

Platform Services follow strict dependency inversion. The dependency graph flows inward.

### Allowed Dependencies

```
Platform Service
    → Persistence Service (ES-010)
    → Identity helpers (ES-009) — TenantContext, permissions
    → Platform Service contracts (peer interfaces via events)
    → Configuration service
```

### Prohibited Dependencies

| From | To | Reason |
|------|----|--------|
| Platform Service | Module Service | Modules depend on platform, not reverse |
| Platform Service | Repository implementation | Services use persistence services, not repos directly |
| Platform Service | UI component | Presentation is separate |
| Platform Service | API route handler | Transport is separate |
| Platform Service | External vendor SDK | Vendors are hidden behind adapters |
| Module Service | Platform Service implementation | Modules depend on interfaces only |

### Injection Model

Platform Services are wired through the **PersistenceContainer** pattern established in ES-010, extended to a **PlatformContainer** (proposed):

```
PlatformContainer
    ├── PersistenceContainer (ES-010)
    ├── NotificationService
    ├── ActivityService
    ├── AuditService
    ├── JobService
    ├── EventService
    └── ConfigService
```

### Injection Rules

1. **Constructor injection only.** No service locator pattern.
2. **No global mutable state.** Container instances are explicit.
3. **Interface dependencies only.** Implementations are supplied at composition root.
4. **Composition root** is the single place where concrete implementations are bound.

---

## 9. Event-Driven Architecture

Platform Services use events to decouple producers from consumers. Events enable modules to react to platform and cross-module changes without direct coupling.

### Event Principles

| Principle | Rule |
|-----------|------|
| **Tenant-scoped** | Every event carries `organizationId` and `workspaceId` |
| **Typed** | Events use structured types — not free-text payloads |
| **Immutable** | Published events are never modified |
| **At-least-once** | Consumers must be idempotent |
| **Explicit** | Events are published intentionally by services — not by repositories |

### Event Categories

| Category | Examples | Publisher |
|----------|----------|-----------|
| **Identity** | `user.created`, `session.expired`, `permission.changed` | Identity services (ES-009) |
| **Persistence** | `entity.created`, `entity.updated`, `entity.deleted` | Persistence services (ES-010) |
| **Platform** | `notification.sent`, `job.completed`, `config.changed` | Platform services (ES-011) |
| **Module** | `reservation.created`, `order.fulfilled` | Module services (future) |

### Event Flow

```
Service performs operation
    ↓
Service publishes domain event
    ↓
Event Bus (transport TBD)
    ↓
Subscriber(s) handle event
    ↓
Optional: Notification / Activity / Job triggered
```

### Event Contract

```
PlatformEvent {
  id: string
  type: string
  timestamp: Date
  organizationId: string
  workspaceId: string
  actorUserId?: string
  payload: Record<string, unknown>
  metadata?: Record<string, string>
}
```

### Event Rules

1. Events are published by services, never by repositories or UI.
2. Event handlers must not throw unhandled exceptions — failures are logged and retried.
3. Cross-tenant event access is prohibited.
4. Event transport (in-process, queue, pub/sub) is an implementation detail hidden behind `EventService`.

---

## 10. Background Jobs

Background jobs handle asynchronous work that must not block user-facing requests.

### Job Principles

| Principle | Rule |
|-----------|------|
| **Tenant-scoped** | Every job carries tenant context |
| **Idempotent** | Jobs must be safe to retry |
| **Observable** | Job status is queryable |
| **Isolated** | Job failures do not cascade to unrelated work |
| **Minimal scope** | Jobs perform one unit of work |

### Job Categories

| Category | Examples | Trigger |
|----------|----------|---------|
| **Notification delivery** | Send email, push alert | NotificationService |
| **Data sync** | Pull reservations from PMS | Integration service (future) |
| **Report generation** | Daily briefing compilation | Scheduled |
| **Cleanup** | Expire stale sessions, purge temp data | Scheduled |
| **Retry** | Re-attempt failed delivery | JobService |

### Job Lifecycle

```
enqueue(job, context)
    ↓
Job queued (transport TBD)
    ↓
Worker picks up job
    ↓
Execute with tenant context
    ↓
success → mark complete
failure → retry (with backoff) or dead-letter
```

### Job Contract

```
PlatformJob {
  id: string
  type: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  organizationId: string
  workspaceId: string
  payload: Record<string, unknown>
  createdAt: Date
  scheduledAt?: Date
  completedAt?: Date
  attempts: number
  maxAttempts: number
}
```

### Job Rules

1. Jobs are enqueued through `JobService` — never directly to a queue.
2. Job workers validate `TenantContext` before execution.
3. Long-running jobs report progress through status updates.
4. Dead-letter jobs are retained for investigation — not silently discarded.
5. Queue infrastructure (in-process, Redis, cloud queue) is an adapter behind `JobService`.

---

## 11. Notification Framework

The Notification Framework delivers alerts to users across channels. It is a core Platform Service consumed by all modules.

### Notification Principles

| Principle | Rule |
|-----------|------|
| **User-centric** | Notifications target authenticated users within tenant scope |
| **Channel-agnostic** | Service contract is independent of email, push, or in-app delivery |
| **Preference-aware** | User and organization preferences govern delivery (future) |
| **Auditable** | Every notification attempt is recorded |
| **Non-blocking** | Delivery is asynchronous via background jobs |

### Notification Channels (Target)

| Channel | Priority | Status |
|---------|----------|--------|
| In-app | High | Planned |
| Email | High | Planned |
| Push | Medium | Planned |
| SMS | Low | Future |

### Notification Contract

```
Notification {
  id: string
  type: string
  recipientUserId: string
  organizationId: string
  workspaceId: string
  channel: "in_app" | "email" | "push" | "sms"
  subject: string
  body: string
  status: "pending" | "sent" | "delivered" | "failed" | "read"
  createdAt: Date
  sentAt?: Date
  metadata?: Record<string, string>
}
```

### Notification Flow

```
Module Service / Platform Service
    ↓
NotificationService.send(notification, context)
    ↓
Validate tenant scope and permissions
    ↓
Persist notification record (via ES-010)
    ↓
JobService.enqueue(delivery job)
    ↓
Channel adapter delivers (email provider, push service, etc.)
    ↓
ActivityService.record(delivery event)
```

### Notification Rules

1. Modules request notifications through `NotificationService` — never through email SDKs.
2. Notification content must not contain cross-tenant data.
3. Failed deliveries are retried with exponential backoff.
4. Users can view in-app notifications within their workspace scope.
5. Channel adapters are swappable without changing `NotificationService` contracts.

---

## 12. Activity & Audit Services

Activity and Audit Services provide observability and compliance. They fulfill PRD-001 governance requirements and PA-001 audit trail obligations.

### Service Boundaries

| Service | Purpose | Audience | Mutability |
|---------|---------|----------|------------|
| **ActivityService** | Operational event history — what happened in the platform | Managers, staff | Append-only |
| **AuditService** | Security and compliance records — who did what, when, outcome | Founders, administrators | Append-only |

### Activity vs Audit

| Dimension | Activity | Audit |
|-----------|----------|-------|
| **Scope** | All significant platform and module events | Security-relevant mutations and access |
| **Examples** | Task completed, notification sent, report generated | Login, permission change, data deletion |
| **Retention** | Configurable per organization | Policy-defined minimum retention (PRD-001 FR-048) |
| **Visibility** | Role-scoped within workspace | Founder full access; admin scoped (PRD-001 FR-046, FR-047) |

### Record Contract

```
ActivityRecord {
  id: string
  type: string
  timestamp: Date
  actorUserId: string
  organizationId: string
  workspaceId: string
  module?: string
  entityType?: string
  entityId?: string
  description: string
  metadata?: Record<string, string>
}

AuditRecord {
  id: string
  type: string
  timestamp: Date
  actorUserId: string
  organizationId: string
  workspaceId: string
  action: string
  outcome: "success" | "failure"
  targetEntityType?: string
  targetEntityId?: string
  ipAddress?: string
  metadata?: Record<string, string>
}
```

### Relationship to ES-009 and ES-010

| Layer | Current State | ES-011 Target |
|-------|---------------|---------------|
| ES-009 `lib/auth/audit.ts` | In-memory authentication audit helpers | Consumed by AuditService; auth events unified |
| ES-010 audit placeholders | `AuditRepository` no-op in persistence services | Replaced by AuditService with real persistence |
| ES-010 persistence audit entries | Structured mutation records | Consumed and stored by AuditService |

### Audit Rules (PRD-001 Alignment)

1. Audit entries include at minimum: timestamp, user, action type, and outcome (FR-045).
2. Founders can view the full audit log for their workspace (FR-046).
3. Administrators can view audit entries within their authority (FR-047).
4. Audit records are retained per platform policy and are not editable (FR-048).
5. Permission changes are auditable and attributable (FR-037).
6. Failed login attempts are captured (PRD-001 security metrics).

---

## 13. Configuration & Feature Flags

The Configuration Service manages organization settings, user preferences, and feature flags. It enables controlled rollout without code deployment.

### Configuration Principles

| Principle | Rule |
|-----------|------|
| **Tenant-scoped** | Organization settings are isolated per tenant |
| **Hierarchical** | Platform defaults → organization overrides → user overrides |
| **Typed** | Configuration keys have defined types and validation |
| **Auditable** | Configuration changes are recorded in the audit trail |
| **Safe defaults** | Missing configuration falls back to platform defaults |

### Configuration Categories

| Category | Scope | Examples |
|----------|-------|----------|
| **Platform** | Global | Maintenance mode, default retention periods |
| **Organization** | Tenant | Timezone, notification defaults, branding |
| **Workspace** | Workspace | Module enablement, workspace-specific settings |
| **User** | Individual | Language, notification preferences, dashboard layout |
| **Feature Flag** | Any scope | Gradual rollout, A/B testing, module gating |

### Feature Flag Contract

```
FeatureFlag {
  key: string
  enabled: boolean
  scope: "platform" | "organization" | "workspace" | "user"
  scopeId?: string
  description: string
  createdAt: Date
  updatedAt: Date
}
```

### Configuration Rules

1. Configuration is read through `ConfigService` — never from environment variables in module code.
2. Feature flags are evaluated at service boundaries, not in UI components.
3. Configuration changes require appropriate permissions (administrator or founder).
4. Sensitive configuration (API keys, credentials) is stored encrypted — never in plain text.
5. Configuration persistence follows ES-010 repository patterns.

---

## 14. Error Handling

Platform Service errors follow the conventions established in ES-010, extended for orchestration concerns.

### Error Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Validation** | Invalid input or domain rule violation | Missing recipient on notification |
| **NotFound** | Requested entity does not exist within tenant scope | Job ID not found |
| **Unauthorized** | Caller lacks permission | Staff accessing audit log |
| **TenantMismatch** | Cross-tenant access attempted | Organization ID mismatch |
| **Conflict** | Duplicate or state conflict | Job already running |
| **Delivery** | External channel failure | Email provider timeout |
| **Queue** | Job infrastructure failure | Queue unreachable |
| **Unknown** | Unclassified failure | Unexpected adapter error |

### Error Handling Rules

1. Platform Services return `ServiceResult<T>` — they do not throw for expected failures.
2. Delivery and queue errors are retried through the job framework.
3. `TenantMismatch` errors trigger security audit events.
4. External provider errors are never exposed to end users — generic messages only.
5. All errors include sufficient context for debugging without exposing sensitive data.
6. Error codes are stable across implementations — consumers depend on codes, not messages.

### Error Flow

```
Platform Service operation
    ↓
Validation failure → ServiceResult failure (Validation)
    ↓
Persistence failure → propagate with service context
    ↓
External adapter failure → ServiceResult failure (Delivery / Queue)
    ↓
AuditService.record (if security-relevant)
```

---

## 15. Future Integrations

Platform Services are designed for adapter-based integration with external systems.

### Integration Targets

| Integration | Service | Adapter Pattern |
|-------------|---------|-----------------|
| Email provider (SendGrid, Resend) | NotificationService | Channel adapter |
| Push notifications (FCM, APNs) | NotificationService | Channel adapter |
| Job queue (Redis, SQS, BullMQ) | JobService | Queue adapter |
| Event transport (in-process, pub/sub) | EventService | Transport adapter |
| Feature flag provider (LaunchDarkly, Flagsmith) | ConfigService | Provider adapter (optional) |

### Adapter Rules

1. Adapters implement service-defined interfaces — not vendor SDKs exposed to consumers.
2. Adapter swap must not require changes to module services or platform service contracts.
3. In-memory adapters serve as the default development implementation.
4. Adapter selection is configured through `PlatformContainer` — not hardcoded.
5. Vendor credentials are managed through environment configuration at the composition root.

### Phased Delivery (Proposed)

| Phase | Deliverable | Release |
|-------|-------------|---------|
| Phase 1 | Service contracts, in-memory adapters, PlatformContainer | v0.5.0 |
| Phase 2 | Notification service (in-app + email adapter) | v0.5.x |
| Phase 3 | Activity and audit persistence | v0.5.x |
| Phase 4 | Background job framework (in-process, then queue adapter) | v0.6.x |
| Phase 5 | Event bus and configuration service | v0.6.x |

---

## 16. Out of Scope

The following are explicitly excluded from ES-011 and will be addressed in future specifications.

| Item | Future Document |
|------|-----------------|
| Implementation code | Sprint 11 ES phases |
| API route definitions | Domain-specific ES |
| UI notification components | ES-008 extension or module ES |
| Email/SMS/push provider selection | Infrastructure ES |
| Queue infrastructure selection | Infrastructure ES |
| Module-specific business services | ORANIA, ATSAR ES |
| Search service | Search ES |
| Messaging service (chat) | Messaging ES |
| Integration connectors | Integration ES |
| Real-time WebSocket delivery | Real-time ES |
| Analytics and reporting | Analytics ES |
| Database schema for platform entities | ES-011 implementation phase |
| Performance benchmarking | Operations ES |

---

## 17. Related Documents

| Document | Location | Relationship |
|----------|----------|--------------|
| **PA-001** | `docs/03_Architecture/ORION_Platform_Architecture.md` | Master architecture — Platform Services layer |
| **PRD-001** | `docs/01_Product/PRD-001-Identity-Authentication.md` | Audit and governance product requirements |
| **ORION Product Backlog** | `docs/01_Product/ORION_Product_Backlog.md` | v0.5.0 Platform Services milestone |
| **ORION Constitution** | `docs/09_Standards/ORION_Constitution.md` | Governing engineering principles |
| **ES-009** | `docs/02_Engineering/ES-009-Identity-Authentication-Foundation.md` | Identity foundation consumed by platform services |
| **ES-010** | `docs/02_Engineering/ES-010-Persistence-Foundation.md` | Persistence foundation consumed by platform services |
| **ES-006** | `docs/02_Engineering/ES-006-Component-Architecture.md` | Platform shell — no direct dependency |
| **ES-008** | `docs/02_Engineering/ES-008-Design-System.md` | UI components for notification display (future) |
| **RR-002** | `docs/06_Releases/RR-002-v0.4.0-Persistence-Foundation.md` | Prior release record |
| **CHANGELOG** | `docs/06_Releases/CHANGELOG.md` | Release history |

---

## 18. Service Lifecycle

Platform Services follow a defined lifecycle from initialization through shutdown. Lifecycle management ensures predictable startup, observable health, and safe teardown across all ORION services.

### Lifecycle Principles

| Principle | Rule |
|-----------|------|
| **Explicit initialization** | Services are initialized deliberately — never lazily on first use |
| **Ordered startup** | Dependencies start before dependents |
| **Observable health** | Every service exposes a health status |
| **Graceful degradation** | Non-critical service failure does not prevent platform startup |
| **Clean shutdown** | In-flight work completes or is safely abandoned before termination |
| **No global state** | Lifecycle is managed by the composition root — not static singletons |

### Service Initialization

Service initialization occurs at the **composition root** when the platform container is constructed.

| Stage | Description |
|-------|-------------|
| **Configuration load** | Platform and persistence configuration are resolved |
| **Adapter binding** | Repository and platform adapters are instantiated |
| **Service construction** | Services are created via constructor injection |
| **Dependency validation** | Required dependencies are verified before the service is marked ready |

### Initialization Rules

1. Services receive all dependencies through their constructor — initialization does not perform service location.
2. Initialization must be idempotent — repeated initialization of the same configuration produces equivalent state.
3. Initialization failures are reported through typed errors — not unhandled exceptions.
4. Services do not perform I/O during construction unless explicitly defined by their adapter contract.
5. In-memory adapters initialize synchronously; external adapters may require async initialization (future).

### Registration

Services are **registered** with the platform container at composition time. Registration declares which service interfaces are available to consumers.

| Registration Element | Purpose |
|---------------------|---------|
| **Service identity** | Unique name identifying the service contract |
| **Interface binding** | Maps contract to implementation |
| **Dependency declaration** | Lists required peer services and persistence dependencies |
| **Lifecycle hooks** | Optional startup and shutdown handlers (future) |

### Registration Rules

1. Each service contract maps to exactly one active implementation per container instance.
2. Registration occurs once at container construction — not at runtime.
3. Duplicate registration of the same contract is a configuration error.
4. Modules receive registered services from the container — they do not register services themselves.
5. Test environments may register mock implementations through the same registration mechanism.

### Health Checks

Every platform service exposes a **health status** indicating its operational readiness.

| Health State | Meaning |
|--------------|---------|
| **Healthy** | Service is fully operational |
| **Degraded** | Service is operational with reduced capability (e.g. queue adapter unreachable, using in-process fallback) |
| **Unhealthy** | Service cannot perform its core function |
| **Unknown** | Health has not been evaluated |

### Health Check Rules

1. Health checks evaluate service readiness — not individual request outcomes.
2. Health checks are lightweight and must not perform destructive operations.
3. External adapter connectivity is verified during health checks when adapters are in use.
4. Aggregate platform health is derived from individual service health states.
5. Health status is exposed to the composition root — not directly to end users.

### Startup Order

Platform services start in **dependency order**. Services that depend on other services must not initialize before their dependencies are ready.

```
1. Configuration resolution
        ↓
2. Persistence layer (ES-010)
   — PersistenceContainer
   — Repository adapters
   — Persistence services
        ↓
3. Core platform services
   — ConfigService
   — AuditService
   — ActivityService
        ↓
4. Orchestration services
   — EventService
   — JobService
   — NotificationService
        ↓
5. Module services (future)
   — Domain-specific services
        ↓
6. API / request handlers (future)
```

### Startup Rules

1. Persistence services (ES-010) must be ready before platform services accept operations.
2. `ConfigService` initializes early — downstream services may depend on configuration.
3. `AuditService` initializes before services that emit audit events.
4. `JobService` initializes before `NotificationService` — delivery depends on job infrastructure.
5. Startup order is declared by the composition root — not discovered at runtime.
6. Circular startup dependencies are prohibited and must be resolved at design time.

### Graceful Shutdown

Platform shutdown releases resources and completes or safely abandons in-flight work.

| Shutdown Stage | Action |
|----------------|--------|
| **Stop accepting new work** | Jobs, events, and notifications are no longer enqueued |
| **Drain in-flight work** | Active jobs and deliveries complete within a timeout |
| **Flush audit and activity** | Pending records are persisted |
| **Release adapters** | External connections are closed |
| **Destroy container** | Service instances are released |

### Shutdown Rules

1. Shutdown is initiated by the composition root — not by individual services.
2. In-flight background jobs are given a configurable grace period to complete.
3. Jobs exceeding the grace period are marked abandoned and recorded in the audit trail.
4. Shutdown order is the reverse of startup order — dependents stop before dependencies.
5. Forced shutdown (process termination) is a last resort — graceful shutdown is the default.

### Future Dependency Management

As the platform grows, dependency management will evolve without changing service contracts.

| Capability | Purpose | Status |
|------------|---------|--------|
| **Lifecycle hooks** | `onStartup` / `onShutdown` callbacks on service interfaces | Planned |
| **Dependency graphs** | Declarative dependency declaration and validation | Planned |
| **Readiness probes** | Integration with hosting health endpoints | Planned |
| **Circuit breakers** | Automatic isolation of failing external adapters | Planned |
| **Service versioning** | Parallel contract versions during migration | Planned |
| **Hot reload** | Configuration changes without full restart | Future |

### Dependency Management Rules

1. Service contracts remain stable — lifecycle infrastructure evolves behind the composition root.
2. New services declare their dependencies explicitly — implicit ordering is prohibited.
3. Optional dependencies must degrade gracefully — core platform functions continue without them.
4. Dependency graphs must be acyclic — circular dependencies indicate a design error.
5. Future dependency management tools operate on the container — not on individual service implementations.

---

# Engineering Principles

The Platform Services Foundation shall follow these engineering principles:

- Platform Services orchestrate cross-module capabilities — they do not contain domain business rules.
- All platform operations are tenant-scoped through `TenantContext`.
- Services depend on interfaces, not implementations.
- Constructor injection is the only wiring mechanism.
- Events, notifications, and jobs are explicit side effects — never implicit.
- Audit and activity records are append-only.
- External providers are hidden behind adapters.
- In-memory implementations serve as reference adapters.
- Strong typing is mandatory — no `any`.
- Every platform service must be independently testable.

---

# Success Criteria

The Platform Services Foundation is considered complete when:

- Platform service contracts are defined and approved.
- In-memory reference implementations exist for each core service.
- `PlatformContainer` wires services with constructor injection.
- Modules can emit notifications, record activity, and enqueue jobs through service interfaces.
- Audit events unify ES-009 authentication audit and ES-010 persistence audit.
- Tenant isolation is enforced on every platform operation.
- Service adapters can be replaced without modifying consumer code.
- All contracts build successfully.
- TypeScript passes without errors.
- ESLint passes without warnings.

---

# Architecture Approval

**Status**

Approved (Frozen)

**Founder**

Mohammad Shafi Goroo

**Chief AI Architect & CTO**

ORION

**Approved Date**

14 July 2026

**Governance**

- This document is frozen.
- Changes require Founder approval.
- Engineering implementation must conform to this specification.
- Future revisions require a new version.

---

*ES-011 is an approved Engineering Specification. Implementation proceeds per Sprint 11 delivery phases.*
