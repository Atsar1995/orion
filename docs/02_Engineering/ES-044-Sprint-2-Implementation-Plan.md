# ES-044 — Sprint 2 Implementation Plan

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Related specifications:** [ES-022 — Executive Dashboard](./ES-022-Executive-Dashboard.md) · [ES-028 — Executive Brief Engine](./ES-028-Executive-Brief-Engine.md) · [ES-040](./ES-040-Sprint-1-Implementation-Plan.md) · [ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md) · [ES-045 — Sprint 2 WBS](./ES-045-Sprint-2-Work-Breakdown-Structure.md) · [ES-046 — Sprint 2 Task Catalogue](./ES-046-Sprint-2-Engineering-Task-Catalogue.md)

---

# Purpose

Sprint 2 delivers the first production-ready executive experience within ORION.

The sprint focuses on implementing the Executive Dashboard and Executive Brief Engine, enabling executives to view key business insights, receive AI-assisted summaries, and interact with the first intelligent features of the platform.

**Current state:** ORION delivers a **substantial executive experience** via `/advisor` (default landing), `/command-center`, and `/mission-control`, with **Brief Engine core delivered** (Mission 17B), Intelligence Pipeline integration on Finance/CRM insight cards, and rich Advisor UI components. **Sprint 2 gaps remain**: unified `/dashboard` routes, dashboard APIs, widget registry, persisted preferences, real AI insights, notification integration, brief history, and full ES-022 dashboard alignment. This document is the **approved Construction Phase Sprint 2 plan** mapped against actual codebase state.

> **Sprint 2 WBS:** [ES-045 — Sprint 2 Work Breakdown Structure](./ES-045-Sprint-2-Work-Breakdown-Structure.md) (Approved · 11 work packages)

> **Task catalogue:** [ES-046 — Sprint 2 Engineering Task Catalogue](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) (Approved · 55 tasks · S2-001–S2-203)

---

# Sprint Goal

Deliver a functional Executive Dashboard with integrated Executive Brief capabilities.

**Status:** **Partial** — Executive Brief surface operational · unified Executive Dashboard per ES-022 — **pending**.

---

# Sprint Duration

**Recommended:** 2 Weeks

---

# Sprint Objectives

| Objective | Status |
|-----------|--------|
| Implement the Executive Dashboard | Partial · `/command-center` · not ES-022 unified dashboard |
| Deliver the Executive Brief Engine | Partial · engine delivered · UI alignment pending |
| Display key business metrics | Partial · workspace KPIs · pipeline health |
| Integrate notification services | Planned |
| Provide AI-assisted executive summaries | Partial · static + pipeline · no LLM |
| Establish dashboard APIs and providers | Partial · Intelligence Bus · no REST |
| Validate end-to-end workflows | Partial · manual only |

---

# Deliverables

## Executive Dashboard

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Dashboard Home | `/advisor` (default) · `/command-center` · `/mission-control` | Partial · not `/dashboard` |
| KPI Widget Framework | Workspace KPI cards · `StatCard` | Partial · no widget registry |
| Executive Summary Panel | `ExecutiveSummaryCard` · Advisor header | Partial |
| Recent Activity Feed | `RecentActivityCard` · workspace activity | Partial · placeholder data |
| Alert Centre | `CriticalAttentionCard` · `RisksCard` · alerts via pipeline | Partial |
| Quick Actions | `QuickActionsCard` (multiple surfaces) | Delivered |
| Navigation Integration | Sidebar · Command Palette | Delivered |
| Responsive Layout | Workspace page patterns | Delivered |

**Spec:** [ES-022 — Executive Dashboard](./ES-022-Executive-Dashboard.md)

## Executive Brief Engine

| Deliverable | Implementation | Status |
|-------------|----------------|--------|
| Daily Brief Generation | `brief-engine.ts` · `generateExecutiveBrief()` | Partial · engine yes · UI mixed |
| Key Metrics Summary | Pipeline health · workspace summaries | Partial |
| Business Highlights | `BusinessSnapshotCard` · static + bus | Partial |
| Emerging Risks | `RisksCard` · recommendation alerts | Partial |
| Recommended Actions | `DecisionCard` · `RECOMMENDED_DECISIONS` | Partial · static |
| Priority Tasks | `PrioritiesCard` · `TODAYS_PRIORITIES` | Partial · static |
| AI Insight Panel | — | Planned · [ES-039](./ES-039-AI-Orchestration-Agent-Framework.md) |
| Brief History | — | Planned |

**Spec:** [ES-028 — Executive Brief Engine](./ES-028-Executive-Brief-Engine.md)

## Dashboard Widgets

| Widget | Source | Status |
|--------|--------|--------|
| Revenue Overview | Finance workspace · `FinanceExecutiveSummary` | Partial · `/finance` not dashboard widget |
| Reservations Summary | Hospitality placeholder | Partial |
| Sales Overview | Commerce nav only | Planned |
| Marketing Performance | Marketing overview | Partial |
| Customer Activity | CRM · `CustomerInsightsCard` on Advisor | Partial · pipeline |
| Finance Snapshot | `FinanceInsightsCard` on Advisor | Partial · pipeline |
| Business Health Score | `BusinessHealthCard` · Health Engine | Partial |
| Trend Indicators | — · [ES-031](./ES-031-Trend-Engine.md) pending | Planned |

## Platform Services

| Service | Implementation | Status |
|---------|----------------|--------|
| Dashboard Provider | — | Planned |
| Brief Provider | `brief-engine.ts` · Intelligence Bus | Partial |
| Widget Registry | — | Planned |
| Metrics Aggregator | `platform-metrics.ts` · pipeline | Partial |
| Notification Integration | Platform contracts | Planned |
| Recommendation Integration | `recommendation-engine.ts` | Delivered · engine |

## APIs

**Target:** Dashboard Data · Executive Brief · Widget Configuration · User Preferences · Dashboard Layout · Notification Feed

**Delivered:** — **planned**. Intelligence consumed in-process via Intelligence Bus — no REST endpoints ([ES-035](./ES-035-API-Design-Standards.md)).

## AI Features

| Feature | Status |
|---------|--------|
| Executive Summary | Partial · static `EXECUTIVE_BRIEF` + aggregated briefing line |
| Insight Generation | Planned · `ai-providers.ts` empty |
| Trend Explanation | Planned · ES-031 |
| Recommendation Preview | Partial · `DecisionCard` · pipeline recommendations |
| Confidence Score | Partial · static in `advisor-data.ts` |
| Source References | Planned |

## User Preferences

Widget Visibility · Dashboard Layout · Theme · Notification Settings · Brief Delivery Schedule

**Delivered:** — **planned**. `/configuration` has notification settings UI · not persisted.

---

# Repository Structure

**Target:**

```
components/dashboard/ · components/widgets/ · providers/dashboard/
providers/brief/ · services/dashboard/ · lib/widgets/ · tests/dashboard/
```

**Delivered (partial):**

| Path | Status |
|------|--------|
| `components/dashboard/` | Delivered · 7 components |
| `components/advisor/` | Delivered · 12 components (Brief surface) |
| `components/command-center/` | Delivered · dashboard-like cards |
| `lib/intelligence/` | Delivered · engines + bus |
| `components/widgets/` | Planned |
| `providers/dashboard/` · `services/dashboard/` | Consolidated in `lib/intelligence/` |
| `tests/dashboard/` | Planned |

---

# Initial Database Additions

Dashboard Preferences · Widget Configuration · Executive Brief History · Dashboard Layout · Insight Cache

**Delivered:** — **planned** ([ES-036](./ES-036-Database-Persistence-Architecture.md))

---

# Provider Implementation

| Provider | Mapping | Status |
|----------|---------|--------|
| Dashboard Provider | — | Planned |
| Brief Provider | `brief-engine.ts` · `intelligence-bus.ts` | Partial |
| Widget Provider | — | Planned |
| Metrics Provider | `platform-metrics.ts` | Partial |
| Insight Provider | Workspace executive providers | Partial |
| Notification Provider | Platform notification contracts | Planned |

---

# Event Implementation

| Event | Status |
|-------|--------|
| DashboardViewed | Planned |
| BriefGenerated | Planned |
| WidgetUpdated | Planned |
| PreferenceChanged | Planned |
| InsightAccepted | Planned |
| InsightDismissed | Planned |

Platform event infrastructure exists ([ES-033](./ES-033-Event-Messaging-Architecture.md)) · dashboard events not emitted.

---

# UI Routes

| ES-044 Route | ORION Route | Status |
|--------------|-------------|--------|
| `/dashboard` | — | Planned · ES-022 target |
| `/dashboard/brief` | `/advisor` (default landing) | Partial |
| `/dashboard/history` | — | Planned |
| `/dashboard/preferences` | `/configuration` (partial) | Partial |

**Decision:** [DL-2026-001](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md) — `/advisor` is current default, not `/dashboard`.

---

# CI/CD Enhancements

Dashboard UI Tests · Widget Snapshot Tests · API Contract Validation · Performance Benchmarks · Accessibility Validation

**Delivered:** — **planned** ([ES-043](./ES-043-Engineering-Governance-Delivery-Standards.md) · ES-042 WP10–WP11)

---

# Testing

Dashboard Rendering · Widget Behaviour · Brief Generation · API Integration · AI Insight Validation · Notification Flow · Accessibility · Performance

**Delivered:** Manual verification in Engineering Standards · automated tests — **planned**.

---

# Security Checklist

| Control | Status |
|---------|--------|
| Dashboard Access Control | Partial · placeholder auth middleware |
| Role Validation | Partial · RBAC helpers |
| Preference Isolation | Planned |
| Audit Logging | Partial · in-memory types |
| API Authorisation | Planned · no REST API |
| Secure Data Retrieval | Partial · tenant session types |

---

# Performance Targets

| Target | ES-044 Goal | Current |
|--------|-------------|---------|
| Dashboard Load | < 2 seconds | Not benchmarked · build succeeds |
| Brief Generation | < 3 seconds | Pipeline sub-second in-process |
| Widget Refresh | < 500 ms | Synchronous · not measured |
| API Response | < 200 ms | N/A · no REST API |

---

# Risks

Incomplete KPI Definitions · AI Insight Quality · Performance Bottlenecks · Data Synchronisation Delays · User Preference Conflicts

**Mitigation (documented):** Incremental widget rollout · caching · fallback summaries · automated performance testing · continuous user feedback.

**Observed:** Static placeholder data in Advisor (`advisor-data.ts`) coexists with pipeline-driven cards — **data synchronisation risk materialised**.

---

# Definition of Ready

Dashboard designs approved · Widget requirements documented · Data sources available · Acceptance criteria defined · Dependencies resolved

**Status:** ES-022 · ES-028 approved · Sprint 1 foundation partial ([ES-040](./ES-040-Sprint-1-Implementation-Plan.md)) · Sprint 2 **ready for gap closure execution**.

---

# Definition of Done

Dashboard operational · Executive Brief generated successfully · Widgets functional · Tests passing · Documentation updated · Performance targets achieved · Founder approval received

**Status:** **Partial** — core engines and Advisor UI delivered · ES-022 unified dashboard · APIs · preferences · automated tests — open.

---

# Acceptance Criteria

Sprint 2 is complete when:

| Criterion | Status |
|-----------|--------|
| Executive Dashboard is accessible | Partial · `/advisor` · `/command-center` · not ES-022 `/dashboard` |
| Executive Brief Engine generates summaries | Partial · engine yes · full ES-028 output pending |
| Widgets display accurate data | Partial · pipeline + placeholder mix |
| Dashboard preferences are persisted | Planned |
| Notifications integrate successfully | Planned |
| AI insights are explainable | Planned · partial static confidence |
| All quality gates pass | Partial · no CI/test suite |

**Sprint 2 completion:** **Partial**.

---

# Implementation Status Summary

| Layer | Delivered | Sprint 2 Gap |
|-------|-----------|--------------|
| Brief Engine (core) | Yes · Mission 17B | Full ES-028 · brief history |
| Advisor UI | Yes · `/advisor` | Wire all cards to pipeline |
| Command Center | Yes · `/command-center` | Merge into ES-022 dashboard |
| Intelligence integration | Partial · Finance/CRM cards | All widgets · Trend Engine |
| Unified Dashboard (ES-022) | No | `/dashboard` · widget registry |
| REST APIs | No | Dashboard · brief · preferences |
| AI insights | No | LLM · explainability |
| Preferences & history | No | Persistence layer |
| Notifications | No | Platform notification runtime |
| Automated tests | No | Dashboard · brief · a11y |

---

# References

| Document | Location |
|----------|----------|
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-030 Alert Engine | [ES-030-Alert-Engine.md](./ES-030-Alert-Engine.md) |
| ES-031 Trend Engine | [ES-031-Trend-Engine.md](./ES-031-Trend-Engine.md) |
| ES-032 Business Health Engine | [ES-032-Business-Health-Engine.md](./ES-032-Business-Health-Engine.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-040 Sprint 1 Implementation Plan | [ES-040-Sprint-1-Implementation-Plan.md](./ES-040-Sprint-1-Implementation-Plan.md) |
| ES-041 Sprint 1 WBS | [ES-041-Sprint-1-Work-Breakdown-Structure.md](./ES-041-Sprint-1-Work-Breakdown-Structure.md) |
| ES-042 Sprint 1 Task Catalogue | [ES-042-Sprint-1-Engineering-Task-Catalogue.md](./ES-042-Sprint-1-Engineering-Task-Catalogue.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| ES-045 Sprint 2 Work Breakdown Structure | [ES-045-Sprint-2-Work-Breakdown-Structure.md](./ES-045-Sprint-2-Work-Breakdown-Structure.md) |
| ES-046 Sprint 2 Engineering Task Catalogue | [ES-046-Sprint-2-Engineering-Task-Catalogue.md](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) |
| DL-2026-001 Default Landing | [DL-2026-001-Executive-Brief-Default-Landing.md](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

Sprint 2 marks the first visible delivery of ORION's Executive Operating System.

It transforms the engineering foundation into a practical executive workspace, combining business intelligence, AI-assisted insights, and operational visibility in a unified dashboard experience.

**Current assessment:** Mission 17B and Advisor UI deliver **core Sprint 2 value early**. Remaining work aligns Advisor/Command Center with ES-022, closes static-data gaps, and adds persistence, APIs, and AI per ES-028 and ES-039.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | ES-044 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
