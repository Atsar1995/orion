# Finance Platform Foundation

**Document ID:** FIN-PLT-001  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.5 — Finance Gate 5 Wave A (Platform Foundation)  
**Version:** 1.0  
**Status:** Implemented — Infrastructure Layer  
**Classification:** Platform Architecture · Finance  
**Authority:** Finance Domain Lead · Platform Engineering Lead  
**Date:** 3 August 2026

**Baseline:** [ES-FIN-002](../../Finance/Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · [ADR-007](../../../11_Governance/ADR/ADR-007-Production-Persistence-Strategy.md) · [ADR-015](../../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · HCM reference (`lib/hcm/createHcmWiring.ts`)

---

## Purpose

This document describes the **Finance platform foundation** introduced in Gate 5 Wave A. It covers persistence backing, repository wiring, PlatformStore integration, and the Finance composition root.

**Scope:** Infrastructure only — no journal posting, ledger rules, invoices, payments, or accounting logic.

---

## Architecture Summary

```
PlatformStore
  └── getFinanceBacking() → FinanceStoreBacking
        └── createFinanceRepositories()
              └── InMemory*Repository (Wave A)
                    └── createFinanceWiring()
                          └── FinanceFacade (public API)
```

| Component | Path | Role |
|-----------|------|------|
| **FinanceStoreBacking** | `lib/finance/persistence/FinanceStoreBacking.ts` | Shared collection contract |
| **createFinanceStore** | `lib/finance/persistence/createFinanceStore.ts` | Empty store factory + seed |
| **createFinanceRepositories** | `lib/finance/persistence/createFinanceRepositories.ts` | Repository bundle |
| **FinancePlatformBacking** | `lib/finance/persistence/FinancePlatformBacking.ts` | PlatformStore resolver |
| **createFinanceWiring** | `lib/finance/createFinanceWiring.ts` | Composition root |
| **FinanceFacade** | `lib/finance/FinanceFacade.ts` | Public entry (`financeService`) |

---

## PlatformStore Integration

| Provider | Finance Backing |
|----------|-----------------|
| **InMemoryPlatformStore** | `createFinanceStore()` per store instance |
| **PostgresPlatformStore** | In-memory Finance backing at initialize (PostgreSQL finance persister — Wave A follow-up) |

`PlatformStore.getFinanceBacking()` is mandatory on all providers per ADR-007 extension.

---

## Wave A Repository Set

| Repository | Interface | Backing Collection |
|------------|-----------|-------------------|
| Chart of Accounts | `ChartOfAccountsRepository` | `accounts` |
| General Ledger | `GeneralLedgerRepository` | `ledgerBalances`, `ledgerPostings`, `consumedEvents`, `reconciledPeriods` |
| Fiscal Period | `PeriodRepository` | `fiscalCalendar`, `fiscalYears`, `fiscalPeriods` |
| Idempotency | `IdempotencyRepository` | `idempotencyKeys` |
| Event Pipeline | `FinancialEventRepository` + related | `financialEvents`, `deadLetters`, `pipelineAudit`, `businessEventIntakes` |
| Executive Intelligence | `FinancialIntelligenceRepository` | `financialTrends`, `budgetActuals` |

---

## Health Integration

`HealthStatusService` reports `finance_platform` when Finance backing is available via PlatformStore.

Operational live probes continue via `OperationalHealthService` (`platform_store_live`).

---

## Remaining Wave A Work

| Item | Status |
|------|--------|
| Platform foundation (this mission) | ✅ Implemented |
| PostgreSQL Finance persister (`finance_entities`) | ⏳ Follow-up |
| `InMemoryJournalRepository` | ⏳ Wave A next |
| `InMemoryEventLineageRepository` | ⏳ Wave A next |
| Finance PlatformStore persister module | ⏳ Wave A next |
| Durable IIL inbound processor | ⏳ Requires ADR-013 Implemented |
| Event contract registry (ADR-014) | ⏳ Registered schemas |

---

## Validation

| Gate | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test -- tests/lib/finance/FinancePlatformFoundation.test.ts` |
| Build | `npm run build` |

---

*Finance Platform Foundation · P-009.5 Wave A · Infrastructure only*
