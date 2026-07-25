# ORION Definition of Ready

| Field | Value |
|-------|-------|
| **Document ID** | OS-006 |
| **Title** | ORION Definition of Ready |
| **Version** | 1.0.0 |
| **Status** | Active |
| **Effective Date** | 25 July 2026 |
| **Owner** | Engineering · Product |
| **Related** | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) · [Engineering Backlog v1](../07_Engineering/Engineering_Backlog_v1.md) · [OS-002 Work Item Lifecycle](../09_Standards/OS-002-Work-Item-Lifecycle.md) |

---

## Purpose

A work item may enter a sprint only when it meets **Definition of Ready (DoR)**. DoR prevents starting work that lacks clarity, dependencies, or acceptance criteria — reducing rework and sprint spillover.

---

## Definition of Ready — User Story

| # | Criterion | Required |
|---|-----------|----------|
| 1 | **Story ID assigned** (e.g. `US-001`) | Yes |
| 2 | **Title and description** written in user-story format | Yes |
| 3 | **Business value** stated in one sentence | Yes |
| 4 | **Acceptance criteria** are testable and unambiguous (Given/When/Then or checklist) | Yes |
| 5 | **Dependencies** identified and resolved or scheduled | Yes |
| 6 | **Priority** assigned (P0 / P1 / P2) | Yes |
| 7 | **Complexity** estimated (XS / S / M / L / XL) | Yes |
| 8 | **Suggested sprint** assigned | Yes |
| 9 | **Epic / Feature** linked | Yes |
| 10 | **Design mockup or wireframe** attached for UI stories | Yes (UI only) |
| 11 | **EC spec section** referenced (EC-001–EC-005) | Yes (EC work) |
| 12 | **No open architecture ADR blockers** | Yes |
| 13 | **Story fits in one sprint** (split if XL without decomposition) | Yes |
| 14 | **Product owner / CTO acceptance** of scope | Yes (P0 only) |

---

## Definition of Ready — Engineering Task

| # | Criterion | Required |
|---|-----------|----------|
| 1 | **Task ID assigned** (e.g. `TASK-BE-007`) | Yes |
| 2 | **Parent user story or epic** linked | Yes |
| 3 | **Category** tagged (Frontend / Backend / API / AI / Testing / DevOps / Documentation / Accessibility / Performance / Security) | Yes |
| 4 | **Implementation approach** documented (file paths, patterns) | Yes |
| 5 | **Acceptance criteria** defined | Yes |
| 6 | **Dependencies** resolved | Yes |
| 7 | **Test plan** identified | Yes (code tasks) |
| 8 | **Rollback / feature flag** identified for risky changes | Yes (High risk) |

---

## Definition of Ready — Epic

| # | Criterion | Required |
|---|-----------|----------|
| 1 | **Epic ID assigned** (E1–E13) | Yes |
| 2 | **Business outcome** defined | Yes |
| 3 | **Features decomposed** into user stories | Yes |
| 4 | **Dependencies** on other epics mapped | Yes |
| 5 | **Sprint range** estimated | Yes |
| 6 | **Success metrics** defined | Yes |
| 7 | **Architecture review** complete for new modules | Yes |

---

## Definition of Ready — Sprint

| # | Criterion | Required |
|---|-----------|----------|
| 1 | Sprint goal stated in one sentence | Yes |
| 2 | Committed stories meet DoR | Yes |
| 3 | Total story points ≤ team velocity | Yes |
| 4 | Critical path items prioritized | Yes |
| 5 | No more than 20% unplanned buffer consumed by carry-over | Yes |
| 6 | Dependencies on other teams / external providers documented | Yes |

---

## Exemptions

| Scenario | Process |
|----------|---------|
| Production incident | CTO may waive DoR for hotfix · post-incident story filed within 24h |
| Spike / research | Use `spike` label · time-boxed · findings doc required |
| Documentation-only | Reduced DoR: criteria 1, 2, 4, 8 only |

---

**Governance:** Stories entering sprint without DoR require **Engineering Program Manager approval** recorded in sprint planning notes.
