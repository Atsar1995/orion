# Enterprise HCM Release Notes

**Version:** 1.0.0  
**Release:** Enterprise HCM v1.0  
**Epic:** P-012 — Enterprise HCM  
**Implementation Missions:** S-002.3 through S-002.8

---

## Overview

Enterprise HCM v1.0 delivers a complete workforce domain module for the ORION platform covering organization structure, employee master, employment lifecycle, recruitment, onboarding, time management, payroll foundation, and talent management.

---

## What's Included

### Domain Services (P-012.1 – P-012.8)

| Module | Capabilities |
|--------|-------------|
| Organization | Org units, positions, hierarchy, reporting relationships |
| Employee | Master data, identity, activation, suspension |
| Employment | Create, transfer, promote, terminate, rehire |
| Recruitment | Candidates, applications, interviews, offers, hire |
| Onboarding | Process, documents, tasks, provisioning, readiness |
| Time | Attendance, leave, roster, calendars, shifts, overtime |
| Payroll | Periods, runs, calculation, adjustments, validation |
| Talent | Goals, reviews, learning, certifications, succession |

### Public API

- **`hcmFacade`** — single entry point from `@/lib/hcm`
- **48 REST routes** — 37 foundation + 11 time (`app/api/hcm/`)
- **Standardized API envelopes** — `lib/hcm/api/` helpers

### Integration

- **IIL events** — 67+ outbound event types across 8 catalogues
- **Workflow orchestration** — 13 workflow template triggers
- **Organization isolation** — all operations scoped by `organizationId`

### Documentation (S-002.8)

- ES-HCM-001 Engineering Specification
- Package, Developer, Architecture, Operational guides
- API and Event catalogues
- Dependency matrix, technical debt register, testing guide

### Tests

- 9 HCM test suites in `tests/lib/hcm/` (74+ test cases)
- Foundation, facade, events, API integration, time certification, documentation certification

---

## Implementation Mission Summary

| Mission | Deliverable |
|---------|-------------|
| S-002.3 | Foundation domain services and rules engines |
| S-002.4 | In-memory repository implementations |
| S-002.5 | `HcmFacade` as sole public entry; time routes migrated |
| S-002.6 | IIL event publication; workflow platform subscription |
| S-002.7 | Foundation REST APIs; time route rationalization |
| S-002.8 | Engineering documentation and developer experience |

---

## Known Limitations

See [HCM Technical Debt Register](./HCM-Technical-Debt-Register.md):

- In-memory persistence only
- No payroll/talent REST routes
- No HCM-specific permission matrix
- `readyForEnterpriseHcmCertification: false` until persistent storage and permission hooks

---

## Breaking Changes from Pre-Facade Code

If upgrading from early P-012.6 development:

| Before | After |
|--------|-------|
| `import { attendanceService } from "@/lib/hcm"` | `import { hcmFacade } from "@/lib/hcm"` → `hcmFacade.attendance` |
| Direct service singletons | All access via `hcmFacade` |
| Attendance GET `{ records, total }` | `{ items, pagination: { page, pageSize, total } }` |

---

## Validation

Validated with:

```bash
npm run typecheck  # PASS
npm run lint       # PASS (0 errors)
npm test           # HCM 74/74 PASS; 6 pre-existing CRM/Finance doc failures unrelated
npm run build      # PASS
```

---

*ORION Enterprise Platform · Enterprise HCM v1.0 · August 2026*
