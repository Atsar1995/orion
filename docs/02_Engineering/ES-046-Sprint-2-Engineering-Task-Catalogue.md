# ES-046 — Sprint 2 Engineering Task Catalogue

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Parent plan:** [ES-044 — Sprint 2 Implementation Plan](./ES-044-Sprint-2-Implementation-Plan.md) · [ES-045 — Sprint 2 WBS](./ES-045-Sprint-2-Work-Breakdown-Structure.md)

---

# Purpose

The Sprint 2 Engineering Task Catalogue decomposes every Sprint 2 work package into atomic engineering tasks.

Each task is independently implementable, testable, reviewable, and traceable from planning through production deployment.

The catalogue serves as the authoritative source for GitHub Issues, Jira tickets, Linear tasks, and AI-assisted implementation.

**Current state:** All **55 tasks** (S2-001–S2-203) catalogued with implementation status mapped to the ORION codebase. **Partial delivery** via Advisor, Command Center, and Mission 17B engines — **Open** tasks form the Sprint 2 closure backlog.

---

# Task Structure

Each engineering task contains: Task ID · Title · Description · Engineering Discipline · Priority · Estimated Effort · Dependencies · Acceptance Criteria · Definition of Done · **Status**

---

# Task Status Summary

| Status | Count | Meaning |
|--------|-------|---------|
| Done | 6 | Delivered and meets task acceptance |
| Partial | 22 | Foundation exists · Sprint 2 acceptance not met |
| Open | 27 | Not implemented |

**Sprint 2 task completion:** **~51% delivered or partial** · **M8 sprint acceptance not met** ([ES-045](./ES-045-Sprint-2-Work-Breakdown-Structure.md))

---

# Work Package 1 — Dashboard Framework

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-001 | Create Dashboard Layout | Frontend | P0 | 6h | **Done** | `DashboardLayout` · Advisor · Command Center |
| S2-002 | Implement Responsive Grid | Frontend | P0 | 5h | **Partial** | Card sections · no unified widget grid |
| S2-003 | Implement Dashboard Navigation | Frontend | P0 | 4h | **Done** | Sidebar · Command Palette |
| S2-004 | Create Widget Containers | Frontend | P0 | 6h | **Partial** | `Card` · workspace sections |
| S2-005 | Dashboard Routing | Frontend | P1 | 3h | **Partial** | `/advisor` · `/command-center` · no `/dashboard` |

**WP1:** 2 Done · 3 Partial

---

# Work Package 2 — Widget Framework

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S2-020 | Build Widget Registry | Backend | P0 | 5h | **Open** |
| S2-021 | Widget Loader | Frontend | P0 | 4h | **Open** |
| S2-022 | Widget Configuration Engine | Backend | P1 | 5h | **Open** |
| S2-023 | Widget Refresh Service | Backend | P1 | 4h | **Open** |
| S2-024 | Widget Lifecycle Management | Backend | P2 | 5h | **Open** |

**WP2:** 5 Open

---

# Work Package 3 — KPI Widgets

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-040 | Revenue Widget | Frontend | P0 | 4h | **Partial** | Finance workspace · not registry widget |
| S2-041 | Reservations Widget | Frontend | P0 | 4h | **Partial** | Hospitality placeholder |
| S2-042 | Sales Widget | Frontend | P0 | 4h | **Open** | Commerce nav only |
| S2-043 | Finance Widget | Frontend | P1 | 4h | **Partial** | `FinanceInsightsCard` · pipeline |
| S2-044 | Marketing Widget | Frontend | P1 | 4h | **Partial** | Marketing overview |
| S2-045 | Business Health Widget | Frontend | P0 | 5h | **Partial** | `BusinessHealthCard` · Health Engine |

**WP3:** 5 Partial · 1 Open

---

# Work Package 4 — Executive Brief Engine

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-060 | Brief Generation Service | AI Engineering | P0 | 8h | **Partial** | `brief-engine.ts` · deterministic · not LLM |
| S2-061 | Daily Summary Generator | AI Engineering | P0 | 6h | **Partial** | `ExecutiveBrief` · static + bus line |
| S2-062 | Risk Summary Generator | AI Engineering | P1 | 5h | **Partial** | `RisksCard` · pipeline alerts |
| S2-063 | Opportunity Summary Generator | AI Engineering | P1 | 5h | **Partial** | `OpportunitiesCard` · static |
| S2-064 | Recommended Actions Generator | AI Engineering | P0 | 6h | **Partial** | `DecisionCard` · static decisions |

**Spec:** [ES-028 — Executive Brief Engine](./ES-028-Executive-Brief-Engine.md)

**WP4:** 5 Partial

---

# Work Package 5 — AI Insight Services

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S2-080 | Insight Generation Engine | AI Engineering | P0 | 8h | **Open** |
| S2-081 | Confidence Scoring | AI Engineering | P1 | 4h | **Partial** · static in `advisor-data.ts` |
| S2-082 | Explainability Engine | AI Engineering | P0 | 6h | **Open** |
| S2-083 | Source Attribution | Backend | P1 | 4h | **Open** |
| S2-084 | Insight Caching | Backend | P2 | 4h | **Open** |

**Spec:** [ES-039 — AI Orchestration & Agent Framework](./ES-039-AI-Orchestration-Agent-Framework.md)

**WP5:** 1 Partial · 4 Open

---

# Work Package 6 — Dashboard Providers

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-100 | Dashboard Provider | Backend | P0 | 6h | **Open** |
| S2-101 | Metrics Provider | Backend | P0 | 5h | **Partial** | `platform-metrics.ts` |
| S2-102 | Widget Provider | Backend | P1 | 4h | **Open** |
| S2-103 | Brief Provider | Backend | P0 | 5h | **Partial** | Intelligence Bus · `brief-engine.ts` |
| S2-104 | Preference Provider | Backend | P1 | 4h | **Open** |

**WP6:** 2 Partial · 3 Open

---

# Work Package 7 — Dashboard APIs

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S2-120 | Dashboard API | Backend | P0 | 6h | **Open** |
| S2-121 | Executive Brief API | Backend | P0 | 5h | **Open** |
| S2-122 | Widget API | Backend | P1 | 4h | **Open** |
| S2-123 | Preferences API | Backend | P1 | 4h | **Open** |
| S2-124 | Notification API Integration | Backend | P1 | 5h | **Open** |

**Spec:** [ES-035 — API Design Standards](./ES-035-API-Design-Standards.md)

**WP7:** 5 Open

---

# Work Package 8 — User Preferences

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-140 | Widget Layout Persistence | Backend | P1 | 4h | **Open** |
| S2-141 | Theme Preferences | Frontend | P2 | 3h | **Partial** · ORION tokens · not user-selectable |
| S2-142 | Dashboard Configuration | Frontend | P1 | 5h | **Open** |
| S2-143 | Notification Preferences | Frontend | P1 | 4h | **Partial** · `/configuration` UI |
| S2-144 | Brief Schedule Preferences | Backend | P2 | 4h | **Open** |

**WP8:** 2 Partial · 3 Open

---

# Work Package 9 — Notification Integration

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-160 | Dashboard Alerts | Backend | P0 | 5h | **Partial** | Pipeline alerts · no delivery |
| S2-161 | Executive Brief Notifications | Backend | P0 | 5h | **Open** |
| S2-162 | Activity Feed | Frontend | P1 | 5h | **Partial** | `RecentActivityCard` · placeholder |
| S2-163 | Alert Centre | Frontend | P1 | 6h | **Partial** | `CriticalAttentionCard` · `RisksCard` |
| S2-164 | Recommendation Notifications | Backend | P2 | 4h | **Open** |

**WP9:** 3 Partial · 2 Open

---

# Work Package 10 — Testing

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S2-180 | Widget Unit Tests | QA | P0 | Continuous | **Open** |
| S2-181 | Dashboard Integration Tests | QA | P0 | Continuous | **Open** |
| S2-182 | Executive Brief Validation | QA | P1 | Continuous | **Open** |
| S2-183 | Accessibility Testing | QA | P1 | Continuous | **Open** |
| S2-184 | Performance Testing | QA | P1 | Continuous | **Open** |

**WP10:** 5 Open

---

# Work Package 11 — Documentation

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S2-200 | Dashboard Documentation | Documentation | P1 | Continuous | **Partial** · ES-022 · ES-044 |
| S2-201 | Widget Developer Guide | Documentation | P2 | Continuous | **Open** |
| S2-202 | Executive Brief Documentation | Documentation | P1 | Continuous | **Partial** · ES-028 |
| S2-203 | Sprint Release Notes | Documentation | P2 | Continuous | **Done** · CHANGELOG · RRs |

**WP11:** 1 Done · 2 Partial · 1 Open

---

# Sprint Metrics

| Metric | Value |
|--------|-------|
| Total Work Packages | 11 |
| Catalogued Tasks | 55 |
| Sprint Duration | 2 Weeks (recommended) |
| Tasks Done | 6 |
| Tasks Partial | 22 |
| Tasks Open | 27 |
| Parallel Streams | Frontend · Backend · AI Engineering · Platform · QA · Documentation |

---

# Open Task Backlog (P0 Priority)

| ID | Title | WP | Blocker for |
|----|-------|-----|-------------|
| S2-020 | Widget Registry | 2 | S2-021–024 · all KPI widgets |
| S2-060 | Brief Generation (full pipeline wiring) | 4 | Advisor static data removal |
| S2-064 | Recommended Actions (pipeline) | 4 | Executive decisions from engine |
| S2-080 | Insight Generation Engine | 5 | AI-assisted insights |
| S2-082 | Explainability Engine | 5 | ES-039 compliance |
| S2-100 | Dashboard Provider | 6 | S2-120 · unified dashboard |
| S2-103 | Brief Provider (complete) | 6 | S2-121 |
| S2-120 | Dashboard API | 7 | External consumers |
| S2-121 | Executive Brief API | 7 | Brief delivery |
| S2-160 | Dashboard Alerts (workflow) | 9 | Alert centre runtime |
| S2-161 | Executive Brief Notifications | 9 | Brief delivery |
| S2-180 | Widget Unit Tests | 10 | DoD · ES-043 |
| S2-181 | Dashboard Integration Tests | 10 | DoD |

---

# Quality Gates

Every task shall satisfy: Code review completed · Unit tests passing · Type checking successful · Linting successful · Documentation updated · Accessibility validated · Security review completed · Acceptance criteria verified

| Gate | Applicable today |
|------|------------------|
| Linting · type checking | Yes |
| Documentation | ES programme |
| Unit / integration tests | **Gap** |
| Accessibility | Manual only |
| Security review | Partial |

**Reference:** [ES-043 — Engineering Governance & Delivery Standards](./ES-043-Engineering-Governance-Delivery-Standards.md)

---

# Traceability

| Document | Relationship |
|----------|--------------|
| [ES-044](./ES-044-Sprint-2-Implementation-Plan.md) | Sprint goals and acceptance |
| [ES-045](./ES-045-Sprint-2-Work-Breakdown-Structure.md) | Work package decomposition |
| [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) | Atomic tasks (this document) |
| [ES-042](./ES-042-Sprint-1-Engineering-Task-Catalogue.md) | Sprint 1 task catalogue (parallel pattern) |
| GitHub Issues / Linear | Map 1:1 from task IDs `S2-xxx` |

---

# Acceptance Criteria

The Sprint 2 Engineering Task Catalogue is complete when:

| Criterion | Status |
|-----------|--------|
| Every Sprint 2 work package decomposed into engineering tasks | Delivered |
| Every task has a unique identifier | Delivered · S2-001–S2-203 |
| Ownership assigned · priorities established · effort documented | Delivered |
| Acceptance criteria defined | Delivered · per WP in ES-045 |
| Implementation status mapped | Delivered · this document |
| Founder approval is received | Approved |

**Catalogue documentation:** **Complete**.

**Sprint 2 task execution:** **Partial** — 6 Done · 22 Partial · 27 Open.

---

# References

| Document | Location |
|----------|----------|
| ES-044 Sprint 2 Implementation Plan | [ES-044-Sprint-2-Implementation-Plan.md](./ES-044-Sprint-2-Implementation-Plan.md) |
| ES-045 Sprint 2 WBS | [ES-045-Sprint-2-Work-Breakdown-Structure.md](./ES-045-Sprint-2-Work-Breakdown-Structure.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |

---

# Closing Statement

The Sprint 2 Engineering Task Catalogue transforms the Executive Dashboard implementation roadmap into actionable engineering work, providing a complete execution framework for developers, AI coding assistants, and project management tools.

**Next action:** Create tracked work items from **Open** and **Partial** P0 tasks · execute per [ES-045](./ES-045-Sprint-2-Work-Breakdown-Structure.md) priority backlog.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-046 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
