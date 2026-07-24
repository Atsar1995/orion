# ES-034 — Provider & Data Contract Standards

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Author:** Founder & Chief Architect

**Related delivery:** [ADR-006 — Executive Intelligence Provider Framework](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) (Mission 17A · read-only executive providers)

---

# Purpose

The Provider & Data Contract Standards define the canonical structure, responsibilities, interfaces, validation rules, versioning, and lifecycle of all ORION Providers.

Every Provider shall expose a consistent interface, making the platform predictable, maintainable, and scalable.

**Current state:** ORION implements **Executive Intelligence Providers** (read-only executive intelligence per ADR-006) with registry validation, versioning, and typed contracts. Platform services use `ServiceResult<T>` envelopes and structured errors. Full ES-034 domain Provider interface (CRUD, search, `publishEvent`, lifecycle methods) and standardised data entity contracts — **Construction Phase alignment pending**.

---

# Objectives

The standards shall:

- Standardise provider design.
- Define data contracts.
- Ensure type safety.
- Promote loose coupling.
- Improve maintainability.
- Simplify testing.
- Enable future extensibility.

---

# Definition

A Provider is the authoritative source responsible for exposing a specific business capability or dataset.

**Examples:** Reservation Provider · Customer Provider · Finance Provider · Inventory Provider · Recommendation Provider · Business Health Provider

**ORION provider families:**

| Family | Purpose | Status |
|--------|---------|--------|
| **Executive Intelligence Provider** | Read-only executive intelligence for workspaces | Delivered · ADR-006 |
| **Domain Data Provider** | Authoritative CRUD + search for business entities | Planned · ES-034 |
| **Platform Service Provider** | Cross-cutting platform capabilities | Partial · ES-011 |

---

# Provider Responsibilities

A Provider shall: own its domain · validate incoming data · expose read operations · expose write operations where permitted · publish business events · handle domain errors · maintain data integrity

**Delivered (partial):**

| Responsibility | Executive Provider | Domain Provider |
|----------------|-------------------|-----------------|
| Own domain | ✓ workspace-scoped | Planned |
| Validate data | ✓ registry validation | Planned |
| Read operations | ✓ getHealth, getMetrics, etc. | Planned |
| Write operations | — (read-only by design) | Planned |
| Publish events | — | Planned · [ES-033](./ES-033-Event-Messaging-Architecture.md) |
| Domain errors | ✓ typed registry errors | Partial · `ServiceError` |

---

# Provider Interface

**ES-034 standard interface:** `initialize()` · `shutdown()` · `health()` · `get()` · `list()` · `search()` · `create()` · `update()` · `validate()` · `publishEvent()`

**Executive Intelligence Provider (delivered — specialised read profile):**

| ES-034 Method | Executive Provider equivalent | Status |
|---------------|------------------------------|--------|
| `health()` | `getHealth()` | Delivered |
| `get()` | `getExecutiveSummary()` · card snapshots | Partial |
| `list()` | `getMetrics()` · aggregated lists | Partial |
| `search()` | — | Not applicable (executive) |
| `create()` / `update()` | — | Not applicable (read-only) |
| `validate()` | Registry `validateProvider()` | Delivered |
| `publishEvent()` | — | Planned |
| `initialize()` / `shutdown()` | Registry register/unregister | Partial |

**Contract location:** [provider.ts](../../lib/intelligence/provider.ts) · [provider-registry.ts](../../lib/intelligence/provider-registry.ts)

---

# Data Contract Structure

Every contract shall contain: Identifier · Version · Schema · Validation Rules · Required Fields · Optional Fields · Business Rules · Metadata

**Delivered (partial):**

| Contract type | Location | Status |
|---------------|----------|--------|
| Executive intelligence models | [models.ts](../../lib/intelligence/models.ts) | Delivered |
| Engine models | [engine-models.ts](../../lib/intelligence/engine-models.ts) | Delivered |
| Platform service types | [types/services.ts](../../types/services.ts) | Delivered |
| Domain entity contracts | — | Planned |
| Schema registry | — | Planned |

---

# Entity Structure

Every entity shall contain: Unique Identifier · Created Timestamp · Updated Timestamp · Created By · Updated By · Version · Status · Metadata

**Delivered (partial):** Persistence foundation patterns in [ES-010](./ES-010-Persistence-Foundation.md) · [ES-036](./ES-036-Database-Persistence-Architecture.md). Standardised entity envelope across all domain providers — **planned**.

---

# Naming Conventions

**Providers:** `ReservationProvider` · `CustomerProvider` · `FinanceProvider` · `RecommendationProvider` · `BusinessHealthProvider`

**Contracts:** `ReservationContract` · `CustomerContract` · `InvoiceContract`

**Delivered (partial):**

| Pattern | Example | Standard |
|---------|---------|----------|
| Executive provider id | `finance`, `crm` | [constants.ts](../../lib/intelligence/constants.ts) · `WORKSPACE_IDS` |
| Implementation file | `finance-executive-provider.ts` | ADR-006 |
| Provider version | `1.0.0` | `PROVIDER_VERSION` · `SUPPORTED_PROVIDER_VERSIONS` |

Full ES-034 naming registry — align with [OS-001](../09_Standards/OS-001-Naming-Standards.md).

---

# Validation

Validation shall occur: before persistence · before publication · before event generation · before API response

**Delivered (partial):**

- Provider registry validates required methods and version on registration
- Platform event validation in [EventBus.ts](../../lib/platform/events/EventBus.ts)
- `validatePlatformServiceContext()` for platform services
- Domain contract validation framework — **planned**

---

# Validation Rules

Required fields · data types · ranges · formats · business rules · cross-field validation · reference validation

**Delivered:** TypeScript strict typing · registry structural validation. Declarative validation rule engine — **planned**.

---

# Error Model

Every Provider shall return structured errors with: Error Code · Message · Category · Severity · Correlation ID · Timestamp · Suggested Action

**Delivered (partial):**

| Layer | Error model | Location |
|-------|-------------|----------|
| Platform services | `ServiceResult<T>` · `ServiceError` | [types/services.ts](../../types/services.ts) |
| Intelligence registry | `InvalidProviderError` · `ProviderNotFoundError` · etc. | [errors.ts](../../lib/intelligence/errors.ts) |
| Platform services | `validationError()` · `dependencyError()` · etc. | [lib/platform/errors.ts](../../lib/platform/errors.ts) |

Full ES-034 error taxonomy (Validation · Business Rule · Not Found · Conflict · Auth · Infrastructure) — **planned unification**.

---

# Versioning

Every Provider shall expose: Provider Version · Contract Version · Schema Version · API Version

**Delivered (partial):**

- `ExecutiveProvider.version` required
- `SUPPORTED_PROVIDER_VERSIONS` enforcement in registry
- `PlatformEvent.version` for events

Contract/schema versioning registry — **planned**.

---

# Event Integration

Providers shall: publish events after successful state changes · consume relevant business events · avoid direct coupling where event-driven communication is appropriate

**Delivered (partial):** [ES-033](./ES-033-Event-Messaging-Architecture.md) event foundation. Executive providers do not yet publish domain events. Domain provider event integration — **planned**.

---

# Performance

| Operation | Target | Executive Provider | Domain Provider |
|-----------|--------|-------------------|-----------------|
| Read | < 200 ms | Delivered (sync in-process) | Planned |
| Write | < 500 ms | N/A | Planned |
| Search | < 300 ms | N/A | Planned |
| Health Check | < 100 ms | Delivered | Planned |

Pipeline tracks engine timing via [platform-metrics.ts](../../lib/intelligence/platform-metrics.ts).

---

# Security

Providers shall: validate permissions · enforce authorisation · protect sensitive fields · mask confidential data · avoid exposing secrets · support audit logging

**Delivered (partial):** Tenant context on platform services · audit event capture · placeholder session permissions. Full provider-level authorisation — **planned**.

---

# Observability

Providers shall expose: health status · latency · error rate · request count · success rate · event count · version

**Delivered (partial):** Registry provider count · pipeline `statistics` · service health checks. Full provider observability — **planned**.

---

# Testing Requirements

Every Provider shall include: Unit Tests · Integration Tests · Contract Tests · Validation Tests · Performance Tests · Failure Tests

**Delivered (partial):** Manual verification via Verification Hierarchy (Phase I). Automated contract test suite — **planned** (CTO-001 noted gap).

---

# Documentation Requirements

Every Provider shall document: purpose · responsibilities · supported operations · input/output schema · events published/consumed · dependencies · known limitations

**Delivered (partial):** Engineering Specifications (ES-025–ES-027) · ADR-006 · intelligence README. Standard provider documentation template — **planned**.

---

# Executive Intelligence Provider Reference

Per [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md):

```typescript
// lib/intelligence/provider.ts — read-only executive profile
interface ExecutiveProvider {
  readonly id: string;
  readonly workspace: string;
  readonly version: string;
  getHealth(): HealthScore;
  getAlerts(): BusinessAlert[];
  getRecommendations(): ExecutiveRecommendation[];
  getExecutiveSummary(): ExecutiveSummary;
  getMetrics(): ExecutiveMetric[];
}
```

**Registered providers:** `financeExecutiveProvider` · `crmExecutiveProvider`  
**Registry:** [register-executive-providers.ts](../../lib/intelligence/register-executive-providers.ts)

Executive providers are a **specialised read-only profile** of ES-034 — they shall not implement CRUD mutations.

---

# Business Rules

- One authoritative Provider per domain.
- No duplicated business logic.
- No hidden side effects.
- All mutations validated.
- Every mutation auditable.
- All contracts versioned.

**Delivered (partial):** Single registry entry per workspace id · ADR-006 workspace independence · audit via events (partial).

---

# Acceptance Criteria

Every Provider shall:

- [x] Implement the standard interface (Executive profile — delivered; full CRUD — planned)
- [x] Expose health information (Executive providers)
- [x] Validate data (registry + TypeScript — partial)
- [ ] Publish events (planned)
- [x] Support versioning (provider version — partial)
- [x] Return structured errors (partial — layer-specific)
- [x] Meet performance targets (in-process — partial)
- [ ] Pass contract testing (planned)

---

# Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Executive Intelligence Provider | Delivered | Mission 17A · ADR-006 · RR-016 |
| Provider Registry | Delivered | Validation · versioning · lifecycle |
| Platform service contracts | Partial | ES-011 · `ServiceResult<T>` |
| Domain Data Provider (CRUD) | Not implemented | Construction Phase |
| Standard entity contract | Not implemented | ES-010 foundation only |
| Schema registry | Not implemented | ES-033 / ES-034 alignment |
| Contract test framework | Not implemented | CTO-001 follow-up |
| ES-034 canonical spec | Approved | This document |

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Valid Create | Domain provider persists validated entity |
| Invalid Create | Structured validation error returned |
| Update Existing Record | Version incremented; event published |
| Delete Restricted Record | Business rule error |
| Permission Failure | Authorisation error with correlation ID |
| Validation Failure | Validation category error |
| Search | Results within performance target |
| Health Check | Provider health metadata returned |
| Event Published | Event consumed by subscribers |
| Version Upgrade | Backward-compatible or major version bump |

---

# Out of Scope

- Database implementation
- Caching strategy
- Infrastructure deployment
- API Gateway configuration

These are defined in separate specifications ([ES-010](./ES-010-Persistence-Foundation.md) · infrastructure specs).

---

# Future Enhancements

- Schema Registry · Automatic Contract Validation · Code Generation
- Provider Discovery · Runtime Contract Verification · Self-Describing APIs

---

# Definition of Done

The Provider Standard is complete when:

- All Provider interfaces are defined and implemented per family
- Data contracts are standardised with schema registry
- Validation rules are documented and enforced
- Versioning is implemented across provider and contract layers
- Error handling is consistent platform-wide
- Testing requirements are met with automated contract tests
- ES-034 acceptance criteria satisfied
- Founder approval is received

**Status:** Executive Intelligence Provider profile **delivered**. Full ES-034 domain Provider model — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ADR-006 Executive Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| ES-010 Persistence Foundation | [ES-010-Persistence-Foundation.md](./ES-010-Persistence-Foundation.md) |
| ES-011 Platform Services | [ES-011-Platform-Services-Foundation.md](./ES-011-Platform-Services-Foundation.md) |
| ES-033 Event & Messaging | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-036 Database & Persistence Architecture | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-056 Data Governance & Information Architecture | [ES-056-ORION-Data-Governance-Information-Architecture.md](./ES-056-ORION-Data-Governance-Information-Architecture.md) |
| ES-060 Platform Extensibility & Marketplace | [ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md](./ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md) |
| ES-037 Authentication & Authorisation Architecture | [ES-037-Authentication-Authorisation-Architecture.md](./ES-037-Authentication-Authorisation-Architecture.md) |
| ES-038 Audit Logging & Observability Architecture | [ES-038-Audit-Logging-Observability-Architecture.md](./ES-038-Audit-Logging-Observability-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-027 CRM Workspace | [ES-027-CRM-Workspace.md](./ES-027-CRM-Workspace.md) |
| OS-001 Naming Standards | [OS-001-Naming-Standards.md](../09_Standards/OS-001-Naming-Standards.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Intelligence README | [lib/intelligence/README.md](../../lib/intelligence/README.md) |

---

# Closing Statement

The Provider & Data Contract Standards establish a single engineering model for every ORION Provider.

They ensure consistency, reliability, and interoperability across the platform while reducing implementation complexity and long-term maintenance effort.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | RR-016 (Executive Provider) · ES-034 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
