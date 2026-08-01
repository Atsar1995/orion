# ORION Engineering Standards

> **Supreme authority:** [ORION Canon v1.0](../00_FOUNDATION/ORION_CANON_v1.md) (Ratified · Frozen · Effective 29 July 2026) — Chapter 6 Engineering Constitution governs verification gates and engineering review.

> **Canonical specification:** [ES-043 — Engineering Governance & Delivery Standards](../02_Engineering/ES-043-Engineering-Governance-Delivery-Standards.md) (Approved · extends this document for Construction Phase delivery governance)

> **Quality assurance:** [ES-054 — ORION Quality Assurance & Engineering Excellence Framework](../02_Engineering/ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) (Approved · testing strategy · CI/CD targets)

> **DevSecOps & CD:** [ES-055 — ORION DevSecOps & Continuous Delivery Architecture](../02_Engineering/ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) (Approved · pipeline architecture)

> **Data governance:** [ES-056 — ORION Data Governance & Information Architecture](../02_Engineering/ES-056-ORION-Data-Governance-Information-Architecture.md) (Approved · domains · MDM · lifecycle)

> **AI governance:** [ES-057 — ORION AI Governance & Responsible Intelligence Framework](../02_Engineering/ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) (Approved · responsible AI · human oversight)

> **Operations & service management:** [ES-058 — ORION Enterprise Operations & Service Management Framework](../02_Engineering/ES-058-ORION-Enterprise-Operations-Service-Management-Framework.md) (Approved · ITSM · service catalogue)

> **Platform security & Zero Trust:** [ES-059 — ORION Platform Security & Zero Trust Architecture](../02_Engineering/ES-059-ORION-Platform-Security-Zero-Trust-Architecture.md) (Approved · Zero Trust · identity)

> **Platform extensibility & marketplace:** [ES-060 — ORION Platform Extensibility, Plugin & Marketplace Architecture](../02_Engineering/ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md) (Approved · plugins · SDK · marketplace)

> **v0.4 master development plan:** [ES-061 — ORION v0.4 Master Development Plan](../02_Engineering/ES-061-ORION-v0.4-Master-Development-Plan.md) (Approved · master plan · v0.4 programme)

> **Executive Intelligence Architecture:** [ES-065 — Executive Intelligence Architecture](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md) (Approved · pipeline · engines · AI integration)

Version 1.4

> **Philosophy:** [ORION Engineering Manifesto v1.0](./ORION_Engineering_Manifesto.md) (Foundational · Engineering Blueprint)

---

## Governance

The ORION Canon v1.0 is the supreme governing document of the platform.

In the event of conflict between any engineering, product, design, AI, architecture, or workspace documentation, the ORION Canon shall prevail.

Reference: [ORION Canon v1.0](../00_FOUNDATION/ORION_CANON_v1.md) · [Compliance Matrix](../00_FOUNDATION/CANON_COMPLIANCE_MATRIX.md)

---
>
> This document defines operational engineering rules. The Manifesto defines the engineering philosophy behind them.

---

Every implementation must follow these principles.

## Reusable Components

Components should be reusable whenever practical.

## Clean Architecture

Separate UI, business logic and services.

## No Duplicate Code

Never duplicate functionality.

## Type Safety

Use TypeScript types wherever possible.

## Naming

Follow [OS-001 — Naming Standards](./OS-001-Naming-Standards.md) for files, variables, functions, types, constants, components, and documentation.

## Work Item Lifecycle

Every feature, bug, enhancement, and architectural change follows [OS-002 — Work Item Lifecycle](./OS-002-Work-Item-Lifecycle.md).

No implementation before approval. No release without verification. No closure without documentation.

## Documentation

Every sprint must have an Engineering Specification.

## Git

Every completed sprint must end with a Git commit.

## Verification Hierarchy

Every release must pass the following gates **in order**. A failure at any gate blocks all subsequent gates. **CTO Approval** is issued only after every gate passes.

| # | Gate | Method | Pass Criteria |
|---|------|--------|---------------|
| 1 | **Build** | `npm run build` | Zero errors; no unexpected bundle warnings |
| 2 | **Lint** | `npm run lint` | Zero errors; warnings resolved or registered in the Technical Debt Register |
| 3 | **Type Safety** | TypeScript (via build / `tsc --noEmit`) | No type errors; no unjustified `any` |
| 4 | **Accessibility** | Manual review | Keyboard navigable; focus visible; ARIA labels; modals dismiss with Escape |
| 5 | **Responsive** | Manual at 375px, 768px, 1280px | No overflow, clipping, or broken layout |
| 6 | **Regression** | Smoke test existing routes | Shell, navigation, auth, and prior features intact |
| 7 | **Manual Verification** | QA against ES acceptance criteria | Every acceptance criterion confirmed |
| 8 | **Release Documentation** | Release Record, CHANGELOG, debt register | Complete, accurate, and committed |

### Workflow

```
Implementation complete
        ↓
  1–3  Automated (Build → Lint → Type Safety)
        ↓
  4–6  Quality (Accessibility → Responsive → Regression)
        ↓
  7    Manual Verification
        ↓
  8    Release Documentation
        ↓
  CTO Approval → Release
```

Results are recorded in the Release Record **Engineering Verification** section.

## CTO Approval

Every release requires formal CTO sign-off after the Verification Hierarchy passes. Record the decision in the Release Record **CTO Approval** section.

| Field | Value |
|-------|-------|
| **Decision** | APPROVED / REJECTED |
| **Reviewer** | Name and role of the approving reviewer |
| **Date** | Date of the decision |
| **Comments** | Engineering assessment, conditions, or rejection rationale |

A **REJECTED** release must not ship. Document required remediation in **Comments** and re-run the Verification Hierarchy before resubmitting.

## Technical Debt

Whenever temporary code or a deliberate shortcut is introduced, record it before merge. **No hidden debt** — no `TODO`, `FIXME`, or `HACK` without a register ID.

Maintain the master list in [Technical_Debt_Register.md](./Technical_Debt_Register.md). Record items **introduced or resolved** in each Release Record **Technical Debt** section.

Governance is defined in [ADR-004 – Technical Debt Governance](../10_Decisions/ADR-004-Technical-Debt-Governance.md).

If none:

**None**

—or, for each item:

| Field | Value |
|-------|-------|
| **ID** | TD-XXX |
| **Description** | What was deferred and why |
| **Priority** | P0 / P1 / P2 / P3 |
| **Target Release** | Version or mission for resolution |
| **Owner** | Person accountable for resolution |

Every open item requires **ID**, **Description**, **Priority**, **Target Release**, and **Owner**. Debt without an owner or target release is blocked from CTO Approval.

## Business Workspace Compliance

Before **CTO Approval** of any Business Workspace release, verify every item below. A failure blocks approval.

Defined in [ADR-005 – Business Workspace Architecture](../10_Decisions/ADR-005-Business-Workspace-Architecture.md). Implementation pattern: [BUSINESS_WORKSPACE_PATTERN.md](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md).

| # | Requirement | Pass Criteria |
|---|-------------|---------------|
| 1 | **Executive Shell integration** | Routes under `app/(platform)/`; uses `DashboardLayout`; no separate shell or dashboard framework |
| 2 | **Business Workspace Pattern compliance** | Follows [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) and [BUSINESS_WORKSPACE_PATTERN.md](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md), or ADR documents deviation |
| 3 | **Design System compliance** | Uses `WORKSPACE_*` tokens, `components/ui/` primitives, and ORION visual language |
| 4 | **Executive Brief contribution** | Insights card or equivalent on `/advisor`; briefing data exported from `lib/` insights layer |
| 5 | **Separation of business logic and presentation** | Domain data and rules in `lib/`; components are presentation-only |
| 6 | **Reuse of existing components** | No duplicate platform functionality; shared patterns extracted when reused twice |
| 7 | **Verification Hierarchy passed** | All eight gates pass per Verification Hierarchy above |
| 8 | **Release documentation complete** | Release Record, CHANGELOG, and Technical Debt section updated |

Record compliance confirmation in the Release Record **CTO Approval** comments for Business Workspace releases.
