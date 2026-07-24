# ES-048 — Sprint 3 Work Breakdown Structure (WBS)

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Parent plan:** [ES-047 — Sprint 3 Implementation Plan](./ES-047-Sprint-3-Implementation-Plan.md) · **Task catalogue:** [ES-049 — Sprint 3 Engineering Task Catalogue](./ES-049-Sprint-3-Engineering-Task-Catalogue.md)

---

# Purpose

This document decomposes Sprint 3 into executable engineering work packages for delivering the Hospitality Workspace.

Each work package is independently implementable, testable, reviewable, and deployable while preserving ORION's architectural standards.

**Current state:** Work packages mapped to ORION codebase delivery. **Partial delivery** exists via `/hospitality` overview (15 components · `lib/hospitality-data.ts`) — **Sprint 3 WBS gaps** (operational workflows, providers, APIs, persistence, intelligence wiring, QA) remain open. See [ES-047](./ES-047-Sprint-3-Implementation-Plan.md).

---

# Sprint 3 Summary

| Field | Value |
|-------|-------|
| Sprint Duration | 3 Weeks (recommended) |
| Primary Goal | First complete Hospitality Workspace integrated with Executive Dashboard and Executive Intelligence Layer |
| Expected Team | Frontend · Backend · AI · Platform · QA · UX · Founder / Product Owner |
| Overall WBS Status | **Partial** — 0 complete · 2 partial · 10 not started |

---

# Work Package Status Overview

| WP | Name | Status | Completion |
|----|------|--------|------------|
| 1 | Hospitality Dashboard | Partial | ~35% |
| 2 | Reservation Management | Not started | ~0% |
| 3 | Guest Management | Not started | ~5% |
| 4 | Room Management | Not started | ~0% |
| 5 | Check-In & Check-Out | Not started | ~10% |
| 6 | Housekeeping | Not started | ~5% |
| 7 | Operational Intelligence | Partial | ~15% |
| 8 | Reporting | Not started | ~0% |
| 9 | Hospitality APIs & Providers | Not started | ~0% |
| 10 | AI Hospitality Services | Not started | ~5% |
| 11 | Quality Assurance | Not started | ~0% |
| 12 | Documentation | Substantial | ~55% |

---

# Work Package 1 — Hospitality Dashboard

**Objectives:** Hospitality Home · Property Overview · Occupancy Dashboard · Today's Operations · Revenue Summary · Alert Panel · Quick Actions

**Dependencies:** Sprint 2 Executive Dashboard ([ES-044](./ES-044-Sprint-2-Implementation-Plan.md))

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Hospitality Home | `app/(platform)/hospitality/page.tsx` | Partial · overview only · no layout/sub-nav |
| Property Overview | `HospitalitySummary` · `HotelHealth` | Partial · static |
| Occupancy Dashboard | `OccupancyRevenue` · `HOTEL_KPIS` | Partial · static |
| Today's Operations | `TodayOperations` · `BookingPerformance` | Partial · static counts |
| Revenue Summary | `OccupancyRevenue` · `RevenueOpportunities` | Partial · static |
| Alert Panel | `CriticalIssues` · `OrionInsights` | Partial · static |
| Quick Actions | `QuickActions` | Partial · UI only · no workflows |

**Spec:** [ES-023 — Hospitality Workspace](./ES-023-Hospitality-Workspace.md)

**Gap vs Finance pattern:** No `layout.tsx` · no `WorkspaceSubNav` · no sub-routes (`/reservations`, `/guests`, etc.)

**Work package status:** **Partial** — executive overview delivered · operational dashboard shell pending.

---

# Work Package 2 — Reservation Management

**Objectives:** Reservation Creation · Editing · Cancellation · Availability Search · Timeline · Calendar · History

**Dependencies:** Work Package 1

| Deliverable | Status |
|-------------|--------|
| Reservation Creation | **Open** |
| Reservation Editing | **Open** |
| Reservation Cancellation | **Open** |
| Availability Search | **Open** |
| Reservation Timeline | **Open** |
| Calendar View | **Open** |
| Reservation History | **Open** |

**Target route:** `/hospitality/reservations` · **Data:** `BOOKING_PERFORMANCE` summary counts only (static).

**Work package status:** **Not started**.

---

# Work Package 3 — Guest Management

**Objectives:** Guest Profiles · Search · Preferences · Notes · History · VIP Classification · Loyalty Information

**Dependencies:** Work Package 2

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Guest Profiles | — | **Open** |
| Guest Search | — | **Open** |
| Guest Preferences | — | **Open** |
| Guest Notes | — | **Open** |
| Guest History | — | **Open** |
| VIP Classification | `TODAY_OPERATIONS` VIP count | Partial · display only |
| Loyalty Information | — | **Open** |

**Partial UI:** `GuestExperience` card (reviews · complaints · satisfaction — static).

**Target route:** `/hospitality/guests`

**Work package status:** **Not started** (~5% static summary only).

---

# Work Package 4 — Room Management

**Objectives:** Room Inventory · Room Types · Room Assignment · Availability · Room Status · Out-of-Service Management

**Dependencies:** Work Package 3

| Deliverable | Status |
|-------------|--------|
| Room Inventory | **Open** |
| Room Types | **Open** |
| Room Assignment | **Open** |
| Room Availability | **Open** |
| Room Status | Partial · room numbers in `ArrivalsDepartures` |
| Out-of-Service Management | **Open** |

**Work package status:** **Not started**.

---

# Work Package 5 — Check-In & Check-Out

**Objectives:** Arrival Dashboard · Check-In Workflow · Identity Verification · Room Assignment · Check-Out · Invoice · Departure Summary

**Dependencies:** Work Package 4

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Arrival Dashboard | `ArrivalsDepartures` · `TodayOperations` | Partial · read-only |
| Check-In Workflow | — | **Open** |
| Identity Verification | — | **Open** |
| Room Assignment | — | **Open** |
| Check-Out Workflow | — | **Open** |
| Invoice Generation | — | **Open** |
| Departure Summary | — | **Open** |

**Work package status:** **Not started** (~10% arrival/departure display only).

---

# Work Package 6 — Housekeeping

**Objectives:** Cleaning Schedule · Room Assignment · Cleaning Status · Inspection · Maintenance Requests · Housekeeping Dashboard

**Dependencies:** Work Package 4

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Cleaning Schedule | — | **Open** |
| Room Assignment | — | **Open** |
| Cleaning Status | `TODAY_OPERATIONS` (Rooms Ready · Cleaning) | Partial · counts only |
| Inspection Workflow | — | **Open** |
| Maintenance Requests | `CriticalIssues` (static) | Partial · display only |
| Housekeeping Dashboard | — | **Open** |

**Target route:** `/hospitality/housekeeping`

**Work package status:** **Not started** (~5% summary metrics only).

---

# Work Package 7 — Operational Intelligence

**Objectives:** Occupancy Forecast · Revenue Forecast · AI Recommendations · Risk Detection · Operational Alerts · Staff Utilisation · Business Health Integration

**Dependencies:** Work Package 9 (Hospitality Providers)

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Occupancy Forecast | `HOTEL_KPIS` · `BOOKING_PERFORMANCE` | Partial · static |
| Revenue Forecast | `OccupancyRevenue` | Partial · static |
| AI Recommendations | `RecommendedActions` · `RevenueOpportunities` | Partial · static |
| Risk Detection | `CriticalIssues` | Partial · static |
| Operational Alerts | `OrionInsights` · `CriticalIssues` | Partial · static |
| Staff Utilisation | — | **Open** |
| Business Health Integration | `HotelHealth` · Health Engine not wired | Partial · static score |

**Platform engines available:** [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md) · **not connected to hospitality domain**.

**Work package status:** **Partial** — presentation cards exist · pipeline integration pending.

---

# Work Package 8 — Reporting

**Objectives:** Occupancy · Revenue · Reservation · Guest · Housekeeping · Operational Reports

**Dependencies:** Work Package 9 (Hospitality APIs)

| Deliverable | Status |
|-------------|--------|
| Occupancy Reports | **Open** |
| Revenue Reports | **Open** |
| Reservation Reports | **Open** |
| Guest Reports | **Open** |
| Housekeeping Reports | **Open** |
| Operational Reports | **Open** |

**Target route:** `/hospitality/reports` · **Reference:** [Finance reports](../../app/(platform)/finance/reports/)

**Work package status:** **Not started**.

---

# Work Package 9 — Hospitality APIs & Providers

**Objectives:** Reservation · Guest · Room · Housekeeping · Dashboard · Reporting Providers

**Dependencies:** Sprint 1 Provider Framework ([ES-034](./ES-034-Provider-Data-Contract-Standards.md) · [ES-040](./ES-040-Sprint-1-Implementation-Plan.md))

| Provider | Mapping | Status |
|----------|---------|--------|
| Reservation Provider | — | **Open** |
| Guest Provider | — | **Open** |
| Room Provider | — | **Open** |
| Housekeeping Provider | — | **Open** |
| Dashboard Provider | — | **Open** |
| Reporting Provider | — | **Open** |

**Current data path:** Components → `lib/hospitality-data.ts` directly · no provider abstraction · no REST APIs ([ES-035](./ES-035-API-Design-Standards.md)).

**Work package status:** **Not started**.

---

# Work Package 10 — AI Hospitality Services

**Objectives:** Reservation Conflict Detection · Occupancy Prediction · Revenue Opportunity Detection · Guest Preference Suggestions · Housekeeping Optimisation · Executive Hospitality Brief

**Dependencies:** Work Package 7

| Service | Implementation | Status |
|---------|----------------|--------|
| Reservation Conflict Detection | — | **Open** |
| Occupancy Prediction | Static forecast in `HOTEL_KPIS` | Partial · not predictive |
| Revenue Opportunity Detection | `RevenueOpportunities` | Partial · static |
| Guest Preference Suggestions | — | **Open** |
| Housekeeping Optimisation | — | **Open** |
| Executive Hospitality Brief | `ExecutiveBriefing` · `HOSPITALITY_SUMMARY` | Partial · not in Brief Engine pipeline |

**AI providers:** `lib/intelligence/ai-providers.ts` — all null ([ES-039](./ES-039-AI-Orchestration-Agent-Framework.md)).

**Work package status:** **Not started** (~5% static placeholders).

---

# Work Package 11 — Quality Assurance

**Objectives:** Reservation · Guest · Room · Workflow · API · AI · Accessibility · Performance · E2E Tests

**Dependencies:** Parallel throughout sprint

| Test Area | Status |
|-----------|--------|
| Reservation Tests | **Open** · no `tests/hospitality/` |
| Guest Tests | **Open** |
| Room Tests | **Open** |
| Workflow Tests | **Open** |
| API Tests | **Open** · no APIs |
| AI Validation | **Open** |
| Accessibility Tests | Manual Verification Hierarchy only |
| Performance Tests | **Open** · not benchmarked |
| End-to-End Tests | **Open** |

**Work package status:** **Not started**.

---

# Work Package 12 — Documentation

**Objectives:** Hospitality User Guide · Reservation Guide · API Documentation · AI Feature Documentation · Release Notes · Deployment Guide

**Dependencies:** Continuous

| Deliverable | Status |
|-------------|--------|
| Hospitality User Guide | **Partial** · ES-023 workspace spec |
| Reservation Guide | **Open** |
| API Documentation | **Open** · ES-035 standards only |
| AI Feature Documentation | **Partial** · ES-028 · ES-039 |
| Release Notes | **Partial** · CHANGELOG · RR-005 placeholder |
| Deployment Guide | **Partial** · Engineering Standards |

**Work package status:** **Substantial** — ES programme · ES-023 · ES-047 · ES-048 delivered.

---

# Milestones

| Milestone | Work Packages | Status |
|-----------|---------------|--------|
| M1 — Hospitality Dashboard Complete | WP1 | Partial |
| M2 — Reservation Management Operational | WP2 | Not met |
| M3 — Guest & Room Management Complete | WP3 · WP4 | Not met |
| M4 — Check-In / Check-Out Operational | WP5 | Not met |
| M5 — Housekeeping Complete | WP6 | Not met |
| M6 — Operational Intelligence Integrated | WP7 | Not met |
| M7 — Reporting Complete | WP8 | Not met |
| M8 — AI Hospitality Services Operational | WP10 | Not met |
| M9 — Sprint Acceptance | All | **Not met** |

---

# Quality Gates

Every work package shall satisfy: Code review completed · Unit tests passing · Integration tests passing · API contracts validated · Accessibility verified · Documentation updated · Security review completed · Performance targets achieved

| Gate | Current |
|------|---------|
| Code review | Process documented ([ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md)) |
| Unit / integration tests | **Gap** · no hospitality test suite |
| API contracts | **Gap** · no REST layer |
| Accessibility | Manual Verification Hierarchy |
| Documentation | ES-023 · ES-047 · ES-048 delivered |
| Performance targets | Not benchmarked ([ES-047](./ES-047-Sprint-3-Implementation-Plan.md)) |
| Security review | Partial · ES-037 placeholder auth |

---

# Dependency Graph

```
Sprint 2 Executive Dashboard (ES-044) — partial
        ↓
WP1 (Hospitality Dashboard)
        ↓
WP2 (Reservations) → WP3 (Guests) → WP4 (Rooms)
        ↓                    ↓
WP5 (Check-In/Out)    WP6 (Housekeeping)
        ↓
WP9 (APIs & Providers) → WP7 (Operational Intelligence) → WP10 (AI Services)
        ↓
WP8 (Reporting)
WP11 (QA) ∥ all WPs
WP12 (Documentation) ∥ all WPs
        ↓
Executive Dashboard / Brief Engine feed (ES-028 · ES-044)
```

**Critical path gaps:** WP9 (providers + APIs) → WP2–WP6 (operational workflows) → WP7 (intelligence wiring) → M9 acceptance.

---

# Open Work Package Backlog (Sprint 3 Closure)

Priority order:

1. **WP9** — Hospitality providers · persistence schema · REST APIs ([ES-034](./ES-034-Provider-Data-Contract-Standards.md) · [ES-036](./ES-036-Database-Persistence-Architecture.md))
2. **WP1** — `layout.tsx` · `WorkspaceSubNav` · sub-route structure per ES-023
3. **WP2** — Reservation CRUD · calendar · search · availability
4. **WP4** — Room inventory · status matrix · assignment
5. **WP3** — Guest profiles · preferences · VIP · loyalty
6. **WP5** — Check-in / check-out workflows
7. **WP6** — Housekeeping schedule · inspection · dashboard
8. **WP7** — Wire intelligence pipeline · Business Health · alerts
9. **WP8** — Reporting suite
10. **WP10** — AI services · Executive Brief hospitality contribution ([ES-028](./ES-028-Executive-Brief-Engine.md))
11. **WP11** — Automated test suite
12. **WP12** — User guides · API docs · RR for Sprint 3

---

# Acceptance Criteria

Sprint 3 Work Breakdown Structure is complete when:

| Criterion | Status |
|-----------|--------|
| Every deliverable is assigned | Delivered · this document |
| Dependencies are documented | Delivered |
| Milestones are defined | Delivered |
| Quality gates are established | Delivered |
| Work packages are independently executable | Delivered |
| Implementation status mapped | Delivered |
| Founder approval is received | Approved |

**WBS documentation:** **Complete**.

**Sprint 3 execution against WBS:** **Partial** — see [ES-047](./ES-047-Sprint-3-Implementation-Plan.md).

---

# References

| Document | Location |
|----------|----------|
| ES-047 Sprint 3 Implementation Plan | [ES-047-Sprint-3-Implementation-Plan.md](./ES-047-Sprint-3-Implementation-Plan.md) |
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-034 Provider Data Contract Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| ES-044 Sprint 2 Implementation Plan | [ES-044-Sprint-2-Implementation-Plan.md](./ES-044-Sprint-2-Implementation-Plan.md) |
| ES-049 Sprint 3 Engineering Task Catalogue | [ES-049-Sprint-3-Engineering-Task-Catalogue.md](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

The Sprint 3 Work Breakdown Structure transforms the Hospitality Workspace implementation plan into a coordinated engineering programme, enabling parallel development while ensuring quality, consistency, and architectural integrity.

**Next action:** Execute open work packages per priority backlog · track atomic tasks via [ES-049 — Sprint 3 Engineering Task Catalogue](./ES-049-Sprint-3-Engineering-Task-Catalogue.md).

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-048 alignment RR pending |

---

### ORION

Engineering clarity for better executive decisions.

Let's build something remarkable.
