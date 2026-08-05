# ORION v2.0 — CRM → Finance Enterprise Milestone

**Document ID:** HIST-v2.0-CRM-FIN-001  
**Period:** August 2026  
**Branch:** `develop/v2.0`  
**Head Commit:** `3f259d9`  
**Platform Version:** 0.2.0  
**Classification:** Internal — Program History

**Baseline:** [P-016.7 Enterprise Readiness Update](../00_Governance/P-016.7-Enterprise-Readiness-Update.md) · [P-016.6 Architecture Baseline](../00_Governance/P-016.6-Architecture-Baseline.md) · [ORION-v2.0-Milestone-2026-08.md](./ORION-v2.0-Milestone-2026-08.md)

---

## 1. Milestone Summary

August 2026 completes ORION's **first true enterprise revenue lifecycle** between two independent business domains:

```
CRM (Publisher)
  ↓
Durable IIL (ADR-013)
  ↓
Finance (Consumer)
  ↓
General Ledger
```

This milestone closes the CRM Gate 5 high-risk trilogy (**CRM-R-001 · CRM-R-002 · CRM-R-003**) and establishes **two certified enterprise reference chains** (HCM → Finance and CRM → Finance).

**Program verdict:** **CONDITIONAL GO** for multi-domain integration · **NO-GO** for v2.0 GA (FIN-R-001 remains open).

---

## 2. CRM Program (P-008)

| Mission | Deliverable | Status |
|---------|-------------|--------|
| P-008.16 | CRM Gate 5 enterprise certification | ✅ CONDITIONAL GO (66/100) |
| P-008.17 | CRM PostgreSQL persistence activation | ✅ **CRM-R-001 CLOSED** |
| P-008.18 | Composition root convergence · TD-002 retirement | ✅ **CRM-R-002 CLOSED** |

**Key artifacts:**

- `lib/platform/persistence/crm/CrmEntityPersister.ts` — PostgreSQL Map-wrapper persistence
- `lib/crm/createCrmWiring.ts` — authoritative composition root
- `tests/lib/crm/CrmPersistenceRestart.test.ts` — restart survival (8 tests)
- `tests/lib/crm/CrmCompositionRoot.test.ts` — wiring convergence (7 tests)
- [CRM-Postgres-Persistence.md](../CRM/Persistence/CRM-Postgres-Persistence.md)
- [CRM-Composition-Root.md](../CRM/Architecture/CRM-Composition-Root.md)

**Commit:** `b4853d7` — P-008.17 + P-008.18 bundle

---

## 3. Finance Program (P-009.19)

| Mission | Deliverable | Status |
|---------|-------------|--------|
| P-009.19 | Finance consumption of CRM canonical revenue events | ✅ **CRM-R-003 CLOSED** |

**Supported inbound events:**

| Event | Finance Action |
|-------|----------------|
| `crm.revenue.recognized` | Revenue journal → posting → GL (Dr 1120 · Cr 4200) |
| `crm.salesorder.confirmed` | Operational order journal → posting → GL |
| Other `crm.*` | Graceful `UNSUPPORTED_EVENT` |

**Key artifacts:**

- `lib/finance/integration/FinanceEventConsumer.ts` — CRM chain subscription
- `lib/finance/integration/FinanceEventMapper.ts` — CRM journal mapping
- `lib/finance/integration/FinanceSupportedEvents.ts` — canonical type registry
- `tests/lib/finance/FinanceCrmRevenueConsumer.test.ts` — 10 certification tests
- [Finance-CRM-Revenue-Integration.md](../Finance/Integration/Finance-CRM-Revenue-Integration.md)

**Commit:** `3f259d9`

---

## 4. Enterprise Reference Chains

| Chain | Producer Mission | Consumer Mission | Certification |
|-------|------------------|------------------|---------------|
| **HCM → Finance** | P-009.15 | P-009.9 | ✅ GA-001 Finance path |
| **CRM → Finance** | P-008.14 · P-008.15 | P-009.19 | ✅ Integration tests + restart replay |

Both chains share:

- ADR-013 durable IIL transport
- ADR-014 envelope validation (`eventVersion`, `idempotencyKey`, `correlationId`)
- ADR-015 domain boundary enforcement (Finance ACL · no cross-domain repo access)
- Three-layer idempotency (EventLineage · PostingValidation · JournalPosting)
- Organization isolation (fail-closed on tenant mismatch)

---

## 5. Validation Evidence

| Suite | Result | Date |
|-------|--------|------|
| Finance (full) | **163/163** | 5 Aug 2026 |
| CRM (full) | **215+** | 5 Aug 2026 |
| Platform IIL | **13/13** | 5 Aug 2026 |
| Typecheck · Lint · Build | ✅ Pass | 5 Aug 2026 |

---

## 6. Risks Closed

| ID | Description | Mission |
|----|-------------|---------|
| CRM-R-001 | CRM PostgreSQL persistence inactive | P-008.17 |
| CRM-R-002 | TD-002 singleton repository bypass | P-008.18 |
| CRM-R-003 | Finance CRM canonical consumer absent | P-009.19 |
| CRM-R-006 | API singletons bypass composition root | P-008.18 |

---

## 7. Remaining Blockers (Post-Milestone)

| ID | Blocker | Impact |
|----|---------|--------|
| FIN-R-001 | GL PostgreSQL persistence | Posted journals survive; ledger entries may not |
| CRM-R-009 | CRM facade unification | Architectural complexity; Gate 6 target |
| CRM-R-010 | GA-001 CRM restart scenario | Operational cert gap |
| B9 | ADR-014 schema registry | Governance registry not populated |
| OPS-001 | Live staging PostgreSQL GA-001 | Production ops evidence |

---

## 8. Governance Synchronization

This milestone is formally recorded in:

- [P-016.7-Enterprise-Readiness-Update.md](../00_Governance/P-016.7-Enterprise-Readiness-Update.md)
- Updated [P-016.6-Architecture-Baseline.md](../00_Governance/P-016.6-Architecture-Baseline.md)
- Updated P-014 enterprise planning suite
- Updated CRM and Finance Gate 5 certification documents

---

## 9. Significance

Before this milestone, ORION had **one** certified cross-domain chain (HCM → Finance) with CRM publishing revenue events that Finance could not consume. After P-009.19:

1. CRM publishes authoritative revenue events (P-008.14/15)
2. CRM data survives PostgreSQL restart (P-008.17)
3. CRM services route through a single composition root (P-008.18)
4. Finance consumes, validates, posts, and updates the ledger (P-009.19)

This is the architectural proof point for ORION's **Executive Operating System** thesis: independent domains, shared platform services, governed event contracts, and Finance as the monetary hub.

---

*ORION v2.0 CRM → Finance Milestone · August 2026 · First enterprise revenue lifecycle*
