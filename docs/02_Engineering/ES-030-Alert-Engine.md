# ES-030 — Alert Engine

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 17B (interim aggregation delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Interim implementation:** Alert aggregation currently lives in [recommendation-engine.ts](../../lib/intelligence/recommendation-engine.ts) (`sortAlerts` · `criticalAlerts`). A dedicated `alert-engine.ts` module is **not yet implemented**.

---

# Purpose

The Alert Engine detects, prioritises, and delivers significant business events requiring executive or operational attention.

It consolidates alerts from all ORION workspaces into a single, prioritised alert stream, reducing noise while ensuring that critical events are never overlooked.

**Current state:** Alert **aggregation** is **partially delivered** via the Recommendation Engine and Executive Provider `getAlerts()` contract. Finance and CRM workspaces surface alerts in workspace UI and contribute to the Intelligence Pipeline. Full ES-030 alert model, dedicated engine module, lifecycle, escalation, routing, delivery channels, and alert history — **Construction Phase alignment pending**.

---

# Objectives

The Alert Engine shall:

- Detect business events.
- Prioritise alerts.
- Consolidate duplicate alerts.
- Route alerts to appropriate users.
- Support acknowledgement and resolution.
- Reduce alert fatigue.
- Escalate unresolved critical alerts.
- Maintain complete alert history.

---

# Consumers

| Consumer | Status |
|----------|--------|
| Executive Brief Engine | Delivered (partial — `criticalAlerts` in brief snapshot) · [ES-028](./ES-028-Executive-Brief-Engine.md) |
| Recommendation Engine | Delivered (interim — alert aggregation co-located) · [ES-029](./ES-029-Recommendation-Engine.md) |
| Executive Dashboard | Specified ([ES-022](./ES-022-Executive-Dashboard.md)) |
| Finance Workspace UI | Delivered (`FinanceAlerts`) |
| CRM Workspace UI | Delivered (`CustomerAlerts`) |
| Marketing Workspace UI | Delivered (partial — `CriticalIssues` on overview) |
| Mobile Application | Planned |
| Notification Centre | Planned |
| Voice Assistant | Planned |
| Future Executive Copilot | Planned |

---

# Inputs

The Alert Engine consumes events from:

| Input | Source | Status |
|-------|--------|--------|
| Finance Workspace | `financeExecutiveProvider.getAlerts()` | Delivered |
| CRM Workspace | `crmExecutiveProvider.getAlerts()` | Delivered |
| Hospitality Workspace | Hospitality provider | Planned ([ES-023](./ES-023-Hospitality-Workspace.md)) |
| Commerce Workspace | Commerce provider | Planned ([ES-024](./ES-024-Commerce-Workspace.md)) |
| Marketing Workspace | Marketing provider | Planned ([ES-026](./ES-026-Marketing-Workspace.md)) |
| Business Health Engine | Health threshold breaches | Delivered (partial) |
| Trend Engine | Trend-based early warnings | Planned · [ES-031](./ES-031-Trend-Engine.md) |
| External Integrations | Connected platform (v2.x) | Planned |

---

# Alert Categories

Financial · Operations · Hospitality · Commerce · Marketing · CRM · Inventory · Maintenance · Customer Experience · Guest Experience · Compliance · Security · System · Executive

**Delivered (partial):** `BusinessAlert.category`: `risk` · `follow-up` · `opportunity` · `operational`. Full ES-030 category taxonomy — **planned alignment**.

---

# Alert Structure

Each alert contains:

| Field | ES-030 | `BusinessAlert` | Status |
|-------|--------|-----------------|--------|
| Alert ID | Required | — | Planned |
| Title | Required | — | Planned |
| Summary | Required | `message` (partial) | Partial |
| Description | Required | — | Planned |
| Category | Required | `category?` | Partial |
| Severity | Required | `severity` (`HealthStatus`) | Delivered |
| Priority | Required | — | Planned |
| Business Area | Required | — | Planned |
| Source Workspace | Required | Via provider context | Partial |
| Related Record | Required | — | Planned |
| Owner | Required | — | Planned |
| Status | Required | — | Planned |
| Created Timestamp | Required | — | Planned |
| Updated Timestamp | Required | — | Planned |
| Expiry Timestamp | Required | — | Planned |

---

# Severity Levels

Critical · High · Medium · Low · Informational

**Delivered (partial):** Platform uses `HealthStatus`: `critical` · `attention` · `healthy` mapped to severity weighting in `sortAlerts()`. Full severity taxonomy — **planned alignment**.

---

# Priority Levels

Immediate · Today · This Week · Monitor · Information Only

**Delivered:** — **planned (ES-030 alignment)**

---

# Alert Lifecycle

Detected · Generated · Delivered · Acknowledged · Assigned · Resolved · Closed · Archived

**Delivered:** Generated state only (stateless aggregation on pipeline run). Lifecycle persistence — **planned**.

---

# Alert Actions

Acknowledge · Assign · Comment · Escalate · Resolve · Reopen · Archive · Mute (where permitted)

**Delivered:** — **planned (ES-030 alignment)**

---

# Delivery Channels

Executive Dashboard · Workspace Notifications · Mobile Push · Email · SMS (optional) · Voice Assistant · API

**Delivered (partial):** In-app workspace cards and Advisor `RisksCard` (partial static). Dedicated notification centre and external channels — **planned**.

---

# Escalation Rules

Critical alerts not acknowledged within the configured response window shall be escalated.

Escalation may include: higher management · alternative owner · additional notification channels · repeated reminders

**Delivered:** — **planned (ES-030 alignment)**

---

# Consolidation Rules

Duplicate alerts shall be merged · related alerts grouped · repeated alerts increment occurrence counts

**Delivered (partial):** `sortAlerts()` orders by severity; deduplication and grouping — **planned**.

---

# Alert Routing

Routing may consider: Role · Business Unit · Workspace · Ownership · Severity · Location · Executive Preferences

**Delivered:** — **planned (ES-030 alignment)**

---

# Architecture Requirements

**Target architecture** (Construction Phase):

| Requirement | Target | Current |
|-------------|--------|---------|
| Alert Engine module | `alert-engine.ts` | Not implemented |
| Engine interface | `AlertEngine` in `engine-interfaces.ts` | Not implemented |
| Pipeline integration | Providers → Alert Engine → Recommendation/Brief | Alerts via Recommendation Engine |
| Platform model | Extended `BusinessAlert` or `ExecutiveAlert` | Minimal `BusinessAlert` |
| Registry delegation | `aggregateAlerts()` | Via `recommendationEngine.aggregate()` |
| Intelligence Bus | `aggregateAlerts()` | [intelligence-bus.ts](../../lib/intelligence/intelligence-bus.ts) · `aggregateAlerts()` (delegates to registry) |

Per [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md):

| Current implementation | Location |
|------------------------|----------|
| Provider alert contract | [provider.ts](../../lib/intelligence/provider.ts) · `getAlerts()` |
| Alert aggregation & sort | [recommendation-engine.ts](../../lib/intelligence/recommendation-engine.ts) · `sortAlerts()` · `criticalAlerts` |
| Risk → alert mapping | `mapRiskIndicatorsToAlerts()` |
| Platform metrics | [platform-metrics.ts](../../lib/intelligence/platform-metrics.ts) · `getCriticalAlertCount()` |
| Brief consumption | [brief-engine.ts](../../lib/intelligence/brief-engine.ts) · `criticalAlerts` |

---

# Provider Dependencies

| Provider | Responsibility | Status |
|----------|----------------|--------|
| Hospitality Provider | Hospitality alerts | Planned |
| Commerce Provider | Commerce alerts | Planned |
| Finance Provider | Financial alerts | Delivered |
| Marketing Provider | Marketing alerts | Planned |
| CRM Provider | Relationship alerts | Delivered |
| Business Health Provider | Health-derived alerts | Delivered (partial) |
| Trend Provider | Trend-based alerts | Planned |
| Notification Provider | External delivery | Planned |
| Executive Profile Provider | Routing preferences | Planned |

---

# Business Rules

- Critical alerts always appear first.
- Resolved alerts become read-only.
- Historical alerts remain immutable.
- Every alert requires a source.
- Every alert requires a severity.
- Duplicate alerts are consolidated automatically.

**Delivered (partial):** Severity-first sorting in `sortAlerts()`. Source via provider registration. Deduplication, immutability, resolution — **planned**.

---

# Performance

| Target | Requirement | Status |
|--------|-------------|--------|
| Alert Detection | < 1 second | Delivered (synchronous pipeline) |
| Alert Delivery | < 2 seconds | Partial (in-app only) |
| Dashboard Refresh | Incremental | Planned |
| Maximum Data Age | 1 minute | Planned |

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

**Delivered:** Alert UI components pass Verification Hierarchy (Finance · CRM workspaces)

---

# Acceptance Criteria

The engine shall:

- [x] Generate alerts (via provider `getAlerts()` + workspace layers)
- [x] Prioritise alerts (severity sorting — partial)
- [ ] Route alerts
- [ ] Escalate critical alerts
- [ ] Maintain alert history
- [ ] Consolidate duplicates
- [ ] Support acknowledgement
- [x] Meet performance targets (synchronous aggregation)
- [x] Meet accessibility requirements (consumer UI — partial)

---

# Implementation Status

| Area | Missions | Release Records |
|------|----------|-----------------|
| Finance alerts | 15B | RR-010 |
| CRM alerts | 16B–16C | RR-013 · RR-014 |
| Provider `getAlerts()` contract | 17A | RR-016 |
| Interim alert aggregation | 17B | RR-017 (via Recommendation Engine) |
| ES-030 canonical spec | — | This document |

**Construction Phase work:** Extract dedicated Alert Engine · extend alert model · lifecycle · escalation · routing · notification centre · deduplication · immutable history

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Critical Cash Flow Alert | Surfaces first in alert stream |
| VIP Guest Arrival | Hospitality alert when provider registered |
| Inventory Shortage | Commerce alert when provider registered |
| Supplier Delay | Operational alert with severity |
| Marketing Tracking Failure | Marketing alert when provider registered |
| Duplicate Alert | Consolidated (when dedup delivered) |
| Alert Escalation | Escalates after response window |
| Alert Resolution | Status updated; read-only history |
| Provider Failure | Alerts from remaining providers |
| Mobile Notification | Delivered via notification channel |

---

# Out of Scope

- Emergency services integration
- Physical alarm systems
- Building management systems
- Industrial monitoring

These capabilities belong to specialised platforms or future ORION releases.

---

# Future Enhancements

- Predictive Alerts · AI Alert Prioritisation · Alert Correlation
- Executive Alert Digest · Cross-Business Risk Detection
- Context-Aware Notifications · Adaptive Alert Thresholds · Natural Language Alert Summaries

---

# Definition of Done

The Alert Engine is complete when:

- Alerts are generated correctly from all registered providers
- Alerts are prioritised consistently via dedicated Alert Engine
- Duplicate alerts are consolidated
- Escalation rules function correctly
- Delivery channels operate correctly
- Historical alerts are retained immutably
- Accessibility requirements are met
- Performance targets are achieved
- ES-030 acceptance gaps closed
- Founder approval is received

**Status:** Interim aggregation **delivered** (17B via Recommendation Engine). Dedicated Alert Engine and full ES-030 model — **Construction Phase pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-032 Business Health Engine | [ES-032-Business-Health-Engine.md](./ES-032-Business-Health-Engine.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-027 CRM Workspace | [ES-027-CRM-Workspace.md](./ES-027-CRM-Workspace.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Platform README | [lib/intelligence/README.md](../../lib/intelligence/README.md) |

---

# Closing Statement

The Alert Engine is ORION's real-time awareness system.

Its purpose is to ensure that executives and operational teams receive timely, relevant, and prioritised notifications so that important business events are addressed before they become larger problems.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | RR-010 · RR-013 · RR-017 (interim aggregation) · ES-030 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
