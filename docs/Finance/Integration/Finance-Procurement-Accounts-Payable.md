# Finance → Procurement Accounts Payable Integration

**Document ID:** FIN-INT-003  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-010.19 — Finance Consumption of Procurement Canonical AP Events  
**Version:** 1.0  
**Status:** Implemented — Third Enterprise Reference Chain  
**Classification:** Platform Architecture · Finance Integration  
**Date:** 6 August 2026

**Baseline:** [ADR-013](../../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Boundaries.md) · [CRM → Finance Chain](./Finance-CRM-Revenue-Integration.md) · [HCM → Finance Chain](./HCM-Finance-Event-Chain.md)

---

## Purpose

Documents the **Procurement → Finance durable accounts payable event chain** — the third certified enterprise reference integration connecting Procurement canonical events to Finance journal posting and General Ledger mutation.

Finance consumes authoritative Procurement events through the Intelligent Integration Layer (IIL) and executes governed journal posting via the existing validation and posting pipeline established in P-009.19.

**Scope:** `procurement.invoice.approved` and `procurement.purchaseorder.approved` post journals. `procurement.goods.received` accepts ADR-014 envelopes but returns `NOT_IMPLEMENTED` until GRNI mapping ships.

**Risk closure:** **ENT-R-002** · **PROC-R-001**

---

## Architecture

```
ProcurementCanonicalEventPublisher (P-010.6 · P-010.11)
  → IIL Transport (ADR-013)
  → FinanceEventConsumer (procurement-chain subscription)
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
| `FinanceEventConsumer` | IIL subscription · Procurement envelope/version/org/idempotency validation |
| `FinanceProcurementSupportedEvents` | Canonical type registry · future vs postable classification |
| `FinanceEventDispatcher` | Route by canonical `eventType` |
| `FinanceEventMapper` | Map Procurement payload → journal draft + posting context |
| `FinanceInboundProcessor` | End-to-end orchestration inside posting UoW |
| `FinanceEventResult` | Structured processing outcome |

---

## Supported Events

| eventType | Finance Action | Journal Mapping | Status |
|-----------|----------------|---------------|--------|
| `procurement.invoice.approved` | AP liability journal | Dr 5100 (Expense) · Cr 2100 (Accounts Payable) | **Implemented** |
| `procurement.purchaseorder.approved` | PO commitment journal | Dr 5100 (Expense) · Cr 2100 (Accounts Payable) | **Implemented** |
| `procurement.goods.received` | GRNI accrual (future) | — | **NOT_IMPLEMENTED** |

**Invoice amount enrichment:** The Procurement canonical publisher emits minimal invoice metadata. Finance accepts optional `amount`, `totalAmount`, and `currencyCode` in the payload boundary for GL posting. Events without postable amounts are rejected with `AMOUNT_REQUIRED`.

**Contract version:** `eventVersion: 1` (ADR-014)

**Ignored:** All other `procurement.*` types → `UNSUPPORTED_EVENT`

---

## Posting Rules

### procurement.invoice.approved

| Line | Account | Direction |
|------|---------|-----------|
| Expense | `coa-5100` | Debit |
| Accounts Payable | `coa-2100` | Credit |

Required payload: `invoiceId`, `amount`, `currencyCode`

Optional metadata: `vendorId`, `purchaseOrderId`, `approvedBy`

### procurement.purchaseorder.approved

| Line | Account | Direction |
|------|---------|-----------|
| Expense / commitment | `coa-5100` | Debit |
| Accounts Payable | `coa-2100` | Credit |

Required payload: `purchaseOrderId`, `amount`

---

## Sequence Diagram

```
Procurement Service (approve invoice)
  → persist supplier invoice
  → publish procurement.invoice.approved
  → IIL (persist-before-ack)
  → FinanceEventConsumer.consumeProcurement()
  → FinanceInboundProcessor.process()
  → JournalPostingService.post()
  → GeneralLedgerPostingService
  → EventLineage completed
```

---

## Envelope Validation (ADR-014)

Required fields validated before dispatch:

| Field | Validation |
|-------|------------|
| `eventVersion` | Must equal `"1"` |
| `organizationId` | Required · must match ServiceContext |
| `correlationId` | Required |
| `idempotencyKey` | Required |
| `sourceDomain` | Must be `"procurement"` when present |
| `canonicalEventType` | Must resolve to supported Procurement type |

Invalid envelopes return `INVALID_ENVELOPE`.

---

## Idempotency

| Layer | Component | Behavior |
|-------|-----------|----------|
| 1 | `EventLineageRepository` | Pre-post duplicate by idempotency key → `status: "duplicate"` |
| 2 | `PostingValidationPipeline` | Idempotency stage |
| 3 | `JournalPostingService` | Completed duplicate short-circuit |

Deterministic keys align with Procurement publisher:

```
{organizationId}:procurement-workspace:procurement-invoice-{invoiceId}-approved-v1
{organizationId}:procurement-workspace:procurement-purchaseorder-{purchaseOrderId}-approved-v1
```

---

## Error Handling

| Condition | Result Code | Journal Created |
|-----------|-------------|-----------------|
| Unsupported `procurement.*` | `UNSUPPORTED_EVENT` | No |
| Invalid envelope | `INVALID_ENVELOPE` | No |
| Version mismatch | `VERSION_MISMATCH` | No |
| Organization mismatch | `ORGANIZATION_MISMATCH` | No |
| Contract validation failure | `AMOUNT_REQUIRED` · etc. | No |
| Duplicate event | `DUPLICATE_EVENT` | No (returns existing) |
| Goods receipt (future) | `NOT_IMPLEMENTED` | No |
| Posting failure | Pipeline error code | Rollback |

---

## Future Goods Receipt Support

`procurement.goods.received` is registered as a **future-ready** event type:

- Envelope validation passes through the procurement-chain consumer
- Contract validation returns `NOT_IMPLEMENTED`
- No journal draft or GL mutation occurs

Future GRNI mapping will debit inventory/expense and credit GRNI accrual without changing the consumer subscription pattern.

---

## Legacy Pipeline Guard

`register-finance-subscribers.ts` skips supported Procurement canonical types on the legacy business-event pipeline — preventing duplicate processing alongside the dedicated procurement-chain consumer (mirrors CRM guard).

---

## Test Coverage

`tests/lib/finance/FinanceProcurementApConsumer.test.ts`:

- Invoice approved happy path · GL AP credit
- Purchase order approved happy path
- Goods received NOT_IMPLEMENTED
- Duplicate idempotency
- Unsupported procurement events
- Version mismatch
- Organization isolation
- Contract validation rollback
- Invalid envelope
- IIL registration E2E
- PostgreSQL restart survival

---

## Enterprise Chain Status

| Chain | Status |
|-------|--------|
| HCM → Finance | ✅ Certified (P-009.9) |
| CRM → Finance | ✅ Certified (P-009.19) |
| **Procurement → Finance** | ✅ **Certified (P-010.19)** |

---

*Finance Procurement Accounts Payable Integration · P-010.19 · Third enterprise reference chain*
