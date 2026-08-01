# ORION Architecture Decision Records

This directory contains the ORION Decision Log and individual decision records. Architecture Decision Records (ADRs) are maintained under [`docs/11_Governance/ADR/`](../11_Governance/ADR/).

**Framework:** [ES-052 — Architecture Decision Record Framework](../02_Engineering/ES-052-Architecture-Decision-Record-Framework.md) (Approved · lifecycle · extended template)

---

## Decision Log

Significant architectural, engineering, product, and business decisions:

- [ORION Decision Log](./ORION_Decision_Log.md) — governance, template, and index
- [Decision entries](./decisions/README.md) — `DL-YYYY-NNN` records

Record an ADR when a decision affects architecture, folder structure, the Design System, Engineering Standards, navigation, or data flow.

Record a Decision Log entry (DL) for any significant decision not fully captured by an ADR, or when broader context and options analysis should be preserved.

---

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](../11_Governance/ADR/ADR-001-Executive-Shell.md) | Executive Shell | Accepted | 2026-07-22 |
| [ADR-002](../11_Governance/ADR/ADR-002-Advisor-Default-Landing.md) | Advisor Default Landing | Accepted | 2026-07-23 |
| [ADR-003](../11_Governance/ADR/ADR-003-Global-Command-Palette.md) | Global Command Palette | Accepted | 2026-07-23 |
| [ADR-004](../11_Governance/ADR/ADR-004-Technical-Debt-Governance.md) | Technical Debt Governance | Accepted | 2026-07-23 |
| [ADR-005](../11_Governance/ADR/ADR-005-Business-Workspace-Architecture.md) | Business Workspace Architecture | Accepted | 2026-07-23 |
| [ADR-006](../11_Governance/ADR/ADR-006-Executive-Intelligence-Provider-Framework.md) | Executive Intelligence Provider Framework | Accepted | 2026-07-24 |

**Related DL:** [DL-2026-001](./decisions/DL-2026-001-Executive-Brief-Default-Landing.md) (Executive Brief default landing)

---

## ADR Format

```markdown
# ADR-XXX – Title

## Status
Proposed | Accepted | Deprecated | Superseded

## Date
YYYY-MM-DD

## Context
Why the decision is needed.

## Decision
What was decided.

## Consequences
### Positive
### Negative
```

---

## Governance

- ADRs require CTO review before status is set to **Accepted**
- Decision Log entries require Founder and Chief Architect approval
- Superseded records remain in this directory; link to the replacing ADR or DL
- Cross-reference ADRs and DL entries from Engineering Specs, Release Records, and Platform Architecture where applicable
