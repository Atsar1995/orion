# ES-032 — Business Health Engine

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Specification

**Mission:** 17B (core engine delivered) · Construction Phase canonical spec

**Author:** Founder & Chief Architect

**Mission delivery spec:** [ES-021 — Executive Intelligence Engines](./ES-021-Executive-Intelligence-Engines.md) (17B · Health Engine module)

**Implementation module:** [health-engine.ts](../../lib/intelligence/health-engine.ts) (`HealthEngine` interface)

---

# Purpose

The Business Health Engine calculates a unified Business Health Score representing the overall condition of an organisation.

It consolidates operational, financial, commercial, marketing, customer, and strategic indicators into a single, explainable measure that enables executives to understand business performance at a glance.

**Current state:** Core Business Health Engine is **implemented** (Mission 17B). `health-engine.ts` aggregates workspace health from registered Executive Providers into `PlatformHealthSnapshot`, with composite scoring, configurable thresholds, and driver-aware status derivation. CRM workspace computes multi-dimensional health via `crm-health-compute.ts` using engine helpers. Full ES-032 domain model, health grades, confidence scores, weighting templates, historical records, and cross-engine inputs — **Construction Phase alignment pending**.

---

# Objectives

The Business Health Engine shall:

- Calculate Business Health.
- Aggregate workspace intelligence.
- Identify strengths.
- Identify weaknesses.
- Detect deteriorating performance.
- Explain contributing factors.
- Support executive decisions.
- Enable continuous business improvement.

---

# Consumers

| Consumer | Status |
|----------|--------|
| Executive Brief Engine | Delivered (`platformHealth` in brief snapshot) · [ES-028](./ES-028-Executive-Brief-Engine.md) |
| Recommendation Engine | Delivered (parallel in pipeline) · [ES-029](./ES-029-Recommendation-Engine.md) |
| Alert Engine | Planned (domain score impact) · [ES-030](./ES-030-Alert-Engine.md) |
| Trend Engine | Planned · [ES-031](./ES-031-Trend-Engine.md) |
| Executive Dashboard | Specified · [ES-022](./ES-022-Executive-Dashboard.md) |
| Finance Workspace UI | Delivered (`FinanceHealthScore`) |
| CRM Workspace UI | Delivered (`CustomerHealthScore` · `RelationshipHealth`) |
| Marketing Workspace UI | Delivered (partial — `MarketingHealth` on overview) |
| Executive Reports | Planned |
| Mobile Application | Planned |
| Voice Assistant | Planned |
| Future Executive Copilot | Planned |

---

# Inputs

The Business Health Engine consumes intelligence from:

| Input | Source | Status |
|-------|--------|--------|
| Finance Workspace | `financeExecutiveProvider.getHealth()` | Delivered |
| CRM Workspace | `crmExecutiveProvider.getHealth()` · CRM pipeline | Delivered |
| Hospitality Workspace | Hospitality provider | Planned ([ES-023](./ES-023-Hospitality-Workspace.md)) |
| Commerce Workspace | Commerce provider | Planned ([ES-024](./ES-024-Commerce-Workspace.md)) |
| Marketing Workspace | Marketing provider | Planned ([ES-026](./ES-026-Marketing-Workspace.md)) |
| Trend Engine | Temporal context | Planned · [ES-031](./ES-031-Trend-Engine.md) |
| Alert Engine | Severity impact on domains | Planned · [ES-030](./ES-030-Alert-Engine.md) |
| Recommendation Engine | Completion impact | Planned · [ES-029](./ES-029-Recommendation-Engine.md) |
| Historical Business Data | Persistence layer | Planned (v2.x) |

**Pipeline position:** Executive Providers → **Health Engine** → Recommendation Engine → Brief Engine

---

# Business Health Model

Business Health consists of weighted domain scores.

**Core domains (ES-032):** Financial · Operational · Customer · Marketing · Commercial · Relationship · Compliance · Growth · Strategic · Executive Execution

**Delivered (partial):**

| ES-032 Domain | Current implementation | Status |
|---------------|------------------------|--------|
| Financial Health | Finance workspace health score | Partial |
| Customer / Relationship Health | CRM pipeline (customer, relationship, opportunity, portfolio) | Partial |
| Platform aggregate | `platformScore` from workspace provider scores | Delivered |
| Operational · Commercial · Marketing · Compliance · Growth · Strategic · Executive Execution | — | Planned |

---

# Health Score

**Displays:** Overall Business Health Score · Health Grade · Trend · Confidence Score · Last Updated · Primary Drivers · Key Risks · Improvement Opportunities

**Delivered (partial):**

| Field | ES-032 | `PlatformHealthSnapshot` / `HealthScore` | Status |
|-------|--------|------------------------------------------|--------|
| Overall Score | Required | `platformScore` · `score` | Delivered |
| Health Grade | Required | `platformStatus` / `status` (`HealthStatus`) | Partial |
| Trend | Required | `trend` string | Partial |
| Confidence Score | Required | — | Planned |
| Last Updated | Required | — | Planned |
| Primary Drivers | Required | `drivers[]` on workspace health | Partial |
| Key Risks | Required | Via alerts (separate engine) | Partial |
| Improvement Opportunities | Required | Via recommendations | Partial |

---

# Health Grades

Excellent · Good · Stable · Watch · At Risk · Critical

**Delivered (partial):** Platform uses `HealthStatus`: `healthy` · `attention` · `critical` with thresholds in [constants.ts](../../lib/intelligence/constants.ts) (`DEFAULT_HEALTH_THRESHOLDS`). Full grade taxonomy — **planned alignment**.

---

# Domain Score Structure

Each domain contains: Domain Name · Current Score · Previous Score · Percentage Change · Weight · Trend · Confidence · Supporting Metrics · Recommendations · Alerts

**Delivered (partial):** CRM multi-score model in `crm-health-compute.ts`. Platform domain bundle — **planned**.

---

# Scoring Methodology

Each domain score shall be calculated using: Weighted KPIs · Historical Performance · Business Rules · Trend Analysis · Alert Severity · Recommendation Completion · Data Quality · Executive Feedback

**Delivered (partial):**

- `calculateCompositeHealthScore()` — weighted composite
- `deriveHealthStatus()` — threshold + driver-aware status
- `buildHealthScore()` — standard score builder
- Workspace-specific KPI logic in workspace pipelines (CRM)

Full methodology per ES-032 — **planned alignment**.

---

# Weighting Model

**Supports:** Global Default Weights · Industry Templates · Business Templates · Organisation Overrides · Workspace Overrides · Future AI Optimisation

**Delivered (partial):** Equal-weight default in `calculateCompositeHealthScore()` when weights omitted. Configurable weights parameter supported. Templates and overrides — **planned**.

---

# Explainability

Every Business Health Score shall include: Primary Contributors · Negative Contributors · Positive Contributors · Supporting KPIs · Historical Comparison · Calculation Timestamp · Confidence Score

**Delivered (partial):** `HealthDriver[]` on workspace `HealthScore` · platform `summary` string. Full explainability bundle — **planned**.

---

# Confidence Score

**Calculated using:** Data Completeness · Data Freshness · Source Reliability · Historical Consistency · Calculation Quality

**Delivered:** — **planned (ES-032 alignment)**

---

# Business Health History

**Maintain:** Daily · Weekly · Monthly · Quarterly · Annual scores · Historical Trends · Historical Explanations

**Delivered:** — **planned (ES-032 alignment)**

---

# Architecture Requirements

Per [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md):

| Requirement | Implementation |
|-------------|----------------|
| Health Engine module | [health-engine.ts](../../lib/intelligence/health-engine.ts) |
| Engine interface | [engine-interfaces.ts](../../lib/intelligence/engine-interfaces.ts) · `HealthEngine` |
| Platform snapshot | [engine-models.ts](../../lib/intelligence/engine-models.ts) · `PlatformHealthSnapshot` |
| Health model | [models.ts](../../lib/intelligence/models.ts) · `HealthScore` · `HealthDriver` |
| Thresholds | [constants.ts](../../lib/intelligence/constants.ts) · `DEFAULT_HEALTH_THRESHOLDS` |
| Registry delegation | [provider-registry.ts](../../lib/intelligence/provider-registry.ts) · `aggregateHealth()` |
| Intelligence Bus | [intelligence-bus.ts](../../lib/intelligence/intelligence-bus.ts) · `aggregateHealthScores()` |
| Workspace health compute | [crm-health-compute.ts](../../lib/crm/crm-health-compute.ts) (CRM example) |

**Design rule:** Workspace-specific KPI calculations live in workspace pipelines; platform engine aggregates provider output only.

---

# Provider Dependencies

| Provider | Responsibility | Status |
|----------|----------------|--------|
| Hospitality Provider | Hospitality health domain | Planned |
| Commerce Provider | Commercial health domain | Planned |
| Finance Provider | Financial health domain | Delivered |
| Marketing Provider | Marketing health domain | Planned |
| CRM Provider | Customer and relationship health | Delivered |
| Trend Provider | Trend impact on scores | Planned |
| Recommendation Provider | Completion impact | Planned |
| Alert Provider | Severity impact on domains | Planned |
| Historical Data Provider | Historical comparison | Planned |
| Executive Profile Provider | Weighting preferences | Planned |

---

# Business Rules

- Every Business Health Score must be explainable.
- No score may be generated without supporting evidence.
- Low-confidence scores shall be identified.
- Historical scores are immutable.
- Health calculations are repeatable.
- Critical alerts reduce relevant domain scores.
- Completed recommendations may improve future scores where appropriate.

**Delivered (partial):** Repeatable deterministic aggregation · driver-aware status · workspace `drivers`. Confidence, history, alert/recommendation score impact — **planned**.

---

# Performance

| Target | Requirement | Status |
|--------|-------------|--------|
| Business Health Calculation | < 5 seconds | Delivered (`healthEngineMs` tracked) |
| Incremental Refresh | Supported | Planned |
| Maximum Data Age | 5 minutes | Planned |

---

# Accessibility

Keyboard navigation · screen reader support · WCAG 2.2 AA

**Delivered:** Health UI components pass Verification Hierarchy (Finance · CRM · Advisor)

---

# Acceptance Criteria

The engine shall:

- [x] Calculate Business Health (platform composite from providers)
- [ ] Calculate domain scores (full ES-032 domain model)
- [x] Support configurable weighting (weights parameter — partial)
- [x] Provide explainable scoring (drivers — partial)
- [ ] Generate confidence scores
- [ ] Maintain historical records
- [ ] Support incremental refresh
- [x] Meet accessibility standards (consumer UI)
- [x] Meet performance targets (engine layer)

---

# Implementation Status

| Area | Missions | Release Records |
|------|----------|-----------------|
| Finance health scores | 15B | RR-010 |
| CRM multi-dimensional health | 16D | RR-015 |
| Provider `getHealth()` contract | 17A | RR-016 |
| Health Engine + aggregation | 17B | RR-017 · [ES-021](./ES-021-Executive-Intelligence-Engines.md) |
| ES-032 canonical spec | — | This document |

**Construction Phase gaps:** Full domain model · health grades · confidence scores · historical store · weighting templates · Trend/Alert/Recommendation inputs · Hospitality/Commerce/Marketing providers

---

# Test Scenarios

| Scenario | Expected |
|----------|----------|
| Healthy Business | High platform score · healthy status |
| Financial Decline | Finance domain reduces composite |
| Operational Improvement | Domain score increases when provider registered |
| Marketing Recovery | Marketing domain improves composite |
| Customer Satisfaction Increase | CRM customer health improves |
| Multiple Critical Alerts | Status derivation reflects critical drivers |
| Incomplete Data | Low confidence score (when delivered) |
| Historical Comparison | Trend vs previous period |
| Provider Failure | Composite from remaining providers |
| Weight Configuration Change | Composite recalculates with new weights |

---

# Out of Scope

- Machine learning scoring models
- Industry benchmarking
- Macroeconomic indicators
- Predictive health forecasting
- Autonomous business optimisation

These capabilities belong to future intelligence releases.

---

# Future Enhancements

- AI Health Prediction · Executive Health Simulator · Industry Benchmark Scores
- Business Resilience Index · Predictive Health Modelling
- Cross-Business Health Comparison · Strategic Readiness Score · Executive Decision Confidence Score

---

# Definition of Done

The Business Health Engine is complete when:

- Business Health is calculated accurately from all registered providers
- Domain scores are generated per ES-032 model
- Explanations accompany every score with confidence
- Historical health is maintained immutably
- Performance targets are achieved
- Accessibility requirements are satisfied
- ES-032 acceptance gaps closed
- Founder approval is received

**Status:** Core engine **complete** (17B). Full ES-032 domain model and history — **Construction Phase alignment pending**.

---

# References

| Document | Location |
|----------|----------|
| ES-021 Intelligence Engines | [ES-021-Executive-Intelligence-Engines.md](./ES-021-Executive-Intelligence-Engines.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-028 Executive Brief Engine | [ES-028-Executive-Brief-Engine.md](./ES-028-Executive-Brief-Engine.md) |
| ES-029 Recommendation Engine | [ES-029-Recommendation-Engine.md](./ES-029-Recommendation-Engine.md) |
| ES-030 Alert Engine | [ES-030-Alert-Engine.md](./ES-030-Alert-Engine.md) |
| ES-031 Trend Engine | [ES-031-Trend-Engine.md](./ES-031-Trend-Engine.md) |
| ES-025 Finance Workspace | [ES-025-Finance-Workspace.md](./ES-025-Finance-Workspace.md) |
| ES-027 CRM Workspace | [ES-027-CRM-Workspace.md](./ES-027-CRM-Workspace.md) |
| ADR-006 Provider Framework | [ADR-006](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md) |
| Decision Framework | [ORION_Decision_Framework.md](../05_AI/ORION_Decision_Framework.md) |
| Product Constitution | [ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |
| Platform README | [lib/intelligence/README.md](../../lib/intelligence/README.md) |

---

# Closing Statement

The Business Health Engine is the central intelligence model of ORION.

Its purpose is to transform thousands of operational signals into a single, transparent, and explainable measure of organisational health, enabling executives to make faster, better-informed decisions with confidence.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 24 July 2026 |
| **Release Records** | RR-010 · RR-015 · RR-017 (engine delivered) · ES-032 alignment RR pending |

---

### ORION

*Engineering clarity for better executive decisions.*

**Let's build something remarkable.**
