# Enterprise HCM Developer Guide

**Document ID:** HCM-DEV-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Audience:** Engineers extending or integrating with Enterprise HCM

---

## Getting Started

### Prerequisites

- Node.js and npm per project `package.json`
- Familiarity with ORION platform `ServiceContext` pattern

### Quick Start

```typescript
import { hcmFacade } from "@/lib/hcm";
import type { ServiceContext } from "@/types/services";

const context: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-hr",
  role: "executive",
};

// Create an employee
const employee = hcmFacade.createEmployee(
  {
    employeeNumber: "E-1001",
    identity: {
      legalName: { givenName: "Alex", familyName: "Rivera" },
      governmentIdentifiers: [],
    },
    effectiveFrom: "2026-01-01",
  },
  context,
);

// Activate and record attendance
hcmFacade.activateEmployee(employee.id, context);
hcmFacade.attendance.record(
  {
    employeeId: employee.id,
    attendanceDate: "2026-07-23",
    status: "present",
    source: "manual",
  },
  context,
);
```

### Domain Status

```typescript
const status = hcmFacade.getDomainStatus();
// All P-012.1–P-012.8 modules report implemented: true
// foundationApiRoutesImplemented, timeApiRoutesImplemented, eventsIntegrated, workflowIntegrated: true
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  app/api/hcm/*          REST handlers                   │
├─────────────────────────────────────────────────────────┤
│  lib/hcm/api/*          Response envelopes, query parse │
├─────────────────────────────────────────────────────────┤
│  HcmFacade (hcmFacade)  Single public entry point       │
│    ├── Foundation ops   createEmployee, listOrgUnits…   │
│    ├── attendance       AttendanceService               │
│    ├── leave            LeaveService                    │
│    ├── payroll          PayrollService + related        │
│    └── talent           PerformanceService, Learning…   │
├─────────────────────────────────────────────────────────┤
│  Services + RulesEngines                                │
├─────────────────────────────────────────────────────────┤
│  Repository interfaces → InMemory implementations       │
├─────────────────────────────────────────────────────────┤
│  InMemoryHcmStore                                       │
└─────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   IIL (events)                  Workflow Platform
```

See [HCM Architecture Guide](./HCM-Architecture-Guide.md) for detailed diagrams.

---

## Calling the Facade

### Foundation Operations

Foundation methods are flat on `hcmFacade`:

```typescript
hcmFacade.createOrgUnit(input, context);
hcmFacade.searchEmployees({ status: "active", page: 1 }, context);
hcmFacade.transferEmployee(transferInput, context);
hcmFacade.hireCandidate(offerId, context);
hcmFacade.determineActivationReadiness(processId, context);
```

### Operational Services

Time, payroll, and talent group related operations:

```typescript
hcmFacade.leave.createRequest(input, context);
hcmFacade.payroll.startRun(input, context);
hcmFacade.performance.startReview(input, context);
```

Every method requires `ServiceContext` with a valid `organizationId`.

---

## REST API Usage

All routes use standard envelopes. Example:

```bash
# Search employees (paginated)
GET /api/hcm/employees?status=active&page=1&pageSize=20

# Create leave request
POST /api/hcm/leave
Content-Type: application/json
{ "employeeId": "...", "leaveType": "annual", ... }
```

See [HCM API Catalogue](./HCM-API-Catalogue.md) for the full route inventory.

---

## Error Handling

Services throw `Error` with domain codes. API layer maps to HTTP status:

| Code pattern | HTTP |
|--------------|------|
| `*_NOT_FOUND` | 404 |
| `DUPLICATE_*` | 409 |
| `INVALID_*`, `MISSING_PARAMS` | 400 |
| `CIRCULAR_*` | 422 |

```typescript
try {
  hcmFacade.suspendEmployee(id, context);
} catch (error) {
  if (error instanceof Error && error.message === "EMPLOYEE_NOT_FOUND") {
    // handle
  }
}
```

---

## Events

Foundation mutations publish automatically via the event-aware facade wrapper. Time/payroll/talent services publish from within service methods.

Subscribe via IIL filtering on `sourceService = hcm-workspace` and `payload.hcmEventType`.

See [HCM Event Catalogue](./HCM-Event-Catalogue.md).

---

## Testing

```bash
# All HCM tests
npm test -- tests/lib/hcm

# Specific suites
npm test -- tests/lib/hcm/HcmFacadeIntegration.test.ts
npm test -- tests/lib/hcm/HcmApiIntegration.test.ts
```

See [HCM Testing Guide](./HCM-Testing-Guide.md).

---

## Extension Patterns

See [HCM Extension Guide](./HCM-Extension-Guide.md) for metadata, reference data, and organization-specific configuration.

---

## Conventions Checklist

- [ ] Import only from `@/lib/hcm` (not internal paths)
- [ ] Pass `ServiceContext` on every call
- [ ] Use domain error codes in new services
- [ ] Add repository interface before implementation
- [ ] Publish IIL events for lifecycle transitions
- [ ] Route new REST endpoints through `hcmFacade`
- [ ] Add tests in `tests/lib/hcm/`
- [ ] Update [HCM API Catalogue](./HCM-API-Catalogue.md) for new public operations

---

*ORION Enterprise Platform · Enterprise HCM v1.0*
