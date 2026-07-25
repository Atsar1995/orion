# ES-064 — Sprint 4 Engineering Task Catalogue

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Parent plan:** [ES-061 — ORION v0.4 Master Development Plan](./ES-061-ORION-v0.4-Master-Development-Plan.md) · [ES-062 — Sprint 4 Implementation Plan](./ES-062-Sprint-4-Implementation-Plan.md) · [ES-063 — Sprint 4 WBS](./ES-063-Sprint-4-Work-Breakdown-Structure.md) · **Architecture:** [ES-065 — Executive Intelligence Architecture](./ES-065-Executive-Intelligence-Architecture.md)

---

# Purpose

The Sprint 4 Engineering Task Catalogue decomposes Sprint 4 intelligence and dashboard work packages into atomic engineering tasks.

Each task is independently implementable, testable, reviewable, and traceable from planning through production deployment. This document is the **official execution checklist for Sprint 4**.

**Task ID convention:** `S4T-xxx` (atomic tasks) · maps to work packages `S4-xxx` in [ES-063](./ES-063-Sprint-4-Work-Breakdown-Structure.md). Platform, API, auth, and integration tasks remain in WBS S4-039–S4-098 and are referenced as **WBS S4-xxx** where they block catalogue tasks.

**Current state:** All **93 tasks** (S4T-001–S4T-108) catalogued with implementation status mapped to the ORION codebase. **Sprint 4 execution is in progress** — core intelligence modules and `/dashboard` delivered on `main` @ `cc4a282` · widget registry, API, CI, legacy migration, and M9 acceptance remain open. Last synced 25 July 2026. See [ES-062](./ES-062-Sprint-4-Implementation-Plan.md).

---

# Task Structure

Each engineering task contains:

| Field | Description |
|-------|-------------|
| **Task ID** | Unique identifier (`S4T-xxx`) |
| **Title** | Short task name |
| **Description** | Scope and deliverable summary |
| **Dependencies** | Prerequisite task IDs |
| **Estimated Hours** | Engineering effort |
| **Priority** | P0 (critical) · P1 (high) · P2 (medium) |
| **Owner** | Responsible discipline |
| **Status** | Open · Partial · Done |
| **Acceptance Criteria** | Definition of complete |

---

# Task Status Summary

| Status | Count | Meaning |
|--------|-------|---------|
| Done | 18 | Delivered and meets task acceptance |
| Partial | 42 | Foundation exists · Sprint 4 acceptance not fully met |
| Open | 33 | Not implemented |

| Section | Tasks | Done | Partial | Open |
|---------|-------|------|---------|------|
| Executive Dashboard | S4T-001–S4T-020 | 4 | 9 | 7 |
| Executive Brief | S4T-021–S4T-032 | 3 | 6 | 5 |
| Recommendation Engine | S4T-040–S4T-048 | 1 | 3 | 5 |
| Alert Engine | S4T-050–S4T-058 | 5 | 2 | 2 |
| Trend Engine | S4T-060–S4T-068 | 0 | 2 | 7 |
| Business Health Engine | S4T-070–S4T-078 | 0 | 4 | 5 |
| Testing | S4T-080–S4T-088 | 1 | 1 | 7 |
| Documentation | S4T-090–S4T-096 | 0 | 2 | 5 |
| Review | S4T-100–S4T-104 | 0 | 0 | 5 |
| Approval | S4T-105–S4T-108 | 0 | 0 | 4 |

**Sprint 4 task completion:** **~19% Done** · **~45% Partial** · **M9 sprint acceptance not met** ([ES-063](./ES-063-Sprint-4-Work-Breakdown-Structure.md))

---

# Executive Dashboard

**Spec:** [ES-022 — Executive Dashboard](./ES-022-Executive-Dashboard.md) · **WBS:** S4-001–S4-022 · S4-013–S4-018

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-001 | Create `/dashboard` Route and Layout Shell | Add canonical dashboard page at `/dashboard` using `DashboardLayout` with ES-022 layout zones | — | 8h | P0 | Frontend Engineer | **Done** | Route live · layout zones defined · responsive shell at 1280/768/375px |
| S4T-002 | Implement 12-Column Responsive Grid | Build unified dashboard grid with breakpoint reflow and widget slot containers | S4T-001 | 6h | P0 | Frontend Engineer | **Partial** | 12-column grid documented · widgets reflow at breakpoints · ES-022 aligned |
| S4T-003 | Build KPI Card Base Component | Reusable KPI widget with value, label, trend slot, and workspace attribution | S4T-001 | 5h | P0 | Frontend Engineer | **Partial** | `KpiWidget` component · trend up/down/neutral · workspace label prop |
| S4T-004 | Implement Widget Registry Module | Central registry mapping widget IDs to components, providers, and default configs | S4T-001 | 6h | P0 | Platform Engineer | **Open** | `WidgetRegistry` · register/unregister · type-safe definitions · barrel export |
| S4T-005 | Build Widget Loader | Dynamic widget instantiation from registry with lazy loading and error isolation | S4T-004 | 5h | P0 | Frontend Engineer | **Open** | Dashboard renders from registry · failed widget isolated · lazy import supported |
| S4T-006 | Wire Executive Metrics Panel | Aggregate `platform-metrics.ts` and provider health into dashboard metrics row | S4T-001 · S4T-070 | 6h | P0 | Backend Engineer | **Partial** | Metrics row uses pipeline data · no static Finance/CRM bypass |
| S4T-007 | Build Revenue KPI Dashboard Widget | Register revenue KPI widget fed by Finance executive provider | S4T-004 · S4T-003 | 4h | P0 | Frontend Engineer | **Partial** | Widget registered · live Finance data · trend indicator |
| S4T-008 | Build Business Health Dashboard Widget | Register platform health widget from Health Engine on dashboard grid | S4T-004 · S4T-074 | 5h | P0 | Frontend Engineer | **Partial** | Health widget on dashboard · score + drivers · registry-driven |
| S4T-009 | Build Workspace KPI Widget Set | KPI widgets for CRM, Marketing, Hospitality, and Commerce headline metrics | S4T-004 · S4T-003 | 8h | P1 | Frontend Engineer | **Open** | ≥4 workspace KPI widgets registered · provider-fed |
| S4T-010 | Implement Trend Indicator Components | Shared trend badge, delta, and period comparison for KPI widgets | S4T-003 · S4T-066 | 4h | P1 | Frontend Engineer | **Open** | Reusable trend components · Trend Engine fed · period labels correct |
| S4T-011 | Build Executive Summary Hero Panel | Dashboard hero panel rendering Brief Engine narrative | S4T-001 · S4T-023 | 5h | P0 | Frontend Engineer | **Partial** | Summary from `generateExecutiveBrief()` · no static copy |
| S4T-012 | Implement Recent Activity Feed | Cross-workspace activity stream with categorisation and timestamps | S4T-001 | 6h | P1 | Frontend Engineer | **Partial** | Feed component · ≥3 workspace sources · chronological sort |
| S4T-013 | Build Alert Centre Panel | Unified alert surface with severity filters fed by Alert Engine | S4T-001 · S4T-054 | 6h | P0 | Frontend Engineer | **Done** | `AlertPanel` · Critical/Recent/Resolved · counts |
| S4T-014 | Configure Dashboard Routing and Aliases | Make `/dashboard` canonical; configure `/advisor` alias and redirects | S4T-001 | 4h | P0 | Frontend Engineer | **Open** | `/dashboard` canonical · alias/redirect works · ES-022 routing met |
| S4T-015 | Update Navigation and Command Palette | Sidebar, breadcrumbs, and palette entries for dashboard as primary executive entry | S4T-014 | 3h | P0 | Frontend Engineer | **Partial** | Sidebar highlights Dashboard · palette finds widgets · landing configurable |
| S4T-016 | Implement Widget Configuration Engine | Per-widget and per-user configuration schema with validation | S4T-004 | 6h | P1 | Backend Engineer | **Open** | Typed config schema · defaults · validation on save |
| S4T-017 | Build Widget Refresh Service | Polling and event-driven refresh intervals per widget type | S4T-004 | 5h | P1 | Backend Engineer | **Open** | Configurable intervals · pipeline events trigger refresh · stale UI indicator |
| S4T-018 | Wire Dashboard Preferences API | Connect widget layout and visibility to preferences endpoint | S4T-004 · S4T-031 | 6h | P1 | Frontend Engineer | **Open** | Show/hide widgets · layout order persisted · restored on reload |
| S4T-019 | Add Dashboard Loading and Error States | Empty, loading, and per-widget error boundaries across dashboard | S4T-001 | 4h | P1 | Frontend Engineer | **Partial** | `LoadingState` · `EmptyState` · error boundary per widget · accessible |
| S4T-020 | Integrate Chart Widgets with Trend Engine | Dashboard chart widgets for revenue, occupancy, pipeline, and health trends | S4T-001 · S4T-062 | 8h | P1 | Frontend Engineer | **Open** | ≥4 chart widgets · Trend Engine fed · ES-008 compliant |

**Section status:** 0 Done · 10 Partial · 10 Open

---

# Executive Brief

**Spec:** [ES-028 — Executive Brief Engine](./ES-028-Executive-Brief-Engine.md) · **WBS:** S4-023 · S4-024 · S4-034 · S4-037 · S4-070

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-021 | Complete Brief Provider Aggregation | Extend Brief Engine to aggregate summaries from all six executive providers | S4T-070 | 6h | P0 | AI Engineer | **Partial** | All registered providers contribute · no missing workspace sections |
| S4T-022 | Remove Static Brief Bypass on Advisor | Refactor Advisor brief sections to consume pipeline output exclusively | S4T-021 | 6h | P0 | Frontend Engineer | **Partial** | No static brief copy on Advisor · pipeline hooks only |
| S4T-023 | Wire ExecutiveSummaryCard to Brief Engine | Connect dashboard and Advisor summary cards to `generateExecutiveBrief()` | S4T-021 | 4h | P0 | Frontend Engineer | **Partial** | Card renders live brief · refreshes on pipeline run |
| S4T-024 | Implement Workspace Brief Section Templates | Typed brief section templates per workspace domain in brief output | S4T-021 | 5h | P1 | AI Engineer | **Open** | Section per workspace · consistent schema · ES-028 aligned |
| S4T-025 | Build Brief History Storage | Persist and retrieve historical brief outputs with timestamps | S4T-021 | 6h | P1 | Backend Engineer | **Open** | Latest + previous briefs retrievable · storage interface defined |
| S4T-026 | Add Scheduled Brief Generation Hooks | Configuration hooks for scheduled brief generation (cron-ready interface) | S4T-025 | 4h | P2 | Backend Engineer | **Open** | Schedule config stub · generation callable · documented |
| S4T-027 | Wire PrioritiesCard to Brief Engine | Connect `PrioritiesCard` to Brief Engine priority output | S4T-021 · S4T-022 | 4h | P0 | Frontend Engineer | **Partial** | Priorities from engine · no `TODAYS_PRIORITIES` static array |
| S4T-028 | Integrate Brief into Command Center | Align Command Center brief sections with Dashboard pipeline source | S4T-022 | 4h | P1 | Frontend Engineer | **Partial** | Command Center brief matches Dashboard · single source |
| S4T-029 | Wire Cross-Workspace Brief Sections | Ensure Finance, CRM, Marketing, Hospitality, Commerce sections appear on Brief | S4T-021 · S4T-024 | 5h | P0 | AI Engineer | **Partial** | Six sections when providers registered · Finance/CRM today |
| S4T-030 | Implement Brief Engine Pipeline Registration | Register Brief Engine in orchestrator with error isolation and logging | S4T-021 | 3h | P0 | Platform Engineer | **Partial** | Engine registered · pipeline invokes · errors isolated |
| S4T-031 | Implement GET `/api/v1/brief` | REST endpoint returning current brief from pipeline | S4T-021 · WBS S4-049 | 5h | P0 | Backend Engineer | **Open** | Authenticated endpoint · ES-035 envelope · pipeline output |
| S4T-032 | Implement GET `/api/v1/brief/history` | REST endpoint returning brief history with pagination | S4T-025 · S4T-031 | 4h | P1 | Backend Engineer | **Open** | History endpoint · paginated · authenticated |

**Section status:** 0 Done · 7 Partial · 5 Open

---

# Recommendation Engine

**Spec:** [ES-029 — Recommendation Engine](./ES-029-Recommendation-Engine.md) · **WBS:** S4-025 · S4-037

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-040 | Extend Recommendation Model | Add reasoning, evidence, confidence, and source fields to `ExecutiveRecommendation` | — | 4h | P0 | Platform Engineer | **Open** | Types extended · ES-057 fields · backward compatible |
| S4T-041 | Implement Reasoning and Evidence | Populate reasoning and evidence references on aggregated recommendations | S4T-040 | 6h | P0 | AI Engineer | **Open** | Each recommendation includes reasoning · evidence refs · provider attributed |
| S4T-042 | Add Confidence Scoring | Implement confidence score calculation per recommendation per ES-057 | S4T-040 | 4h | P0 | AI Engineer | **Partial** | Confidence 0–1 on each recommendation · documented formula |
| S4T-043 | Wire DecisionCard to Recommendation Engine | Refactor `DecisionCard` to render pipeline recommendations only | S4T-041 · S4T-022 | 5h | P0 | Frontend Engineer | **Partial** | Decisions from engine · no `RECOMMENDED_DECISIONS` static |
| S4T-044 | Remove Static Decision Arrays | Delete or gate static decision data from `advisor-data.ts` for recommendations | S4T-043 | 3h | P0 | Frontend Engineer | **Open** | No static decision bypass in Advisor · TD noted if deferred |
| S4T-045 | Add Recommendation Acceptance Tracking | Stub acceptance/dismissal tracking for executive recommendations | S4T-040 | 4h | P2 | Backend Engineer | **Open** | Track accept/dismiss events · audit-ready interface |
| S4T-046 | Implement GET `/api/v1/recommendations` | REST endpoint returning recommendations with filters | S4T-041 · WBS S4-049 | 5h | P1 | Backend Engineer | **Open** | Paginated · filter by workspace/priority · authenticated |
| S4T-047 | Add Explainability to Advisor UI | Display reasoning, evidence, and confidence on recommendation cards | S4T-041 · S4T-043 | 5h | P0 | Frontend Engineer | **Open** | UI shows reasoning · evidence tooltip · confidence badge |
| S4T-048 | Unit Tests — Recommendation Explainability | Unit tests for explainability fields and aggregation logic | S4T-041 · S4T-080 | 6h | P0 | QA Engineer | **Open** | Tests cover reasoning · evidence · confidence · CI runnable |

**Section status:** 0 Done · 2 Partial · 7 Open

---

# Alert Engine

**Spec:** [ES-030 — Alert Engine](./ES-030-Alert-Engine.md) · **WBS:** S4-026 · S4-027

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-050 | Extract `alert-engine.ts` Module | Create dedicated Alert Engine module separate from interim `getAlerts()` | — | 6h | P0 | Backend Engineer | **Done** | `lib/intelligence/alerts/` · rule engine · prioritizer |
| S4T-051 | Define Alert Severity Rules | Configurable severity classification (critical, warning, info) with rule documentation | S4T-050 | 4h | P0 | Backend Engineer | **Done** | `AlertRules.ts` · 10 configuration-driven rules |
| S4T-052 | Register Alert Engine in Pipeline | Wire Alert Engine into intelligence pipeline orchestrator | S4T-050 | 3h | P0 | Platform Engineer | **Done** | `evaluate-alerts` stage in `PipelineRunner` |
| S4T-053 | Build Notification Bridge Interface | Define notification delivery interface stub for critical alerts | S4T-051 | 4h | P1 | Backend Engineer | **Open** | Interface defined · stub implementation · ES-033 hook documented |
| S4T-054 | Wire Alert Centre to Alert Engine | Connect dashboard alert panel to Alert Engine output with filters | S4T-050 · S4T-013 | 4h | P0 | Frontend Engineer | **Done** | `AlertPanel` consumes `alertPanel` snapshot |
| S4T-055 | Wire RisksCard to Alert Engine | Refactor `RisksCard` to consume Alert Engine instead of interim aggregation | S4T-050 · S4T-022 | 4h | P0 | Frontend Engineer | **Partial** | Risks from Alert Engine · no interim bypass |
| S4T-056 | Remove Interim Alert Aggregation | Deprecate interim `getAlerts()` path once Alert Engine is live | S4T-052 · S4T-054 | 3h | P0 | Backend Engineer | **Open** | Single alert path through engine · interim code removed or gated |
| S4T-057 | Implement GET `/api/v1/alerts` | REST endpoint returning alerts with severity and workspace filters | S4T-050 · WBS S4-049 | 5h | P1 | Backend Engineer | **Open** | Paginated alerts · severity filter · authenticated |
| S4T-058 | Unit Tests — Alert Engine | Unit tests for severity rules, aggregation, and edge cases | S4T-050 · S4T-080 | 6h | P0 | QA Engineer | **Open** | Severity tests · empty provider · CI runnable |

**Section status:** 0 Done · 3 Partial · 6 Open

---

# Trend Engine

**Spec:** [ES-031 — Trend Engine](./ES-031-Trend-Engine.md) · **WBS:** S4-028 · S4-029 · S4-004 · S4-022

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-060 | Define Trend Series Models | Add trend series types and period comparison models to `lib/intelligence/models.ts` | — | 4h | P1 | Platform Engineer | **Open** | Types defined · period enum · comparison fields documented |
| S4T-061 | Extend Provider Trend Contract | Add `aggregateTrends()` to executive provider interface per ES-034 | S4T-060 | 4h | P1 | Platform Engineer | **Open** | Interface extended · Finance/CRM implement first · validation in registry |
| S4T-062 | Implement `trend-engine.ts` Core | Build Trend Engine with time-series aggregation and period comparison | S4T-060 · S4T-061 | 8h | P1 | Backend Engineer | **Open** | Engine implements interface · period comparison · ES-031 acceptance |
| S4T-063 | Register Trend Engine in Pipeline | Wire Trend Engine into intelligence pipeline orchestrator | S4T-062 | 3h | P1 | Platform Engineer | **Open** | Engine registered · output available on bus |
| S4T-064 | Finance Provider Trend Aggregation | Implement Finance executive provider `aggregateTrends()` | S4T-061 | 5h | P1 | Backend Engineer | **Open** | Revenue/cash trends returned · valid series data |
| S4T-065 | CRM Provider Trend Aggregation | Implement CRM executive provider `aggregateTrends()` | S4T-061 | 5h | P1 | Backend Engineer | **Open** | Pipeline/health trends returned · valid series data |
| S4T-066 | Feed KPI Widgets from Trend Engine | Connect trend indicators and chart widgets to Trend Engine output | S4T-062 · S4T-010 | 5h | P1 | Frontend Engineer | **Open** | KPI trends live · charts use engine data |
| S4T-067 | Add Marketing and Hospitality Trend Stubs | Stub trend aggregation for Marketing and Hospitality providers | S4T-061 | 4h | P2 | Backend Engineer | **Open** | Stub series returned · ready for connector data |
| S4T-068 | Unit Tests — Trend Engine | Unit tests for trend calculation, periods, and empty data | S4T-062 · S4T-080 | 6h | P1 | QA Engineer | **Open** | Period comparison tests · empty provider · CI runnable |

**Section status:** 0 Done · 0 Partial · 9 Open

---

# Business Health Engine

**Spec:** [ES-032 — Business Health Engine](./ES-032-Business-Health-Engine.md) · **WBS:** S4-030 · S4-020 · S4-071

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-070 | Register Finance Provider in Health Scoring | Ensure Finance provider fully participates in Health Engine aggregation | — | 3h | P0 | Backend Engineer | **Partial** | Finance health in platform score · TD-001 path clear |
| S4T-071 | Register CRM Provider in Health Scoring | Ensure CRM provider fully participates in Health Engine aggregation | — | 3h | P0 | Backend Engineer | **Partial** | CRM health in platform score · TD-002 path clear |
| S4T-072 | Register Marketing Provider in Health Scoring | Add Marketing executive provider to Health Engine scoring | WBS S4-059 | 4h | P1 | Backend Engineer | **Open** | Marketing contributes to platform score · driver listed |
| S4T-073 | Register Hospitality Provider in Health Scoring | Add Hospitality executive provider to Health Engine scoring | WBS S4-060 | 4h | P0 | Backend Engineer | **Open** | Hospitality contributes to platform score · driver listed |
| S4T-074 | Register Commerce Provider in Health Scoring | Add Commerce executive provider stub to Health Engine scoring | WBS S4-061 | 4h | P1 | Backend Engineer | **Open** | Commerce stub in platform score · driver listed |
| S4T-075 | Implement Platform Health Driver Breakdown UI | UI showing per-domain health drivers on dashboard and Advisor | S4T-070–S4T-074 | 5h | P1 | Frontend Engineer | **Partial** | Driver breakdown visible · links to workspaces |
| S4T-076 | Add Workspace Health Chips to Dashboard | Per-workspace health chips with colour coding on dashboard header | S4T-070–S4T-074 | 4h | P1 | Frontend Engineer | **Open** | Six chips when providers registered · colour by score |
| S4T-077 | Remove Static Health from Advisor Data | Remove static health scores from `advisor-data.ts`; use Health Engine only | S4T-070 · S4T-071 | 3h | P0 | Frontend Engineer | **Open** | No static health bypass · engine-only on Advisor |
| S4T-078 | Unit Tests — Multi-Provider Health Engine | Unit tests for Health Engine with zero, one, and six providers | S4T-074 · S4T-080 | 6h | P0 | QA Engineer | **Open** | Multi-provider tests · driver aggregation · CI runnable |

**Section status:** 0 Done · 3 Partial · 6 Open

---

# Testing

**Spec:** [ES-054 — Quality Assurance](./ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) · **WBS:** S4-099–S4-106

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-080 | Configure Unit Test Runner and CI | Set up Vitest/Jest, fixtures, and CI job for unit tests | S4T-043 | 8h | P0 | QA Engineer | **Partial** | Vitest configured locally · CI Phase B not wired |
| S4T-081 | Intelligence Engine Unit Test Suite | Unit tests for Brief, Recommendation, Alert, Trend, and Health engines | S4T-030 · S4T-050 · S4T-062 | 12h | P0 | QA Engineer | **Open** | ≥1 test file per engine · happy path + empty provider |
| S4T-082 | Provider Contract Compliance Tests | Automated tests validating executive provider contract methods | S4T-061 | 8h | P0 | QA Engineer | **Open** | Finance, CRM, Marketing, Hospitality, Commerce validated |
| S4T-083 | Dashboard Integration Tests | Integration tests for dashboard pipeline and widget rendering | S4T-005 · S4T-080 | 10h | P0 | QA Engineer | **Open** | Dashboard loads · widgets render · pipeline mocked · CI green |
| S4T-084 | API Integration Tests — v1 Endpoints | Integration tests for brief, recommendations, alerts, and dashboard APIs | S4T-031 · S4T-046 · S4T-057 | 10h | P0 | QA Engineer | **Open** | Auth 401/200 paths · ES-035 envelope validated |
| S4T-085 | Advisor E2E Workflow Tests | End-to-end test for Advisor brief, recommendations, and alert flow | S4T-022 · S4T-080 | 12h | P1 | QA Engineer | **Open** | Playwright E2E · brief visible · recommendation card · optional CI |
| S4T-086 | Accessibility Audit — Dashboard and Advisor | WCAG-oriented audit of unified dashboard and Advisor surfaces | S4T-001 | 8h | P1 | QA Engineer | **Open** | Audit checklist complete · critical issues filed · ES-054 |
| S4T-087 | Performance Baseline — Intelligence Pipeline | Benchmark pipeline execution and dashboard load; document p95 targets | S4T-030 | 6h | P2 | QA Engineer | **Open** | Baseline documented · p95 < 500ms target · regression stub |
| S4T-088 | Engine Interface Compliance Audit | Automated audit that all five engines implement `engine-interfaces.ts` | S4T-030 · S4T-050 · S4T-062 | 4h | P0 | Platform Engineer | **Open** | Audit script or test · fails CI if non-compliant |

**Section status:** 0 Done · 0 Partial · 9 Open

---

# Documentation

**WBS:** S4-107–S4-110

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-090 | Author RR-018 Sprint 4 Release Record | Write RR-018 documenting Sprint 4 v0.4 Phase 1 delivery and verification | S4T-108 | 4h | P1 | Technical Writer | **Open** | RR-018 published · verification hierarchy · mission mapping |
| S4T-091 | Write API Documentation — v1 Endpoints | Document `/api/v1/brief`, recommendations, alerts, and dashboard endpoints | S4T-031 · S4T-046 · S4T-057 | 6h | P1 | Technical Writer | **Open** | OpenAPI or markdown docs · ES-035 compliant |
| S4T-092 | Write Widget Developer Guide | Guide for registering dashboard widgets via widget registry | S4T-004 | 6h | P2 | Technical Writer | **Open** | Developer guide · code example · ES-022 cross-ref |
| S4T-093 | Update ES-061 Deliverables Checklist | Update ES-061 checklist and status tables post-Sprint 4 execution | S4T-108 | 4h | P1 | Technical Writer | **Open** | ES-061 checklist current · status reflects Sprint 4 |
| S4T-094 | Update CHANGELOG for Sprint 4 | Add Sprint 4 delivery entries to CHANGELOG | S4T-108 | 2h | P1 | Technical Writer | **Open** | CHANGELOG section · ES-064 referenced |
| S4T-095 | Update Intelligence Layer README | Document Alert/Trend engine extraction and pipeline changes in `lib/intelligence/README.md` | S4T-050 · S4T-062 | 3h | P1 | Technical Writer | **Open** | README reflects six engines · pipeline diagram updated |
| S4T-096 | Cross-Reference Governance Docs | Update baseline, backlog, and governance framework with ES-064 | — | 3h | P2 | Technical Writer | **Partial** | ES-063 registered · ES-064 registered in key docs |

**Section status:** 0 Done · 1 Partial · 6 Open

---

# Review

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-100 | Architecture Review — Dashboard and Widget Framework | Review ES-022 alignment, widget registry design, and pipeline integration | S4T-005 · S4T-004 | 4h | P0 | Chief Architect | **Open** | Review notes filed · ADR if needed · ES-022 gaps closed |
| S4T-101 | Security Review — Auth and API Scope | Review authentication, API auth middleware, and secrets for Sprint 4 endpoints | S4T-031 · WBS S4-049 | 4h | P0 | Platform Engineer | **Open** | Security checklist complete · ES-059 alignment · no secrets in code |
| S4T-102 | Code Review Gate — All P0 PRs | Ensure all P0 Sprint 4 pull requests pass ES-043 code review | S4T-022 · S4T-043 · S4T-050 | 8h | P0 | Engineering Lead | **Open** | All P0 PRs reviewed · no open blockers · lint/tsc clean |
| S4T-103 | AI Governance Review — Explainability | Review recommendation explainability and Brief output against ES-057 | S4T-041 · S4T-047 | 3h | P0 | Founder / AI Engineer | **Open** | ES-057 checklist passed · human oversight documented |
| S4T-104 | QA Sign-Off — Test Suite and Coverage | QA sign-off on test suite execution and coverage report for Sprint 4 scope | S4T-081 · S4T-083 · S4T-084 | 4h | P0 | QA Engineer | **Open** | Test report signed · critical paths covered · gaps documented |

**Section status:** 0 Done · 0 Partial · 5 Open

---

# Approval

| Task ID | Title | Description | Dependencies | Hours | Priority | Owner | Status | Acceptance Criteria |
|---------|-------|-------------|--------------|-------|----------|-------|--------|---------------------|
| S4T-105 | Founder Review — Executive Dashboard | Founder acceptance of ES-022 Executive Dashboard Sprint 4 deliverables | S4T-001 · S4T-014 · S4T-100 | 2h | P0 | Founder | **Open** | ES-022 minimum acceptance verified · sign-off recorded |
| S4T-106 | Founder Review — Intelligence Engines | Founder acceptance of Brief, Recommendation, Alert, Trend, and Health engines | S4T-030 · S4T-050 · S4T-062 · S4T-074 | 2h | P0 | Founder | **Open** | Six engines operational or documented deferral · sign-off recorded |
| S4T-107 | Chief Architect Sign-Off — Sprint 4 Technical | Chief Architect confirms technical completion against ES-063 WBS | S4T-102 · S4T-104 | 2h | P0 | Chief Architect | **Open** | WBS P0 items complete or deferred with RR · sign-off recorded |
| S4T-108 | Sprint 4 Acceptance — M9 Milestone | Formal Sprint 4 acceptance per ES-063 M9 and ES-061 Phase 1 criteria | S4T-105 · S4T-106 · S4T-107 | 2h | P0 | Founder · Chief Architect | **Open** | M9 met · RR-018 authorised · Sprint 4 closed |

**Section status:** 0 Done · 0 Partial · 4 Open

---

# Sprint Metrics

| Metric | Value |
|--------|-------|
| Total Sections | 10 |
| Catalogued Tasks | 93 |
| Sprint Duration | 4 Weeks (recommended) |
| Tasks Done | 0 |
| Tasks Partial | 26 |
| Tasks Open | 67 |
| Parallel Streams | Frontend · Backend · Platform · AI · QA · Documentation · Review · Approval |

---

# Open Task Backlog (P0 Priority)

Execute in dependency order per [ES-063](./ES-063-Sprint-4-Work-Breakdown-Structure.md):

1. **S4T-001 · S4T-014** — Dashboard route and routing (`/dashboard`)
2. **S4T-004 · S4T-005** — Widget registry and loader
3. **S4T-050 · S4T-052 · S4T-056** — Alert Engine extraction and pipeline registration
4. **S4T-021 · S4T-022 · S4T-023** — Brief Engine completion and Advisor wiring
5. **S4T-040 · S4T-041 · S4T-043 · S4T-044** — Recommendation explainability and DecisionCard
6. **S4T-070 · S4T-071 · S4T-077** — Health Engine multi-provider and static removal
7. **S4T-031 · S4T-046 · S4T-057** — REST API endpoints (requires WBS S4-049 API foundation)
8. **S4T-080 · S4T-081 · S4T-088** — Test foundation and engine tests
9. **S4T-100 · S4T-102 · S4T-104** — Review gates
10. **S4T-105 · S4T-106 · S4T-107 · S4T-108** — Approval and sprint closure

---

# Execution Checklist

Use this checklist to track Sprint 4 execution. Mark tasks **Done** in work tracking tools using Task IDs `S4T-xxx`.

## Executive Dashboard

- [ ] S4T-001 Create `/dashboard` Route and Layout Shell
- [ ] S4T-002 Implement 12-Column Responsive Grid
- [ ] S4T-003 Build KPI Card Base Component
- [ ] S4T-004 Implement Widget Registry Module
- [ ] S4T-005 Build Widget Loader
- [ ] S4T-006 Wire Executive Metrics Panel
- [ ] S4T-007 Build Revenue KPI Dashboard Widget
- [ ] S4T-008 Build Business Health Dashboard Widget
- [ ] S4T-009 Build Workspace KPI Widget Set
- [ ] S4T-010 Implement Trend Indicator Components
- [ ] S4T-011 Build Executive Summary Hero Panel
- [ ] S4T-012 Implement Recent Activity Feed
- [ ] S4T-013 Build Alert Centre Panel
- [ ] S4T-014 Configure Dashboard Routing and Aliases
- [ ] S4T-015 Update Navigation and Command Palette
- [ ] S4T-016 Implement Widget Configuration Engine
- [ ] S4T-017 Build Widget Refresh Service
- [ ] S4T-018 Wire Dashboard Preferences API
- [ ] S4T-019 Add Dashboard Loading and Error States
- [ ] S4T-020 Integrate Chart Widgets with Trend Engine

## Executive Brief

- [ ] S4T-021 Complete Brief Provider Aggregation
- [ ] S4T-022 Remove Static Brief Bypass on Advisor
- [ ] S4T-023 Wire ExecutiveSummaryCard to Brief Engine
- [ ] S4T-024 Implement Workspace Brief Section Templates
- [ ] S4T-025 Build Brief History Storage
- [ ] S4T-026 Add Scheduled Brief Generation Hooks
- [ ] S4T-027 Wire PrioritiesCard to Brief Engine
- [ ] S4T-028 Integrate Brief into Command Center
- [ ] S4T-029 Wire Cross-Workspace Brief Sections
- [ ] S4T-030 Implement Brief Engine Pipeline Registration
- [ ] S4T-031 Implement GET `/api/v1/brief`
- [ ] S4T-032 Implement GET `/api/v1/brief/history`

## Recommendation Engine

- [ ] S4T-040 Extend Recommendation Model
- [ ] S4T-041 Implement Reasoning and Evidence
- [ ] S4T-042 Add Confidence Scoring
- [ ] S4T-043 Wire DecisionCard to Recommendation Engine
- [ ] S4T-044 Remove Static Decision Arrays
- [ ] S4T-045 Add Recommendation Acceptance Tracking
- [ ] S4T-046 Implement GET `/api/v1/recommendations`
- [ ] S4T-047 Add Explainability to Advisor UI
- [ ] S4T-048 Unit Tests — Recommendation Explainability

## Alert Engine

- [ ] S4T-050 Extract `alert-engine.ts` Module
- [ ] S4T-051 Define Alert Severity Rules
- [ ] S4T-052 Register Alert Engine in Pipeline
- [ ] S4T-053 Build Notification Bridge Interface
- [ ] S4T-054 Wire Alert Centre to Alert Engine
- [ ] S4T-055 Wire RisksCard to Alert Engine
- [ ] S4T-056 Remove Interim Alert Aggregation
- [ ] S4T-057 Implement GET `/api/v1/alerts`
- [ ] S4T-058 Unit Tests — Alert Engine

## Trend Engine

- [ ] S4T-060 Define Trend Series Models
- [ ] S4T-061 Extend Provider Trend Contract
- [ ] S4T-062 Implement `trend-engine.ts` Core
- [ ] S4T-063 Register Trend Engine in Pipeline
- [ ] S4T-064 Finance Provider Trend Aggregation
- [ ] S4T-065 CRM Provider Trend Aggregation
- [ ] S4T-066 Feed KPI Widgets from Trend Engine
- [ ] S4T-067 Add Marketing and Hospitality Trend Stubs
- [ ] S4T-068 Unit Tests — Trend Engine

## Business Health Engine

- [ ] S4T-070 Register Finance Provider in Health Scoring
- [ ] S4T-071 Register CRM Provider in Health Scoring
- [ ] S4T-072 Register Marketing Provider in Health Scoring
- [ ] S4T-073 Register Hospitality Provider in Health Scoring
- [ ] S4T-074 Register Commerce Provider in Health Scoring
- [ ] S4T-075 Implement Platform Health Driver Breakdown UI
- [ ] S4T-076 Add Workspace Health Chips to Dashboard
- [ ] S4T-077 Remove Static Health from Advisor Data
- [ ] S4T-078 Unit Tests — Multi-Provider Health Engine

## Testing

- [ ] S4T-080 Configure Unit Test Runner and CI
- [ ] S4T-081 Intelligence Engine Unit Test Suite
- [ ] S4T-082 Provider Contract Compliance Tests
- [ ] S4T-083 Dashboard Integration Tests
- [ ] S4T-084 API Integration Tests — v1 Endpoints
- [ ] S4T-085 Advisor E2E Workflow Tests
- [ ] S4T-086 Accessibility Audit — Dashboard and Advisor
- [ ] S4T-087 Performance Baseline — Intelligence Pipeline
- [ ] S4T-088 Engine Interface Compliance Audit

## Documentation

- [ ] S4T-090 Author RR-018 Sprint 4 Release Record
- [ ] S4T-091 Write API Documentation — v1 Endpoints
- [ ] S4T-092 Write Widget Developer Guide
- [ ] S4T-093 Update ES-061 Deliverables Checklist
- [ ] S4T-094 Update CHANGELOG for Sprint 4
- [ ] S4T-095 Update Intelligence Layer README
- [ ] S4T-096 Cross-Reference Governance Docs

## Review

- [ ] S4T-100 Architecture Review — Dashboard and Widget Framework
- [ ] S4T-101 Security Review — Auth and API Scope
- [ ] S4T-102 Code Review Gate — All P0 PRs
- [ ] S4T-103 AI Governance Review — Explainability
- [ ] S4T-104 QA Sign-Off — Test Suite and Coverage

## Approval

- [ ] S4T-105 Founder Review — Executive Dashboard
- [ ] S4T-106 Founder Review — Intelligence Engines
- [ ] S4T-107 Chief Architect Sign-Off — Sprint 4 Technical
- [ ] S4T-108 Sprint 4 Acceptance — M9 Milestone

---

# Quality Gates

Every task shall satisfy: Code reviewed · Unit tests passing · Type checking successful · Linting successful · Documentation updated · Accessibility validated · Security review completed · Acceptance criteria verified

| Gate | Applicable today |
|------|------------------|
| Linting · type checking | Yes · manual |
| Documentation | ES programme · ES-064 delivered |
| Unit / integration tests | **Gap** · S4T-080–S4T-088 Open |
| API contracts | **Gap** · S4T-031 · S4T-046 · S4T-057 Open |
| Accessibility | S4T-086 · manual Verification Hierarchy |
| Security review | S4T-101 · partial · placeholder auth |
| Performance | S4T-087 · not benchmarked |

**Reference:** [ES-043 — Engineering Governance & Delivery Standards](./ES-043-Engineering-Governance-Delivery-Standards.md)

---

# Traceability

| Document | Relationship |
|----------|--------------|
| [ES-061](./ES-061-ORION-v0.4-Master-Development-Plan.md) | v0.4 programme and Phase 1 scope |
| [ES-063](./ES-063-Sprint-4-Work-Breakdown-Structure.md) | Work package decomposition · WBS `S4-xxx` |
| [ES-064](./ES-064-Sprint-4-Engineering-Task-Catalogue.md) | Atomic tasks (this document) · `S4T-xxx` |
| [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) | Sprint 2 task catalogue (parallel pattern) |
| [ES-049](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) | Sprint 3 task catalogue (parallel pattern) |
| GitHub Issues / Linear | Map 1:1 from task IDs `S4T-xxx` |

---

# Acceptance Criteria

The Sprint 4 Engineering Task Catalogue is complete when:

| Criterion | Status |
|-----------|--------|
| Every Sprint 4 feature area decomposed into engineering tasks | **Delivered** |
| Tasks organised by Executive Dashboard · Brief · Engines · Testing · Documentation · Review · Approval | **Delivered** |
| Every task has Task ID · Title · Description · Dependencies · Hours · Priority · Owner · Status · Acceptance Criteria | **Delivered** · S4T-001–S4T-108 |
| Execution checklist provided | **Delivered** |
| Implementation status mapped to codebase | **Delivered** |
| Founder approval received | **Approved** |

**Catalogue documentation:** **Complete**.

**Sprint 4 task execution:** **In progress** — 18 Done · 42 Partial · 33 Open · M9 not met.

---

# References

| Document | Location |
|----------|----------|
| ES-061 ORION v0.4 Master Development Plan | [ES-061-ORION-v0.4-Master-Development-Plan.md](./ES-061-ORION-v0.4-Master-Development-Plan.md) |
| ES-063 Sprint 4 WBS | [ES-063-Sprint-4-Work-Breakdown-Structure.md](./ES-063-Sprint-4-Work-Breakdown-Structure.md) |
| ES-065 Executive Intelligence Architecture | [ES-065-Executive-Intelligence-Architecture.md](./ES-065-Executive-Intelligence-Architecture.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-028–ES-032 Intelligence Engines | [ES-028](./ES-028-Executive-Brief-Engine.md) · [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-031](./ES-031-Trend-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| ES-054 Quality Assurance Framework | [ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md](./ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) |
| ES-057 AI Governance Framework | [ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md](./ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

The Sprint 4 Engineering Task Catalogue is the **official execution checklist** for ORION v0.4 Phase 1 — transforming work packages into trackable engineering tasks for developers, AI coding assistants, and project management tools.

**Next action:** Create tracked work items from **Open** and **Partial** P0 tasks · execute per [ES-063](./ES-063-Sprint-4-Work-Breakdown-Structure.md) critical path · begin with S4T-001 (Dashboard route) and S4T-050 (Alert Engine extraction).

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 25 July 2026 |
| **Release Records** | ES-064 alignment · RR-018 pending |

---

### ORION

Engineering clarity for better executive decisions.

Let's build something remarkable.
