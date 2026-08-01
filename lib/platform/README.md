# ORION Platform Services

Enterprise platform modules for cross-domain capabilities. All services are organization-scoped and consumed by domain workspaces through public facades — never duplicated per domain.

## Mission Status

| Mission | Module | Status |
|---------|--------|--------|
| P-005 | Organization & Identity | Implemented |
| P-006 | Intelligence Integration Layer | Implemented |
| P-010.2 | Workflow & Approval Engine | Partial |
| P-010.3 | Notification & Communication Framework | Implemented |
| P-010.4 | Document Management Framework | Planned |
| P-010.5 | Search & Indexing Platform | Partial |
| P-010.6 | Audit & Compliance Framework | Implemented |

## Public APIs

### Compliance (P-010.6)

```typescript
import {
  enterpriseAuditService,
  complianceService,
  entityHistoryService,
  retentionService,
  reportingService,
} from "@/lib/platform/compliance";
```

| Service | Responsibility |
|---------|----------------|
| `enterpriseAuditService` | Record and search immutable audit events |
| `complianceService` | Compliance events, violations, exceptions, dashboard |
| `entityHistoryService` | Entity change history and security event logging |
| `retentionService` | Retention policies and expiry evaluation |
| `reportingService` | Audit reporting dashboards and export framework |

REST endpoints: `/api/platform/compliance/audit`, `/dashboard`, `/history/[entityType]/[entityId]`, `/retention`, `/reporting`

### Notification (P-010.3)

```typescript
import {
  notificationService,
  templateService,
  preferenceService,
  deliveryService,
  historyService,
} from "@/lib/platform/notification";
```

## Engineering Patterns

- **Facade Pattern** — single entry point per mission module
- **Repository Pattern** — in-memory implementations; interfaces not exported publicly
- **Service Layer** — business logic isolated from API routes
- **Organization Scoped** — all records filtered by `ServiceContext.organizationId`
- **Immutable Audit Records** — append-only storage with integrity hashing

## Canon Compliance (P-010.6)

| Chapter | Applicability |
|---------|---------------|
| C-003 Architecture | Platform layer model; shared services not duplicated |
| C-006 Engineering | Typecheck, lint, test, build validation |
| C-008 Intelligence | IIL event publishing for audit lifecycle |
| C-010 Security | Security event logging, risk classification, org isolation |

## References

- [ES-011 Platform Services Foundation](../docs/02_Engineering/ES-011-Platform-Services-Foundation.md)
- [P-010.6 Audit & Compliance Framework](../docs/02_Engineering/P-010.6-Enterprise-Audit-Compliance-Framework.md)
