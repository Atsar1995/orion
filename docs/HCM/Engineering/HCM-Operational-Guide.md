# Enterprise HCM Operational Guide

**Document ID:** HCM-OPS-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Audience:** Operators, integrators, support engineers

---

## Runtime Overview

Enterprise HCM v1.0 runs in-process within the ORION Next.js application. All data persists in `InMemoryHcmStore` (development/demo). Restarting the process resets non-seeded data.

Production persistent storage is deferred — see [Technical Debt Register](./HCM-Technical-Debt-Register.md).

---

## Default Organization Context

API routes resolve context via `getDecisionServiceContext()`:

| Condition | Organization | User |
|-----------|--------------|------|
| Authenticated session | Session `organizationId` | Session user |
| No session (development) | `org-orania` | `user-executive` |

All seeded demo data targets `org-orania`.

---

## Seed Data

On first `HcmFacade` construction, `createHcmWiring()` seeds:

| Dataset | Contents |
|---------|----------|
| Time | Employees, shifts, calendars, sample attendance/leave |
| Payroll | Calendars, periods, components |
| Talent | Goals, reviews, courses, certifications |
| Onboarding | Default document requirements |

Seed organization: `org-orania` (`HCM_SEED_ORG_ID` in `seed-hcm-time.ts`).

---

## API Operations

### Health Check

Verify facade status programmatically:

```typescript
import { hcmFacade } from "@/lib/hcm";

console.log(hcmFacade.getDomainStatus());
```

Expected flags for v1.0: all `*Implemented: true`, `foundationApiRoutesImplemented: true`, `eventsIntegrated: true`, `workflowIntegrated: true`.

### Common REST Flows

**Record attendance**

```
POST /api/hcm/attendance
{ "employeeId": "emp-hcm-001", "attendanceDate": "2026-07-23", "status": "present", "source": "manual" }
```

**Leave approval**

```
POST /api/hcm/leave/actions
{ "action": "approve", "requestId": "<id>", "approverId": "user-manager" }
```

**Hire-to-onboard**

1. `POST /api/hcm/recruitment/candidates`
2. `POST /api/hcm/recruitment/applications`
3. `POST .../applications/[id]/submit` → advance → interview
4. `POST /api/hcm/recruitment/offers`
5. `POST .../offers/[id]/hire`
6. `POST /api/hcm/onboarding`

See [HCM API Catalogue](./HCM-API-Catalogue.md).

---

## Event Monitoring

HCM events appear on IIL as `CustomEvent` from `hcm-workspace`. Filter:

```
payload.workspace = "hcm"
```

Workflow-triggering events additionally dispatch to Workflow Platform. See [HCM Event Catalogue](./HCM-Event-Catalogue.md).

---

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| `EMPLOYEE_NOT_FOUND` on attendance | Employee not in org or inactive | Verify `organizationId` and employee status |
| Empty search results | Wrong organization context | Confirm session org matches data org |
| `DUPLICATE_EMPLOYEE_NUMBER` | Unique constraint | Use unique employee number |
| `MISSING_PARAMS` on leave balance | Missing query params | Provide `employeeId` and `leaveType` |
| Workflow not starting | Event type has no template mapping | Check `HCM_WORKFLOW_TRIGGERS` |
| Data lost after restart | In-memory store | Expected in v1.0; re-seed or recreate |

---

## Validation Gates (Release)

Before operational deployment:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

---

## Security Notes

- Organization isolation enforced at repository layer
- API returns domain error codes only — no internal stack traces
- Fine-grained HCM role permissions not yet implemented (deferred)
- Sensitive PII stored in employee records — restrict API access in production

---

## Related Module Guides

| Guide | Topic |
|-------|-------|
| [P-012.6-Attendance-Guide](./P-012.6-Attendance-Guide.md) | Attendance policies |
| [P-012.6-Leave-Management-Guide](./P-012.6-Leave-Management-Guide.md) | Leave workflows |
| [P-012.6-Roster-Guide](./P-012.6-Roster-Guide.md) | Roster planning |
| [P-012.6-Policy-Configuration-Guide](./P-012.6-Policy-Configuration-Guide.md) | Time policies |

---

*ORION Enterprise Platform · Enterprise HCM v1.0*
