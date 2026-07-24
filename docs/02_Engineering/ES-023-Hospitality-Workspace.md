# ES-023 — Hospitality Workspace

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 19A (Construction Phase)

**Author:** Founder & Chief Architect

---

# Purpose

The Hospitality Workspace provides a unified operational and executive view of hospitality businesses managed through ORION.

It combines reservations, guests, operations, housekeeping, maintenance, finance, guest experience, and executive intelligence into a single workspace.

The workspace is designed to answer the executive's operational questions while reducing the need to navigate multiple systems.

**Current state:** A hospitality overview exists at `/hospitality` with placeholder components and `lib/hospitality-data.ts` (Sprint 12 foundation). This specification defines the full Business Workspace per [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) and [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md).

> **Sprint 3 plan:** [ES-047 — Sprint 3 Implementation Plan](./ES-047-Sprint-3-Implementation-Plan.md) (Approved · overview delivered · operational workflows pending)

> **Sprint 3 WBS:** [ES-048 — Sprint 3 Work Breakdown Structure](./ES-048-Sprint-3-Work-Breakdown-Structure.md) (Approved · 12 work packages mapped)

> **Task catalogue:** [ES-049 — Sprint 3 Engineering Task Catalogue](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) (Approved · 72 tasks · S3-001–S3-224)

---

# Objectives

The Hospitality Workspace shall:

- Manage reservations.
- Monitor occupancy.
- Track guest journeys.
- Coordinate housekeeping.
- Monitor maintenance.
- Present operational KPIs.
- Generate executive recommendations.
- Detect operational risks.
- Improve guest satisfaction.

---

# Primary Users

Founder · Hotel Owner · General Manager · Operations Manager · Front Office · Housekeeping Manager · Reservations Team · Concierge · Finance Manager

---

# Executive Questions

The workspace shall answer:

- What is today's occupancy?
- Which guests arrive today?
- Which guests depart today?
- Which VIP guests require attention?
- Which rooms require housekeeping?
- Which rooms require maintenance?
- Which reservations require action?
- Which guests are returning?
- Which guests have unresolved issues?
- What operational risks exist today?

**Behavioural input:** [FA-001 Project Sunrise](../01_Product/FA-001-Project-Sunrise.md) (Hospitality observation categories)

---

# Workspace Sections

1. Executive Summary
2. Reservations
3. Arrivals
4. Departures
5. In-House Guests
6. Housekeeping
7. Maintenance
8. Guest Experience
9. Revenue Snapshot
10. Operational Alerts
11. Recommendations

---

# Executive Summary

**Displays:** Current Occupancy · Today's Revenue · ADR · RevPAR · Guest Satisfaction · Pending Tasks · Business Health

**Platform:** Executive Summary pattern · health score with drivers · links to [Executive Dashboard](./ES-022-Executive-Dashboard.md) workspace card

---

# Reservations

**Displays:** Upcoming Reservations · Confirmed · Pending · Cancelled · No Shows · Wait List

**Actions:** View · Modify · Cancel · Assign Room

---

# Arrivals

**Displays:** Today's Arrivals · Arrival Time · Airport Transfer · Special Requests · VIP Status · Loyalty Status · Expected Check-in

---

# Departures

**Displays:** Today's Departures · Outstanding Bills · Transport · Feedback Pending · Late Checkout Requests

---

# In-House Guests

**Displays:** Room Number · Guest Name · Length of Stay · Preferences · Requests · Special Notes · Current Balance

---

# Housekeeping

**Displays:** Room Status — Clean · Dirty · Inspection Pending · Out of Service · Maintenance Hold

**Actions:** Assign · Complete · Inspect

---

# Maintenance

**Displays:** Open Issues · Priority · Assigned Staff · Estimated Completion · Affected Rooms

---

# Guest Experience

**Displays:** Complaints · Compliments · Reviews · Service Recovery · VIP Notes · Preferences · Special Occasions

---

# Revenue Snapshot

**Displays:** Today's Revenue · Weekly Revenue · Monthly Revenue · ADR · RevPAR · Occupancy % · Average Stay

---

# Operational Alerts

**Examples:** VIP Arrival · Room Out of Service · Double Booking · Payment Failure · Late Checkout · Guest Complaint · Maintenance Delay · Overbooking Risk

---

# Recommendations

**Examples:** Upgrade VIP Guest · Prioritize Room 205 · Offer Late Checkout · Call Returning Guest · Schedule Preventive Maintenance · Increase Weekend Pricing

**Platform:** Workspace intelligence pipeline → [Executive Provider](../../lib/intelligence/provider.ts) → Intelligence Platform

---

# Workspace Navigation

**Route:** `/hospitality`

| Section | Route (target) |
|---------|----------------|
| Overview | `/hospitality` |
| Reservations | `/hospitality/reservations` |
| Guests | `/hospitality/guests` |
| Housekeeping | `/hospitality/housekeeping` |
| Maintenance | `/hospitality/maintenance` |
| Revenue | `/hospitality/revenue` |
| Operations | `/hospitality/operations` |
| Reports | `/hospitality/reports` |
| Settings | `/hospitality/settings` |

Follow [Finance](../finance/) and [CRM](../crm/) sub-navigation pattern (`WorkspaceSubNav`).

---

# Search

Supports: Guests · Reservations · Room Numbers · Booking Reference · Phone · Email · Passport Number

Integrates with [Command Palette / Universal Search](../10_Decisions/ADR-003-Global-Command-Palette.md).

---

# Filters

Date · Status · Room Type · VIP · Nationality · Booking Source · Payment Status

---

# Responsive Behaviour

| Viewport | Layout |
|----------|--------|
| Desktop | Three-column layout |
| Tablet | Two-column layout |
| Mobile | Single-column layout |

---

# Empty States

Display: illustration · explanation · suggested action

---

# Error States

Display: simple message · retry · technical details hidden

---

# Performance

| Target | Requirement |
|--------|-------------|
| Initial load | < 2 seconds |
| Search | < 300ms |
| Navigation | Instant |

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

---

# Architecture Requirements

Per [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md):

| Requirement | Implementation |
|-------------|----------------|
| Executive Shell integration | `app/(platform)/hospitality/` · `DashboardLayout` |
| Business logic in `lib/` | `lib/hospitality-data.ts` → expand to domain modules |
| Presentation in components | `components/hospitality/` |
| Executive Provider | `lib/intelligence/workspace-providers/hospitality-executive-provider.ts` |
| Executive Brief contribution | Intelligence Bus — no direct Advisor imports |
| Intelligence pipeline | `lib/hospitality/hospitality-intelligence-pipeline.ts` (workspace-specific) |
| Registry registration | `register-executive-providers.ts` |

**Dependency rules:** Workspace modules must not import CRM or Finance. Platform engines remain workspace-agnostic per [ES-021](./ES-021-Executive-Intelligence-Engines.md).

---

# Provider Dependencies

| Provider | Responsibility |
|----------|----------------|
| Reservation Provider | Bookings, occupancy, wait list |
| Guest Provider | Profiles, preferences, VIP, loyalty |
| Housekeeping Provider | Room status, assignments |
| Maintenance Provider | Issues, priorities, completion |
| Revenue Provider | ADR, RevPAR, revenue snapshots |
| Recommendation Provider | Executive actions ranked by impact |
| Alert Provider | Operational and guest-risk alerts |
| Health Provider | Hospitality business health score |

All providers implement [ExecutiveProvider](../../lib/intelligence/provider.ts) + ADR-006 aggregation methods.

---

# Platform Dependencies

| Dependency | Status |
|------------|--------|
| Mission 17B — Intelligence Engines | Complete |
| Mission 17A — Provider Framework | Complete |
| Executive Shell | Complete |
| ES-022 — Executive Dashboard | Specified |
| Hospitality Executive Provider | Planned (Mission 19A) |
| Connected PMS / reservation API | Out of scope (placeholder data Phase II) |

---

# Business Rules

- No reservation duplication.
- VIP guests always highlighted.
- Critical alerts override informational alerts.
- Recommendations ranked by business impact.
- Historical guest preferences retained.

---

# Acceptance Criteria

The workspace shall:

- [ ] Display operational summary on Overview
- [ ] Manage reservations (CRUD with validation)
- [ ] Display arrivals and departures for current day
- [ ] Track housekeeping room status
- [ ] Track maintenance issues
- [ ] Display guest intelligence (VIP, preferences, issues)
- [ ] Present recommendations via Executive Provider
- [ ] Generate operational alerts
- [ ] Support responsive layouts (375px, 768px, 1280px)
- [ ] Meet WCAG 2.2 AA accessibility standards
- [ ] Pass [Business Workspace Compliance](../09_Standards/Engineering_Standards.md#business-workspace-compliance)
- [ ] Pass Verification Hierarchy
- [ ] Satisfy [Non-Negotiables](../00_BLUEPRINT/ORION_Non_Negotiables.md) Decision Filter

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Reservation Created | Appears in reservations and operational summary |
| Reservation Modified | Updated across arrivals/occupancy views |
| Guest Checked In | Room status and in-house list update |
| Guest Checked Out | Departure complete; housekeeping triggered |
| Housekeeping Completed | Room status → Clean |
| Maintenance Closed | Issue removed; room released if applicable |
| VIP Guest Arrives | VIP highlighted; alert generated |
| Double Booking Detected | Critical alert; recommendation surfaced |
| Provider Failure | Widget error state; workspace remains usable |
| Mobile Layout | Sections stack; navigation usable |

---

# Out of Scope

- Channel Manager Integration
- OTA Synchronization
- POS Integration
- Door Lock Systems
- IoT Devices
- AI Concierge

These features belong to future releases.

---

# Future Enhancements

- Channel Manager · Dynamic Pricing · Predictive Occupancy
- AI Concierge · Voice Commands · Guest Timeline
- Digital Key · Mobile Check-in · Smart Maintenance · Predictive Recommendations

---

# Definition of Done

The Hospitality Workspace is complete when:

- Reservations function correctly
- Guest management is operational
- Housekeeping is integrated
- Maintenance is tracked
- Revenue metrics are displayed
- Recommendations function correctly via Executive Provider
- Alerts operate correctly
- Executive Brief receives hospitality contribution
- Accessibility requirements are met
- Performance targets are achieved
- Release Record (RR) published
- Founder approval is received

---

# References

| Document | Location |
|----------|----------|
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-047 Sprint 3 Implementation Plan | [ES-047-Sprint-3-Implementation-Plan.md](./ES-047-Sprint-3-Implementation-Plan.md) |
| ES-048 Sprint 3 Work Breakdown Structure | [ES-048-Sprint-3-Work-Breakdown-Structure.md](./ES-048-Sprint-3-Work-Breakdown-Structure.md) |
| ES-049 Sprint 3 Engineering Task Catalogue | [ES-049-Sprint-3-Engineering-Task-Catalogue.md](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) |
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ADR-005 Business Workspace | [ADR-005](../10_Decisions/ADR-005-Business-Workspace-Architecture.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Business Workspace Pattern | [BUSINESS_WORKSPACE_PATTERN.md](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md) |
| Product Constitution | [ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Product Bible | [ORION_Product_Bible.md](../00_BLUEPRINT/ORION_Product_Bible.md) |
| Project Charter | [ORION_Project_Charter.md](../00_BLUEPRINT/ORION_Project_Charter.md) |

---

# Closing Statement

The Hospitality Workspace is the operational heart of ORION's hospitality capability.

It should allow executives to understand the state of their hospitality business in minutes while empowering operational teams to execute efficiently.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Record** | Pending (Mission 19A) |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
