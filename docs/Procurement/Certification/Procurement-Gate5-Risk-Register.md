# Procurement Gate 5 — Risk Register

**Mission:** P-010.13 — Procurement Gate 5 Enterprise Certification  
**Document ID:** PROC-CERT-RISK-001  
**Assessment Date:** 5 August 2026  
**Branch Baseline:** `develop/v2.0` @ `e47e871`  
**Classification:** Internal — Procurement Domain Certification

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [Procurement-Reference-Domain-Strategy.md](../Procurement-Reference-Domain-Strategy.md)

---

## Risk Summary

| Severity | Open | Closed | Accepted | Mitigating |
|----------|-----:|-------:|---------:|-----------:|
| Critical | 0 | 0 | 0 | 0 |
| High | 3 | 0 | 0 | 0 |
| Medium | 6 | 0 | 1 | 0 |
| Low | 3 | 0 | 1 | 0 |

---

## High Risks

| ID | Risk | Impact | Likelihood | Owner | Priority | Mitigation | Mission | Target Release | Status |
|----|------|--------|------------|-------|----------|------------|---------|----------------|--------|
| **PROC-R-001** | Finance has no Procurement canonical event consumer | `procurement.goods.received` and invoice events never reach Finance AP posting; procure-to-pay chain incomplete | High | Finance Domain | P1 | Implement Finance Procurement consumer for ADR-014 canonical types | P-010.14+ | Gate 6 | **Open** |
| **PROC-R-002** | Supplier Invoice Management service not implemented | Invoice REST routes return 501; `procurement.invoice.*` events never emitted; three-way match absent | High | Procurement Domain | P1 | Implement `SupplierInvoiceService` and activate invoice routes | P-010.11+ | Gate 6 | **Open** |
| **PROC-R-003** | PostgreSQL restart survival not certified for Procurement | Production durability unproven; data loss risk on restart in non-durable config | High | Platform Eng | P1 | Add `ProcurementPersistenceRestart.test.ts`; verify Map-wrapper hydrate | P-010.14+ | Gate 6 | **Open** |

---

## Medium Risks

| ID | Risk | Impact | Likelihood | Owner | Priority | Mitigation | Mission | Target Release | Status |
|----|------|--------|------------|-------|----------|------------|---------|----------------|--------|
| **PROC-R-004** | RFQ/sourcing services absent | `procurement.rfq.sent` and `procurement.quotation.received` contracts defined but unreachable | Medium | Procurement Domain | P2 | Implement RFQ and quotation services + REST routes | P-010.15+ | Gate 6 | **Open** |
| **PROC-R-005** | `procurement.contract.created` not wired in `PurchaseContractService` | Publisher method exists; contract create emits no canonical event | Medium | Procurement Domain | P2 | Wire `publishContractCreated()` post-commit on `createContract()` | P-010.14+ | Gate 6 | **Open** |
| **PROC-R-006** | Invoice REST routes return 501 stub | API surface present but non-functional for invoice capture/approve | Medium | Procurement Domain | P2 | Activate routes when P-010.11 ships | P-010.11+ | Gate 6 | **Open** |
| **PROC-R-007** | EventContracts registry (`docs/11_Governance/EventContracts/`) absent | No central contract validation for cross-domain consumers | Medium | Platform Eng | P2 | Create registry per ADR-014 Gate 6 requirement | P-014.5 | Gate 6 | **Accepted (Gate 6)** |
| **PROC-R-008** | Inventory and Warehouse consumers absent | Goods receipt completion does not update stock or warehouse locations | Medium | Inventory Domain | P2 | Implement Inventory consumer for `procurement.goods.received` | P-010.16+ | Post-Gate 6 | **Open** |
| **PROC-R-009** | GA-001 excludes Procurement restart assertions | Regression undetected in operational certification | Medium | QA / Platform | P2 | Add Procurement Postgres restart-survival GA scenario | P-010.14+ | Gate 6 | **Open** |
| **PROC-R-010** | Engineering specification mission status partially outdated | Documentation drift; API routes marked planned despite P-010.12 completion | Medium | Procurement Domain | P3 | Update P-010.2 mission matrix and ownership table | P-010.14+ | Gate 6 | **Open** |

---

## Low Risks

| ID | Risk | Impact | Likelihood | Owner | Priority | Mitigation | Mission | Target Release | Status |
|----|------|--------|------------|-------|----------|------------|---------|----------------|--------|
| **PROC-R-011** | IIL transport production cutover pending | Cross-restart event loss in non-durable config | Low | Platform Eng | P3 | ADR-013 durable adapter implemented; env config for production | P-009.16 | Gate 6 | **Accepted** — ADR-013 Implemented |
| **PROC-R-012** | `ProcurementFacade.readyForCertification` remains `false` | Status flag not flipped post-certification | Low | Procurement Domain | P3 | Set `true` after high-risk closure verification | Post-Gate 6 | Post-Gate 6 | **Open** |
| **PROC-R-013** | Analytics and executive routes minimal | Only dashboard workspace view; no spend analytics | Low | Procurement Domain | P3 | Implement analytics services in Gate 6+ | P-010.17+ | Post-Gate 6 | **Open** |

---

## Accepted Wave 3 Waivers

| Waiver | Rationale | Expiry |
|--------|-----------|--------|
| EventContracts registry (PROC-R-007) | Gate 6 platform governance scope | Gate 6 |
| Invoice service deferral (PROC-R-002 partial) | REST auth wired; business logic deferred by Wave 3 scope | Gate 6 |
| Inventory/Warehouse consumers (PROC-R-008) | Explicitly out of Wave 3 scope per mission constraints | Gate 6+ |
| In-memory IIL for dev/staging (PROC-R-011) | Shared platform debt (TD-PLATFORM-003) | Gate 6 or executive waiver |

---

## Risk Trend

Procurement Gate 5 (P-010.3–P-010.12) delivered a **complete Wave 3 platform layer** with security posture matching CRM at P-008.13. Unlike CRM, **no post-certification persistence or consumer missions have closed high risks yet**. The three high risks (Finance consumer, invoice service, restart certification) are the primary production blockers.

Architecture risks (EventContracts registry) tracked at platform level in [P-016.7](../../00_Governance/P-016.7-Enterprise-Readiness-Update.md).

---

## Production Blockers Summary

| Blocker | Risk ID | Required for Unconditional GO |
|---------|---------|-------------------------------|
| Finance AP canonical consumer | PROC-R-001 | **Yes** |
| Supplier Invoice Management | PROC-R-002 | **Yes** |
| PostgreSQL restart certification | PROC-R-003 | **Yes** |
| EventContracts registry | PROC-R-007 | Gate 6 |
| Durable IIL production cutover | PROC-R-011 | Yes (or waiver) |
| GA-001 procurement restart test | PROC-R-009 | Recommended |
| Inventory/Warehouse consumers | PROC-R-008 | Recommended (not blocking dev/staging) |

**Closed blockers:** None at P-010.13 assessment time.

---

*Procurement Gate 5 Risk Register · P-010.13*
