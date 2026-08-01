# Enterprise HCM Dependency Matrix

**Document ID:** HCM-DEP-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)

---

## Layer Boundaries

| From → To | API | Facade | Service | Repository | Store | Platform |
|-----------|-----|--------|---------|------------|-------|----------|
| **API** | — | ✓ | ✗ | ✗ | ✗ | ✓ (session) |
| **Facade** | ✗ | internal | ✓ (via wiring) | ✗ | ✗ | ✓ (IIL) |
| **Service** | ✗ | ✗ | peer repos | ✓ | ✗ | ✗ |
| **Repository** | ✗ | ✗ | ✗ | — | ✓ | ✗ |
| **External domains** | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ |

---

## Allowed Imports

### API Layer (`app/api/hcm/`)

```
@/lib/hcm
@/lib/hcm/api
@/lib/decisions/server-context
@/types/hcm-*
next/server
```

### Public HCM Package (`@/lib/hcm`)

```
@/lib/hcm/*           (internal modules)
@/types/*
@/lib/platform/intelligence
@/lib/platform/workflow/workflow-events
```

### Domain Services

```
@/lib/hcm/<module>/repositories/*
@/lib/hcm/<module>/*RulesEngine
@/lib/hcm/common/*
@/types/hcm-*
```

### Repositories

```
@/types/hcm-*
@/lib/hcm/data/InMemoryHcmStore (implementations only)
```

---

## Forbidden Imports

| Consumer | Forbidden Target | Reason |
|----------|------------------|--------|
| Any external module | `lib/hcm/**/repositories/*` | Bypasses facade |
| Any external module | `lib/hcm/data/InMemoryHcmStore` | Direct store access |
| API routes | Domain services directly | Must use `hcmFacade` |
| HCM services | `app/*` | Layer inversion |
| HCM services | CRM, Finance, Hospitality internals | Cross-domain coupling |
| Repository interfaces | Next.js, React | Framework isolation |

---

## Cross-Module Dependencies (Internal)

| Module | May Depend On |
|--------|---------------|
| Employment | Employee repository |
| Onboarding | Recruitment (offer, candidate) repositories |
| Time (Attendance, Leave) | Employee repository |
| Payroll Calculation | Employment, Attendance, Leave repositories |
| Performance | Employee, Competency repositories |
| Learning, Certification | Employee repository |
| Recruitment | Self-contained |
| Organization | Self-contained |

Services **must not** import peer services directly. Shared orchestration belongs on the facade or a dedicated internal coordinator (future).

---

## Platform Dependencies

| Platform Service | HCM Usage |
|------------------|-----------|
| Intelligence Integration Layer | Outbound event publication, workflow subscription |
| Workflow Platform | Workflow dispatch from `HcmWorkflowOrchestrator` |
| Identity / Session | `getDecisionServiceContext()` for API auth context |

HCM does **not** depend on Finance, CRM, or Hospitality packages.

---

## Module Dependency Graph

```
organization ──┐
employees ─────┼──► foundation repositories ──► store
employment ────┤         ▲
recruitment ───┤         │
onboarding ────┘         │
                         │
time ────────────────────┤ (employee repo)
payroll ─────────────────┤ (employment, attendance, leave)
talent ──────────────────┘ (employee repo)
```

---

## Enforcement

- ESLint import rules (project-wide)
- `HcmFacadeIntegration.test.ts` verifies repositories not exposed on public facade
- Code review checklist in [HCM Developer Guide](./HCM-Developer-Guide.md)

---

*See [HCM Package Guide](./HCM-Package-Guide.md) for folder layout.*
