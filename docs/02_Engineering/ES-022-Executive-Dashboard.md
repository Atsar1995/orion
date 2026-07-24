# ES-022 — Executive Dashboard

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 18A (Construction Phase)

**Author:** Founder & Chief Architect

---

# Purpose

The Executive Dashboard is the primary entry point into ORION.

It provides executives with an immediate understanding of the health of their business and presents the most important information requiring attention.

The dashboard is designed to answer the executive's most important questions within sixty seconds.

**Current state:** Executive Brief (Advisor) at `/advisor` is the default landing per [DL-2026-001](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md). Command Center at `/command-center` provides dashboard-like cards. This specification defines the unified Executive Dashboard that will become the primary command center, consuming the Intelligence Pipeline — not workspace modules directly. Sprint 2 delivery status: [ES-044](./ES-044-Sprint-2-Implementation-Plan.md) (partial).

---

# Objectives

The Executive Dashboard shall:

- Present overall business health.
- Prioritize executive attention.
- Highlight significant changes.
- Surface recommendations.
- Display critical alerts.
- Reduce information overload.
- Enable confident decision-making.

---

# Executive Questions

The dashboard shall answer:

- How is my business performing?
- What requires my attention today?
- What changed since yesterday?
- What opportunities exist?
- What risks require action?
- What should I do next?

**Behavioural input:** [FA-001 Project Sunrise](../01_Product/FA-001-Project-Sunrise.md) · [FA-002 Project Compass](../01_Product/FA-002-Project-Compass.md) · [FA-003 Project Pulse](../01_Product/FA-003-Project-Pulse.md)

---

# Users

**Primary:** Founder · CEO · Managing Director · Business Owner · Executive Manager

**Secondary:** Operations Manager · General Manager · Finance Manager · Department Heads

---

# Information Hierarchy

| Priority | Content |
|----------|---------|
| 1 | Overall Business Health |
| 2 | Today's Priorities |
| 3 | Critical Alerts |
| 4 | Executive Brief |
| 5 | Recommendations |
| 6 | Business Snapshot |
| 7 | Workspace Shortcuts |

---

# Dashboard Layout

```
+-------------------------------------------------------------+
| Header                                                      |
| Greeting | Date | Search | Notifications | Profile          |
+-------------------------------------------------------------+

| Business Health | Alerts                                   |

+-------------------------------------------------------------+

| Today's Priorities                                         |

+-------------------------------------------------------------+

| Executive Brief                                             |

+-------------------------------------------------------------+

| Top Recommendation                                          |

+-------------------------------------------------------------+

| Business Snapshot                                           |

+-------------------------------------------------------------+

| Workspace Cards                                              |
| Hospitality · Commerce · Finance · Marketing · CRM          |
+-------------------------------------------------------------+
```

---

# Widget Specifications

## Business Health

**Purpose:** Provide an overall score representing the current health of the business.

**Displays:** Health Score · Trend · Previous Score · Status · Confidence

**Actions:** View Details · Open Business Health Workspace

**Platform source:** [Health Engine](../../lib/intelligence/health-engine.ts) via [Provider Registry](../../lib/intelligence/provider-registry.ts) · `aggregateHealth()`

---

## Today's Priorities

**Displays:** Maximum five items.

**Each item includes:** Priority · Title · Description · Owner · Due Date · Status

**Platform source:** [Recommendation Engine](../../lib/intelligence/recommendation-engine.ts) · provider `getPriorities()`

---

## Critical Alerts

**Severity levels:** Critical · High · Medium · Low

**Each alert includes:** Title · Reason · Impact · Recommended Action

**Platform source:** [Recommendation Engine](../../lib/intelligence/recommendation-engine.ts) · provider `getAlerts()`

---

## Executive Brief

**Contains:** Business Summary · Positive Developments · Concerns · Today's Focus

**Platform source:** [Brief Engine](../../lib/intelligence/brief-engine.ts) · `prepareBrief()` · [Intelligence Bus](../../lib/intelligence/intelligence-bus.ts)

---

## Recommendation Card

**Contains:** Recommendation · Business Reason · Priority · Confidence · Expected Benefit · Action Button

**Platform source:** [Recommendation Engine](../../lib/intelligence/recommendation-engine.ts) · [Decision Framework](../05_AI/ORION_Decision_Framework.md)

---

## Business Snapshot

**Shows:** Revenue · Cash Flow · Occupancy · Bookings · Orders · Customers · Marketing · Inventory

**Platform source:** Workspace Summary Providers · `aggregateSummaries()` · workspace `getMetrics()`

---

## Workspace Cards

**Each workspace displays:** Status · Health · Notifications · Quick Action

**Workspaces:** Hospitality · Commerce · Finance · Marketing · CRM

**Platform source:** Registered [Executive Providers](../../lib/intelligence/provider.ts) · `getProviderCardSnapshot()`

---

# Navigation

**Header Navigation:** Dashboard · Hospitality · Commerce · Finance · Marketing · CRM · Reports · Settings

Integrates with existing [Executive Shell](../../app/(platform)/) and [Command Palette](../10_Decisions/ADR-003-Global-Command-Palette.md).

---

# Search

**Global Search** supports: Guests · Customers · Orders · Reservations · Invoices · Products · Documents · Tasks · Recommendations

**Reference:** [ADR-003 — Global Command Palette](../10_Decisions/ADR-003-Global-Command-Palette.md) · Mission 14C

---

# Notifications

**Displays:** Unread Count · Critical Alerts · Mentions · Tasks · Approvals

Per [Non-Negotiables](../00_BLUEPRINT/ORION_Non_Negotiables.md): notifications must matter or not exist.

---

# Responsive Behaviour

| Viewport | Layout |
|----------|--------|
| Desktop | Three-column layout |
| Tablet | Two-column layout |
| Mobile | Single-column; widgets stack vertically |

---

# Empty States

When no data exists, display: friendly illustration · short explanation · suggested next action

---

# Loading States

Use skeleton loaders. Avoid layout shifts.

---

# Error States

Display: simple explanation · retry button · technical details hidden by default

Per acceptance criteria: provider failure affects widget only; remaining widgets continue.

---

# Performance

| Target | Requirement |
|--------|-------------|
| Initial load | Under 2 seconds |
| Widget refresh | Under 500ms |
| Dashboard interactions | Instant |

---

# Accessibility

- Keyboard navigation
- Screen reader support
- High contrast compatibility
- Resizable text
- WCAG 2.2 AA compliance

---

# Data Providers

| Provider | Platform mapping (Mission 17B) |
|----------|-------------------------------|
| Business Health Provider | Health Engine · `PlatformHealthSnapshot` |
| Recommendation Provider | Recommendation Engine · `RecommendationBundle` |
| Alert Provider | Recommendation Engine · `criticalAlerts` |
| Executive Brief Provider | Brief Engine · `ExecutiveBriefSnapshot` |
| Workspace Summary Providers | Provider Registry · `aggregateSummaries()` |
| Notification Provider | Planned (Phase II+) |
| Trend Provider | Planned (future engine) |

**Entry point:** [Intelligence Bus](../../lib/intelligence/intelligence-bus.ts) — Advisor components and Dashboard must not import workspace modules directly.

---

# Dependencies

| Dependency | Status |
|------------|--------|
| Mission 17B — Health Engine | Complete |
| Mission 17B — Recommendation Engine | Complete |
| Mission 17B — Brief Engine | Complete |
| Mission 17B — Intelligence Pipeline | Complete |
| Mission 17B — Provider Registry | Complete |
| Mission 17A — Provider Framework | Complete |
| Alert Engine (dedicated) | Not required — alerts via Recommendation Engine |
| Trend Engine | Planned · [ES-031](./ES-031-Trend-Engine.md) |
| Executive Shell | Complete |
| Finance Executive Provider | Complete |
| CRM Executive Provider | Complete |

---

# Architecture Requirements

- Dashboard consumes [Intelligence Pipeline](../../lib/intelligence/pipeline.ts) output only.
- No direct imports from `lib/crm-*`, `lib/finance-*`, or workspace routes in dashboard widgets.
- Widgets map to engine outputs defined in [engine-models.ts](../../lib/intelligence/engine-models.ts).
- Follow [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) and [Business Workspace Pattern](../03_Architecture/BUSINESS_WORKSPACE_PATTERN.md).

---

# Acceptance Criteria

The dashboard shall:

- [ ] Display within two seconds
- [ ] Show business health from Health Engine aggregation
- [ ] Display executive priorities (max five)
- [ ] Present recommendations with explainability fields
- [ ] Present alerts by severity
- [ ] Support keyboard navigation
- [ ] Operate responsively (375px, 768px, 1280px)
- [ ] Recover gracefully from provider failures (widget-level error states)
- [ ] Pass Verification Hierarchy per [Engineering Standards](../09_Standards/Engineering_Standards.md)
- [ ] Satisfy [Non-Negotiables](../00_BLUEPRINT/ORION_Non_Negotiables.md) Decision Filter

---

# Out of Scope

- Charts
- Custom dashboards
- Drag-and-drop widgets
- Advanced personalization
- AI conversation interface

These features belong to future releases.

---

# Test Scenarios

## Dashboard Loads

**Expected:** All widgets display successfully.

## Provider Failure

**Expected:** Affected widget shows error state. Remaining widgets continue functioning.

## No Alerts

**Expected:** Display "No critical alerts today."

## Mobile Layout

**Expected:** Widgets stack correctly. Navigation remains usable.

## Business Health Changes

**Expected:** Health score updates. Trend indicator changes. Recommendation refreshes.

---

# Future Enhancements

- Custom widgets
- Executive favourites
- Voice summaries
- Predictive insights
- Natural language dashboard
- Cross-company dashboards
- AI executive assistant

---

# Definition of Done

The Executive Dashboard is complete when:

- All widgets function correctly
- All provider integrations pass verification
- Accessibility requirements are met
- Performance targets are achieved
- Documentation is complete (ES, RR, CHANGELOG)
- Test scenarios pass
- Architecture review is approved
- Founder acceptance is received

---

# References

| Document | Location |
|----------|----------|
| ORION Product Bible | [00_BLUEPRINT/ORION_Product_Bible.md](../00_BLUEPRINT/ORION_Product_Bible.md) |
| ORION Non-Negotiables | [00_BLUEPRINT/ORION_Non_Negotiables.md](../00_BLUEPRINT/ORION_Non_Negotiables.md) |
| ORION Project Charter | [00_BLUEPRINT/ORION_Project_Charter.md](../00_BLUEPRINT/ORION_Project_Charter.md) |
| Product Constitution | [01_Product/ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Engineering Manifesto | [09_Standards/ORION_Engineering_Manifesto.md](../09_Standards/ORION_Engineering_Manifesto.md) |
| Intelligence Constitution | [05_AI/ORION_Intelligence_Constitution.md](../05_AI/ORION_Intelligence_Constitution.md) |
| Decision Framework | [05_AI/ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Governance Framework | [09_Standards/ORION_Governance_Framework.md](../09_Standards/ORION_Governance_Framework.md) |
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-026 Marketing Workspace | [ES-026-Marketing-Workspace.md](./ES-026-Marketing-Workspace.md) |
| ES-027 CRM Workspace | [ES-027-CRM-Workspace.md](./ES-027-CRM-Workspace.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-030 Alert Engine | [ES-030-Alert-Engine.md](./ES-030-Alert-Engine.md) |
| ES-031 Trend Engine | [ES-031-Trend-Engine.md](./ES-031-Trend-Engine.md) |
| ES-032 Business Health Engine | [ES-032-Business-Health-Engine.md](./ES-032-Business-Health-Engine.md) |
| ES-033 Event & Messaging Architecture | [ES-033-Event-Messaging-Architecture.md](./ES-033-Event-Messaging-Architecture.md) |
| ES-034 Provider & Data Contract Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-036 Database & Persistence Architecture | [ES-036-Database-Persistence-Architecture.md](./ES-036-Database-Persistence-Architecture.md) |
| ES-037 Authentication & Authorisation Architecture | [ES-037-Authentication-Authorisation-Architecture.md](./ES-037-Authentication-Authorisation-Architecture.md) |
| ES-038 Audit Logging & Observability Architecture | [ES-038-Audit-Logging-Observability-Architecture.md](./ES-038-Audit-Logging-Observability-Architecture.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-040 Sprint 1 Implementation Plan | [ES-040-Sprint-1-Implementation-Plan.md](./ES-040-Sprint-1-Implementation-Plan.md) |
| ES-041 Sprint 1 Work Breakdown Structure | [ES-041-Sprint-1-Work-Breakdown-Structure.md](./ES-041-Sprint-1-Work-Breakdown-Structure.md) |
| ES-042 Sprint 1 Engineering Task Catalogue | [ES-042-Sprint-1-Engineering-Task-Catalogue.md](./ES-042-Sprint-1-Engineering-Task-Catalogue.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| ES-044 Sprint 2 Implementation Plan | [ES-044-Sprint-2-Implementation-Plan.md](./ES-044-Sprint-2-Implementation-Plan.md) |
| ES-045 Sprint 2 Work Breakdown Structure | [ES-045-Sprint-2-Work-Breakdown-Structure.md](./ES-045-Sprint-2-Work-Breakdown-Structure.md) |
| ES-046 Sprint 2 Engineering Task Catalogue | [ES-046-Sprint-2-Engineering-Task-Catalogue.md](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) |
| ES-047 Sprint 3 Implementation Plan | [ES-047-Sprint-3-Implementation-Plan.md](./ES-047-Sprint-3-Implementation-Plan.md) |
| ES-048 Sprint 3 Work Breakdown Structure | [ES-048-Sprint-3-Work-Breakdown-Structure.md](./ES-048-Sprint-3-Work-Breakdown-Structure.md) |
| ES-049 Sprint 3 Engineering Task Catalogue | [ES-049-Sprint-3-Engineering-Task-Catalogue.md](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) |
| ES-050 ORION Enterprise Reference Architecture | [ES-050-ORION-Enterprise-Reference-Architecture.md](./ES-050-ORION-Enterprise-Reference-Architecture.md) |
| ES-051 Technical Roadmap & Product Evolution | [ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md](./ES-051-ORION-Technical-Roadmap-Product-Evolution-Strategy.md) |
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| Engineering Standards | [09_Standards/Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Decision Log | [10_Decisions/ORION_Decision_Log.md](../10_Decisions/ORION_Decision_Log.md) |
| ADR-006 | [10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |

---

# Closing Statement

The Executive Dashboard is not a reporting screen.

It is the executive's daily command center.

Every design decision should reinforce clarity, confidence, and informed leadership.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Record** | Pending (Mission 18A) |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
