# Enterprise HCM Testing Guide

**Document ID:** HCM-TEST-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)

---

## Test Strategy

HCM tests verify business rules, repository contracts, facade integration, event publication, API envelopes, and documentation completeness — **without** requiring Next.js runtime (except route handler imports with mocked context).

---

## Test Suites

| Suite | File | Coverage |
|-------|------|----------|
| Foundation Services | `FoundationServices.test.ts` | P-012.1–P-012.5 service rules |
| Foundation Repositories | `FoundationRepository.test.ts` | Repository contracts, org isolation |
| Facade Integration | `HcmFacadeIntegration.test.ts` | Public facade, no repo leakage |
| Events Integration | `HcmEventsIntegration.test.ts` | IIL publication, workflow dispatch |
| API Integration | `HcmApiIntegration.test.ts` | REST envelopes, pagination, org isolation |
| Time Repository | `TimeRepository.test.ts` | Time persistence contracts |
| Attendance Operations | `AttendanceOperations.test.ts` | P-012.6 attendance flows |
| Leave Policy | `LeavePolicy.test.ts` | Leave business rules |
| Time Certification | `HcmTimeCertification.test.ts` | P-012.6 docs and routes |
| Documentation Certification | `HcmDocumentationCertification.test.ts` | S-002.8 doc inventory |

---

## Running Tests

```bash
# All HCM tests
npm test -- tests/lib/hcm

# Single suite
npm test -- tests/lib/hcm/HcmFacadeIntegration.test.ts

# Watch mode (development)
npm test -- --watch tests/lib/hcm
```

---

## Test Patterns

### ServiceContext

```typescript
const CONTEXT: ServiceContext = {
  organizationId: "org-test",
  workspaceId: "ws-test",
  userId: "user-hr",
  role: "executive",
};
```

Use unique organization IDs for isolation tests.

### Isolated Facade

```typescript
import { HcmFacade } from "@/lib/hcm";

const facade = new HcmFacade(); // Fresh wiring + store
```

### Organization Isolation Assertion

```typescript
const record = facade.createEmployee(input, CONTEXT_A);
expect(facade.getEmployee(record.id, CONTEXT_B)).toBeNull();
```

### API Route Testing

Mock `getHcmApiContext` to avoid Next.js cookies dependency:

```typescript
vi.mock("@/lib/hcm/api/hcm-api-context", () => ({
  getHcmApiContext: vi.fn(async () => ({ context: CONTEXT, executiveName: "Test" })),
}));
```

---

## Certification Gates

Every HCM mission requires:

| Gate | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Test | `npm test` |
| Build | `npm run build` |

---

## Coverage Expectations

| Layer | Minimum Expectation |
|-------|---------------------|
| Rules engines | All status transitions and validation rules |
| Services | CRUD + lifecycle operations per module |
| Repositories | Org scoping, search, count |
| Facade | All public methods reachable; internals not exposed |
| Events | Foundation mutations publish; workflow triggers mapped |
| API | Success/error envelopes; 404 for missing entities |
| Documentation | All ES-HCM-001 referenced docs exist on disk |

---

## Adding Tests for New Features

1. Add service tests in `FoundationServices.test.ts` or module-specific file
2. Add repository tests if new repository interface
3. Extend `HcmFacadeIntegration.test.ts` if new public facade surface
4. Add event tests if new IIL event type
5. Add API tests if new REST route
6. Update [HCM API Catalogue](./HCM-API-Catalogue.md) and [HCM Event Catalogue](./HCM-Event-Catalogue.md)

---

*ORION Enterprise Platform · Enterprise HCM v1.0*
