# ES-HCM-001 – Enterprise HCM Engineering Specification

**Document ID:** ES-HCM-001  
**Domain:** Human Capital Management (HCM)  
**Version:** 1.0  
**Architecture Baseline:** v0.5.0-beta  
**Status:** Implemented — Enterprise HCM v1.0  
**Classification:** Engineering Specification  
**Epic:** P-012 — Enterprise HCM  
**Authority:** Chief Enterprise Architect  

**Constitutional Blueprints:** [D-014 — Enterprise HCM Architecture Blueprint](../Blueprints/D-014_Enterprise_HCM_Architecture_Blueprint.md)  

**Related Specifications:** [HCM Architecture Guide](./HCM-Architecture-Guide.md) · [HCM API Catalogue](./HCM-API-Catalogue.md) · [HCM Event Catalogue](./HCM-Event-Catalogue.md) · [HCM Dependency Matrix](./HCM-Dependency-Matrix.md) · [ES-DATA-001 — Data Platform Engineering Spec](../../Data/Engineering/ES-DATA-001-Enterprise-Data-Platform-Engineering-Specification.md)

---

## 1. Purpose

This Engineering Specification translates the approved HCM architecture blueprint (D-014) into an **engineering architecture suitable for implementation** under Epic P-012.

ES-HCM-001 is the **authoritative engineering reference** for Enterprise HCM v1.0. It governs:

- Module structure across missions P-012.1 through P-012.8
- Public facade contracts
- Repository and service layering
- REST API conventions
- IIL event publication and workflow integration
- Dependency boundaries and testing gates

Mission-level guides (P-012.6 Attendance, Leave, Roster, etc.) provide operational detail; they **must conform** to this specification.

This document describes engineering architecture. It does not prescribe UI designs or database vendor schemas.

---

## 2. Engineering Objectives

| Objective | Description |
|-----------|-------------|
| **Maintainability** | Each mission owns cohesive services and repository interfaces within `lib/hcm/` |
| **Extensibility** | New capabilities added via new services on `HcmFacade` without bypassing layering |
| **Testability** | Business rules isolated in services and rules engines; testable without Next.js |
| **Domain Isolation** | HCM logic contained in `@/lib/hcm`; organization scoping on every operation |
| **Event-driven design** | Material lifecycle transitions publish outbound IIL events |
| **Single entry point** | All consumers use `hcmFacade` from `@/lib/hcm` |
| **Enterprise scalability** | Repository contracts support future persistent stores without facade changes |

Success is measured by certification gates: `typecheck`, `lint`, `test`, `build`, plus documentation completeness (S-002.8).

---

## 3. Mission Coverage

| Mission | Module | Package Path | Status |
|---------|--------|--------------|--------|
| P-012.1 | Organization Structure | `lib/hcm/organization/` | Implemented |
| P-012.2 | Employee Master | `lib/hcm/employees/` | Implemented |
| P-012.3 | Employment Lifecycle | `lib/hcm/employment/` | Implemented |
| P-012.4 | Recruitment | `lib/hcm/recruitment/` | Implemented |
| P-012.5 | Onboarding | `lib/hcm/onboarding/` | Implemented |
| P-012.6 | Time (Attendance, Leave, Roster) | `lib/hcm/time/` | Implemented |
| P-012.7 | Payroll Foundation | `lib/hcm/payroll/` | Implemented |
| P-012.8 | Talent (Performance, Learning) | `lib/hcm/talent/` | Implemented |

Implementation missions S-002.3 through S-002.7 delivered services, repositories, facade integration, events, workflow, and REST APIs. S-002.8 delivers documentation.

---

## 4. Layered Architecture

Every HCM operation follows this call chain:

```
REST API route  →  HcmFacade  →  Business Service  →  Repository Interface  →  Repository  →  Store
```

### Layer Rules

| Layer | Responsibility | May Import |
|-------|----------------|------------|
| **API** (`app/api/hcm/`) | Auth context, validation envelope, HTTP mapping | `@/lib/hcm`, `@/lib/hcm/api`, `@/lib/decisions/server-context` |
| **Facade** (`lib/hcm/index.ts`) | Public surface, event-aware foundation ops, domain status | Internal wiring, event publisher, constants |
| **Service** | Business rules, orchestration, domain exceptions | Repository interfaces, rules engines, types |
| **Repository** | Persistence contract, organization scoping | Types, store (in-memory today) |
| **Store** (`InMemoryHcmStore`) | Development persistence | Types only |

**Forbidden:** API routes calling repositories directly. External code importing internal module paths.

---

## 5. Public Domain Interface

External consumers interact with HCM **exclusively through `hcmFacade`**.

```typescript
import { hcmFacade } from "@/lib/hcm";
```

### Facade Contract

| Rule | Description |
|------|-------------|
| Single entry | `HcmFacade` class + `hcmFacade` singleton exported from `@/lib/hcm` |
| Context required | Every method accepts organization-scoped `ServiceContext` |
| Foundation ops | Flat methods on facade (e.g. `createEmployee`, `listOrgUnits`) |
| Operational ops | Grouped services (e.g. `hcmFacade.attendance`, `hcmFacade.payroll`) |
| No internals | Repositories, stores, rules engines, and wiring are not exported |

See [HCM API Catalogue](./HCM-API-Catalogue.md) for the complete operation inventory.

---

## 6. Dependency Injection and Wiring

Centralized wiring lives in `lib/hcm/createHcmWiring.ts`:

1. Bootstrap in-memory store with seed data (time, payroll, talent, onboarding requirements)
2. Create foundation repositories via `createFoundationRepositories`
3. Instantiate domain services with repository dependencies
4. Register IIL subscribers via `registerHcmSubscribers`
5. Return wiring object consumed by `HcmFacade` constructor

`HcmFoundationFacade` wires P-012.1–P-012.5 services internally. It is **not** exported publicly.

Foundation mutations on the public facade pass through `createEventAwareFoundationOperations`, which publishes IIL events after successful operations.

---

## 7. Repository Pattern

Each module defines repository **interfaces** under `repositories/` and in-memory implementations. Contracts include:

- `domain: "hcm"` discriminator
- Organization-scoped queries (`organizationId` first parameter)
- Immutable return types (`readonly` arrays and records)

Foundation repository factory: `lib/hcm/data/createFoundationRepositories.ts`.

---

## 8. REST API Layer

Routes under `app/api/hcm/` delegate exclusively to `hcmFacade`.

Shared helpers in `lib/hcm/api/`:

| Helper | Purpose |
|--------|---------|
| `getHcmApiContext()` | Resolves authenticated `ServiceContext` |
| `hcmOk` / `hcmCreated` | Standard success envelopes |
| `hcmError` / `hcmFromError` | Standard error envelopes with HTTP status mapping |
| `hcmPaginated` | List responses with `{ items, pagination }` |
| `parsePagination` | Query param parsing |

Response envelope:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "ERROR_CODE" }
```

Paginated lists:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": { "page": 1, "pageSize": 50, "total": 0 }
  }
}
```

48 REST routes implemented (37 foundation + 11 time). Payroll and talent REST routes are deferred (see Technical Debt Register).

---

## 9. Event Integration (IIL)

HCM publishes outbound events via the Intelligence Integration Layer:

| Publisher | Scope |
|-----------|-------|
| `HcmEventPublisher` | Foundation lifecycle (org, employee, employment, recruitment, onboarding) |
| `publishHcmTimeEvent` | Time domain (P-012.6) — from time services |
| `publishHcmPayrollEvent` | Payroll domain (P-012.7) — from payroll services |
| `publishHcmTalentEvent` | Talent domain (P-012.8) — from talent services |

All events use IIL `CustomEvent` with `sourceService: hcm-workspace` and `payload.hcmEventType` set to the domain event name.

See [HCM Event Catalogue](./HCM-Event-Catalogue.md).

---

## 10. Workflow Integration

`HcmWorkflowOrchestrator` subscribes to HCM IIL events via `registerHcmSubscribers`. When an event maps to a workflow template in `HCM_WORKFLOW_TRIGGERS`, the orchestrator dispatches `WorkflowRequested` to the Workflow Platform.

Workflow orchestration contains **no business rules** and **no persistence**.

---

## 11. Organization Isolation and Security

| Control | Implementation |
|---------|----------------|
| Organization scoping | `context.organizationId` passed to every service and repository call |
| Authentication | API routes use `getDecisionServiceContext()` → session or development default |
| Permission hooks | Platform session provides `userId` and `role`; fine-grained HCM permissions deferred |
| Audit metadata | Records include `createdBy`, `updatedBy`, timestamps |
| Error safety | Domain error codes returned; no stack traces in API responses |

---

## 12. Testing Standards

| Test Category | Location | Purpose |
|---------------|----------|---------|
| Foundation services | `tests/lib/hcm/FoundationServices.test.ts` | P-012.1–P-012.5 business rules |
| Foundation repositories | `tests/lib/hcm/FoundationRepository.test.ts` | Repository contracts |
| Facade integration | `tests/lib/hcm/HcmFacadeIntegration.test.ts` | Public facade surface |
| Events integration | `tests/lib/hcm/HcmEventsIntegration.test.ts` | IIL publication and workflow |
| API integration | `tests/lib/hcm/HcmApiIntegration.test.ts` | REST envelopes and org isolation |
| Time certification | `tests/lib/hcm/HcmTimeCertification.test.ts` | P-012.6 docs and routes |
| Documentation certification | `tests/lib/hcm/HcmDocumentationCertification.test.ts` | S-002.8 doc inventory |

All missions require: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

---

## 13. Package Structure

See [HCM Package Guide](./HCM-Package-Guide.md) for folder layout and naming conventions.

---

## 14. Validation Gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

---

## 15. Related Documents

| Document | Description |
|----------|-------------|
| [HCM Developer Guide](./HCM-Developer-Guide.md) | Getting started, examples, conventions |
| [HCM Operational Guide](./HCM-Operational-Guide.md) | Runtime behaviour, seed data, troubleshooting |
| [HCM Technical Debt Register](./HCM-Technical-Debt-Register.md) | Known limitations and deferred work |
| [HCM Release Notes](./HCM-Release-Notes.md) | Enterprise HCM v1.0 delivery summary |

---

*ORION Enterprise Platform · Enterprise HCM v1.0 · S-002.8*
