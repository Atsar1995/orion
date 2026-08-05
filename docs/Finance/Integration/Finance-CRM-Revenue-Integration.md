# CRM → Finance Revenue Integration

**Document ID:** FIN-INT-002  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.19 — Finance Consumption of CRM Canonical Revenue Events  
**Version:** 1.0  
**Status:** Implemented — First CRM → Finance Enterprise Chain  
**Classification:** Platform Architecture · Finance Integration  
**Date:** 23 July 2026

**Baseline:** [ADR-013](../../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Boundaries.md) · [HCM → Finance Chain](./HCM-Finance-Event-Chain.md)

---

## Purpose

Documents the **CRM → Finance durable revenue event chain** — the first enterprise business chain connecting CRM canonical revenue events to Finance journal posting and General Ledger mutation.

Finance consumes authoritative CRM events through the Intelligent Integration Layer (IIL) and executes governed journal posting via the existing validation and posting pipeline.

**Scope:** `crm.revenue.recognized` and `crm.salesorder.confirmed` only. All other `crm.*` canonical types receive a graceful `UNSUPPORTED_EVENT` rejection.

**Risk closure:** **CRM-R-003 CLOSED**

---

## Architecture

```
CRM Canonical Publisher (P-008.14)
  → IIL Transport (ADR-013)
  → FinanceEventConsumer (crm-chain subscription)
        ├── ADR-014 envelope validation
        ├── Version validation (eventVersion: 1)
        ├── Organization validation
        └── Idempotency key validation
  → FinanceEventDispatcher
  → FinanceInboundProcessor
        ├── Contract validation
        ├── Idempotency (EventLineageRepository)
        ├── FinanceEventMapper → JournalDraftInput + PostingContext
        ├── PostingValidationPipeline
        ├── JournalPostingService
        └── GeneralLedgerPostingService
  → PlatformStore commit
  → EventLineage completed
```

| Component | Responsibility |
|-----------|----------------|
| `FinanceEventConsumer` | IIL subscription · CRM envelope/version/org/idempotency validation |
| `FinanceSupportedEvents` | Canonical type registry · unsupported `crm.*` detection |
| `FinanceEventDispatcher` | Route by canonical `eventType` |
| `FinanceEventMapper` | Map CRM payload → journal draft + posting context (no calculations) |
| `FinanceInboundProcessor` | End-to-end orchestration inside posting UoW |
| `FinanceEventResult` | Structured processing outcome |

---

## Supported Events

| eventType | Finance Action | Journal Mapping | Idempotency Entity |
|-----------|----------------|-----------------|-------------------|
| `crm.revenue.recognized` | Revenue recognition journal | Dr 1120 (AR) · Cr 4200 (Commercial Revenue) | `salesOrderId` |
| `crm.salesorder.confirmed` | Operational order journal | Dr 1120 (AR) · Cr 4200 (Commercial Revenue) | `salesOrderId` |

**Sales order amount:** The CRM canonical publisher does not include order value in the base contract. Finance accepts optional `amount` or `orderValue` in the payload for GL posting. Events without a postable amount are rejected with `ORDER_VALUE_REQUIRED` until order value enrichment is available at the Finance boundary.

**Deferred journal mode:** When `CRM_DEFERRED_JOURNAL_ENABLED` or payload `deferredJournal: true`, sales order confirmed maps credit to 3100 (Retained Earnings) instead of 4200.

**Contract version:** `eventVersion: 1` (ADR-014)

**Ignored:** All other `crm.*` types → `UNSUPPORTED_EVENT`

---

## Envelope Validation (ADR-014)

Required fields validated before dispatch:

| Field | Validation |
|-------|------------|
| `eventVersion` | Must equal `1` |
| `organizationId` | Required · must match service context |
| `correlationId` | Required |
| `idempotencyKey` | Required (CRM chain) |
| `canonicalEventType` | Required · must be supported CRM finance type |
| `sourceDomain` | Must be `crm` when present |

Optional: `causationId` (recorded in posting metadata when present)

---

## Idempotency

Duplicate CRM events produce **one journal only**. Enforcement at three layers (mirrors HCM chain):

1. **EventLineageRepository** — inbound duplicate detection by idempotency key
2. **PostingValidationPipeline** — idempotency stage
3. **JournalPostingService** — completed duplicate short-circuit

Idempotency key format (ES-CRM-001 / ES-FIN-002):

```
{organizationId}:crm-workspace:crm-revenue-{salesOrderId}-recognized-v1
{organizationId}:crm-workspace:crm-salesorder-{salesOrderId}-confirmed-v1
```

---

## Organization Isolation

Events with `organizationId` mismatching the Finance service context are rejected with `ORGANIZATION_MISMATCH`. No cross-tenant posting occurs.

---

## Legacy Pipeline Guard

The legacy Finance business-event pipeline (`register-finance-subscribers.ts`) skips canonical CRM finance types to prevent double journal creation. Canonical CRM events are handled exclusively by the `FinanceEventConsumer` CRM chain subscription.

---

## Transaction Boundary

The entire workflow executes inside the **PlatformStore `TransactionManager`** boundary established by `JournalPostingService`:

- Validation failure → no journal mutation · no ledger mutation · rollback
- Posting failure → journal reverted to `draft` · rollback
- Duplicate idempotency key → short-circuit without double GL entries

---

## Test Coverage

`tests/lib/finance/FinanceCrmRevenueConsumer.test.ts` verifies:

- Revenue recognized happy path + GL mutation
- Sales order confirmed happy path
- Duplicate suppression
- Unsupported `crm.*` event handling
- Version mismatch rejection
- Organization isolation
- Contract validation failure (rollback)
- Envelope validation (idempotency key)
- IIL registration E2E
- PostgreSQL restart + duplicate replay

---

## Enterprise Chain Status

```
CRM (Publisher certified P-008.14)
  ↓
Durable IIL (ADR-013)
  ↓
Finance (Consumer P-009.19) ← THIS MISSION
  ↓
General Ledger
```

**CRM-R-003:** **CLOSED**

---

*CRM → Finance Revenue Integration · P-009.19 · First enterprise revenue lifecycle*
