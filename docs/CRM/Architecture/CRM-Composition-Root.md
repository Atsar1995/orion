# CRM Composition Root

**Document ID:** CRM-ARCH-001  
**Program:** P-008 — ORION Enterprise CRM  
**Mission:** P-008.18 — CRM Composition Root Convergence & TD-002 Retirement  
**Version:** 1.0  
**Status:** Implemented — Dependency Injection Layer  
**Classification:** Platform Architecture · CRM  
**Date:** 5 August 2026

**Baseline:** [CRM-Platform-Foundation.md](../Platform/CRM-Platform-Foundation.md) · [CRM-Postgres-Persistence.md](../Persistence/CRM-Postgres-Persistence.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · Finance reference (`lib/finance/FinanceFacade.ts`)

**Risk Closed:** CRM-R-002

---

## Purpose

Documents the authoritative CRM dependency injection model. Mission P-008.18 retires TD-002 process-wide singleton repositories and establishes a single PlatformStore-backed composition root.

---

## Composition Model

```
PlatformStore
  └── ensureCrmPlatformBacking()
        └── createCrmRepositories(backing)
              └── createCrmPersistenceRepositories({ platformStore, connection })
                    └── createCrmWiring(platformStore)
                          └── CrmFacade (crmFacade)
                                └── Public services (crmService, crmPartyService, …)
```

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **Store** | `PlatformStore` | Owns `CrmStoreBacking` lifetime |
| **Repositories** | `createCrmRepositories()` | Domain repository bundle (single instance per wiring) |
| **Persistence** | `createCrmPersistenceRepositories()` | Aggregate persistence adapter |
| **Wiring** | `createCrmWiring()` | Authoritative DI root — facades, services, publisher |
| **Facade** | `CrmFacade` / `crmFacade` | Public domain entry |
| **Exports** | `lib/crm/index.ts` | Re-exports wired services from `crmFacade` |

---

## Dependency Graph

```
createCrmWiring(platformStore)
  ├── backing ← platformStore.getCrmBacking()
  ├── crmRepository ← PostgresCrmRepository | InMemoryCrmPersistenceRepository
  ├── repository ← new InMemoryCrmRepository()  [domain seed data, per wiring scope]
  ├── canonicalEventPublisher ← new CrmCanonicalEventPublisher()
  ├── salesOrderService ← new SalesOrderService(publisher)
  ├── authorization ← new CrmAuthorizationService()
  ├── caseService ← new CaseService(backing, publisher)
  ├── partyFacade ← CrmPartyFacade(repository, publisher)
  ├── commercialFacade ← CrmCommercialFacade(repository, publisher)
  ├── agreementsFacade ← CrmAgreementsFacade(repository, publisher, salesOrderService)
  ├── *IntelligenceFacade ← repository
  └── crmService ← CrmService({ repository, publisher, salesOrderService })
```

**Rule:** No module-level repository singletons. Each `createCrmWiring()` call produces an isolated repository graph unless explicitly injected.

---

## TD-002 Retirement

| Retired | Replacement |
|---------|-------------|
| `defaultCrmRepository` | `createCrmRepositories()` → `new InMemoryCrmRepository()` per wiring |
| `getDefaultCrmBacking()` | `PlatformStore.getCrmBacking()` |
| Module-level service construction in `index.ts` | `crmFacade.*` exports |
| `defaultSalesOrderService` | `createCrmWiring()` local instance |
| Facade constructor defaults for publisher | Required constructor injection |

`resetDefaultCrmBackingForTests()` retained as no-op for test harness compatibility.

---

## Public API

All workspace consumers import from `@/lib/crm`:

```typescript
import {
  crmFacade,
  crmService,
  crmPartyService,
  crmCommercialService,
  crmRepository,
  createCrmWiring,
} from "@/lib/crm";
```

For tests and custom PlatformStore scopes:

```typescript
const wiring = createCrmWiring(platformStore, { repository: mockRepository });
const facade = new CrmFacade(wiring);
```

---

## Injection Points

| Option | Location | Use |
|--------|----------|-----|
| `CreateCrmWiringOptions.repository` | `createCrmWiring()` | Replace domain repository (mock/spy) |
| `CreateCrmRepositoriesOptions.repository` | `createCrmRepositories()` | Low-level repository override |
| `CrmFacade(wiring)` | Constructor | Custom wiring graph |

---

## Certification

Composition root convergence certified in `tests/lib/crm/CrmCompositionRoot.test.ts`:

- Public services resolve from `crmFacade`
- Shared repository instance across domain interfaces
- Mock repository injection
- PlatformStore lifecycle
- TD-002 singleton absence
- Organization isolation through wired repository

**CRM-R-002:** CLOSED

---

*CRM Composition Root · P-008.18 · Dependency injection layer*
