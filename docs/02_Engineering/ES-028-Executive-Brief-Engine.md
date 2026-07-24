# ES-028 — Executive Brief Engine

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 17B (core engine delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Mission delivery spec:** [ES-021 — Executive Intelligence Engines](./ES-021-Executive-Intelligence-Engines.md) (17B · Brief Engine module)

---

# Purpose

The Executive Brief Engine is responsible for generating a concise, actionable summary of the organisation's current state.

Rather than displaying raw metrics, the engine synthesises information from all ORION workspaces into an executive briefing that highlights performance, risks, opportunities, and recommended actions.

The Executive Brief is intended to answer one question:

**"What does the executive need to know right now?"**

**Current state:** Core Brief Engine is **implemented** (Mission 17B). `brief-engine.ts` produces `ExecutiveBriefSnapshot` via the Intelligence Pipeline. The Advisor surface at `/advisor` is the primary consumer; Finance and CRM workspace cards consume the Intelligence Bus. Platform-level brief cards and several Advisor sections still use static placeholder data. Full ES-028 output structure, personalisation, delivery channels, and Trend Engine integration — **Construction Phase alignment pending**.

---

# Objectives

The Executive Brief Engine shall:

- Summarise business performance.
- Highlight critical events.
- Prioritise executive attention.
- Surface actionable recommendations.
- Explain business health.
- Identify emerging trends.
- Reduce information overload.
- Support faster executive decisions.

---

# Consumers

| Consumer | Route / Channel | Status |
|----------|-----------------|--------|
| Executive Brief (Advisor) | `/advisor` | Delivered (partial pipeline wiring) |
| Executive Dashboard | `/dashboard` (ES-022) | Specified — not implemented |
| Founder Dashboard | Future | Planned |
| Daily Brief | On-demand via Advisor | Delivered (partial) |
| Mobile Dashboard | Future | Planned |
| Executive Email Digest | Future | Planned |
| Voice Assistant | Future | Planned |
| Future Executive Copilot | Future | Planned |

**Default landing:** `/advisor` per [DL-2026-001](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md)

---

# Inputs

The Executive Brief Engine consumes intelligence from:

| Input | Source | Status |
|-------|--------|--------|
| Finance Workspace | `financeExecutiveProvider` | Delivered |
| CRM Workspace | `crmExecutiveProvider` | Delivered |
| Hospitality Workspace | Hospitality provider | Planned ([ES-023](./ES-023-Hospitality-Workspace.md)) |
| Commerce Workspace | Commerce provider | Planned ([ES-024](./ES-024-Commerce-Workspace.md)) |
| Marketing Workspace | Marketing provider | Planned ([ES-026](./ES-026-Marketing-Workspace.md)) |
| Business Health Engine | [health-engine.ts](../../lib/intelligence/health-engine.ts) | Delivered · [ES-032](./ES-032-Business-Health-Engine.md) |
| Recommendation Engine | [recommendation-engine.ts](../../lib/intelligence/recommendation-engine.ts) | Delivered |
| Alert Engine | Via Recommendation Engine (`criticalAlerts`) | Interim · [ES-030](./ES-030-Alert-Engine.md) |
| Trend Engine | Dedicated module | Planned · [ES-031](./ES-031-Trend-Engine.md) |

**Pipeline order:** Executive Providers → Health Engine → Recommendation Engine → Brief Engine ([pipeline.ts](../../lib/intelligence/pipeline.ts))

---

# Output Structure

Each Executive Brief contains:

| Section | ES-028 | `ExecutiveBriefSnapshot` / UI | Status |
|---------|--------|-------------------------------|--------|
| Executive Summary | Required | `briefingLine` · `weeklySummary` · `executiveNotes` | Partial |
| Business Health | Required | `platformHealth` | Engine delivered · Advisor card static |
| Top Priorities | Required | `topPriorities` | Engine delivered · Advisor card static |
| Critical Alerts | Required | `criticalAlerts` | Engine delivered · partial UI |
| Key Opportunities | Required | `recommendations.opportunities` | Engine delivered · partial UI |
| Performance Highlights | Required | — | Planned |
| Emerging Trends | Required | Trend Engine | Planned |
| Recommended Actions | Required | `executiveRecommendations` · `recommendedAction` | Partial |
| Confidence Score | Required | — | Planned |
| Generated Timestamp | Required | — | Planned |

**Legacy output:** `ExecutiveBriefOutput` via [toExecutiveBriefOutput()](../../lib/intelligence/brief-engine.ts) for Advisor compatibility.

---

# Executive Summary

**Provides:** Overall business condition · major developments · executive focus for the day · estimated reading time

**Delivered (partial):** `prepareExecutiveBrief()` concatenates provider briefing lines; `ExecutiveBrief` component uses static `EXECUTIVE_BRIEF` from `lib/advisor-data.ts` — **pipeline wiring pending**.

---

# Business Health

**Displays:** Overall Health Score · Workspace Health Scores · Trend · Confidence · Primary contributing factors

**Delivered (partial):** `platformHealth` in `ExecutiveBriefSnapshot` via Health Engine. `BusinessHealthCard` uses static data — **pipeline wiring pending**.

---

# Top Priorities

**Displays:** Priority · Description · Business Area · Impact · Urgency · Owner · Suggested Due Date

**Delivered (partial):** `topPriorities` from Recommendation Engine. `PrioritiesCard` uses static `TODAYS_PRIORITIES` — **pipeline wiring pending**.

---

# Critical Alerts

**Displays:** Severity · Category · Business · Description · Impact · Suggested Response · Related Workspace

**Delivered (partial):** `criticalAlerts` aggregated and deduplicated by Recommendation Engine. `RisksCard` and workspace cards surface alerts — partial.

---

# Key Opportunities

**Examples:** Increase pricing · Recover dormant customers · Upsell premium products · Expand inventory · Improve occupancy · Launch marketing campaign · Reduce operating costs · Improve collections

**Delivered (partial):** `recommendations.opportunities` in pipeline output. `OpportunitiesCard` uses static data — **pipeline wiring pending**.

---

# Performance Highlights

**Displays:** Revenue Growth · Occupancy · Customer Satisfaction · Profitability · Cash Position · Marketing Performance · Relationship Growth · Operational Efficiency

**Delivered:** — **planned (ES-028 alignment)**

---

# Emerging Trends

**Displays:** Positive Trends · Negative Trends · Early Warnings · Pattern Recognition · Historical Comparison · Forecast Direction

**Delivered:** Trend Engine — **planned**

---

# Recommended Actions

**Displays:** Action · Business Area · Expected Benefit · Estimated Impact · Priority · Confidence · Owner

**Delivered (partial):** `executiveRecommendations` · `recommendedAction` in snapshot. Workspace cards (Finance, CRM) and `DecisionCard` section — partial static/pipeline mix.

---

# Confidence Score

Each recommendation shall include: Confidence Percentage · Data Quality Rating · Supporting Evidence Count · Last Updated

**Delivered:** — **planned (ES-028 alignment)**

---

# Personalisation

**Supports:** Founder View · CEO View · CFO View · Operations View · Sales View · Marketing View · Hospitality View · Commerce View · Custom Executive Profiles

**Delivered:** Founder-only placeholder session — **planned**

---

# Brief Frequency

**Supports:** On Demand · Daily · Weekly · Monthly · Quarterly · Annual

**Delivered:** On-demand (page load) — scheduled frequencies **planned**

---

# Delivery Channels

Executive Dashboard · Mobile App · Email · PDF · Push Notification · Voice Assistant · API

**Delivered:** Web (`/advisor`) — other channels **planned**

---

# Refresh Behaviour

Real Time · Scheduled Refresh · Manual Refresh · Incremental Updates

**Delivered:** Server render on navigation — incremental/scheduled refresh **planned**

---

# Architecture Requirements

Per [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md):

| Requirement | Implementation |
|-------------|----------------|
| Brief Engine module | [brief-engine.ts](../../lib/intelligence/brief-engine.ts) |
| Engine interface | [engine-interfaces.ts](../../lib/intelligence/brief-engine.ts) · `BriefEngine` |
| Pipeline orchestration | [pipeline.ts](../../lib/intelligence/pipeline.ts) · `runIntelligencePipeline()` |
| Registry delegation | [provider-registry.ts](../../lib/intelligence/provider-registry.ts) · `prepareBrief()` |
| Intelligence Bus | [intelligence-bus.ts](../../lib/intelligence/intelligence-bus.ts) · `generateExecutiveBrief()` |
| Engine models | [engine-models.ts](../../lib/intelligence/engine-models.ts) · `ExecutiveBriefSnapshot` |
| UI consumer | [app/(platform)/advisor/page.tsx](../../app/(platform)/advisor/page.tsx) |
| Workspace cards | `FinanceInsightsCard` · `CustomerInsightsCard` (Intelligence Bus) |

**Prohibited:** Direct workspace imports in Advisor components (ADR-006).

---

# Provider Dependencies

| Provider | Responsibility | Status |
|----------|----------------|--------|
| Business Health Provider | Platform and workspace health | Delivered (Health Engine) |
| Recommendation Provider | Priorities, actions, opportunities | Delivered (Recommendation Engine) |
| Alert Provider | Critical alerts | Delivered (partial) |
| Trend Provider | Emerging trends | Planned |
| Hospitality Provider | Hospitality intelligence | Planned |
| Commerce Provider | Commerce intelligence | Planned |
| Finance Provider | Finance intelligence | Delivered |
| Marketing Provider | Marketing intelligence | Planned |
| CRM Provider | Relationship intelligence | Delivered |

---

# Business Rules

- Only significant events appear in the Executive Summary.
- Recommendations are ranked by executive impact.
- Duplicate alerts are consolidated.
- Business Health is calculated before the brief is generated.
- Confidence scores accompany every recommendation.
- Historical briefs remain immutable.

**Delivered:** Health-before-brief ordering in pipeline · alert deduplication in Recommendation Engine. Confidence scores and immutable brief history — **planned**.

---

# Performance

| Target | Requirement | Status |
|--------|-------------|--------|
| Generate Brief | < 3 seconds | Delivered (engine `statistics.totalMs` tracked) |
| Refresh | Incremental | Planned |
| Maximum Data Age | 5 minutes | Planned |

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

**Delivered:** Advisor page passes Verification Hierarchy (Phase I)

---

# Acceptance Criteria

The engine shall:

- [x] Generate executive summaries (engine layer)
- [x] Aggregate workspace intelligence (Finance + CRM providers)
- [x] Prioritise recommendations (Recommendation Engine)
- [x] Display alerts (partial — engine + workspace cards)
- [ ] Display opportunities (engine yes · full UI pending)
- [ ] Display trends (Trend Engine pending)
- [ ] Support personalisation
- [x] Meet accessibility standards (Advisor surface)
- [x] Achieve required performance targets (engine layer)
- [ ] Wire all Advisor cards to `generateExecutiveBrief()`
- [ ] Confidence scores on all recommendations
- [ ] Full ES-028 output structure in UI

---

# Implementation Status

| Area | Missions | Release Records |
|------|----------|-----------------|
| CRM brief integration | 16B–16D | RR-013 · RR-014 · RR-015 |
| Finance brief integration | 15B–15C | RR-010 · RR-011 |
| Provider framework | 17A | RR-016 |
| Brief Engine + Pipeline | 17B | RR-017 · [ES-021](./ES-021-Executive-Intelligence-Engines.md) |
| ES-028 canonical spec | — | This document |

**Construction Phase gaps:** Full Advisor pipeline wiring · Performance Highlights · Trend Engine · Confidence scores · Personalisation · Delivery channels · Generated timestamp · Hospitality/Commerce/Marketing provider inputs

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Healthy Business | Positive health · few alerts · growth opportunities |
| Critical Financial Risk | Finance alerts dominate · urgent priorities |
| Multiple Workspace Alerts | Alerts consolidated · ranked by severity |
| No Alerts | Brief focuses on opportunities and health |
| Recommendation Generated | Appears in `executiveRecommendations` |
| Low Confidence Data | Confidence score reflects data quality |
| Provider Failure | Brief degrades gracefully; other workspaces intact |
| Partial Data Availability | Brief generated from available providers |
| Manual Refresh | Brief regenerates on navigation |
| Scheduled Refresh | Brief updates per schedule (when delivered) |

---

# Out of Scope

- Natural language conversation
- Predictive simulations
- Board reporting
- Strategic planning assistant

These belong to future intelligence engines.

---

# Future Enhancements

- Executive Copilot · Conversational Briefing · Voice Summary
- Predictive Executive Report · Board Pack Generator
- Scenario Planning · Meeting Preparation · Autonomous Decision Suggestions

---

# Definition of Done

The Executive Brief Engine is complete when:

- Executive summaries are generated correctly from all registered providers
- Workspace intelligence is aggregated via Intelligence Bus only
- Recommendations are prioritised with confidence scores
- Alerts are consolidated
- Emerging trends surface via Trend Engine
- All Advisor and Executive Dashboard sections consume pipeline output
- Performance targets are met
- Accessibility standards are satisfied
- ES-028 acceptance gaps closed
- Founder approval is received

**Status:** Core engine **complete** (17B). Full ES-028 consumer experience and output structure — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-030 Alert Engine | [ES-030-Alert-Engine.md](./ES-030-Alert-Engine.md) |
| ES-032 Business Health Engine | [ES-032-Business-Health-Engine.md](./ES-032-Business-Health-Engine.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-023 Hospitality Workspace | [ES-023-Hospitality-Workspace.md](./ES-023-Hospitality-Workspace.md) |
| ES-024 Commerce Workspace | [ES-024-Commerce-Workspace.md](./ES-024-Commerce-Workspace.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-026 Marketing Workspace | [ES-026-Marketing-Workspace.md](./ES-026-Marketing-Workspace.md) |
| ES-027 CRM Workspace | [ES-027-CRM-Workspace.md](./ES-027-CRM-Workspace.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| DL-2026-001 Default Landing | [DL-2026-001](../10_Decisions/decisions/DL-2026-001-Executive-Brief-Default-Landing.md) |
| ES-044 Sprint 2 Implementation Plan | [ES-044-Sprint-2-Implementation-Plan.md](./ES-044-Sprint-2-Implementation-Plan.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Intelligence Constitution | [ORION_Intelligence_Constitution.md](../05_AI/ORION_Intelligence_Constitution.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Platform README | [lib/intelligence/README.md](../../lib/intelligence/README.md) |

---

# Closing Statement

The Executive Brief Engine transforms distributed operational intelligence into a concise executive briefing that enables leaders to understand the state of their organisation within minutes and take informed action with confidence.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | RR-013 · RR-015 · RR-017 (engine delivered) · ES-028 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
