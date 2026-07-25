# ORION Technical Debt Register

Version 1.0

---

Master register of all conscious technical debt across the ORION Platform. Every temporary shortcut, deferred implementation, or known workaround must be recorded here — **no hidden debt**.

Governance is defined in [ADR-004 – Technical Debt Governance](../10_Decisions/ADR-004-Technical-Debt-Governance.md).

**Framework:** [ES-053 — ORION Risk Management & Technical Debt Framework](../02_Engineering/ES-053-ORION-Risk-Management-Technical-Debt-Framework.md) (Approved · risk categories · debt policy · review cadence)

**Quality:** [ES-054 — ORION Quality Assurance & Engineering Excellence Framework](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) (Approved · testing strategy · CI/CD targets)

**Data Governance:** [ES-056 — ORION Data Governance & Information Architecture](../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) (Approved · domains · MDM · lifecycle)

**AI Governance:** [ES-057 — ORION AI Governance & Responsible Intelligence Framework](../02_Engineering/ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) (Approved · responsible AI · human oversight)

**Operations & Service Management:** [ES-058 — ORION Enterprise Operations & Service Management Framework](../02_Engineering/ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md) (Approved · ITSM · service catalogue)

**Platform Security & Zero Trust:** [ES-059 — ORION Platform Security & Zero Trust Architecture](../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) (Approved · Zero Trust · identity)

**Platform Extensibility & Marketplace:** [ES-060 — ORION Platform Extensibility, Plugin & Marketplace Architecture](../02_Engineering/ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md) (Approved · plugins · SDK · marketplace)

**v0.4 Master Development Plan:** [ES-061 — ORION v0.4 Master Development Plan](../02_Engineering/ES-061-ORION-v0.4-Master-Development-Plan.md) (Approved · master plan · TD remediation tracked in deliverables checklist)

Release Records reference items introduced or resolved in each release. Inline code markers use the register ID:

```ts
// TD-003: Mock finance API until Mission 15 persistence layer ships
```

---

## Entry Format

| Field | Description |
|-------|-------------|
| **ID** | Stable reference (e.g. `TD-001`) |
| **Description** | What was deferred and why |
| **Priority** | P0 (blocking) · P1 (high) · P2 (medium) · P3 (low) |
| **Target Release** | Version or mission when resolution is planned |
| **Owner** | Person accountable for resolution |
| **Status** | Open · In Progress · Resolved · Won't Fix |
| **Location** | File path(s) and line reference |
| **Introduced** | Release Record where debt was introduced |
| **Resolved** | Release Record where debt was closed (if applicable) |

---

## Active Debt

| ID | Description | Priority | Target Release | Owner | Status | Location | Introduced |
|----|-------------|----------|----------------|-------|--------|----------|------------|
| TD-001 | Placeholder finance data — no accounting API or persistence integration | P2 | v2.x Connected Business Platform | ORION CTO | Open | `lib/finance-data.ts`, `lib/finance-insights.ts`, `lib/finance-receivables-payables.ts` | RR-009 |
| TD-002 | Placeholder CRM data — no customer intelligence service integration | P2 | v2.x Connected Business Platform | ORION CTO | Open | `lib/crm-data.ts`, `lib/crm-business-data.ts`, `lib/crm-insights.ts`, `lib/crm-relationships-opportunities.ts`, `lib/intelligence/` | RR-012 |

---

## Resolved Debt

| ID | Description | Resolved In |
|----|-------------|-------------|
| — | — | — |

---

## Changelog

| Date | Change |
|------|--------|
| 23 July 2026 | Register created |
