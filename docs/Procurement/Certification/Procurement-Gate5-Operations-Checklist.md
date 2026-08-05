# Procurement Gate 5 — Operations Checklist

**Mission:** P-010.13 — Procurement Gate 5 Enterprise Certification  
**Document ID:** PROC-CERT-OPS-001  
**Assessment Date:** 5 August 2026  
**Classification:** Internal — Procurement Operations Readiness

---

## Pre-Deployment Checklist

### Platform Foundation

- [ ] `PlatformStore` initialized with Procurement backing seeded (`createProcurementStore`)
- [ ] PostgreSQL migration applied (`procurement_entities` table via bootstrap migration)
- [ ] `ProcurementEntityPersister` connected when `StoreProvider.PostgreSQL`
- [ ] Procurement health endpoint returns healthy on `/api/health` (`procurement_platform` aggregate)
- [ ] `createProcurementWiring()` invoked at application bootstrap
- [ ] **Manual:** Confirm PostgreSQL persistence hydrates on initialize (PROC-R-003)

### Procurement Business Operations

- [ ] Actor has authorized Procurement role via session
- [ ] Organization ID in `ServiceContext` matches entity org
- [ ] Supplier create/qualify uses `SupplierService` with post-commit canonical publish
- [ ] Requisition submit/approve uses `PurchaseRequisitionService` with post-commit publish
- [ ] Purchase order submit/approve uses `PurchaseOrderService` with post-commit publish
- [ ] Goods receipt complete uses `GoodsReceiptService.completeReceipt()` → `procurement.goods.received`
- [ ] Contract create/update uses `PurchaseContractService` *(contract.created not yet wired — PROC-R-005)*

### REST Authorization

- [ ] All 38 Procurement API routes call `getProcurementApiContextForRequest()` at route entry
- [ ] Unauthorized requests return 401/403 via `errorResponse` (fail-closed)
- [ ] Permission codes match route operation (read vs write vs approve)
- [ ] Unknown mutating routes denied via `procurement:unknown:write`

### Cross-Domain (Procurement → Finance / Inventory)

- [ ] Canonical events use Version 1 contract types (`procurementOutboundEvents.ts`)
- [ ] `eventVersion: "1"` in payload
- [ ] `sourceService: procurement-workspace` and `sourceDomain: procurement`
- [ ] Idempotency key follows deterministic pattern per event type
- [ ] IIL publisher registered via `getIntelligenceIntegrationService()`
- [ ] **Not ready:** Finance consumer for Procurement canonical types (PROC-R-001)
- [ ] **Not ready:** Inventory consumer for `procurement.goods.received` (PROC-R-008)
- [ ] **Manual:** Verify Finance receives `procurement.goods.received` after receipt complete in staging *(blocked until consumer ships)*

### Canonical Event Verification

| Event | Trigger | Verify |
|-------|---------|--------|
| `procurement.vendor.created` | `SupplierService.createSupplier()` | `SupplierWorkflowEventEmission.test.ts` |
| `procurement.vendor.updated` | Qualify/activate/deactivate | Same |
| `procurement.requisition.created` | `PurchaseRequisitionService.createRequisition()` | `PurchaseRequisitionWorkflow.test.ts` |
| `procurement.requisition.approved` | `approveRequisition()` | Same |
| `procurement.purchaseorder.created` | `PurchaseOrderService.createPurchaseOrder()` | `PurchaseOrderWorkflow.test.ts` |
| `procurement.purchaseorder.approved` | `approvePurchaseOrder()` | Same |
| `procurement.goods.received` | `GoodsReceiptService.completeReceipt()` | `GoodsReceiptWorkflow.test.ts` |
| `procurement.contract.created` | Contract create | ❌ Not wired (PROC-R-005) |
| `procurement.invoice.received` | Invoice capture | ❌ Service not shipped (PROC-R-002) |
| `procurement.invoice.approved` | Invoice approve | ❌ Service not shipped (PROC-R-002) |
| `procurement.rfq.sent` | RFQ send | ❌ Service not shipped (PROC-R-004) |
| `procurement.quotation.received` | Quotation receive | ❌ Service not shipped (PROC-R-004) |

### Restart & Recovery

- [ ] **Manual:** Confirm Procurement data after restart *(not certified — PROC-R-003)*
- [ ] **Manual:** Confirm IIL queue state after restart (in-memory — see PROC-R-011)
- [ ] **Manual:** Confirm canonical event idempotency after restart (publisher keys deterministic; IIL state ephemeral)

### Security

- [ ] Organization ID in `ServiceContext` matches entity org on all mutations
- [ ] No cross-tenant Procurement entity access
- [ ] RBAC fail-closed on all 38 REST routes ✅
- [ ] Permission catalog loaded (`procurement-permission-catalog.ts`)

### Monitoring

- [ ] `procurement_platform` health signal visible in platform aggregate
- [ ] `procurementEventPipelineRegistry.canonicalPublisherReady === true`
- [ ] Executive dashboard route returns workspace view (`/api/procurement/executive/dashboard`)

---

## Validation Commands

```bash
npm run typecheck
npm run lint
npm test -- tests/lib/procurement
npm run build
```

**Expected (5 Aug 2026 baseline):**

| Suite | Files | Tests | Result |
|-------|------:|------:|--------|
| Procurement only | 13 | 129 | All pass |
| Typecheck | — | — | 0 errors |
| Build | — | — | Success |

---

## Monitoring Signals (Wave 3)

| Signal | Source | Action Threshold |
|--------|--------|------------------|
| Procurement auth failure | `getProcurementApiContextForRequest()` 401/403 | Alert on sustained unauthorized access attempts |
| Canonical publish failure | `ProcurementCanonicalEventPublisher` errors | Investigate IIL connectivity |
| Pipeline registry status | `procurementEventPipelineRegistry` | Alert if `canonicalPublisherReady` becomes false |
| Invoice route 501 rate | `/api/procurement/invoices` | Expected until P-010.11; monitor for unexpected traffic |
| IIL dead letters | Intelligence DLQ | Review contract/version mismatches on Procurement events |
| Goods receipt without consumer | `procurement.goods.received` published | Monitor until Finance/Inventory consumers live |

---

## Incident Response

| Scenario | Expected Behaviour | Verify |
|----------|-------------------|--------|
| Unauthorized REST access | 401/403 fail-closed; no mutation | `ProcurementApiAuthorization.test.ts` |
| Org mismatch on mutation | Reject; no entity change | `ProcurementAuthorization.test.ts` |
| Canonical publish after commit failure | No event emitted | Service layer guards |
| Duplicate idempotency key | IIL deduplication; no double processing | `ProcurementCanonicalPublisher.test.ts` |
| Quantity exceeds ordered on receive | `QUANTITY_EXCEEDS_ORDERED`; no persist | `GoodsReceiptService.test.ts` |
| Goods receipt complete without Finance consumer | Event published; Finance ignores | PROC-R-001 — no AP posting |
| Invoice API call | 501 `SUPPLIER_INVOICE_SERVICE_NOT_IMPLEMENTED` | PROC-R-006 |

---

## Backup & Recovery

| Asset | Current State | Production Requirement |
|-------|---------------|----------------------|
| Procurement entity data | In-memory Maps (default) | Postgres `procurement_entities` (PROC-R-003) |
| Idempotency keys | In-memory | Postgres durable (PROC-R-003) |
| IIL event queue | In-process | Durable transport (PROC-R-011) |
| Permission catalog | Code-defined | No backup required (static) |

**Recovery procedure (current):** Restart restores empty Procurement backing unless re-seeded. **Not production-viable without PROC-R-003 closure.**

---

## Rollback

| Change Type | Rollback Action |
|-------------|-----------------|
| Procurement mission deployment | Revert to prior `develop/v2.0` commit |
| Canonical event emission | Feature flag not available — revert service mission commit |
| RBAC enforcement | Reverting P-010.12 removes fail-closed REST auth — **do not rollback in production** |
| Postgres activation (future) | Migration rollback + in-memory fallback |

---

## Known Limitations (Wave 3)

1. **No restart survival certification** — default in-memory backing (PROC-R-003)
2. **No Finance AP consumer** — goods received and invoice events published but not consumed (PROC-R-001)
3. **Supplier invoice service absent** — invoice routes return 501 (PROC-R-002 · PROC-R-006)
4. **No Inventory/Warehouse consumers** — goods receipt isolated from stock (PROC-R-008)
5. **RFQ/sourcing not implemented** — 2 of 12 canonical contracts unreachable (PROC-R-004)
6. **Contract created event not wired** — publisher method unused (PROC-R-005)
7. **IIL in-process** — events lost on restart (PROC-R-011)
8. **`readyForCertification: false`** — facade status flag intentionally unset (PROC-R-012)

---

## Production Blockers (Do Not Deploy Without)

1. Finance Procurement canonical event consumer (PROC-R-001)
2. Supplier Invoice Management service (PROC-R-002)
3. PostgreSQL restart certification (PROC-R-003)
4. Durable IIL transport or explicit executive waiver (PROC-R-011)

---

## Outstanding Operational Tasks

| Task | Owner | Priority | Mission |
|------|-------|----------|---------|
| Operational staging deployment | Platform Ops | P1 | Pre-Gate 6 |
| Finance AP consumer integration test | Finance + Procurement | P1 | P-010.14+ |
| PostgreSQL restart GA scenario | QA | P2 | PROC-R-009 |
| Update engineering spec mission matrix | Procurement | P3 | PROC-R-010 |
| Wire contract.created emission | Procurement | P2 | PROC-R-005 |
| Activate invoice REST routes | Procurement | P1 | P-010.11+ |
| EventContracts registry | Platform | P2 | P-014.5 |

---

## Certification Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Procurement Domain Lead | — | — | Pending |
| Platform Engineering | — | — | Pending |
| Chief Enterprise Architect | — | — | Pending |

---

*Procurement Gate 5 Operations Checklist · P-010.13 · Assessment only*
