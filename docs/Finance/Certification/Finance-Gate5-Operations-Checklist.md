# Finance Gate 5 — Operations Checklist

**Mission:** P-009.10 — Finance Gate 5 Enterprise Certification  
**Document ID:** FIN-CERT-OPS-001  
**Assessment Date:** 3 August 2026  
**Classification:** Internal — Finance Operations Readiness

---

## Pre-Deployment Checklist

### Platform Foundation

- [ ] `PlatformStore` initialized with finance backing seeded (`seedFinanceStore`)
- [ ] PostgreSQL migration applied (`finance_entities` table via bootstrap migration)
- [ ] `FinanceEntityPersister` connected when `StoreProvider.PostgreSQL`
- [ ] Finance health endpoint returns healthy on `/api/health` (platform aggregate)
- [ ] `createFinanceWiring()` invoked at application bootstrap

### Posting Operations

- [ ] Journal draft created before post (`JournalRepository.createDraft`)
- [ ] Posting actor has authorized role (`organization_admin`, `service_account`, etc.)
- [ ] Fiscal period is **Open** for target `periodId`
- [ ] Journal lines balanced (debits = credits)
- [ ] Cost centre provided when account requires it (`costCentreRequired`)
- [ ] Idempotency key unique per business event
- [ ] Posting validation pipeline passes all 8 stages

### Cross-Domain (HCM → Finance)

- [ ] HCM event uses canonical type (`hcm.workforce.cost.recorded` or `hcm.expense.approved`)
- [ ] `eventVersion: 1` in payload
- [ ] `sourceService: hcm-workspace` and `sourceDomain: hcm`
- [ ] Idempotency key follows ES-FIN-002 §4.6 format
- [ ] Finance IIL consumer registered (`registerFinanceEventSubscriptions`)
- [ ] Duplicate delivery returns `duplicate` without double GL entries

### Restart & Recovery

- [ ] Verify journal status survives Postgres restart (certified)
- [ ] Verify event lineage idempotency survives Postgres restart (certified)
- [ ] **Manual:** Confirm GL entries after restart (not yet durable — see FIN-R-001)
- [ ] **Manual:** Confirm IIL queue state after restart (in-memory — see FIN-R-002)

### Security

- [ ] Organization ID in `ServiceContext` matches journal/event org
- [ ] No cross-tenant journal or ledger access
- [ ] **Gap:** Finance API RBAC not yet fail-closed — restrict production exposure

---

## Validation Commands

```bash
npm run typecheck
npm run lint
npm test -- tests/lib/finance/
npm run build
```

**Expected (3 Aug 2026 baseline):** 18 test files · 128 tests pass · 0 type errors · build success

---

## Monitoring Signals (Wave A)

| Signal | Source | Action Threshold |
|--------|--------|------------------|
| Posting validation failure | `PostingValidationService` error codes | Alert on sustained `UNAUTHORIZED` or `PERIOD_NOT_OPEN` |
| Duplicate event rate | `FinanceEventResult.status === duplicate` | Expected on retry; spike indicates upstream bug |
| Lineage `failed` status | `EventLineageRepository` | Investigate; journal should remain `draft` |
| GL balance drift | `GeneralLedgerRepository.listBalances` | Manual reconciliation until trial balance (Wave B) |
| IIL dead letters | Intelligence DLQ | Review contract/version mismatches |

---

## Incident Response

| Scenario | Expected Behaviour | Verify |
|----------|-------------------|--------|
| Validation failure mid-post | Transaction rollback; journal stays `draft`; no GL entries | `PostingValidationPipeline.test.ts` |
| GL failure after journal posted | Journal reverted to `draft`; rollback | `GeneralLedgerPostingService.test.ts` |
| Duplicate idempotency key | Return duplicate; no re-post | `PostingService.test.ts`, `FinanceEventConsumer.test.ts` |
| Org mismatch | Reject; no mutation | `FinanceEventConsumer.test.ts` |
| Version mismatch | Reject with `VERSION_MISMATCH` | `FinanceEventConsumer.test.ts` |

---

## Production Blockers (Do Not Deploy Without)

1. GL PostgreSQL durability (FIN-R-001)
2. Finance API fail-closed RBAC (FIN-R-004)
3. HCM canonical event publishers (FIN-R-003)
4. Durable IIL transport or explicit executive waiver (FIN-R-002)

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Finance Domain Lead | — | — | Pending |
| Platform Engineering | — | — | Pending |
| Chief Enterprise Architect | — | — | Pending |

---

*Finance Gate 5 Operations Checklist · P-009.10 · Assessment only*
