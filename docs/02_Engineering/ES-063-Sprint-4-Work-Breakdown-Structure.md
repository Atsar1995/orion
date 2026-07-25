# ES-063 — Sprint 4 Work Breakdown Structure (WBS)

**Version:** 1.0.0

**Status:** Approved

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Parent plan:** [ES-061 — ORION v0.4 Master Development Plan](./ES-061-ORION-v0.4-Master-Development-Plan.md) · **Architecture:** [ES-065 — Executive Intelligence Architecture](./ES-065-Executive-Intelligence-Architecture.md) · **Task catalogue:** [ES-064 — Sprint 4 Engineering Task Catalogue](./ES-064-Sprint-4-Engineering-Task-Catalogue.md)

---

# Purpose

This document decomposes Sprint 4 into executable engineering work packages for delivering **v0.4 Phase 1** — platform foundation closure, unified Executive Dashboard, Executive Intelligence engine completion, Advisor pipeline integration, domain provider remediation, REST API foundation, Executive Copilot MVP, and first-wave integration connectors.

Each work package is independently implementable, testable, reviewable, and deployable while preserving ORION architectural standards.

**Current state:** All **110 work packages** (S4-001–S4-110) catalogued with implementation status mapped to the ORION codebase. **Sprint 4 execution has not started** — work inherits partial delivery from Sprints 1–3 and the `v0.3.0-enterprise-foundation` baseline. See [ES-061](./ES-061-ORION-v0.4-Master-Development-Plan.md).

---

# Work Package Structure

Each engineering work package contains:

| Field | Description |
|-------|-------------|
| **ID** | Unique Sprint 4 identifier (`S4-xxx`) |
| **Title** | Work package name |
| **Description** | Scope and deliverable summary |
| **Priority** | P0 (critical) · P1 (high) · P2 (medium) |
| **Dependencies** | Prerequisite work package IDs |
| **Estimated Effort** | Engineering hours |
| **Owner** | Responsible engineering discipline |
| **Acceptance Criteria** | Definition of complete |
| **Status** | Open · Partial · Done |

---

# Sprint 4 Summary

| Field | Value |
|-------|-------|
| Sprint Duration | 4 Weeks (recommended) |
| Primary Goal | v0.4 Phase 1 — Platform foundation · Executive Dashboard · Intelligence engines · Advisor pipeline · API · Copilot foundation |
| Programme | [ES-061 — ORION v0.4 Master Development Plan](./ES-061-ORION-v0.4-Master-Development-Plan.md) |
| Expected Team | Frontend · Backend · Platform · AI · QA · UX · Founder / Product Owner |
| Total Work Packages | 110 |
| Overall WBS Status | **Not started** — 0 Done · 18 Partial (inherited) · 92 Open |

---

# Work Package Status Overview

| WP | Name | Packages | Status | Completion |
|----|------|----------|--------|------------|
| 1 | Executive Dashboard | S4-001–S4-012 | Partial | ~25% |
| 2 | Widget Framework | S4-013–S4-018 | Not started | ~0% |
| 3 | Executive Metrics & Visualisation | S4-019–S4-022 | Partial | ~20% |
| 4 | Executive Intelligence Engines | S4-023–S4-032 | Partial | ~35% |
| 5 | Intelligence Pipeline & Advisor | S4-033–S4-038 | Partial | ~30% |
| 6 | Platform Foundation | S4-039–S4-048 | Partial | ~20% |
| 7 | REST API Layer | S4-049–S4-056 | Not started | ~0% |
| 8 | Domain Provider Remediation | S4-057–S4-064 | Partial | ~25% |
| 9 | Workspace Intelligence Integration | S4-065–S4-072 | Partial | ~40% |
| 10 | Commerce & Marketing Workspace | S4-073–S4-078 | Partial | ~15% |
| 11 | Executive Copilot & AI | S4-079–S4-086 | Not started | ~5% |
| 12 | Integration Connectors | S4-087–S4-098 | Not started | ~0% |
| 13 | Quality Assurance | S4-099–S4-106 | Not started | ~0% |
| 14 | Documentation & Release | S4-107–S4-110 | Substantial | ~50% |

---

# Work Package 1 — Executive Dashboard

**Objectives:** Unified `/dashboard` route · responsive layout · executive summary · activity · alerts · quick actions · ES-022 alignment

**Spec:** [ES-022 — Executive Dashboard](./ES-022-Executive-Dashboard.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-001 | Executive Dashboard Layout | Create unified dashboard page shell with responsive grid, section containers, and ES-022 layout zones at `/dashboard` | P0 | — | 8h | Frontend Engineer | `/dashboard` route live · responsive at 1280/768/375px · uses `DashboardLayout` · ES-022 zones defined | **Open** |
| S4-002 | KPI Cards Framework | Implement registry-driven KPI card component with trend indicators, sparkline slot, and workspace attribution | P0 | S4-001 | 6h | Frontend Engineer | Reusable `KpiWidget` · trend up/down/neutral · workspace label · no hard-coded Finance/CRM only | **Partial** · workspace KPIs exist · not registry-driven |
| S4-003 | Executive Metrics Panel | Aggregate platform metrics from `platform-metrics.ts` and provider health into dashboard metrics row | P0 | S4-001 · S4-057 | 6h | Backend Engineer | Metrics row renders live pipeline data · no static `advisor-data.ts` bypass for Finance/CRM | **Partial** · `platform-metrics.ts` exists |
| S4-004 | Charts & Trend Visualisation | Add dashboard chart widgets consuming Trend Engine output (revenue, occupancy, pipeline, health trends) | P1 | S4-001 · S4-028 | 8h | Frontend Engineer | ≥4 chart widgets · CSS or library per ES-008 · fed by Trend Engine not static arrays | **Open** |
| S4-005 | Executive Summary Panel | Dashboard hero panel with daily executive narrative from Brief Engine | P0 | S4-001 · S4-023 | 5h | Frontend Engineer | Summary text from `generateExecutiveBrief()` · refreshes on pipeline run · no static copy | **Partial** · `ExecutiveSummaryCard` · mixed static |
| S4-006 | Recent Activity Feed | Cross-workspace activity stream with categorisation and timestamps | P1 | S4-001 · S4-049 | 6h | Frontend Engineer | Activity feed component · ≥3 workspace sources · sorted chronologically | **Partial** · `RecentActivityCard` · placeholder data |
| S4-007 | Alert Centre Panel | Unified alert surface aggregating Alert Engine output with severity filtering | P0 | S4-001 · S4-026 | 6h | Frontend Engineer | Alert panel · critical/warning/info filters · links to source workspace | **Partial** · `CriticalAttentionCard` · `RisksCard` |
| S4-008 | Quick Actions Integration | Dashboard quick actions wired to workspace routes and command palette entries | P1 | S4-001 | 4h | Frontend Engineer | Quick actions navigate correctly · palette entries match · ≥6 actions | **Done** · `QuickActionsCard` · multiple surfaces |
| S4-009 | Dashboard Routing & Aliases | Establish `/dashboard` as canonical route with redirects from `/advisor` and command palette updates | P0 | S4-001 | 4h | Frontend Engineer | `/dashboard` canonical · `/advisor` alias or redirect · nav updated · ES-022 routing met | **Open** · `/advisor` only today |
| S4-010 | Dashboard Navigation Integration | Integrate dashboard into sidebar, breadcrumbs, and command palette as primary executive entry | P0 | S4-009 | 3h | Frontend Engineer | Sidebar highlights Dashboard · palette search finds dashboard widgets · default landing configurable | **Partial** · `/advisor` default landing |
| S4-011 | Responsive Dashboard Grid | Unified 12-column responsive grid supporting widget resize and breakpoint reflow | P0 | S4-001 · S4-013 | 6h | Frontend Engineer | Grid system documented · widgets reflow at breakpoints · matches ES-022 wireframes | **Partial** · card layouts · no unified grid |
| S4-012 | Dashboard Empty & Loading States | Empty, loading, and error states for dashboard and widget slots | P1 | S4-001 | 4h | Frontend Engineer | Uses `LoadingState` · `EmptyState` · error boundary per widget · accessible | **Partial** · primitives exist · not dashboard-wide |

**WP1 status:** **Partial** — Advisor/Command Center shells exist · ES-022 unified `/dashboard` and registry-driven widgets pending.

---

# Work Package 2 — Widget Framework

**Objectives:** Widget registry · loader · configuration · refresh · lifecycle · preferences integration

**Dependencies:** S4-001 · [ES-044](./ES-044-Sprint-2-Implementation-Plan.md) WP2 gaps

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-013 | Widget Registry | Central registry mapping widget IDs to components, data providers, and default configs | P0 | S4-001 | 6h | Platform Engineer | `WidgetRegistry` module · register/unregister · type-safe widget definitions · barrel export | **Open** |
| S4-014 | Widget Loader | Dynamic widget instantiation from registry with lazy loading and error isolation | P0 | S4-013 | 5h | Frontend Engineer | Dashboard renders widgets from registry · failed widget does not crash grid · lazy import supported | **Open** |
| S4-015 | Widget Configuration Engine | Per-widget and per-user configuration schema with validation | P1 | S4-013 | 6h | Backend Engineer | Config schema typed · defaults per widget · validation on save · persisted stub ready | **Open** |
| S4-016 | Widget Refresh Service | Polling and event-driven refresh intervals per widget type | P1 | S4-013 · S4-033 | 5h | Backend Engineer | Refresh intervals configurable · pipeline event triggers refresh · stale indicator in UI | **Open** |
| S4-017 | Widget Lifecycle Management | Mount, suspend, destroy, and visibility lifecycle hooks for dashboard widgets | P2 | S4-014 | 4h | Frontend Engineer | Lifecycle hooks documented · widgets clean up subscriptions · hidden widgets suspend refresh | **Open** |
| S4-018 | Dashboard Preferences Integration | Wire widget layout and visibility preferences to preferences API | P1 | S4-013 · S4-055 | 6h | Frontend Engineer | User can show/hide widgets · layout order persisted · restored on reload | **Open** |

**WP2 status:** **Not started**.

---

# Work Package 3 — Executive Metrics & Visualisation

**Objectives:** Platform KPIs · workspace KPI widgets · trend indicators · business health display

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-019 | Revenue KPI Widget | Dashboard widget for revenue metrics from Finance provider | P0 | S4-013 · S4-057 | 4h | Frontend Engineer | Widget registered · live Finance provider data · trend indicator | **Partial** · Finance workspace KPIs · not dashboard widget |
| S4-020 | Business Health Score Widget | Platform health widget from Health Engine aggregating all registered providers | P0 | S4-013 · S4-030 | 5h | Frontend Engineer | `BusinessHealthCard` as registry widget · score + drivers · all providers when registered | **Partial** · Health Engine · Finance/CRM only |
| S4-021 | Workspace KPI Widget Set | Registry widgets for CRM, Marketing, Hospitality, and Commerce headline KPIs | P1 | S4-013 · S4-065–S4-072 | 8h | Frontend Engineer | ≥4 workspace KPI widgets registered · each fed by executive provider | **Partial** · workspace pages only |
| S4-022 | Trend Indicator Components | Shared trend badge, delta, and period comparison components for KPI widgets | P1 | S4-002 · S4-028 | 4h | Frontend Engineer | Trend components reusable · fed by Trend Engine · period labels correct | **Open** |

**WP3 status:** **Partial**.

---

# Work Package 4 — Executive Intelligence Engines

**Objectives:** Complete six engines per ES-028–032 · extract Alert · implement Trend · extend Health

**Spec:** [ES-028](./ES-028-Executive-Brief-Engine.md) · [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-031](./ES-031-Trend-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-023 | Executive Brief Engine Completion | Complete Brief Engine wiring, remove static bypass, add brief sections for all workspace providers | P0 | S4-057–S4-061 | 8h | AI Engineer | `brief-engine.ts` produces full brief from pipeline only · all provider summaries included | **Partial** · engine delivered · UI mixed |
| S4-024 | Brief History & Scheduling | Persist brief history and support scheduled brief generation hooks | P1 | S4-023 · S4-039 | 8h | Backend Engineer | Brief history retrievable · schedule config stub · latest + previous accessible | **Open** |
| S4-025 | Recommendation Engine Explainability | Extend recommendations with reasoning, evidence, confidence per ES-057 and ES-029 | P0 | S4-057 | 8h | AI Engineer | `ExecutiveRecommendation` includes reasoning · evidence refs · confidence score · ES-057 fields | **Partial** · engine aggregates · no explainability schema |
| S4-026 | Alert Engine Extraction | Extract dedicated `alert-engine.ts` from interim `getAlerts()` with severity rules | P0 | S4-057 | 8h | Backend Engineer | Standalone Alert Engine · severity classification · registered in pipeline · ES-030 acceptance | **Partial** · interim aggregation only |
| S4-027 | Alert Severity Rules & Notification Bridge | Configurable severity rules and notification bridge stub for alert delivery | P1 | S4-026 | 6h | Backend Engineer | Rules documented · critical alerts flagged · notification bridge interface defined | **Open** |
| S4-028 | Trend Engine Implementation | Implement `trend-engine.ts` with time-series aggregation from executive providers | P1 | S4-057–S4-061 | 10h | Backend Engineer | Trend Engine live · period comparison · feeds S4-004 and S4-022 · ES-031 acceptance | **Open** |
| S4-029 | Trend Data Models & Provider Contracts | Define trend series models and provider `aggregateTrends()` contract extension | P1 | S4-028 · S4-057 | 6h | Platform Engineer | Types in `models.ts` · provider interface extended · Finance/CRM implement first | **Open** |
| S4-030 | Business Health Engine Multi-Provider | Extend Health Engine to score all six workspace executive providers | P0 | S4-057–S4-061 | 6h | Backend Engineer | Platform health score uses all registered providers · driver breakdown per domain | **Partial** · Finance/CRM registered |
| S4-031 | Engine Interface Compliance | Verify all six engines implement `engine-interfaces.ts` and register in pipeline | P0 | S4-023–S4-030 | 4h | Platform Engineer | Six engines pass interface audit · pipeline orchestrator invokes each · unit tests stubbed | **Partial** · 3 engines · 2 interim |
| S4-032 | Engine Unit Test Suite | Unit tests for each intelligence engine with fixture providers | P0 | S4-031 · S4-099 | 12h | QA Engineer | ≥1 test file per engine · happy path + empty provider · CI runnable | **Open** |

**WP4 status:** **Partial** — Mission 17B engines delivered · Alert/Trend extraction and explainability pending.

---

# Work Package 5 — Intelligence Pipeline & Advisor

**Objectives:** End-to-end Intelligence Bus · Advisor pipeline-only data · Command Center alignment

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-033 | Intelligence Pipeline Orchestration | Harden pipeline orchestrator for sequential/parallel engine execution and caching | P0 | S4-031 | 6h | Platform Engineer | Pipeline runs all engines · errors isolated · execution logged · cache TTL configurable | **Partial** · pipeline exists |
| S4-034 | Advisor Intelligence Bus Wiring | Refactor Advisor to consume pipeline exclusively; remove Finance/CRM static bypass | P0 | S4-033 · S4-023 | 8h | Frontend Engineer | Advisor cards use pipeline hooks only · no direct `lib/*-data.ts` for intelligence surfaces | **Partial** · mixed static + pipeline |
| S4-035 | Command Center Pipeline Integration | Align Command Center metrics and cards with same pipeline outputs as Dashboard | P1 | S4-033 | 6h | Frontend Engineer | Command Center and Dashboard show consistent metrics · single pipeline source | **Partial** |
| S4-036 | Workspace Insight Cards on Advisor | Register insight cards for Marketing, Hospitality, and Commerce on Advisor/Brief | P1 | S4-065–S4-072 | 8h | Frontend Engineer | Six workspace insight cards on Advisor · each from executive provider | **Partial** · Finance/CRM only |
| S4-037 | Decision & Priority Cards Pipeline | Wire `DecisionCard` and `PrioritiesCard` to Recommendation and Brief engines | P0 | S4-025 · S4-034 | 6h | Frontend Engineer | Decisions from Recommendation Engine · priorities from Brief Engine · no static arrays | **Partial** · static decisions |
| S4-038 | Intelligence Bus Performance Budget | Establish pipeline execution time budget and lazy widget loading strategy | P2 | S4-033 | 4h | Platform Engineer | Pipeline p95 < 500ms with fixture data · documented budget · lazy load on dashboard | **Open** |

**WP5 status:** **Partial**.

---

# Work Package 6 — Platform Foundation

**Objectives:** Auth · CI/CD · persistence ADR · observability · TD remediation prerequisites

**Spec:** [ES-037](./ES-037-Authentication-Authorisation-Architecture.md) · [ES-055](./ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) · [ES-036](./ES-036-Database-Persistence-Architecture.md) · [ES-038](./ES-038-Audit-Logging-Observability-Architecture.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-039 | Authentication Provider ADR | Author ADR selecting production auth provider (Clerk, Auth.js, or enterprise IdP) | P0 | — | 4h | Founder / Platform Engineer | ADR accepted in `docs/10_Decisions/` · supersedes placeholder decision · ES-052 compliant | **Open** |
| S4-040 | Production Authentication Implementation | Replace placeholder session with real auth provider integration | P0 | S4-039 | 12h | Backend Engineer | Login/logout functional · session persisted · `NOT_IMPLEMENTED` removed from auth service | **Partial** · placeholder auth |
| S4-041 | Protected Routes & RBAC Enforcement | Enforce RBAC on platform routes and prepare API auth middleware | P0 | S4-040 | 8h | Backend Engineer | Middleware blocks unauthenticated access · role checks on admin routes · ES-037 minimum | **Partial** · `AuthGuard` · placeholder |
| S4-042 | Persistence Architecture ADR | Author ADR for production database selection and repository migration path | P0 | — | 6h | Platform Engineer | ADR accepted · migration from in-memory documented · ES-036 aligned | **Open** |
| S4-043 | CI/CD Phase A Pipeline | GitHub Actions workflow: lint, typecheck, build on PR | P0 | — | 6h | Platform Engineer | CI green on PR · required check · ES-055 Phase A | **Open** |
| S4-044 | CI/CD Phase B Test Pipeline | Extend CI with unit and integration test execution | P0 | S4-043 · S4-099 | 8h | Platform Engineer | Tests run in CI · coverage report stub · ES-055 Phase B | **Open** |
| S4-045 | HTTP Health Endpoint | Implement `/api/health` with platform and pipeline status | P0 | S4-033 | 4h | Backend Engineer | Health endpoint returns 200 · version · pipeline status · ES-038 minimum | **Open** |
| S4-046 | Structured Logging Foundation | Structured JSON logging for API, pipeline, and auth events | P1 | S4-045 | 6h | Backend Engineer | Logger module · request correlation ID · auth and pipeline events logged | **Open** |
| S4-047 | Secrets Management Pattern | Document and implement secrets loading pattern for integrations and auth | P0 | S4-039 · S4-087 | 4h | Platform Engineer | `.env` template · no secrets in code · ES-059 alignment documented | **Open** |
| S4-048 | Event Bus Domain Catalogue | Document and stub domain event types for workspace and integration emitters | P1 | S4-057 | 6h | Platform Engineer | Event catalogue in docs · registry accepts domain events · ES-033 alignment | **Partial** · in-memory registry |

**WP6 status:** **Partial** — types and placeholders exist · production paths open.

---

# Work Package 7 — REST API Layer

**Objectives:** `/api/v1/` foundation · dashboard · brief · widget · preferences · workspace resources

**Spec:** [ES-035 — API Design Standards](./ES-035-API-Design-Standards.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-049 | REST API Routing Foundation | Establish `/api/v1/` route structure, error envelope, and auth middleware | P0 | S4-040 · S4-041 | 8h | Backend Engineer | `/api/v1/` namespace · `ServiceResult` HTTP mapping · auth on protected routes | **Open** |
| S4-050 | API Request Validation Layer | Shared Zod or equivalent validation for API request bodies and query params | P0 | S4-049 | 6h | Backend Engineer | Validation middleware · standard 400 errors · ES-035 compliance | **Open** |
| S4-051 | Dashboard API | `GET /api/v1/dashboard` returning metrics, widgets, and layout config | P0 | S4-049 · S4-013 | 6h | Backend Engineer | Endpoint returns dashboard payload · authenticated · matches ES-035 | **Open** |
| S4-052 | Executive Brief API | `GET /api/v1/brief` and `GET /api/v1/brief/history` | P0 | S4-049 · S4-023 | 6h | Backend Engineer | Brief endpoint returns pipeline output · history endpoint stub · authenticated | **Open** |
| S4-053 | Widget API | CRUD endpoints for widget registry metadata and user widget instances | P1 | S4-049 · S4-013 | 6h | Backend Engineer | Widget list and config endpoints · OpenAPI stub · ES-035 | **Open** |
| S4-054 | Recommendations & Alerts API | `GET /api/v1/recommendations` and `GET /api/v1/alerts` | P1 | S4-049 · S4-025 · S4-026 | 6h | Backend Engineer | Endpoints return engine output · filter by severity/workspace · paginated | **Open** |
| S4-055 | Preferences API | `GET/PATCH /api/v1/preferences/dashboard` for layout and widget preferences | P1 | S4-049 · S4-018 | 5h | Backend Engineer | Preferences persist per user · validated schema · RESTful | **Open** |
| S4-056 | Workspace Resources API Stubs | Stub `/api/v1/workspaces/{domain}/summary` for Finance, CRM, Marketing, Hospitality, Commerce | P1 | S4-049 · S4-057–S4-061 | 8h | Backend Engineer | Five workspace summary endpoints · provider-backed · authenticated | **Open** |

**WP7 status:** **Not started**.

---

# Work Package 8 — Domain Provider Remediation

**Objectives:** TD-001 · TD-002 · register all six executive providers

**Spec:** [ES-034 — Provider Data Contract Standards](./ES-034-Provider-Data-Contract-Standards.md) · [Technical Debt Register](../09_Standards/Technical_Debt_Register.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-057 | Finance Provider Remediation (TD-001) | Refactor Finance intelligence to consume provider/repository only; remove static bypass | P0 | S4-042 | 10h | Backend Engineer | TD-001 closed · Finance provider sole intelligence source · tests pass | **Partial** · provider exists · static fallback |
| S4-058 | CRM Provider Remediation (TD-002) | Refactor CRM intelligence to consume provider/repository only; remove static bypass | P0 | S4-042 | 10h | Backend Engineer | TD-002 closed · CRM pipeline provider-only · tests pass | **Partial** · pipeline exists · static data |
| S4-059 | Marketing Executive Provider | Implement and register `marketingExecutiveProvider` | P1 | S4-042 | 8h | Backend Engineer | Provider registered · health · recommendations · summaries · trends stub | **Open** |
| S4-060 | Hospitality Executive Provider | Implement and register `hospitalityExecutiveProvider` | P0 | S4-042 | 8h | Backend Engineer | Provider registered · connects to hospitality data layer · pipeline integrated | **Open** |
| S4-061 | Commerce Executive Provider | Implement and register `commerceExecutiveProvider` | P1 | S4-073 | 8h | Backend Engineer | Provider registered · stub metrics until Commerce workspace live | **Open** |
| S4-062 | Provider Validation Suite | Automated validation that all providers implement required contract methods | P1 | S4-057–S4-061 | 6h | Platform Engineer | Validation script or test · fails CI if provider incomplete · ES-034 | **Open** |
| S4-063 | Provider Registry Lifecycle | Extend registry with domain metadata, health checks, and deregistration | P1 | S4-057–S4-061 | 5h | Platform Engineer | Registry lists six providers · health status per provider · ADR-006 compliant | **Partial** · Finance/CRM registered |
| S4-064 | Domain Repository Interfaces | Define repository interfaces per workspace domain ahead of persistence ADR | P1 | S4-042 | 8h | Backend Engineer | Interface per domain · in-memory impl remains · swap-ready for ADR | **Partial** · pattern exists |

**WP8 status:** **Partial**.

---

# Work Package 9 — Workspace Intelligence Integration

**Objectives:** Six workspace insight cards · pipeline integration · Advisor/Brief contribution

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-065 | Finance Insight Card | Dashboard/Advisor card wired to Finance executive provider via pipeline | P0 | S4-057 · S4-034 | 4h | Frontend Engineer | `FinanceInsightsCard` pipeline-only · receivables/payables blocks on Brief | **Partial** · pipeline integrated |
| S4-066 | CRM Insight Card | Dashboard/Advisor card wired to CRM executive provider via pipeline | P0 | S4-058 · S4-034 | 4h | Frontend Engineer | `CustomerInsightsCard` pipeline-only · relationship/opportunity on Brief | **Partial** · pipeline integrated |
| S4-067 | Marketing Insight Card | Advisor card for Marketing workspace metrics and campaign highlights | P1 | S4-059 · S4-034 | 5h | Frontend Engineer | Marketing card on Advisor · fed by marketing provider · ES-026 alignment | **Open** |
| S4-068 | Hospitality Insight Card | Advisor card for occupancy, arrivals, and operational alerts | P1 | S4-060 · S4-034 | 5h | Frontend Engineer | Hospitality card on Advisor · fed by hospitality provider · ES-023 alignment | **Open** |
| S4-069 | Commerce Insight Card | Advisor card for orders, revenue, and catalogue health stub | P1 | S4-061 · S4-034 | 5h | Frontend Engineer | Commerce card on Advisor · stub until S4-073 complete | **Open** |
| S4-070 | Cross-Workspace Brief Sections | Brief Engine sections per workspace in daily executive brief | P0 | S4-023 · S4-065–S4-069 | 6h | AI Engineer | Brief includes all six workspace sections when providers registered | **Partial** · Finance/CRM sections |
| S4-071 | Workspace Health on Dashboard | Per-workspace health chips on dashboard from Health Engine | P1 | S4-030 · S4-013 | 5h | Frontend Engineer | Six health chips · colour by score · link to workspace | **Partial** · platform health only |
| S4-072 | Intelligence Workspace Alignment | Align `/intelligence` workspace with pipeline outputs and engine status | P1 | S4-033 | 6h | Frontend Engineer | Intelligence workspace shows engine status · last run · recommendations feed | **Partial** · workspace exists |

**WP9 status:** **Partial**.

---

# Work Package 10 — Commerce & Marketing Workspace

**Objectives:** Commerce foundation · Marketing operational minimum · sub-navigation · command palette

**Spec:** [ES-024 — Commerce Workspace](./ES-024-Commerce-Workspace.md) · [ES-026 — Marketing Workspace](./ES-026-Marketing-Workspace.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-073 | Commerce Workspace Shell | Create `/commerce` layout, sub-nav, overview page, and command palette entries | P1 | S4-001 | 8h | Frontend Engineer | `/commerce` live · sub-nav · overview KPIs · palette entries · ES-024 foundation | **Open** |
| S4-074 | Commerce Overview Dashboard | Commerce overview with orders, products, revenue, and inventory summary cards | P1 | S4-073 | 8h | Frontend Engineer | Overview page · ≥6 components · static or provider data · matches Finance pattern | **Open** |
| S4-075 | Commerce Data Layer | `lib/commerce-data.ts` and commerce insights module following workspace conventions | P1 | S4-073 | 6h | Backend Engineer | Data module · insights stub · ready for Shopify connector | **Open** |
| S4-076 | Marketing Sub-Navigation | Add Marketing workspace layout, sub-routes, and section pages beyond overview | P1 | — | 8h | Frontend Engineer | `layout.tsx` · sub-nav · campaigns/channels/reports routes · ES-026 minimum | **Open** · overview only |
| S4-077 | Marketing Campaign Dashboard | Campaign performance section with channel breakdown and KPI cards | P1 | S4-076 · S4-059 | 8h | Frontend Engineer | Campaign page live · KPI cards · static or connector data | **Open** |
| S4-078 | Marketing Channel Analytics | Channel analytics section preparing for Google Ads and Meta connectors | P2 | S4-076 · S4-094 · S4-095 | 6h | Frontend Engineer | Channel page · placeholder connector hooks · ES-026 alignment | **Open** |

**WP10 status:** **Partial** — Marketing overview only · Commerce absent.

---

# Work Package 11 — Executive Copilot & AI

**Objectives:** LLM provider · prompt library · audit · Ask ORION MVP · NL interface · approval workflow

**Spec:** [ES-039 — AI Orchestration](./ES-039-AI-Orchestration-Agent-Framework.md) · [ES-057 — AI Governance](./ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-079 | LLM Provider ADR | Author ADR for LLM provider selection, data handling, and fallback strategy | P0 | S4-039 | 4h | Founder / AI Engineer | ADR accepted · ES-057 constraints documented · no production key in repo | **Open** |
| S4-080 | AI Prompt Library | Governed prompt templates for Brief, Copilot, and recommendations | P0 | S4-079 | 8h | AI Engineer | Prompt library module · versioned templates · ES-057 review fields | **Open** |
| S4-081 | AI Interaction Audit Schema | Schema and storage for AI interactions, inputs, outputs, and approvals | P0 | S4-079 · S4-046 | 6h | Backend Engineer | Audit schema typed · log on every LLM call · retention documented | **Open** |
| S4-082 | Register LLM in AI Provider Registry | Register first LLM provider in `AI_PROVIDER_REGISTRY` with null-safe fallback | P0 | S4-079 · S4-080 | 8h | AI Engineer | Provider registered · feature-flagged · falls back to deterministic when disabled | **Open** · all null today |
| S4-083 | Executive Copilot MVP (Ask ORION) | Live Ask ORION panel on Advisor/Dashboard with workspace context | P0 | S4-082 · S4-034 | 12h | AI Engineer | Copilot responds with pipeline context · citations · governed prompts · ES-057 | **Partial** · placeholder UI |
| S4-084 | Natural Language Query Interface | NL query routes to intelligence bus and returns structured response | P1 | S4-083 | 10h | AI Engineer | User query → pipeline/LLM → formatted answer · workspace scope param | **Open** |
| S4-085 | Human Approval Workflow | Approval UI for high-impact AI recommendations and copilot actions | P0 | S4-083 · S4-025 | 8h | Frontend Engineer | Approval required for flagged actions · audit trail · ES-057 non-negotiables | **Open** |
| S4-086 | Agent Framework Stubs | Brief Agent and Recommendation Agent stubs with tool boundaries | P2 | S4-082 | 8h | AI Engineer | Agent interfaces implemented · no autonomous actions · ES-039 stubs | **Open** |

**WP11 status:** **Not started** (~5% placeholder UI).

---

# Work Package 12 — Integration Connectors

**Objectives:** Phase 1 connector foundation per ES-061 · registry · contracts · stub/live adapters

**Spec:** [ES-034](./ES-034-Provider-Data-Contract-Standards.md) · [ES-061 § Integration Roadmap](./ES-061-ORION-v0.4-Master-Development-Plan.md#integration-roadmap)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-087 | Integration Provider Registry | Central registry for external integration connectors with health and config | P0 | S4-047 · S4-049 | 6h | Platform Engineer | Registry module · register connector · status enum · ES-034 contract | **Open** |
| S4-088 | Integration Data Contract Templates | Standard connector contract templates for auth, sync, and error handling | P1 | S4-087 | 6h | Platform Engineer | Template documented · example connector · validation rules | **Open** |
| S4-089 | Stripe Connector Foundation | Stripe connector for payments, revenue, and Finance workspace hooks | P0 | S4-087 · S4-057 | 12h | Backend Engineer | Stripe adapter · test mode · Finance provider hook · webhook stub | **Open** |
| S4-090 | Google Workspace Connector Foundation | Google Calendar and Gmail context connector for Brief scheduling | P1 | S4-087 | 10h | Backend Engineer | OAuth flow stub · calendar read stub · Brief context interface | **Open** |
| S4-091 | Microsoft 365 Connector Foundation | M365 Calendar and Teams context connector | P1 | S4-087 | 10h | Backend Engineer | OAuth stub · calendar read stub · ES-061 INT-1 | **Open** |
| S4-092 | Shopify Connector Foundation | Shopify connector for orders, products, and Commerce workspace | P1 | S4-087 · S4-073 | 12h | Backend Engineer | Shopify adapter stub · Commerce data feed · webhook stub | **Open** |
| S4-093 | Hospitality PMS Connector Foundation | PMS connector for reservations, guests, and rooms | P0 | S4-087 · S4-060 | 14h | Backend Engineer | PMS adapter interface · one reference stub · Hospitality provider feed | **Open** |
| S4-094 | Google Ads Connector Foundation | Google Ads metrics connector for Marketing workspace | P1 | S4-087 · S4-059 | 10h | Backend Engineer | Ads metrics stub · Marketing provider hook · OAuth documented | **Open** |
| S4-095 | Meta Connector Foundation | Meta ads and social metrics connector for Marketing workspace | P1 | S4-087 · S4-059 | 10h | Backend Engineer | Meta metrics stub · Marketing provider hook · ES-061 INT-1 | **Open** |
| S4-096 | WhatsApp Connector Foundation | WhatsApp messaging connector stub for CRM/Hospitality | P2 | S4-087 | 8h | Backend Engineer | Connector interface · send/receive stub · ES-061 INT-2 | **Open** |
| S4-097 | Channel Manager Connector Foundation | Channel manager connector for OTA rates and availability | P2 | S4-087 · S4-093 | 10h | Backend Engineer | Channel manager interface · sync stub · Hospitality feed | **Open** |
| S4-098 | Integration Health & Sync Status UI | Admin UI showing connector status, last sync, and errors | P2 | S4-087 | 6h | Frontend Engineer | Status page or config section · per-connector health · link from `/configuration` | **Open** |

**WP12 status:** **Not started**.

---

# Work Package 13 — Quality Assurance

**Objectives:** Test foundation · dashboard · engines · API · accessibility · E2E

**Spec:** [ES-054 — Quality Assurance](./ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md)

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-099 | Unit Test Foundation | Establish test runner, fixtures, and CI integration for unit tests | P0 | S4-043 | 8h | QA Engineer | Vitest or Jest configured · sample test passes · runs in CI | **Open** |
| S4-100 | Intelligence Engine Unit Tests | Unit tests for all six intelligence engines | P0 | S4-032 · S4-099 | 12h | QA Engineer | Coverage for each engine · edge cases · CI green | **Open** |
| S4-101 | Provider Contract Tests | Tests validating executive provider contract compliance | P0 | S4-062 · S4-099 | 8h | QA Engineer | Finance, CRM, Marketing, Hospitality, Commerce providers tested | **Open** |
| S4-102 | Dashboard Integration Tests | Integration tests for dashboard pipeline and widget rendering | P0 | S4-001 · S4-099 | 10h | QA Engineer | Dashboard loads · widgets render · pipeline mocked · CI green | **Open** |
| S4-103 | API Integration Tests | Integration tests for `/api/v1/` core endpoints | P0 | S4-049 · S4-099 | 10h | QA Engineer | Auth, dashboard, brief endpoints tested · 401/200 paths | **Open** |
| S4-104 | Advisor E2E Workflow Tests | E2E test for Advisor/Dashboard brief and recommendation flow | P1 | S4-034 · S4-099 | 12h | QA Engineer | Playwright or equivalent · brief visible · recommendation card · CI optional | **Open** |
| S4-105 | Accessibility Audit — Dashboard | WCAG-oriented audit of unified dashboard and Advisor | P1 | S4-001 | 8h | QA Engineer | Audit checklist completed · critical issues filed · ES-054 | **Open** |
| S4-106 | Performance Baseline — Pipeline | Benchmark intelligence pipeline and dashboard load targets | P2 | S4-033 · S4-038 | 6h | QA Engineer | Baseline documented · p95 metrics · regression threshold in CI stub | **Open** |

**WP13 status:** **Not started**.

---

# Work Package 14 — Documentation & Release

**Objectives:** Sprint 4 docs · API docs · RR · CHANGELOG · ES-061 status update

| ID | Title | Description | Priority | Dependencies | Effort | Owner | Acceptance Criteria | Status |
|----|-------|-------------|----------|--------------|--------|-------|---------------------|--------|
| S4-107 | Sprint 4 Release Record (RR-018) | Author RR-018 for v0.4 Phase 1 Sprint 4 delivery | P1 | Sprint acceptance | 4h | Founder / Technical Writer | RR-018 published · verification hierarchy · mission mapping | **Open** |
| S4-108 | API Documentation — v1 Stubs | OpenAPI or markdown API docs for `/api/v1/` Sprint 4 endpoints | P1 | S4-049–S4-056 | 6h | Technical Writer | Docs for dashboard, brief, alerts, preferences · ES-035 | **Open** |
| S4-109 | Widget Developer Guide | Guide for registering dashboard widgets via widget registry | P2 | S4-013 | 6h | Technical Writer | Developer guide · code example · ES-022 cross-ref | **Open** |
| S4-110 | ES-061 Implementation Status Update | Update ES-061 deliverables checklist and sprint metrics post-Sprint 4 | P1 | Sprint acceptance | 4h | Technical Writer | ES-061 checklist updated · status tables current · CHANGELOG entry | **Partial** · ES-061 approved · execution open |

**WP14 status:** **Substantial** — ES-061 · ES-063 programme docs delivered.

---

# Milestones

| Milestone | Work Packages | Target | Status |
|-----------|---------------|--------|--------|
| M1 — Platform Foundation Operational | S4-039–S4-048 · S4-043–S4-044 | Week 1 | **Not met** |
| M2 — Unified Executive Dashboard Live | S4-001–S4-012 · S4-013–S4-018 | Week 2 | **Not met** |
| M3 — Six Intelligence Engines Complete | S4-023–S4-032 | Week 2 | **Not met** |
| M4 — Advisor Pipeline-Only | S4-033–S4-038 | Week 3 | **Not met** |
| M5 — REST API v1 Foundation | S4-049–S4-056 | Week 3 | **Not met** |
| M6 — Six Executive Providers Registered | S4-057–S4-064 | Week 3 | **Not met** |
| M7 — Executive Copilot MVP | S4-079–S4-085 | Week 4 | **Not met** |
| M8 — Phase 1 Connectors (≥4) | S4-087–S4-095 | Week 4 | **Not met** |
| M9 — Sprint 4 Acceptance | All | Week 4 | **Not met** |

---

# Quality Gates

Every work package shall satisfy: Code review completed · Unit tests passing · Integration tests passing · API contracts validated · Accessibility verified · Documentation updated · Security review completed · Performance targets achieved

| Gate | Sprint 4 Target | Current |
|------|-----------------|---------|
| Code review | ES-043 process on every PR | Process documented |
| Unit / integration tests | S4-099–S4-104 · CI Phase B | **Gap** |
| API contracts | ES-035 · S4-049–S4-056 | **Gap** |
| Accessibility | S4-105 · ES-054 | Manual only |
| Documentation | S4-107–S4-110 | ES programme substantial |
| Security review | S4-039–S4-041 · S4-047 · ES-059 | Partial · placeholder auth |
| Performance | S4-038 · S4-106 | Not benchmarked |

**Reference:** [ES-043 — Engineering Governance & Delivery Standards](./ES-043-Engineering-Governance-Delivery-Standards.md)

---

# Dependency Graph

```
Sprint 1–3 partial foundation (ES-040–ES-049)
        ↓
S4-039–S4-048 Platform Foundation (Auth · CI · ADR · Health)
        ↓
S4-057–S4-064 Domain Providers (TD-001/002 · six providers)
        ↓
S4-023–S4-032 Intelligence Engines ──→ S4-033–S4-038 Pipeline & Advisor
        ↓                                        ↓
S4-013–S4-018 Widget Framework ──→ S4-001–S4-012 Executive Dashboard
        ↓                                        ↓
S4-049–S4-056 REST API Layer ←──────────────────┘
        ↓
S4-087–S4-098 Integration Connectors
        ↓
S4-079–S4-086 Executive Copilot
        ↓
S4-065–S4-072 Workspace Cards · S4-073–S4-078 Commerce/Marketing
        ↓
S4-099–S4-106 QA ∥ S4-107–S4-110 Documentation
        ↓
M9 Sprint 4 Acceptance · RR-018
```

**Critical path:** S4-039 (Auth ADR) → S4-040 (Auth) → S4-049 (API) → S4-057/058 (TD remediation) → S4-033 (Pipeline) → S4-001 (Dashboard) → S4-083 (Copilot)

---

# Open Work Package Backlog (P0 Priority)

| ID | Title | WP | Blocker for |
|----|-------|-----|-------------|
| S4-039 | Authentication Provider ADR | 6 | S4-040 · API · integrations |
| S4-040 | Production Authentication | 6 | S4-041 · S4-049 · all APIs |
| S4-043 | CI/CD Phase A | 6 | S4-044 · S4-099 · DoD |
| S4-057 | Finance Provider Remediation | 8 | S4-023 · S4-065 · TD-001 |
| S4-058 | CRM Provider Remediation | 8 | S4-066 · TD-002 |
| S4-001 | Executive Dashboard Layout | 1 | All dashboard widgets |
| S4-013 | Widget Registry | 2 | S4-014–S4-018 · KPI widgets |
| S4-026 | Alert Engine Extraction | 4 | S4-007 · S4-054 |
| S4-023 | Brief Engine Completion | 4 | S4-034 · S4-052 |
| S4-033 | Pipeline Orchestration | 5 | S4-034 · Advisor wiring |
| S4-034 | Advisor Bus Wiring | 5 | Static data removal |
| S4-049 | REST API Foundation | 7 | S4-051–S4-056 · integrations |
| S4-079 | LLM Provider ADR | 11 | S4-082 · S4-083 Copilot |
| S4-083 | Executive Copilot MVP | 11 | v0.4 AI objective |
| S4-099 | Unit Test Foundation | 13 | ES-054 · CI Phase B |

---

# Acceptance Criteria

Sprint 4 Work Breakdown Structure is complete when:

| Criterion | Status |
|-----------|--------|
| Every Sprint 4 feature decomposed into work packages | **Delivered** · S4-001–S4-110 |
| Each work package has Description · Priority · Dependencies · Effort · Owner · Acceptance Criteria · Status | **Delivered** |
| Work packages grouped into logical work streams (WP1–WP14) | **Delivered** |
| Dependencies documented with dependency graph | **Delivered** |
| Milestones and quality gates established | **Delivered** |
| Implementation status mapped to codebase baseline | **Delivered** |
| Founder approval received | **Approved** |

**WBS documentation:** **Complete**.

**Sprint 4 execution against WBS:** **Not started** — 0 Done · 18 Partial (inherited) · 92 Open.

---

# References

| Document | Location |
|----------|----------|
| ES-061 ORION v0.4 Master Development Plan | [ES-061-ORION-v0.4-Master-Development-Plan.md](./ES-061-ORION-v0.4-Master-Development-Plan.md) |
| ES-022 Executive Dashboard | [ES-022-Executive-Dashboard.md](./ES-022-Executive-Dashboard.md) |
| ES-028–ES-032 Intelligence Engines | [ES-028](./ES-028-Executive-Brief-Engine.md) · [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-031](./ES-031-Trend-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md) |
| ES-034 Provider Data Contract Standards | [ES-034-Provider-Data-Contract-Standards.md](./ES-034-Provider-Data-Contract-Standards.md) |
| ES-035 API Design Standards | [ES-035-API-Design-Standards.md](./ES-035-API-Design-Standards.md) |
| ES-039 AI Orchestration & Agent Framework | [ES-039-AI-Orchestration-Agent-Framework.md](./ES-039-AI-Orchestration-Agent-Framework.md) |
| ES-043 Engineering Governance & Delivery Standards | [ES-043-Engineering-Governance-Delivery-Standards.md](./ES-043-Engineering-Governance-Delivery-Standards.md) |
| ES-044–ES-046 Sprint 2 Programme | [ES-044](./ES-044-Sprint-2-Implementation-Plan.md) · [ES-045](./ES-045-Sprint-2-Work-Breakdown-Structure.md) · [ES-046](./ES-046-Sprint-2-Engineering-Task-Catalogue.md) |
| ES-047–ES-049 Sprint 3 Programme | [ES-047](./ES-047-Sprint-3-Implementation-Plan.md) · [ES-048](./ES-048-Sprint-3-Work-Breakdown-Structure.md) · [ES-049](./ES-049-Sprint-3-Engineering-Task-Catalogue.md) |
| ES-054 Quality Assurance Framework | [ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md](./ES-054-ORION-Quality-Assurance-Engineering-Excellence-Framework.md) |
| ES-055 DevSecOps & CD Architecture | [ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md](./ES-055-ORION-DevSecOps-Continuous-Delivery-Architecture.md) |
| ES-057 AI Governance Framework | [ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md](./ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md) |
| ES-064 Sprint 4 Task Catalogue | [ES-064-Sprint-4-Engineering-Task-Catalogue.md](./ES-064-Sprint-4-Engineering-Task-Catalogue.md) |
| Technical Debt Register | [Technical_Debt_Register.md](../09_Standards/Technical_Debt_Register.md) |
| Engineering Standards | [Engineering_Standards.md](../09_Standards/Engineering_Standards.md) |

---

# Closing Statement

The Sprint 4 Work Breakdown Structure transforms the ORION v0.4 Phase 1 programme into a coordinated engineering execution plan — closing platform foundation gaps, delivering the unified Executive Dashboard, completing six intelligence engines, and establishing the API, provider, copilot, and integration foundations required for production-capable executive operations.

**Next action:** Decompose work packages into atomic tasks via [ES-064 — Sprint 4 Engineering Task Catalogue](./ES-064-Sprint-4-Engineering-Task-Catalogue.md) · execute P0 backlog starting with S4-039 (Auth ADR) and S4-043 (CI Phase A).

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | Founder · Chief Architect |
| **Date** | 25 July 2026 |
| **Release Records** | ES-063 alignment · RR-018 pending |

---

### ORION

Engineering clarity for better executive decisions.

Let's build something remarkable.
