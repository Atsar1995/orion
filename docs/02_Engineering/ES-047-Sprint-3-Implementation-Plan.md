# ES-047 — Sprint 3 Implementation Plan

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Related specifications:** [ES-023 — Hospitality Workspace](./ES-023-Hospitality-Workspace.md) · [ES-028 — Executive Brief Engine](./ES-028-Executive-Brief-Engine.md) · [ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md) · [ES-044](./ES-044-Sprint-2-Implementation-Plan.md) · [ES-045](./ES-045-Sprint-2-Work-Breakdown-Structure.md) · [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) · [ES-048 — Sprint 3 WBS](./ES-048-Sprint-3-Work-Breakdown-Structure.md) · [ES-049 — Sprint 3 Task Catalogue](./ES-049-Sprint-3-Engineering-Task-Catalogue.md)

---

# Purpose

Sprint 3 delivers ORION's first operational business workspace: the Hospitality Workspace.

This sprint introduces day-to-day hospitality operations, enabling property managers to manage reservations, guests, rooms, housekeeping, occupancy, and operational insights through a unified interface.

The Hospitality Workspace demonstrates ORION's ability to combine operational workflows with executive intelligence.

**Current state:** ORION delivers a **Hospitality overview surface** at `/hospitality` with **15 dashboard-style components** and static data in `lib/hospitality-data.ts` (Sprint 12 foundation per [ES-023](./ES-023-Hospitality-Workspace.md)). **Operational workflows are not implemented**: no reservation CRUD, guest profiles, room inventory, check-in/check-out, housekeeping workflows, sub-navigation, domain providers, persistence, REST APIs, or hospitality events. Executive Dashboard integration is **partial** — hospitality KPIs appear as placeholder summaries on Advisor/Command Center, not live operational metrics. This document is the **approved Construction Phase Sprint 3 plan** mapped against actual codebase state.

> **Workspace specification:** [ES-023 — Hospitality Workspace](./ES-023-Hospitality-Workspace.md) (Approved · Mission 19A)

> **Sprint 3 WBS:** [ES-048 — Sprint 3 Work Breakdown Structure](./ES-048-Sprint-3-Work-Breakdown-Structure.md) (Approved · 12 work packages mapped)

> **Task catalogue:** [ES-049 — Sprint 3 Engineering Task Catalogue](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) (Approved · 72 tasks · S3-001–S3-224)

---

# Sprint Goal

Deliver a production-ready Hospitality Workspace integrated with the Executive Dashboard and Executive Brief Engine.

**Status:** **Partial** — overview UI and static executive summary delivered · operational workspace per ES-023 — **pending**.

---

# Sprint Duration

**Recommended:** 3 Weeks

---

# Sprint Objectives

| Objective | Status |
|-----------|--------|
| Implement reservation management | Planned |
| Implement guest management | Planned |
| Implement room inventory | Planned |
| Implement housekeeping workflows | Planned |
| Provide occupancy monitoring | Partial · static KPIs on overview |
| Provide operational dashboards | Partial · `/hospitality` overview only |
| Integrate AI operational recommendations | Partial · static `RecommendedActions` · `OrionInsights` |
| Integrate Executive Dashboard metrics | Partial · placeholder hospitality metrics · no live feed |

---

# Deliverables

## Hospitality Dashboard

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Property Overview | `HospitalitySummary` · `HotelHealth` | Partial · static |
| Today's Arrivals | `ArrivalsDepartures` · `TodayOperations` · `BookingPerformance` | Partial · display only |
| Today's Departures | `ArrivalsDepartures` | Partial · display only |
| Current Occupancy | `OccupancyRevenue` · `HOTEL_KPIS` | Partial · static |
| Housekeeping Status | `TODAY_OPERATIONS` (Rooms Ready · Cleaning) | Partial · summary counts only |
| Maintenance Alerts | `CriticalIssues` | Partial · static issues list |
| Revenue Snapshot | `OccupancyRevenue` · `RevenueOpportunities` | Partial · static |
| Operational Alerts | `CriticalIssues` · `OrionInsights` | Partial · static |

**Route:** `/hospitality` · **Spec:** [ES-023 — Hospitality Workspace](./ES-023-Hospitality-Workspace.md)

## Reservation Management

| Deliverable | Status |
|-------------|--------|
| Create Reservation | Planned |
| Modify Reservation | Planned |
| Cancel Reservation | Planned |
| Reservation Calendar | Planned |
| Reservation Timeline | Planned |
| Availability Check | Planned |
| Reservation Search | Planned |
| Reservation History | Planned |

**Target route:** `/hospitality/reservations` (per ES-023) · **Delivered:** — **planned**.

## Guest Management

| Deliverable | Status |
|-------------|--------|
| Guest Profiles | Planned |
| Guest History | Planned |
| Preferences | Planned |
| VIP Classification | Partial · VIP count in `TODAY_OPERATIONS` |
| Special Requests | Planned |
| Communication History | Planned |
| Loyalty Information | Planned |
| Guest Notes | Planned |

**Target route:** `/hospitality/guests` · **Delivered:** `GuestExperience` card (static reviews/complaints summary only).

## Room Management

| Deliverable | Status |
|-------------|--------|
| Room Inventory | Planned |
| Room Types | Planned |
| Room Status | Partial · room numbers in arrivals list only |
| Availability Matrix | Planned |
| Maintenance Status | Partial · maintenance count in `TODAY_OPERATIONS` |
| Out-of-Service Management | Planned |
| Room Assignment | Planned |

**Target route:** `/hospitality/operations` · **Delivered:** — **planned**.

## Check-In & Check-Out

| Deliverable | Status |
|-------------|--------|
| Arrival Dashboard | Partial · `ArrivalsDepartures` · `TodayOperations` |
| Digital Check-In | Planned |
| Manual Check-In | Planned |
| Room Assignment | Planned |
| Identity Verification | Planned |
| Check-Out Workflow | Planned |
| Invoice Generation | Planned |
| Departure Summary | Planned |

## Housekeeping

| Deliverable | Status |
|-------------|--------|
| Cleaning Schedule | Planned |
| Room Assignment | Planned |
| Status Updates | Planned |
| Inspection Workflow | Planned |
| Maintenance Requests | Planned |
| Housekeeping Dashboard | Planned |

**Target route:** `/hospitality/housekeeping` · **Delivered:** summary counts in `TODAY_OPERATIONS` only.

## Operational Intelligence

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Occupancy Forecast | `HOTEL_KPIS` · `BOOKING_PERFORMANCE` | Partial · static forecast values |
| Revenue Forecast | `OccupancyRevenue` | Partial · static |
| Guest Satisfaction Trends | `GuestExperience` | Partial · static |
| Operational Recommendations | `RecommendedActions` · `RevenueOpportunities` | Partial · static |
| Housekeeping Optimisation | — | Planned |
| Staff Utilisation Insights | — | Planned |
| AI Operational Alerts | `CriticalIssues` · `OrionInsights` | Partial · static · no pipeline |

**Platform:** Intelligence engines available ([ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md)) · **not wired to hospitality domain**.

## Reports

| Deliverable | Status |
|-------------|--------|
| Daily Occupancy Report | Planned |
| Arrival Report | Planned |
| Departure Report | Planned |
| Housekeeping Report | Planned |
| Revenue Report | Planned |
| Reservation Summary | Planned |
| Guest Activity Report | Planned |
| Operational Performance | Planned |

**Target route:** `/hospitality/reports` · **Reference pattern:** [Finance reports](../finance/reports/) · **Delivered:** — **planned**.

---

# Repository Structure

**Target:**

```
components/hospitality/ · components/reservations/ · components/guests/
components/rooms/ · components/housekeeping/
providers/hospitality/ · providers/reservations/ · providers/guests/
providers/rooms/ · providers/housekeeping/
services/hospitality/ · tests/hospitality/ · docs/hospitality/
```

**Delivered (partial):**

| Path | Status |
|------|--------|
| `components/hospitality/` | Delivered · 15 overview components |
| `lib/hospitality-data.ts` | Delivered · static placeholder data |
| `app/(platform)/hospitality/page.tsx` | Delivered · overview route only |
| `components/reservations/` · `components/guests/` · `components/rooms/` · `components/housekeeping/` | Planned |
| `providers/hospitality/` · `providers/reservations/` · etc. | Planned · no domain providers |
| `services/hospitality/` | Planned |
| `tests/hospitality/` | Planned |
| `docs/hospitality/` | Planned · ES-023 is canonical spec |

**Gap vs Finance/CRM pattern:** Finance has `layout.tsx` + 9 sub-routes · Hospitality has **single overview page** · no `WorkspaceSubNav`.

---

# Database Additions

Properties · Rooms · Room Types · Reservations · Guests · Guest Preferences · Housekeeping Tasks · Maintenance Requests · Operational Notes

**Delivered:** — **planned** ([ES-036](./ES-036-Database-Persistence-Architecture.md)). In-memory persistence layer exists for platform entities only — **no hospitality schema**.

---

# Provider Implementation

| Provider | Mapping | Status |
|----------|---------|--------|
| Hospitality Provider | — | Planned |
| Reservation Provider | — | Planned |
| Guest Provider | — | Planned |
| Room Provider | — | Planned |
| Housekeeping Provider | — | Planned |
| Maintenance Provider | — | Planned |
| Occupancy Provider | — | Planned |

**Data source today:** `lib/hospitality-data.ts` consumed directly by components — **no provider abstraction** ([ES-034](./ES-034-Provider-Data-Contract-Standards.md)).

---

# APIs

Reservations API · Guests API · Rooms API · Housekeeping API · Occupancy API · Maintenance API · Hospitality Dashboard API

**Delivered:** — **planned** ([ES-035](./ES-035-API-Design-Standards.md)). No REST endpoints · no Next.js route handlers for hospitality operations.

---

# Event Implementation

| Event | Status |
|-------|--------|
| ReservationCreated | Planned |
| ReservationUpdated | Planned |
| ReservationCancelled | Planned |
| GuestCheckedIn | Planned |
| GuestCheckedOut | Planned |
| RoomAssigned | Planned |
| HousekeepingCompleted | Planned |
| MaintenanceRequested | Planned |
| OccupancyUpdated | Planned |
| OperationalAlertGenerated | Planned |

Platform event infrastructure exists ([ES-033](./ES-033-Event-Messaging-Architecture.md)) · hospitality domain events **not emitted**.

---

# AI Features

| Feature | Status |
|---------|--------|
| Reservation Conflict Detection | Planned |
| Occupancy Prediction | Partial · static forecast in `HOTEL_KPIS` |
| Housekeeping Optimisation | Planned |
| Guest Preference Suggestions | Planned |
| Operational Risk Detection | Partial · static `CriticalIssues` |
| Revenue Opportunity Recommendations | Partial · static `RevenueOpportunities` |
| Executive Hospitality Summary | Partial · `ExecutiveBriefing` · `HOSPITALITY_SUMMARY` · not in Brief Engine pipeline |

**AI providers:** `lib/intelligence/ai-providers.ts` — all null ([ES-039](./ES-039-AI-Orchestration-Agent-Framework.md)).

---

# Security Checklist

| Control | Status |
|---------|--------|
| Role-based access control | Partial · RBAC helpers · placeholder auth |
| Property-level permissions | Planned |
| Guest data protection | Planned · PII in static demo data only |
| Audit logging | Partial · in-memory platform types |
| Secure API access | Planned · no REST API |
| Sensitive data masking | Planned |

---

# Testing

Reservation workflows · Guest lifecycle · Room assignment · Check-in/check-out · Housekeeping workflow · API integration · Performance testing · Accessibility testing · End-to-end operational scenarios

**Delivered:** Manual verification in Engineering Standards · automated tests — **planned** ([ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md) · no `tests/hospitality/`).

---

# Performance Targets

| Target | ES-047 Goal | Current |
|--------|-------------|---------|
| Reservation Search | < 300 ms | N/A · no search |
| Reservation Creation | < 500 ms | N/A · no CRUD |
| Dashboard Refresh | < 2 seconds | Not benchmarked · static SSR |
| Occupancy Calculation | < 1 second | Static constants · not calculated |
| API Response | < 200 ms | N/A · no REST API |

---

# Risks

Complex reservation rules · Concurrent room assignments · Guest data quality · Housekeeping synchronisation · Operational workflow complexity

**Mitigation (documented):** Incremental feature rollout · comprehensive workflow testing · transaction validation · concurrency safeguards · continuous stakeholder feedback.

**Observed:** Static overview creates **false completeness risk** — executive metrics appear live but are not backed by operational data or persistence.

---

# Definition of Ready

Hospitality workflows approved · Business rules documented · Data model validated · Acceptance criteria defined · Dependencies resolved

**Status:** [ES-023](./ES-023-Hospitality-Workspace.md) approved · Sprint 12 overview foundation delivered · Sprint 2 executive integration **partial** ([ES-044](./ES-044-Sprint-2-Implementation-Plan.md)) · Sprint 3 **ready for operational execution** once Sprint 2 P0 gaps are triaged per product priority.

---

# Definition of Done

Hospitality Workspace operational · Reservations functional · Guest management operational · Room inventory operational · Housekeeping workflow complete · Operational dashboard functional · AI recommendations available · Tests passing · Documentation complete · Founder approval received

**Status:** **Partial** — overview UI delivered · operational workflows · providers · persistence · APIs · automated tests — **open**.

---

# Acceptance Criteria

Sprint 3 is complete when:

| Criterion | Status |
|-----------|--------|
| Reservations can be created and managed | Planned |
| Guests can be managed | Planned |
| Rooms can be assigned | Planned |
| Housekeeping workflow operates correctly | Planned |
| Operational dashboard displays live metrics | Partial · static overview only |
| AI operational recommendations are available | Partial · static cards · no pipeline |
| Executive Dashboard receives hospitality metrics | Partial · placeholder · not live feed |
| All quality gates pass | Partial · no CI/test suite |

**Sprint 3 completion:** **Partial** (~15% delivered — overview foundation only).

---

# Implementation Status Summary

| Layer | Delivered | Sprint 3 Gap |
|-------|-----------|--------------|
| Hospitality overview UI | Yes · 15 components · `/hospitality` | Sub-routes · `WorkspaceSubNav` |
| Static executive summary | Yes · `hospitality-data.ts` | Live operational data |
| Reservation management | No | Full CRUD · calendar · search |
| Guest management | No | Profiles · history · preferences |
| Room inventory | No | Status matrix · assignment |
| Check-in / check-out | No | Workflows · invoicing |
| Housekeeping | No | Schedule · inspection · dashboard |
| Domain providers | No | 7 providers per ES-047 |
| Persistence / database | No | Hospitality schema |
| REST APIs | No | 7 API surfaces |
| Domain events | No | 10 hospitality events |
| Intelligence integration | No | Pipeline · Brief Engine contribution |
| Executive Dashboard feed | Partial | Live hospitality metrics widget |
| Automated tests | No | Workflow · E2E · a11y |

---

# Sprint Deliverable

At Sprint 3 completion ORION shall provide:

Hospitality Workspace · Reservation Management · Guest Management · Room Management · Housekeeping Dashboard · Operational Reports · Occupancy Analytics · AI Operational Assistance · Executive Dashboard Integration · Production-ready hospitality operations

**Current deliverable:** Hospitality **overview dashboard** (static) · **operational platform** — pending.

---

# References

| Document | Location |
|----------|----------|
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-030 Alert Engine | [ES-030-Alert-Engine.md](./ES-030-Alert-Engine.md) |
| ES-031 Trend Engine | [ES-031-Trend-Engine.md](./ES-031-Trend-Engine.md) |
| ES-032 Business Health Engine | [ES-032-Business-Health-Engine.md](./ES-032-Business-Health-Engine.md) |
| ES-033 Event Messaging Architecture | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-034 Provider Data Contract Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-036 Database Persistence Architecture | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| ES-044 Sprint 2 Implementation Plan | [ES-044-Sprint-2-Implementation-Plan.md](./ES-044-Sprint-2-Implementation-Plan.md) |
| ES-045 Sprint 2 WBS | [ES-045-Sprint-2-Work-Breakdown-Structure.md](./ES-045-Sprint-2-Work-Breakdown-Structure.md) |
| ES-046 Sprint 2 Task Catalogue | [ES-046-Sprint-2-Engineering-Task-Catalogue.md](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) |
| ES-048 Sprint 3 Work Breakdown Structure | [ES-048-Sprint-3-Work-Breakdown-Structure.md](./ES-048-Sprint-3-Work-Breakdown-Structure.md) |
| ES-049 Sprint 3 Engineering Task Catalogue | [ES-049-Sprint-3-Engineering-Task-Catalogue.md](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) |
| FA-001 Project Sunrise | [FA-001-Project-Sunrise.md](../01_Product/FA-001-Project-Sunrise.md) |
| ADR-005 Business Workspace | [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

Sprint 3 transforms ORION into a fully operational hospitality management platform.

By combining operational workflows, executive intelligence, and AI-assisted recommendations, the Hospitality Workspace establishes the first complete vertical solution within the ORION Executive Operating System.

**Current assessment:** Sprint 12 delivered a **credible hospitality overview** aligned with ES-023 executive summary sections. Sprint 3 execution must convert static presentation into **operational workflows**, wire **domain providers and persistence**, emit **hospitality events** into the Intelligence Platform, and feed **live metrics** to the Executive Dashboard and Brief Engine per ES-028.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-047 alignment RR pending |

---

### ORION

Engineering clarity for better executive decisions.

Let's build something remarkable.
