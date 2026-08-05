# Goods Receipt Management

**Document ID:** PROC-SVC-004  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.10 — Goods Receipt Management Services  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement Services · Receiving  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [Purchase-Order-Management.md](./Purchase-Order-Management.md) · CRM P-008.15

---

## Purpose

Mission P-010.10 extends Procurement from purchasing into receiving. Implements goods receipt lifecycle, receiving lines, partial receipts, receipt completion, RBAC, repository integration, and post-persistence canonical events.

**Scope:** Goods receipt and receiving lines only. No REST migration, inventory consumers, warehouse consumers, finance integration, supplier invoices, or downstream stock updates.

---

## Service Architecture

```
ProcurementFacade.receiving
  ├── goodsReceipt: GoodsReceiptService
  └── lines: ReceivingLineService
        ↓
  ProcurementPersistenceRepository (receiving adapter)
        ↓
  PlatformStore backing (goodsReceipts · receivingLines)
        ↓
  ProcurementCanonicalEventPublisher
```

---

## Workflow

```
draft ──start──▶ receiving ──receive──▶ partially_received ──complete──▶ received ──close──▶ closed
                    │                         │
                    └──cancel──▶ cancelled ◀──┘
```

Invalid transitions are rejected. Received quantities must not exceed ordered quantities on receiving lines.

---

## Business Operations

### GoodsReceiptService

| Operation | RBAC | Canonical Event |
|-----------|------|-----------------|
| `listGoodsReceipts()` | `procurement:goodsreceipt:read` | — |
| `getGoodsReceipt()` | `procurement:goodsreceipt:read` | — |
| `createGoodsReceipt()` | `procurement:goodsreceipt:write` | — |
| `updateGoodsReceipt()` | `procurement:goodsreceipt:write` | — (draft only) |
| `startReceiving()` | `procurement:goodsreceipt:write` | — |
| `receiveItems()` | `procurement:goodsreceipt:write` | — |
| `partialReceipt()` | `procurement:goodsreceipt:write` | — |
| `completeReceipt()` | `procurement:goodsreceipt:write` | `procurement.goods.received` |
| `cancelReceipt()` | `procurement:goodsreceipt:write` | — |
| `closeReceipt()` | `procurement:goodsreceipt:write` | — |

### ReceivingLineService

| Operation | RBAC |
|-----------|------|
| `listLines()` | `procurement:goodsreceipt:read` |
| `createLine()` | `procurement:goodsreceipt:write` (draft receipt only) |
| `updateLine()` | `procurement:goodsreceipt:write` (draft receipt only) |

---

## Linkage Rules

| Link | Validation |
|------|------------|
| Purchase order | Must exist and be `approved` or `closed` |
| Vendor | Inherited from linked purchase order |
| Receiving lines | Scoped to goods receipt; ordered quantity editable in `draft` only |

---

## Canonical Events

| Event | Trigger | Idempotency |
|-------|---------|-------------|
| `procurement.goods.received` | `completeReceipt()` after successful persistence | Once per goods receipt |

Partial receives and cancellations do not emit canonical events.

---

## Validation Summary

- Repository persistence via `ProcurementPersistenceRepository`
- Workflow transition guards in `goodsReceiptWorkflow.ts`
- Quantity validation in `goodsReceiptQuantity.ts`
- RBAC via `ProcurementAuthorizationService`
- Organization isolation on all reads and writes
- Canonical event emission only after successful completion persistence
- Idempotent `completeReceipt()` when status is already `received`

---

## Next Mission

**P-010.11** — Supplier Invoice Management Services (planned).
