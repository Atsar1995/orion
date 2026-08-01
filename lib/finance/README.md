# Finance Workspace Module

Public API: import from `@/lib/finance` only.

**Mission:** P-009.1 · P-009.2 · P-009.3 · P-009.5 · P-009.6 Financial Event Pipeline · Architecture Baseline v0.3

## Architecture

```
app/(platform)/finance/     → workspace pages (ES-025)
lib/finance/
  FinanceFacade.ts          → public financeService
  constants.ts                → FINANCE_IIL_SERVICE_ID, route permissions
  nav.ts                      → FINANCE_NAV
  finance-events.ts           → IIL financial event publisher
  event-pipeline/             → pipeline service, transformation registry, policy evaluator
  fiscal-period/              → period service, rules engine, period events
  general-ledger/             → GL service, rules engine, ledger events
  chart-of-accounts/          → CoA service and validation
  services/                   → service interfaces (+ stubs for future missions)
  repositories/               → repository interfaces (+ idempotency impl)
  models/                     → workspace view models
  index.ts                    → public API
types/finance-*.ts            → domain and event contract types
tests/lib/finance/            → foundation and certification tests
```

**Constitutional references:** D-007 · D-008 · D-009 · ES-FIN-001

## P-009.1 Scope

| Delivered | Deferred |
|-----------|----------|
| Finance workspace bootstrap | General Ledger |
| Public `financeService` facade | Journal posting |
| Validation framework (structural) | AR / AP |
| Event contracts + IIL registration | Persistence tier |

## P-009.2 Scope

| Delivered | Deferred |
|-----------|----------|
| Enterprise Chart of Accounts | Journal Engine |
| Account hierarchy + validation | AR / AP / Banking |
| CoA public APIs | Persistence tier |

## P-009.3 Scope

| Delivered | Deferred |
|-----------|----------|
| Enterprise General Ledger | Journal Engine (P-009.4) |
| Trial balance + inquiry | AR / AP / Banking |
| Opening / closing balances | Budget / Forecast / Tax |
| Ledger posting interface | Financial statements |
| Period integration + validation | Persistence tier |

## P-009.5 Scope

| Delivered | Deferred |
|-----------|----------|
| Enterprise Fiscal Period Management | Financial Event Pipeline (P-009.6) |
| Fiscal calendar + year + period lifecycle | AR / AP / Banking |
| Soft close · hard close · year close · reopen | Budget / Forecast / Tax |
| Period validation + locking | Financial statements |

## Services

| Member | Purpose |
|--------|---------|
| `financeService.validation` | Structural validation pipeline |
| `financeService.events` | Publish financial events; record inbound business events |
| `financeChartOfAccountsService.accounts` | CoA list, detail, hierarchy, create, update |
| `financeGeneralLedgerService` | Trial balance, inquiry, posting, reconciliation |
| `financeFiscalPeriodService` | Calendar, period lifecycle, validation, inquiry |
| `financeEventPipelineService` | Business event intake, transformation, policy, audit |
| `financeService.transformation` | Legacy adapter delegating to event pipeline |
| `financeService.getDomainStatus()` | Domain readiness snapshot |
| `financeService.journal` | Stub — P-009.4 |

## IIL Integration

- **Service ID:** `finance-workspace`
- **Publishes:** financial event contracts (`publishFinanceEvent`)
- **Subscribes:** business events from `crm-workspace`, `hospitality-workspace`
- **Registration:** `registerFinanceEventSubscriptions()` via platform intelligence handlers

## References

- [ES-FIN-001 Finance Domain Engineering Specification](../../docs/Finance/Engineering/ES-FIN-001_Finance_Domain_Engineering_Specification.md)
- [ES-025 Finance Workspace](../../docs/02_Engineering/ES-025-Finance-Workspace.md)
- [P-009.1 Mission Specification](../../docs/Finance/Engineering/P-009.1-Finance-Workspace-Foundation.md)
- [P-009.2 Chart of Accounts](../../docs/Finance/Engineering/P-009.2-Enterprise-Chart-of-Accounts.md)
- [P-009.3 General Ledger](../../docs/Finance/Engineering/P-009.3-Enterprise-General-Ledger.md)
- [P-009.5 Fiscal Period Management](../../docs/Finance/Engineering/P-009.5-Enterprise-Fiscal-Period-Management.md)
- [P-009.6 Financial Event Pipeline](../../docs/Finance/Engineering/P-009.6-Enterprise-Financial-Event-Pipeline.md)
