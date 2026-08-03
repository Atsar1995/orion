# Finance Gate 5 — Closure Program

**Mission:** P-009.11 — Finance Gate 5 Closure Program  
**Document ID:** FIN-CLOSE-001  
**Program:** P-009 — ORION Enterprise Finance  
**Gate:** Gate 5 Exit — CONDITIONAL GO → Full GO  
**Assessment Date:** 3 August 2026  
**Branch Baseline:** `develop/v2.0` @ `a5b2f72`  
**Platform Version:** 0.2.0  
**Classification:** Internal — Finance Domain Program  
**Authority:** Finance Domain Lead · Chief Enterprise Architect

**Baseline:** [P-009.10 Certification Report](./Finance-Gate5-Certification-Report.md) · [Risk Register](./Finance-Gate5-Risk-Register.md) · [Scorecard](./Finance-Gate5-Scorecard.md) · [Operations Checklist](./Finance-Gate5-Operations-Checklist.md)

**Governance:** [ES-092](../../00_Governance/ES-092-Enterprise-Architecture-Lifecycle-Standard.md) · [ES-093](../../00_Governance/ES-093-Enterprise-Technical-Debt-Management-Standard.md) · [ES-094](../../00_Governance/ES-094-Enterprise-Architecture-Compliance-Standard.md) · [ES-095](../../00_Governance/ES-095-Enterprise-Architecture-Maturity-Assessment.md)

**Related:** [Closure Roadmap](./Finance-Gate5-Closure-Roadmap.md) · [Executive Summary](./Finance-Gate5-Executive-Summary.md)

---

## 1. Program Purpose

P-009.11 establishes the **official engineering roadmap** to convert Finance Gate 5 from **CONDITIONAL GO (68/100)** to **Full GO** for enterprise production authorization.

This mission is **planning only** — no code, architecture, ADR, repository, or persistence changes.

Every open **FIN-R** risk from P-009.10 is mapped to an engineering mission with owner, priority, dependencies, target milestone, acceptance criteria, and closure evidence.

---

## 2. Current Certification State

| Attribute | Value |
|-----------|-------|
| Wave A missions (P-009.5–P-009.9) | ✅ Complete |
| P-009.10 certification | ✅ Complete (`a5b2f72`) |
| Overall readiness | **68/100** |
| Verdict | **CONDITIONAL GO** |
| Production authorization | **Not granted** |

### 2.1 Conditions for Full GO (from P-009.10)

1. Persist GL collections to PostgreSQL (FIN-R-001)
2. Implement HCM canonical event publishers (FIN-R-003)
3. Finance permission catalog + fail-closed API auth (FIN-R-004)
4. Durable IIL transport or executive waiver (FIN-R-002)
5. Extend GA-001 with Finance restart-survival scenario (FIN-R-007)

---

## 3. Gate 5 Closure Dashboard

### 3.1 Program Status Summary

| Category | Count | Items |
|----------|------:|-------|
| **Completed** | 9 | Wave A missions P-009.5–P-009.9 · P-009.10 certification · journal/lineage Postgres · posting stack · validation pipeline · HCM consumer · FIN-R-011 mitigated |
| **In Progress** | 0 | — |
| **Blocked** | 2 | P-009.15 (HCM publishers) · P-009.16 (IIL durable — platform dependency) |
| **Deferred** | 4 | FIN-R-009 budget · FIN-R-010 outbound events · workflow approvals · trial balance/reporting |

### 3.2 Risk Closure Dashboard

| Status | Risks | Count |
|--------|-------|------:|
| ✅ **Closed / Mitigated** | FIN-R-011 | 1 |
| 🔄 **Mitigating** | FIN-R-006 (journal path closed; GL/CoA pending) | 1 |
| ⏳ **Planned — P0** | FIN-R-001, FIN-R-003, FIN-R-004, FIN-R-005 | 4 |
| ⏳ **Planned — P1** | FIN-R-002, FIN-R-007, FIN-R-013 | 3 |
| ⏳ **Planned — P2** | FIN-R-008, FIN-R-012 | 2 |
| 📋 **Accepted / Deferred** | FIN-R-009, FIN-R-010 | 2 |

### 3.3 Mission Tracker

| Mission | Risk(s) | Priority | Milestone | Status |
|---------|---------|----------|-----------|--------|
| P-009.12 | FIN-R-001, FIN-R-013, FIN-R-006 | P0 | Wave A Completion | ⏳ Planned |
| P-009.13 | FIN-R-005, FIN-R-006 | P0 | Wave A Completion | ⏳ Planned |
| P-009.14 | FIN-R-004 | P0 | Wave A Completion | ⏳ Planned |
| P-009.15 | FIN-R-003 | P0 | Wave A Completion | 🚫 Blocked (HCM) |
| P-009.16 | FIN-R-002 | P1 | Gate 6 | 🚫 Blocked (Platform) |
| P-009.17 | FIN-R-007 | P1 | Gate 6 | ⏳ Planned |
| P-009.18 | FIN-R-008 | P2 | Gate 6 | ⏳ Planned |
| P-009.19 | FIN-R-012 | P2 | Gate 6 | ⏳ Planned |
| P-009.20 | FIN-R-009 | P2 | Wave B | 📋 Deferred |
| P-009.21 | FIN-R-010 | P2 | Wave B | 📋 Deferred |
| P-009.22 | — | — | Gate 6 | ⏳ Re-certification (P-009.23) |

---

## 4. Risk-to-Mission Mapping

### 4.1 P0 — Wave A Completion (Production Blockers)

#### FIN-R-001 → P-009.12 — GL PostgreSQL Persistence

| Field | Value |
|-------|-------|
| **Owner** | Platform Engineering / Finance Domain |
| **Priority** | P0 |
| **Target Milestone** | Wave A Completion |
| **Dependencies** | P-009.7B `FinanceEntityPersister` pattern |
| **Certification Required** | Yes — restart-survival integration test |
| **Current State** | `ledgerEntries` / `ledgerBalances` held in in-memory Maps; journals survive Postgres restart, GL does not |
| **Target State** | GL collections persisted via `FinanceEntityPersister`; posting stack restart-safe end-to-end |
| **Required Work** | Extend persister schema · wire `GeneralLedgerRepository` Postgres path · org-scoped queries |
| **Acceptance Criteria** | Post journal → restart PlatformStore → GL entries and balances match pre-restart state |
| **Closure Evidence** | `GeneralLedgerRepository.test.ts` cross-restart case · updated persistence doc · FIN-R-001 → Closed |

#### FIN-R-005 → P-009.13 — Finance Master Data Persistence

| Field | Value |
|-------|-------|
| **Owner** | Finance Domain |
| **Priority** | P0 |
| **Target Milestone** | Wave A Completion |
| **Dependencies** | P-009.12 (shared persister pattern) |
| **Certification Required** | Yes |
| **Current State** | CoA, fiscal periods, idempotency keys in-memory seed only |
| **Target State** | All Wave A collections durable on PostgreSQL path |
| **Required Work** | Persist `chartOfAccounts`, `fiscalPeriods`, `idempotencyKeys` collections |
| **Acceptance Criteria** | Master data and dedup keys survive restart; org isolation maintained |
| **Closure Evidence** | Repository restart tests · TD-DOMAIN-PERSIST-001 partial closure · FIN-R-005 → Closed |

#### FIN-R-004 → P-009.14 — Finance API RBAC & Permission Catalog

| Field | Value |
|-------|-------|
| **Owner** | Platform Security / Finance Domain |
| **Priority** | P0 |
| **Target Milestone** | Wave A Completion |
| **Dependencies** | ES-FIN-002 §7 permission matrix |
| **Certification Required** | Yes — security test suite |
| **Current State** | Finance REST routes lack fail-closed RBAC; validation stage enforces roles at service layer only |
| **Target State** | `finance-permission-catalog.ts` · route middleware · deny-by-default on all Finance API endpoints |
| **Required Work** | Permission catalog · middleware integration · negative auth tests |
| **Acceptance Criteria** | Unauthenticated/unauthorized requests return 403; authorized roles pass; ES-094 compliance |
| **Closure Evidence** | Permission test file · security scorecard update · FIN-R-004 → Closed |

#### FIN-R-003 → P-009.15 — HCM Canonical Event Publishers

| Field | Value |
|-------|-------|
| **Owner** | HCM Domain (Finance consumer ready) |
| **Priority** | P0 |
| **Target Milestone** | Wave A Completion |
| **Dependencies** | P-009.9 Finance consumer · ADR-014 contract |
| **Certification Required** | Yes — end-to-end chain test |
| **Current State** | Finance consumer certified with synthetic events; HCM does not emit `hcm.workforce.cost.recorded` or `hcm.expense.approved` |
| **Target State** | HCM payroll/expense services publish canonical ADR-014 events to IIL |
| **Required Work** | HCM publisher implementation · envelope compliance · integration test with Finance consumer |
| **Acceptance Criteria** | Real HCM event → Finance journal posted → GL updated → lineage completed |
| **Closure Evidence** | Cross-domain E2E test · HCM-Finance chain doc update · FIN-R-003 → Closed |
| **Status** | 🚫 **Blocked** — requires HCM domain mission authorization |

---

### 4.2 P1 — Gate 6 Readiness

#### FIN-R-002 → P-009.16 — Durable IIL Transport

| Field | Value |
|-------|-------|
| **Owner** | Platform Engineering |
| **Priority** | P1 |
| **Target Milestone** | Gate 6 |
| **Dependencies** | ADR-013 · platform IIL adapter |
| **Certification Required** | Yes — or executive waiver with compensating controls |
| **Current State** | IIL in-process only (TD-PLATFORM-003); events lost on restart |
| **Target State** | Durable transport with at-least-once delivery; acknowledge after post-commit |
| **Required Work** | ADR-013 durable adapter · Finance consumer ack semantics · DLQ handling |
| **Acceptance Criteria** | Event survives process restart; duplicate delivery handled idempotently |
| **Closure Evidence** | IIL restart test · TD-PLATFORM-003 closure or waiver record · FIN-R-002 → Closed/Waived |
| **Status** | 🚫 **Blocked** — platform program dependency |

#### FIN-R-007 → P-009.17 — GA-001 Finance Restart Certification

| Field | Value |
|-------|-------|
| **Owner** | QA / Platform Engineering |
| **Priority** | P1 |
| **Target Milestone** | Gate 6 |
| **Dependencies** | P-009.12 (GL durable) |
| **Certification Required** | Yes — GA-001 extension |
| **Current State** | GA-001 has no Finance-specific restart assertions |
| **Target State** | GA-001 includes finance posting restart-survival scenario |
| **Required Work** | Add Finance scenario to `GA001OperationalCertification.test.ts` |
| **Acceptance Criteria** | GA-001 passes with Finance journal + GL + lineage restart assertions |
| **Closure Evidence** | GA-001 test case · ES-096 alignment · FIN-R-007 → Closed |

#### FIN-R-013 → P-009.12 (bundled) — GL Cross-Restart Test

| Field | Value |
|-------|-------|
| **Owner** | QA / Finance Domain |
| **Priority** | P1 |
| **Target Milestone** | Gate 6 |
| **Dependencies** | P-009.12 |
| **Certification Required** | Yes |
| **Current State** | Postgres GL restart test scoped to same session |
| **Target State** | True cross-restart GL persistence certification |
| **Required Work** | Bundled with P-009.12 implementation |
| **Acceptance Criteria** | Test destroys and recreates store connection; GL state restored |
| **Closure Evidence** | Integration test in finance suite · FIN-R-013 → Closed |

#### FIN-R-006 → P-009.12 + P-009.13 (rollup) — TD-DOMAIN-PERSIST-001 Closure

| Field | Value |
|-------|-------|
| **Owner** | Finance Domain |
| **Priority** | P1 |
| **Target Milestone** | Gate 6 |
| **Dependencies** | P-009.12 · P-009.13 |
| **Certification Required** | Yes |
| **Current State** | Journal/lineage durable ✅; GL/CoA/period/idempotency in-memory |
| **Target State** | All Finance Wave A collections production-authoritative on PostgreSQL |
| **Required Work** | Complete P-009.12 and P-009.13 |
| **Acceptance Criteria** | TD-DOMAIN-PERSIST-001 marked Closed for Finance Wave A scope |
| **Closure Evidence** | Technical debt register update · FIN-R-006 → Closed |

---

### 4.3 P2 — Gate 6 Hygiene / Wave B

#### FIN-R-008 → P-009.18 — Certification Test Alignment

| Field | Value |
|-------|-------|
| **Owner** | Finance Domain |
| **Priority** | P2 |
| **Target Milestone** | Gate 6 |
| **Dependencies** | None |
| **Certification Required** | No — engineering hygiene |
| **Current State** | P-009.5/6 cert tests have mission constant drift (S-001.2) |
| **Target State** | Cert test expectations aligned with current mission IDs |
| **Required Work** | Update mission constants and assertions in domain cert suites |
| **Acceptance Criteria** | All finance cert tests pass with correct mission metadata |
| **Closure Evidence** | Test file diffs · FIN-R-008 → Closed |

#### FIN-R-012 → P-009.19 — ADR-014 Envelope Completion

| Field | Value |
|-------|-------|
| **Owner** | Platform Engineering |
| **Priority** | P2 |
| **Target Milestone** | Gate 6 |
| **Dependencies** | ADR-014 |
| **Certification Required** | Yes — contract validation tests |
| **Current State** | `IntelligenceEvent` envelope missing `idempotencyKey`, `eventVersion` fields |
| **Target State** | Full ADR-014 envelope on platform event type |
| **Required Work** | Extend envelope schema · update Finance/HCM mappers |
| **Acceptance Criteria** | Contract validation passes without payload fallback |
| **Closure Evidence** | Envelope test suite · FIN-R-012 → Closed |

#### FIN-R-009 → P-009.20 — Budget Variance Service (Deferred)

| Field | Value |
|-------|-------|
| **Owner** | Finance Domain |
| **Priority** | P2 |
| **Target Milestone** | Wave B |
| **Dependencies** | Intelligence budget data feed |
| **Certification Required** | At Wave B gate |
| **Current State** | Validation stage 7 uses intelligence stub; soft-limit warnings not production-calibrated |
| **Target State** | `BudgetVarianceService` with real budget data |
| **Required Work** | Implement budget variance engine · wire validation stage |
| **Acceptance Criteria** | Budget warn/hard-stop reflects authoritative budget data |
| **Closure Evidence** | Service tests · validation pipeline doc · FIN-R-009 → Closed |
| **Status** | 📋 **Deferred** — accepted Wave A waiver |

#### FIN-R-010 → P-009.21 — Outbound `finance.journal.posted` (Deferred)

| Field | Value |
|-------|-------|
| **Owner** | Finance Domain |
| **Priority** | P2 |
| **Target Milestone** | Wave B |
| **Dependencies** | P-009.16 (durable IIL) |
| **Certification Required** | At Wave B gate |
| **Current State** | No outbound IIL event after successful post |
| **Target State** | Post-commit `finance.journal.posted` per ADR-014 |
| **Required Work** | Egress publisher in `JournalPostingService` post-commit hook |
| **Acceptance Criteria** | Downstream subscriber receives event after durable post |
| **Closure Evidence** | E2E egress test · FIN-R-010 → Closed |
| **Status** | 📋 **Deferred** — explicit Wave A out-of-scope |

#### FIN-R-011 → Closed (Mitigated)

| Field | Value |
|-------|-------|
| **Status** | ✅ **Mitigated** |
| **Evidence** | Stub services documented in ES-FIN-002; not exposed via API |
| **Action** | No mission required; maintain documentation discipline |

---

## 5. Milestone Grouping

### 5.1 Wave A Completion

**Objective:** Close all P0 production blockers. Re-score persistence, security, and cross-domain integration.

| Mission | Closes |
|---------|--------|
| P-009.12 | FIN-R-001, FIN-R-013 |
| P-009.13 | FIN-R-005 |
| P-009.14 | FIN-R-004 |
| P-009.15 | FIN-R-003 |

**Exit criteria:** All P0 missions complete · no open High risks · readiness score ≥ 80 · interim re-certification (P-009.22 partial).

### 5.2 Gate 6

**Objective:** Independent certification per ES-096 · operational readiness · GA-001 coverage.

| Mission | Closes |
|---------|--------|
| P-009.16 | FIN-R-002 (or waiver) |
| P-009.17 | FIN-R-007 |
| P-009.18 | FIN-R-008 |
| P-009.19 | FIN-R-012 |
| P-009.12 + P-009.13 | FIN-R-006 |
| P-009.23 | Full GO re-certification |

**Exit criteria:** All P0 + P1 closed or waived · GA-001 Finance scenario passes · readiness score ≥ 85 · **Full GO**.

### 5.3 Wave B

**Objective:** Extended Finance capabilities beyond Gate 5 Wave A scope.

| Mission | Closes |
|---------|--------|
| P-009.20 | FIN-R-009 |
| P-009.21 | FIN-R-010 |
| P-009.24+ | Trial balance · reporting · AR/AP (per ES-FIN-002 roadmap) |

---

## 6. Dependency Graph

```mermaid
flowchart TD
  subgraph p0 [P0 — Wave A Completion]
    M12[P-009.12 GL Persistence]
    M13[P-009.13 Master Data Persistence]
    M14[P-009.14 Finance RBAC]
    M15[P-009.15 HCM Publishers]
  end

  subgraph p1 [P1 — Gate 6]
    M16[P-009.16 Durable IIL]
    M17[P-009.17 GA-001 Finance]
    M18[P-009.18 Cert Test Align]
    M19[P-009.19 Envelope Complete]
    M23[P-009.23 Re-certification]
  end

  subgraph p2 [P2 — Wave B]
    M20[P-009.20 Budget Service]
    M21[P-009.21 Outbound Events]
  end

  M12 --> M13
  M12 --> M17
  M12 --> M23
  M13 --> M23
  M14 --> M23
  M15 --> M23
  M16 --> M21
  M16 --> M23
  M17 --> M23
  M18 --> M23
  M19 --> M23
  M15 -.->|blocked HCM| M23
  M16 -.->|blocked Platform| M23
```

---

## 7. Re-Certification Plan (P-009.23)

Upon closure of P0 missions, execute **Finance Gate 5 Re-Certification**:

| Step | Action | Standard |
|------|--------|----------|
| 1 | Re-run full finance test suite (128+ tests) | ES-096 |
| 2 | Execute operations checklist | FIN-CERT-OPS-001 |
| 3 | Update scorecard dimensions | ES-095 |
| 4 | Close or waive all FIN-R items | ES-093 |
| 5 | Issue Full GO determination | ES-092 Gate 5 exit |

**Target readiness for Full GO:** ≥ 85/100 with no open High risks.

---

## 8. Governance Alignment

| Standard | Application |
|----------|-------------|
| **ES-092** | Gate 5 exit lifecycle; P-009.23 re-certification at Validation stage |
| **ES-093** | TD-DOMAIN-PERSIST-001 · TD-PLATFORM-003 tracked to closure |
| **ES-094** | P-009.14 RBAC compliance; ADR alignment verification at Gate 6 |
| **ES-095** | Maturity uplift from Level 3 (Defined) → Level 4 (Measured) on persistence and security |

---

## 9. Sign-Off

| Role | Action | Date |
|------|--------|------|
| Finance Domain Lead | Approve closure program | Pending |
| Platform Engineering | Acknowledge P0/P1 dependencies | Pending |
| HCM Domain Lead | Acknowledge P-009.15 dependency | Pending |
| Chief Enterprise Architect | Authorize mission sequence | Pending |

---

*Finance Gate 5 Closure Program · P-009.11 · Planning only · No code changes*
