# Enterprise HCM Package Guide

**Document ID:** HCM-PKG-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Epic:** P-012 — Enterprise HCM

---

## Purpose

Documents the `lib/hcm/` package layout, module boundaries, naming conventions, and bootstrap sequence.

---

## Top-Level Structure

```
lib/hcm/
├── index.ts                    # HcmFacade — sole public export surface
├── constants.ts                # Missions, capabilities, workflow templates
├── createHcmWiring.ts          # Dependency injection bootstrap
├── HcmFoundationFacade.ts      # Internal foundation service wiring (not exported)
├── HcmFoundationOperations.ts  # Foundation operation delegates
├── hcm-events.ts               # IIL event publishers and event catalogues
├── api/                        # REST API shared helpers (S-002.7)
├── common/                     # Shared ids, time utilities
├── data/                       # InMemoryHcmStore, seeds, repository factory
├── events/                     # Event publisher, subscribers, catalog guard
├── workflow/                   # HcmWorkflowOrchestrator
├── foundation/                 # Foundation module index (internal)
├── organization/               # P-012.1
├── employees/                  # P-012.2
├── employment/                 # P-012.3
├── recruitment/                # P-012.4
├── onboarding/                 # P-012.5
├── time/                       # P-012.6
├── payroll/                    # P-012.7
└── talent/                     # P-012.8
```

REST routes mirror domain modules under `app/api/hcm/`.

---

## Module Internal Layout

Each domain module follows:

```
<module>/
├── services/           # Business services (public via facade)
├── repositories/       # Interface + InMemory implementation
├── *RulesEngine.ts     # Validation and transition rules (internal)
└── index.ts            # Optional internal barrel (not public API)
```

---

## Types

Domain types live in `types/` at project root:

| File | Mission |
|------|---------|
| `types/hcm-common.ts` | Shared value objects |
| `types/hcm-organization.ts` | P-012.1 |
| `types/hcm-employee.ts` | P-012.2 |
| `types/hcm-employment.ts` | P-012.3 |
| `types/hcm-recruitment.ts` | P-012.4 |
| `types/hcm-onboarding.ts` | P-012.5 |
| `types/hcm-time.ts` | P-012.6 |
| `types/hcm-payroll.ts` | P-012.7 |
| `types/hcm-talent.ts` | P-012.8 |

---

## Naming Conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| Service | `<Domain>Service` | `EmployeeService` |
| Repository interface | `<Entity>Repository` | `EmployeeRepository` |
| In-memory repo | `InMemory<Entity>Repository` | `InMemoryEmployeeRepository` |
| Rules engine | `<Domain>RulesEngine` | `EmploymentRulesEngine` |
| Input types | `Create<Entity>Input`, `Update<Entity>Input` | `CreateEmployeeInput` |
| Error codes | `SCREAMING_SNAKE_CASE` | `EMPLOYEE_NOT_FOUND` |
| Event types | PascalCase verb phrase | `EmployeeActivated` |
| API routes | kebab-case path segments | `/api/hcm/organization/units` |

---

## Public Import Boundary

**Allowed:**

```typescript
import { hcmFacade, HCM_ALL_MISSIONS, publishHcmTimeEvent } from "@/lib/hcm";
import { hcmOk, getHcmApiContext } from "@/lib/hcm/api";
```

**Forbidden:**

```typescript
import { EmployeeService } from "@/lib/hcm/employees/services/EmployeeService";
import { defaultHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
```

---

## Bootstrap Sequence

1. `createHcmWiring()` seeds `defaultHcmStore`
2. Foundation repositories created from store
3. Operational repositories and services wired
4. `registerHcmSubscribers(intelligence)` registers workflow handler
5. `new HcmFacade(wiring)` exposes public surface
6. `hcmFacade` singleton used by API routes and tests

---

## Seed Data

| Seed | File | Organization |
|------|------|--------------|
| Time | `data/seed-hcm-time.ts` | `org-orania` |
| Payroll | `data/seed-hcm-payroll.ts` | `org-orania` |
| Talent | `data/seed-hcm-talent.ts` | `org-orania` |
| Onboarding requirements | `InMemoryHcmStore.seedDefaultDocumentRequirements` | Configurable |

---

*See [HCM Dependency Matrix](./HCM-Dependency-Matrix.md) for import rules.*
