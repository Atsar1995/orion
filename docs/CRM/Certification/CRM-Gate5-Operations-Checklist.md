# CRM Gate 5 — Operations Checklist

**Mission:** P-008.16 — CRM Gate 5 Enterprise Certification  
**Document ID:** CRM-CERT-OPS-001  
**Assessment Date:** 4 August 2026  
**Classification:** Internal — CRM Operations Readiness

---

## Pre-Deployment Checklist

### Platform Foundation

- [ ] `PlatformStore` initialized with CRM backing seeded (`createCrmStore`)
- [ ] PostgreSQL migration applied (`crm_entities` table via bootstrap migration)
- [ ] `CrmEntityPersister` connected when `StoreProvider.PostgreSQL`
- [ ] CRM health endpoint returns healthy on `/api/health` (`crm_platform` aggregate)
- [ ] `createCrmWiring()` invoked at application bootstrap
- [x] PostgreSQL persistence via `CrmEntityPersister` (P-008.17 · CRM-R-001 closed)

### CRM Business Operations

- [ ] Actor has authorized CRM role via session (`resolveCrmRolesForPlatformRole`)
- [ ] Organization ID in `ServiceContext` matches entity org
- [ ] Lead create/qualify uses `LeadService` with post-commit canonical publish
- [ ] Opportunity create/close uses `OpportunityService` with post-commit publish
- [ ] Quote create uses `QuotationService` with post-commit publish
- [ ] Contract sign triggers `SalesOrderService.confirm()` → `crm.salesorder.confirmed` + `crm.revenue.recognized`
- [ ] Case close uses `CaseService.close()` → `crm.case.closed`

### REST Authorization

- [ ] All 47 CRM API routes call `getCrmApiContextForRequest()` at route entry
- [ ] Unauthorized requests return 401/403 via `errorResponse` (fail-closed)
- [ ] Permission codes match route operation (read vs write vs qualify)
- [ ] Settings route requires `crm:configuration:manage`

### Cross-Domain (CRM → Finance)

- [ ] Canonical events use Version 1 contract types (`crmOutboundEvents.ts`)
- [ ] `eventVersion: "1"` in payload
- [ ] `sourceService: crm-workspace` and `sourceDomain: crm`
- [ ] Idempotency key follows deterministic pattern per event type
- [ ] IIL publisher registered via `getIntelligenceIntegrationService()`
- [x] Finance consumer registered for CRM canonical types (P-009.19 · CRM-R-003 closed)
- [ ] **Manual:** Verify Finance receives `crm.revenue.recognized` after contract sign in staging

### Canonical Event Verification

| Event | Trigger | Verify |
|-------|---------|--------|
| `crm.lead.created` | `LeadService.create()` | `CrmWorkflowEventEmission.test.ts` |
| `crm.lead.qualified` | `LeadService.qualify()` | Same |
| `crm.opportunity.created` | `OpportunityService.create()` | Same |
| `crm.opportunity.closed` | Won/lost/closed modify | Same |
| `crm.quote.created` | `QuotationService.create()` | Same |
| `crm.customer.created` | Organisation/Person create | Same |
| `crm.customer.updated` | Organisation/Person update | Same |
| `crm.salesorder.confirmed` | Contract sign → confirm | Same |
| `crm.revenue.recognized` | Contract sign → confirm | Same |
| `crm.case.closed` | `CaseService.close()` | Same |

### Restart & Recovery

- [x] **Manual:** Confirm CRM data after restart (`CrmPersistenceRestart.test.ts`)
- [ ] **Manual:** Confirm IIL queue state after restart (in-memory — see CRM-R-011)
- [ ] **Manual:** Confirm canonical event idempotency after restart (publisher keys deterministic; IIL state ephemeral)

### Security

- [ ] Organization ID in `ServiceContext` matches entity org on all mutations
- [ ] No cross-tenant CRM entity access
- [ ] RBAC fail-closed on all 47 REST routes ✅
- [ ] Permission catalog loaded (`crm-permission-catalog.ts`)

### Monitoring

- [ ] `crm_platform` health signal visible in platform aggregate
- [ ] `crmEventPipelineRegistry.canonicalPublisherReady === true`
- [ ] Workspace intelligence health compute operational (`crm-health-compute.ts`)

---

## Validation Commands

```bash
npm run typecheck
npm run lint
npm test -- tests/lib/crm/
npm test -- tests/lib/crm tests/lib/platform/security tests/platform/iil
npm run build
```

**Expected (4 Aug 2026 baseline):**

| Suite | Files | Tests | Result |
|-------|------:|------:|--------|
| CRM only | 27 | 200 | All pass |
| CRM + security + IIL | 44 | 265 | All pass |
| Typecheck | — | — | 0 errors |
| Lint | — | — | 0 errors (67 warnings) |
| Build | — | — | Success |

---

## Monitoring Signals (Wave B)

| Signal | Source | Action Threshold |
|--------|--------|------------------|
| CRM auth failure | `getCrmApiContextForRequest()` 401/403 | Alert on sustained unauthorized access attempts |
| Canonical publish failure | `CrmCanonicalEventPublisher` errors | Investigate IIL connectivity |
| Pipeline registry status | `crmEventPipelineRegistry` | Alert if `canonicalPublisherReady` becomes false |
| Workspace health score | `crm-health-compute.ts` | Review if score drops below attention threshold |
| IIL dead letters | Intelligence DLQ | Review contract/version mismatches on CRM events |
| Legacy shim publish rate | `publishCommercialEngineEvent` et al. | Monitor during dual-publication period (CRM-R-004) |

---

## Incident Response

| Scenario | Expected Behaviour | Verify |
|----------|-------------------|--------|
| Unauthorized REST access | 401/403 fail-closed; no mutation | `CrmApiAuthorization.test.ts` |
| Org mismatch on mutation | Reject; no entity change | `CrmAuthorization.test.ts` |
| Canonical publish after commit failure | No event emitted | Service layer guards |
| Duplicate idempotency key | IIL deduplication; no double processing | `CrmCanonicalPublisher.test.ts` |
| Postgres path selected but inactive | Falls back to in-memory backing | CRM-R-001 — data not durable |
| Contract sign without Finance consumer | Events published; Finance ignores | CRM-R-003 — no journal created |

---

## Backup & Recovery

| Asset | Current State | Production Requirement |
|-------|---------------|----------------------|
| CRM entity data | In-memory Maps | Postgres `crm_entities` (CRM-R-001) |
| Idempotency keys | In-memory | Postgres durable (CRM-R-001) |
| IIL event queue | In-process | Durable transport (CRM-R-011) |
| Permission catalog | Code-defined | No backup required (static) |

**Recovery procedure (current):** Restart restores empty CRM backing unless re-seeded. **Not production-viable.**

---

## Rollback

| Change Type | Rollback Action |
|-------------|-----------------|
| CRM mission deployment | Revert to prior `develop/v2.0` commit |
| Canonical event emission | Feature flag not available — revert P-008.15 commit |
| RBAC enforcement | Reverting P-008.13 removes fail-closed REST auth — **do not rollback in production** |
| Postgres activation (future) | Migration rollback + in-memory fallback |

---

## Known Limitations (Wave B)

1. **No restart survival** — all CRM data in-memory (CRM-R-001, CRM-R-002)
2. **No Finance CRM consumer** — revenue events published but not consumed (CRM-R-003)
3. **Dual event publication** — legacy shims + canonical publisher (CRM-R-004)
4. **Case management API absent** — service-only; no REST routes (CRM-R-005)
5. **Seven sub-facades** — not converged to single service surface (CRM-R-009)
6. **IIL in-process** — events lost on restart (CRM-R-011)
7. **`readyForCertification: false`** — facade status flag intentionally unset (CRM-R-013)

---

## Production Blockers (Do Not Deploy Without)

1. PostgreSQL query activation in `PostgresCrmRepository` (CRM-R-001)
2. TD-002 singleton path retirement (CRM-R-002)
3. Finance CRM canonical event consumer (CRM-R-003)
4. Durable IIL transport or explicit executive waiver (CRM-R-011)

---

## Certification Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| CRM Domain Lead | — | — | Pending |
| Platform Engineering | — | — | Pending |
| Chief Enterprise Architect | — | — | Pending |

---

*CRM Gate 5 Operations Checklist · P-008.16 · Assessment only*
