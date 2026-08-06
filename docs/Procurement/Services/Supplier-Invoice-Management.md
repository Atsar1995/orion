# Supplier Invoice Management

**Document ID:** PROC-SVC-005  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.11 — Supplier Invoice Management Services  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement Services · Invoicing  
**Date:** 6 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [Goods-Receipt-Management.md](./Goods-Receipt-Management.md) · [Purchase-Order-Management.md](./Purchase-Order-Management.md)

---

## Purpose

Mission P-010.11 completes the procure-to-pay lifecycle within Procurement by implementing supplier invoice capture, three-way match preparation, approval workflow, RBAC, repository integration, and post-persistence canonical events.

**Scope:** Supplier invoice service layer only. No Finance consumer, Inventory changes, Warehouse changes, REST route activation, or PostgreSQL schema changes.

---

## Service Architecture

```
ProcurementFacade.invoices
  └── SupplierInvoiceService
        ↓
  ProcurementPersistenceRepository (receiving adapter)
        ↓
  PlatformStore backing (supplierInvoices)
        ↓
  ProcurementCanonicalEventPublisher
```

---

## Workflow

```
draft ──submit──▶ submitted ──match PO + GR──▶ matched ──approve──▶ approved ──(Finance)──▶ posted
   │                    │                          │
   └──cancel──▶ cancelled                    rejected ◀── reject
                    │
                    └──reject──▶ rejected
```

Invalid transitions are rejected. Three-way match preparation requires an approved purchase order, a received goods receipt, vendor consistency, currency alignment, and invoice line quantities within received quantities.

---

## Business Operations

### SupplierInvoiceService

| Operation | RBAC | Canonical Event |
|-----------|------|-----------------|
| `listSupplierInvoices()` | `procurement:invoice:read` | — |
| `getSupplierInvoice()` | `procurement:invoice:read` | — |
| `createSupplierInvoice()` | `procurement:invoice:write` | `procurement.invoice.received` |
| `updateSupplierInvoice()` | `procurement:invoice:write` | — (draft only) |
| `submitSupplierInvoice()` | `procurement:invoice:write` | — |
| `matchPurchaseOrder()` | `procurement:invoice:write` | — |
| `matchGoodsReceipt()` | `procurement:invoice:write` | — |
| `approveSupplierInvoice()` | `procurement:invoice:approve` | `procurement.invoice.approved` |
| `rejectSupplierInvoice()` | `procurement:invoice:reject` | — |
| `cancelSupplierInvoice()` | `procurement:invoice:write` | — |

---

## Validation Summary

| Rule | Error |
|------|-------|
| Invoice number required and unique per organization | `INVALID_INVOICE_NUMBER` · `DUPLICATE_INVOICE_NUMBER` |
| Duplicate vendor + invoice number (non-cancelled/rejected) | `DUPLICATE_VENDOR_INVOICE` |
| Vendor must exist | `VENDOR_NOT_FOUND` |
| Purchase order approved or closed | `PURCHASE_ORDER_NOT_APPROVED` |
| Vendor matches PO and GR | `INVOICE_VENDOR_MISMATCH` |
| Goods receipt received or closed | `GOODS_RECEIPT_NOT_RECEIVED` |
| GR linked to same PO | `GOODS_RECEIPT_PURCHASE_ORDER_MISMATCH` |
| Currency matches PO | `INVOICE_CURRENCY_MISMATCH` |
| Invoice line items on receipt | `INVOICE_ITEM_NOT_ON_RECEIPT` |
| Quantity within received amount | `INVOICE_QUANTITY_EXCEEDS_RECEIVED` |
| Three-way match complete before approve | `THREE_WAY_MATCH_INCOMPLETE` |

Validation failures throw before persistence. Canonical events never emit on validation failure.

---

## Canonical Events

| Event | Trigger | Idempotency |
|-------|---------|-------------|
| `procurement.invoice.received` | `createSupplierInvoice()` after successful persistence | Once per invoice |
| `procurement.invoice.approved` | `approveSupplierInvoice()` after successful persistence | Once per invoice |

Duplicate approvals return the existing approved record without emitting a second event.

---

## RBAC

| Permission | Code |
|------------|------|
| Read | `procurement:invoice:read` |
| Write | `procurement:invoice:write` |
| Approve | `procurement:invoice:approve` |
| Reject | `procurement:invoice:reject` |

Fail-closed authorization via `ProcurementAuthorizationService`. Organization isolation enforced on all reads and writes.

---

## Future Finance Integration

Mission **P-010.19** implements the Finance Accounts Payable canonical consumer for:

- `procurement.invoice.received` — GRNI / accrual posting
- `procurement.invoice.approved` — AP liability posting

Finance integration follows the certified HCM → Finance and CRM → Finance reference chain pattern (ADR-014 · IIL · inbound processor).

---

## Next Mission

**P-010.19** — Finance Procurement canonical consumer (planned).

**P-010.12 follow-on** — REST route activation for invoice endpoints (deferred from P-010.11 scope).

---

*Supplier Invoice Management · P-010.11 · Procure-to-pay completion within Procurement domain boundary*
