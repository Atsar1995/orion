# CRM Platform Foundation

**Document ID:** CRM-PLT-001  
**Program:** P-008 — ORION Enterprise CRM  
**Mission:** P-008.9 — CRM Platform Foundation  
**Version:** 1.0  
**Status:** Implemented — Infrastructure Layer  
**Classification:** Platform Architecture · CRM  
**Authority:** CRM Domain Lead · Platform Engineering Lead  
**Date:** 23 July 2026

**Baseline:** [CRM-Reference-Domain-Architecture.md](../CRM-Reference-Domain-Architecture.md) · [ADR-007](../../11_Governance/ADR/ADR-007-Production-Persistence-Strategy.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · Finance reference (`lib/finance/createFinanceWiring.ts`) · HCM reference (`lib/hcm/createHcmWiring.ts`)

---

## Purpose

This document describes the **CRM platform foundation** introduced in Mission P-008.9. It covers persistence backing, repository wiring, PlatformStore integration, health monitoring, and the CRM composition root.

**Scope:** Infrastructure only — no lead management, opportunity processing, workflow implementation, analytics, REST endpoints, or canonical event processing.

---

## Architecture Summary

```
PlatformStore
  └── getCrmBacking() → CrmStoreBacking
        └── createCrmRepositories()
              └── InMemoryCrmRepository (TD-002 placeholder)
                    └── createCrmWiring()
                          └── CrmFacade (public API)
```

| Component | Path | Role |
|-----------|------|------|
| **CrmStoreBacking** | `lib/crm/persistence/CrmStoreBacking.ts` | Shared collection contract |
| **createCrmStore** | `lib/crm/persistence/createCrmStore.ts` | Empty store factory + org foundation seed |
| **createCrmRepositories** | `lib/crm/persistence/createCrmRepositories.ts` | Repository bundle |
| **CrmPlatformBacking** | `lib/crm/persistence/CrmPlatformBacking.ts` | PlatformStore resolver |
| **createCrmWiring** | `lib/crm/createCrmWiring.ts` | Composition root |
| **CrmFacade** | `lib/crm/CrmFacade.ts` | Public entry (`crmFacade`) |
| **crmEventPipelineRegistry** | `lib/crm/services/crmEventPipelineRegistry.ts` | Event pipeline placeholder (ADR-014 follow-up) |
| **CrmEntityPersister** | `lib/platform/persistence/crm/CrmEntityPersister.ts` | PostgreSQL `crm_entities` adapter |

---

## PlatformStore Integration

| Provider | CRM Backing |
|----------|-------------|
| **InMemoryPlatformStore** | `createCrmStore()` per store instance |
| **PostgresPlatformStore** | `createPostgresCrmStore()` at initialize |

`PlatformStore.getCrmBacking()` is mandatory on all providers per ADR-007 extension.

---

## Foundation Repository Set

| Repository | Interface | Backing (Foundation) |
|------------|-----------|---------------------|
| Core CRM | `CrmRepository` | Shared `InMemoryCrmRepository` (TD-002) |
| Parties | `PartyRepository` | Shared instance |
| Commercial | `CommercialRepository` | Shared instance |
| Agreements | `AgreementsRepository` | Shared instance |
| Commercial Intelligence | `CommercialIntelligenceRepository` | Shared instance |
| Customer Intelligence | `CustomerIntelligenceRepository` | Shared instance |
| Executive Dashboard | `ExecutiveDashboardRepository` | Shared instance |

Organization foundation markers (`organizationFoundations`) are stored in `CrmStoreBacking` and prepared for `crm_entities` PostgreSQL persistence.

---

## Health Integration

`HealthStatusService` reports `crm_platform` when CRM backing is available via PlatformStore.

Operational live probes continue via `OperationalHealthService` (`platform_store_live`).

---

## Remaining CRM Work

| Item | Status |
|------|--------|
| Platform foundation (this mission) | ✅ Implemented |
| Full PlatformStore + CrmEntityPersister business persistence | ⏳ P-008.10 |
| RBAC permission catalog + REST | ⏳ P-008.11 |
| CrmCanonicalEventPublisher + ADR-014 registry | ⏳ P-008.12 |
| Unified `crmFacade` · retire sub-facades | ⏳ P-008.9 Phase II |
| REST, workflow, certification, Gate 6 | ⏳ P-008.13–P-008.20 |

---

## Validation

| Gate | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test -- tests/lib/crm/CrmPlatformFoundation.test.ts` |
| Build | `npm run build` |

---

*CRM Platform Foundation · P-008.9 · Infrastructure only*
