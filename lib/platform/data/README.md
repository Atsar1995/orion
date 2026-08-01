# Enterprise Data Platform

Organization-scoped master data, validation, and synchronization for the ORION Enterprise Platform (Epic P-011).

## Mission Status

| Mission | Module | Status |
|---------|--------|--------|
| P-011.1 | Master Data Registry | **Delivered** |
| P-011.2 | Reference Data Framework | Deferred |
| P-011.3 | Metadata Framework | Deferred |
| P-011.4 | Data Validation Framework | **Delivered** |
| P-011.5 | Synchronization Engine | **Delivered** |
| P-011.6 | Data Governance Services | Deferred |
| P-011.7 | Executive Data Intelligence | Deferred |
| P-011.8 | Platform Certification | **Complete** · CONDITIONAL GO |

**Release:** [v0.4.1-alpha](../../docs/releases/v0.4.1-alpha-Release-Notes.md) · [Certificate](../../docs/Data/Engineering/ENTERPRISE_DATA_PLATFORM_CERTIFICATE.md)

## Public API

```typescript
import {
  // P-011.1 Master Data Registry
  masterDataRegistryService,
  entityLookupService,
  entityDiscoveryService,
  identityService,
  registryQueryService,
  // P-011.4 Validation Framework
  validationService,
  validationRuleService,
  validationPolicyService,
  validationReportService,
  validationRegistryService,
  // P-011.5 Synchronization Engine
  synchronizationService,
  subscriptionService,
  synchronizationPolicyService,
  synchronizationMonitoringService,
  synchronizationAuditService,
} from "@/lib/platform/data";
```

| Service | Mission | Responsibility |
|---------|---------|----------------|
| `masterDataRegistryService` | P-011.1 | Register, update, activate, deactivate, archive master entities |
| `entityLookupService` | P-011.1 | Lookup by ID, business key, or global ID |
| `entityDiscoveryService` | P-011.1 | Cross-domain entity search and discovery |
| `identityService` | P-011.1 | Immutable identity resolution and integrity validation |
| `registryQueryService` | P-011.1 | Canonical entity type registry and statistics |
| `validationService` | P-011.4 | Eight-stage validation pipeline |
| `validationRuleService` | P-011.4 | Validation rule registration and management |
| `validationPolicyService` | P-011.4 | Validation policy management |
| `validationReportService` | P-011.4 | Validation report retrieval |
| `validationRegistryService` | P-011.4 | Rule group and registry statistics |
| `synchronizationService` | P-011.5 | Enqueue and retry synchronization jobs |
| `subscriptionService` | P-011.5 | Subscriber registry management |
| `synchronizationPolicyService` | P-011.5 | Sync policy management |
| `synchronizationMonitoringService` | P-011.5 | Sync statistics and conflict monitoring |
| `synchronizationAuditService` | P-011.5 | Synchronization audit trail |

## REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/platform/data/entities` | Discover / register entities |
| GET/PATCH | `/api/platform/data/entities/[id]` | Get / update / lifecycle actions |
| GET | `/api/platform/data/registry` | Entity type registry and stats |
| GET | `/api/platform/data/lookup` | Lookup by globalId or businessKey |
| POST | `/api/platform/data/validation` | Run validation pipeline |
| GET/POST | `/api/platform/data/synchronization` | Sync jobs and monitoring |
| GET/POST | `/api/platform/data/synchronization/subscriptions` | Subscriber registry |

## Engineering Patterns

- **Facade:** `DataPlatformFacade` via `lib/platform/data/index.ts`
- **Repository:** Internal in-memory implementations (ES-036 persistence deferred)
- **Organization scoped:** All operations filtered by `ServiceContext.organizationId`
- **Immutable identity:** Surrogate ID and global ID never change after creation
- **Events:** Published via IIL with `sourceService: data-platform`

## References

- [ES-DATA-001 — Engineering Specification](../../docs/Data/Engineering/ES-DATA-001-Enterprise-Data-Platform-Engineering-Specification.md)
- [D-011 — Data Architecture Blueprint](../../docs/Data/Blueprints/D-011_Enterprise_Data_Architecture_Blueprint.md)
- [D-013 — Data Governance](../../docs/Data/Governance/D-013_Enterprise_Data_Governance.md)
- [P-011.1 Mission Doc](../../docs/Data/Engineering/P-011.1-Enterprise-Master-Data-Registry.md)
- [Platform Certificate](../../docs/Data/Engineering/ENTERPRISE_DATA_PLATFORM_CERTIFICATE.md)

## Canon (P-011)

| Chapter | Applicability |
|---------|---------------|
| C-003 | Platform layer; domain isolation |
| C-006 | Facade, repository, service layer, tests |
| C-008 | IIL event publishing |
| C-010 | Organization isolation; immutable identity |
