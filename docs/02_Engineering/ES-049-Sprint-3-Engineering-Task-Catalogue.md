# ES-049 — Sprint 3 Engineering Task Catalogue

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Parent plan:** [ES-047 — Sprint 3 Implementation Plan](./ES-047-Sprint-3-Implementation-Plan.md) · [ES-048 — Sprint 3 WBS](./ES-048-Sprint-3-Work-Breakdown-Structure.md)

---

# Purpose

The Sprint 3 Engineering Task Catalogue decomposes every Hospitality Workspace work package into atomic engineering tasks.

Each task is independently implementable, testable, reviewable, and traceable throughout development, testing, deployment, and production support.

This catalogue serves as the authoritative implementation source for GitHub Issues, Jira, Linear, Azure DevOps, and AI-assisted development tools.

**Current state:** All **72 tasks** (S3-001–S3-224) catalogued with implementation status mapped to the ORION codebase. **Partial delivery** via `/hospitality` overview (15 components · `lib/hospitality-data.ts`) — **Open** tasks form the Sprint 3 closure backlog.

---

# Task Structure

Each engineering task contains: Task ID · Title · Description · Engineering Discipline · Priority · Estimated Effort · Dependencies · Acceptance Criteria · Definition of Done · **Status**

---

# Task Status Summary

| Status | Count | Meaning |
|--------|-------|---------|
| Done | 0 | Delivered and meets task acceptance |
| Partial | 23 | Foundation exists · Sprint 3 acceptance not met |
| Open | 49 | Not implemented |

**Sprint 3 task completion:** **~32% delivered or partial** · **M9 sprint acceptance not met** ([ES-048](./ES-048-Sprint-3-Work-Breakdown-Structure.md))

---

# Work Package 1 — Hospitality Dashboard

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-001 | Hospitality Dashboard Layout | Frontend | P0 | 8h | **Partial** | `hospitality/page.tsx` · no `layout.tsx` · no `WorkspaceSubNav` |
| S3-002 | Property Overview Widget | Frontend | P0 | 5h | **Partial** | `HospitalitySummary` · `HotelHealth` · static |
| S3-003 | Occupancy Dashboard Widget | Frontend | P0 | 6h | **Partial** | `OccupancyRevenue` · `HOTEL_KPIS` |
| S3-004 | Today's Operations Panel | Frontend | P1 | 5h | **Partial** | `TodayOperations` · `BookingPerformance` |
| S3-005 | Revenue Snapshot Widget | Frontend | P1 | 5h | **Partial** | `OccupancyRevenue` · `RevenueOpportunities` |
| S3-006 | Alert Panel | Frontend | P1 | 4h | **Partial** | `CriticalIssues` · `OrionInsights` |
| S3-007 | Quick Actions Panel | Frontend | P2 | 4h | **Partial** | `QuickActions` · UI only · no workflows |

**Spec:** [ES-023 — Hospitality Workspace](./ES-023-Hospitality-Workspace.md)

**WP1:** 7 Partial

---

# Work Package 2 — Reservation Management

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S3-020 | Reservation Creation Service | Backend | P0 | 8h | **Open** |
| S3-021 | Reservation Update Service | Backend | P0 | 6h | **Open** |
| S3-022 | Reservation Cancellation | Backend | P1 | 4h | **Open** |
| S3-023 | Availability Search | Backend | P0 | 6h | **Open** |
| S3-024 | Reservation Calendar | Frontend | P1 | 8h | **Open** |
| S3-025 | Reservation Timeline | Frontend | P2 | 6h | **Open** |
| S3-026 | Reservation History | Backend | P2 | 4h | **Open** |

**Target route:** `/hospitality/reservations` · **WP2:** 7 Open

---

# Work Package 3 — Guest Management

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-040 | Guest Profile Management | Backend | P0 | 6h | **Open** |
| S3-041 | Guest Search | Backend | P1 | 4h | **Open** |
| S3-042 | Guest Preferences | Frontend | P1 | 5h | **Open** |
| S3-043 | VIP Classification | Backend | P2 | 4h | **Partial** | VIP count in `TODAY_OPERATIONS` |
| S3-044 | Guest History | Backend | P1 | 5h | **Open** |
| S3-045 | Guest Notes | Frontend | P2 | 4h | **Open** |

**Partial UI:** `GuestExperience` card (static reviews summary only).

**WP3:** 1 Partial · 5 Open

---

# Work Package 4 — Room Management

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-060 | Room Inventory | Backend | P0 | 8h | **Open** |
| S3-061 | Room Types | Backend | P0 | 5h | **Open** |
| S3-062 | Room Assignment Engine | Backend | P0 | 6h | **Open** |
| S3-063 | Availability Matrix | Frontend | P1 | 6h | **Open** |
| S3-064 | Room Status Dashboard | Frontend | P1 | 5h | **Partial** | Room numbers in `ArrivalsDepartures` only |
| S3-065 | Out-of-Service Workflow | Backend | P2 | 5h | **Open** |

**WP4:** 1 Partial · 5 Open

---

# Work Package 5 — Check-In & Check-Out

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-080 | Arrival Dashboard | Frontend | P1 | 6h | **Partial** | `ArrivalsDepartures` · read-only |
| S3-081 | Digital Check-In Workflow | Frontend | P0 | 8h | **Open** |
| S3-082 | Identity Verification Service | Backend | P0 | 6h | **Open** |
| S3-083 | Check-Out Workflow | Frontend | P0 | 7h | **Open** |
| S3-084 | Invoice Generation | Backend | P1 | 6h | **Open** |
| S3-085 | Departure Summary | Frontend | P2 | 4h | **Open** |

**WP5:** 1 Partial · 5 Open

---

# Work Package 6 — Housekeeping

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-100 | Cleaning Schedule Engine | Backend | P0 | 6h | **Open** |
| S3-101 | Housekeeping Dashboard | Frontend | P0 | 6h | **Partial** | Summary counts in `TODAY_OPERATIONS` |
| S3-102 | Room Assignment | Backend | P1 | 5h | **Open** |
| S3-103 | Inspection Workflow | Frontend | P1 | 5h | **Open** |
| S3-104 | Maintenance Request Module | Backend | P1 | 6h | **Partial** | `CriticalIssues` · static list |
| S3-105 | Cleaning Status Updates | Frontend | P2 | 4h | **Open** |

**Target route:** `/hospitality/housekeeping`

**WP6:** 2 Partial · 4 Open

---

# Work Package 7 — Operational Intelligence

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-120 | Occupancy Forecast | AI Engineering | P0 | 8h | **Partial** | Static forecast in `HOTEL_KPIS` |
| S3-121 | Revenue Forecast | AI Engineering | P0 | 8h | **Partial** | Static in `OccupancyRevenue` |
| S3-122 | Operational Recommendation Engine | AI Engineering | P0 | 10h | **Partial** | `RecommendedActions` · static |
| S3-123 | Risk Detection | AI Engineering | P1 | 6h | **Partial** | `CriticalIssues` · static |
| S3-124 | Staff Utilisation Analytics | Backend | P2 | 6h | **Open** |
| S3-125 | Business Health Integration | Backend | P1 | 5h | **Partial** | `HotelHealth` · not wired to Health Engine |

**Platform:** [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md) · not connected to hospitality.

**WP7:** 5 Partial · 1 Open

---

# Work Package 8 — Reporting

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S3-140 | Occupancy Report | Backend | P1 | 5h | **Open** |
| S3-141 | Revenue Report | Backend | P1 | 5h | **Open** |
| S3-142 | Reservation Report | Backend | P1 | 5h | **Open** |
| S3-143 | Guest Activity Report | Backend | P2 | 4h | **Open** |
| S3-144 | Housekeeping Report | Backend | P2 | 4h | **Open** |
| S3-145 | Operational Performance Report | Backend | P1 | 6h | **Open** |

**Target route:** `/hospitality/reports` · **WP8:** 6 Open

---

# Work Package 9 — Hospitality APIs & Providers

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S3-160 | Reservation Provider | Backend | P0 | 6h | **Open** |
| S3-161 | Guest Provider | Backend | P0 | 5h | **Open** |
| S3-162 | Room Provider | Backend | P0 | 5h | **Open** |
| S3-163 | Housekeeping Provider | Backend | P1 | 5h | **Open** |
| S3-164 | Dashboard Provider | Backend | P1 | 4h | **Open** |
| S3-165 | Reporting Provider | Backend | P1 | 5h | **Open** |

**Current data path:** Components → `lib/hospitality-data.ts` directly ([ES-034](./ES-034-Provider-Data-Contract-Standards.md)).

**WP9:** 6 Open · **critical path** per [ES-048](./ES-048-Sprint-3-Work-Breakdown-Structure.md)

---

# Work Package 10 — AI Hospitality Services

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-180 | Reservation Conflict Detection | AI Engineering | P0 | 6h | **Open** |
| S3-181 | Guest Preference Suggestions | AI Engineering | P1 | 5h | **Open** |
| S3-182 | Revenue Opportunity Detection | AI Engineering | P1 | 6h | **Partial** | `RevenueOpportunities` · static |
| S3-183 | Housekeeping Optimisation | AI Engineering | P1 | 6h | **Open** |
| S3-184 | Executive Hospitality Brief | AI Engineering | P0 | 8h | **Partial** | `ExecutiveBriefing` · not in Brief Engine pipeline |

**Spec:** [ES-028 — Executive Brief Engine](./ES-028-Executive-Brief-Engine.md) · [ES-039](./ES-039-AI-Orchestration-Agent-Framework.md)

**WP10:** 2 Partial · 3 Open

---

# Work Package 11 — Testing

| ID | Title | Discipline | Priority | Effort | Status |
|----|-------|------------|----------|--------|--------|
| S3-200 | Reservation Workflow Tests | QA | P0 | Continuous | **Open** |
| S3-201 | Guest Lifecycle Tests | QA | P0 | Continuous | **Open** |
| S3-202 | Room Management Tests | QA | P1 | Continuous | **Open** |
| S3-203 | Hospitality API Tests | QA | P1 | Continuous | **Open** |
| S3-204 | AI Validation Tests | QA | P1 | Continuous | **Open** |
| S3-205 | Accessibility & Performance Tests | QA | P1 | Continuous | **Open** |

**WP11:** 6 Open · no `tests/hospitality/`

---

# Work Package 12 — Documentation

| ID | Title | Discipline | Priority | Effort | Status | Notes |
|----|-------|------------|----------|--------|--------|-------|
| S3-220 | Hospitality User Guide | Documentation | P1 | Continuous | **Partial** | ES-023 workspace spec |
| S3-221 | Operations Manual | Documentation | P1 | Continuous | **Open** |
| S3-222 | API Documentation | Documentation | P1 | Continuous | **Partial** | ES-035 standards · no hospitality API |
| S3-223 | AI Feature Guide | Documentation | P2 | Continuous | **Partial** | ES-028 · ES-039 |
| S3-224 | Sprint Release Notes | Documentation | P2 | Continuous | **Partial** | CHANGELOG · RR-005 placeholder |

**WP12:** 4 Partial · 1 Open

---

# Sprint Metrics

| Metric | Value |
|--------|-------|
| Total Work Packages | 12 |
| Engineering Tasks | 72 (S3-001–S3-224) |
| Sprint Duration | 3 Weeks |
| Done | 0 |
| Partial | 23 |
| Open | 49 |
| Parallel Streams | Frontend · Backend · AI · Platform · QA · Documentation · UX |

---

# Open Task Backlog (P0 Priority)

Execute in dependency order per [ES-048](./ES-048-Sprint-3-Work-Breakdown-Structure.md):

1. **S3-160–S3-162** — Reservation · Guest · Room providers
2. **S3-001** — Dashboard layout · sub-navigation · sub-routes
3. **S3-020 · S3-023** — Reservation creation · availability search
4. **S3-060 · S3-062** — Room inventory · assignment engine
5. **S3-040** — Guest profile management
6. **S3-081 · S3-083** — Check-in · check-out workflows
7. **S3-100 · S3-101** — Housekeeping schedule · dashboard
8. **S3-122 · S3-125 · S3-184** — Intelligence pipeline · Brief integration
9. **S3-200 · S3-201** — Core workflow tests

---

# Quality Gates

Every task shall satisfy: Code reviewed · Unit tests passing · Integration tests passing · API contracts validated · Accessibility verified · Documentation updated · Security review completed · Performance targets achieved

| Gate | Current |
|------|---------|
| Code review | Process documented ([ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md)) |
| Unit / integration tests | **Gap** · S3-200–S3-205 Open |
| API contracts | **Gap** · S3-160–S3-165 Open |
| Accessibility | Manual Verification Hierarchy |
| Documentation | ES-047 · ES-048 · ES-049 delivered |
| Performance | Not benchmarked ([ES-047](./ES-047-Sprint-3-Implementation-Plan.md)) |
| Security | Partial · ES-037 |

---

# Traceability

| Document | Relationship |
|----------|--------------|
| [ES-047](./ES-047-Sprint-3-Implementation-Plan.md) | Sprint goals and acceptance |
| [ES-048](./ES-048-Sprint-3-Work-Breakdown-Structure.md) | Work package decomposition |
| [ES-049](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) | Atomic tasks (this document) |
| [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) | Sprint 2 task catalogue (parallel pattern) |
| GitHub Issues / Linear | Map 1:1 from task IDs `S3-xxx` |

---

# Acceptance Criteria

The Sprint 3 Engineering Task Catalogue is complete when:

| Criterion | Status |
|-----------|--------|
| Every work package decomposed into engineering tasks | Delivered |
| Every task has a unique identifier | Delivered · S3-001–S3-224 |
| Ownership assigned · priorities established · effort documented | Delivered |
| Acceptance criteria defined | Delivered · per WP in ES-048 |
| Implementation status mapped | Delivered · this document |
| Founder approval is received | Approved |

**Catalogue documentation:** **Complete**.

**Sprint 3 task execution:** **Partial** — 0 Done · 23 Partial · 49 Open.

---

# References

| Document | Location |
|----------|----------|
| ES-047 Sprint 3 Implementation Plan | [ES-047-Sprint-3-Implementation-Plan.md](./ES-047-Sprint-3-Implementation-Plan.md) |
| ES-048 Sprint 3 WBS | [ES-048-Sprint-3-Work-Breakdown-Structure.md](./ES-048-Sprint-3-Work-Breakdown-Structure.md) |
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

The Sprint 3 Engineering Task Catalogue provides the complete execution framework for delivering ORION's first operational business workspace.

It enables disciplined planning, parallel engineering, AI-assisted development, and predictable delivery while preserving the architectural integrity of the ORION Executive Operating System.

**Next action:** Create tracked work items from **Open** and **Partial** P0 tasks · execute per [ES-048](./ES-048-Sprint-3-Work-Breakdown-Structure.md) priority backlog.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-049 alignment RR pending |

---

### ORION

Engineering clarity for better executive decisions.

Let's build something remarkable.
