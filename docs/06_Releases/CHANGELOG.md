# ORION Changelog

This document records the notable changes made to the ORION Platform.

During pre-release development, ORION follows milestone-based semantic versioning.

The format is based on "Keep a Changelog" principles.

---

## [0.2.0] — Business Health Engine

**Release Status:** Internal  
**Release Date:** 26 July 2026  
**Git Baseline:** `main` (pending commit)  
**Engineering:** EC-002A · ES-009 · DC-009

### Summary

Delivers the provider-independent Business Health Engine — deterministic KPI scoring, category aggregation, and explainable health scores. Restores the engineering Quality Gate with comprehensive GA4 test coverage.

### Added

- Business Health Engine (`lib/business-health/`) — orchestration, provider-independent scoring pipeline
- `WeightedAverageStrategy` — KPI, category, and overall weighted scoring with confidence
- `KPIRegistry` — register, lookup, category queries, duplicate ID validation
- Domain models — `KPI`, `Category`, `HealthScore`, `ScoreBreakdown`
- Category scorers — Revenue, Marketing, Customer, Operations
- Provider normalizers — GA4, Shopify, Meta
- Utilities — `WeightCalculator`, `TrendCalculator`, `HealthUtils`
- `HealthScoreService` — executive-facing facade
- Unit tests (`tests/business-health/`) — registry, strategy, scorers, normalizers, engine, utilities
- Engineering documentation — `docs/07_Engineering/EC-002A_Business_Health_Engine_Core.md`

### Improved

- GA4 testing — comprehensive suite for GA4Client, GoogleAnalyticsProvider, GA4Mapper, GA4Config, GA4Cache, GA4Authenticator, GA4Health, ProviderFactory
- Coverage — business-health module included in vitest coverage; global gate ≥90%
- CI — Quality Gate workflow validates typecheck, lint, build, test, and coverage on `main`

### Fixed

- Quality Gate — restored passing thresholds (statements/lines/functions ≥80%, branches ≥75%)

| Check | Status |
|-------|--------|
| TypeScript | PASS |
| Lint | PASS |
| Tests | PASS · 194 tests |
| Coverage | PASS · ~91% |
| Build | PASS |

---

## v0.4.0-alpha — Executive Intelligence Foundations

**Release Status:** Alpha · Internal  
**Release Date:** 25 July 2026  
**Git Baseline:** `main` @ `cc4a282`  
**Release Notes:** [docs/releases/v0.4.0-alpha-Release-Notes.md](../releases/v0.4.0-alpha-Release-Notes.md)  
**Release Checklist:** [docs/releases/v0.4.0-alpha-Release-Checklist.md](../releases/v0.4.0-alpha-Release-Checklist.md)  
**Git Tag:** Not applied (alpha policy)

### Summary

Sprint 4 delivers the Provider Framework, Sprint 4 intelligence engines, Intelligence Orchestrator, Executive Intelligence Service, and the `/dashboard` Executive Dashboard — the first orchestrator-fed executive surface.

### Added

- Provider Framework (`lib/providers/`) — registry, manager, health, mock providers (Finance, CRM, Marketing, Hospitality, Commerce, Calendar, Email)
- Provider data layer (`lib/providers/provider-data.ts`) — centralized contribution fetch
- Shared provider aggregation (`lib/intelligence/shared/provider-aggregation.ts`)
- Intelligence Orchestrator (`lib/orchestrator/`) — 10-stage dashboard pipeline with observability
- Executive Brief Engine (`lib/intelligence/brief/`) — ES-028 Sprint 4 module
- Recommendation Engine (`lib/intelligence/recommendations/`) — configuration-driven rules · ES-029
- Alert Engine (`lib/intelligence/alerts/`) — rule engine · alert panel snapshot · ES-030
- Executive Intelligence Service (`lib/intelligence/ExecutiveIntelligenceService.ts`)
- Executive Dashboard at `/dashboard` — HealthScore, MetricCard, BriefCard, RecommendationCard, AlertPanel, TaskList
- Dashboard components (`components/dashboard/`)
- Sprint 4 types (`types/intelligence.ts`, `types/alerts.ts`, `types/brief.ts`, `types/recommendations.ts`, `types/orchestrator.ts`, `types/providers.ts`)
- Vitest test suite (`tests/`, `vitest.config.ts`) — 84 tests · ~88% Sprint 4 coverage · local only
- Engineering Audit Report (`docs/03_Quality/Engineering-Audit-Report.md`)
- Performance Audit Report (`docs/03_Quality/Performance-Audit.md`)
- Sprint 4 Testing Summary (`docs/03_Quality/Sprint-4-Testing-Summary.md`)
- v0.4.0-alpha release documentation (`docs/releases/`)
- ES-062 Sprint 4 Implementation Plan

### Changed

- Pipeline performance — single provider fetch · parallel engine stages · `React.cache()` · wall-clock metrics
- `/dashboard` — `force-dynamic` rendering (was static prerender)
- `CommandCenterHeader` — Server Component (removed unnecessary client boundary)
- Documentation synchronized for Sprint 4 implementation state (ES-061 · ES-063 · ES-064 · ES-065)
- Architecture Index updated with Sprint 4 orchestrator and dual-stack note

### Known Gaps (Remaining Sprint 4)

- Widget registry and ES-022 full acceptance
- Legacy `intelligence-bus` migration from Advisor/CRM surfaces (C-01)
- Standalone Trend Engine (ES-031)
- REST API `/api/v1/`
- Production authentication and CI/CD Phase A–B
- RR-018 Release Record and M9 sprint acceptance

| Check | Status |
|-------|--------|
| Build | PASS |
| Lint | PASS |
| Tests (local) | PASS · 84 tests · ~88% coverage |
| CI | NOT CONFIGURED |

---

## v1.2.0 – Business Platform (Foundation)

**Release Status:** Released  
**Release Date:** 23 July 2026  
**Git Tag:** v1.2.0

### Summary

ORION v1.2.0 begins the Business Platform phase with the Finance Workspace — the first business capability module integrated into the Executive Shell.

### Added

- Finance Workspace at `/finance`
- Finance sub-navigation (Overview, Cash, Revenue, Expenses, Receivables, Payables, Forecast, Reports, Settings)
- Finance Overview with executive summary, KPIs, snapshots, activity, and notes
- Workspace-level layout pattern with horizontal sub-nav
- Placeholder finance data layer (`lib/finance-data.ts`)
- Command palette entries for all Finance routes
- Financial health score with driver breakdown
- Enhanced KPI cards with trend indicators
- Revenue trend and expense breakdown charts (CSS-based, no chart library)
- Cash flow summary, executive insights, and financial alerts
- Finance Insights card on Executive Brief
- Finance insights business logic layer (`lib/finance-insights.ts`)
- Receivables management (aging, collection priority, recommended actions)
- Payables management (upcoming payments, vendor priority, cash impact)
- Receivables and payables business logic layer (`lib/finance-receivables-payables.ts`)
- Executive Brief highest-priority receivable and payable blocks

### Added (continued)

- Customer Intelligence workspace at `/crm`
- Shared workspace sub-navigation (`WorkspaceSubNav`, `WorkspaceSectionHeader`)
- CRM Overview with executive summary, KPIs, health placeholder, opportunities, activity, notes
- CRM sub-navigation (9 sections) and Command Palette entries
- Customer health score with trend and driver breakdown
- Enhanced CRM KPI cards with trend indicators
- Opportunity pipeline (Prospect → Won) with bar chart and executive summary
- Relationship health segmentation (Healthy, Needs Attention, At Risk)
- Executive insights and customer alerts
- Customer Insights card on Executive Brief
- CRM insights business logic layer (`lib/crm-insights.ts`, `CRM_INSIGHTS_READY = true`)
- Customer profile dashboards with health, relationship status, and executive notes
- Relationship timeline with chronological placeholder activity
- Opportunity management with automated prioritisation (high / medium / low)
- Relationship actions and customer portfolio segmentation
- Executive recommendations from business logic layer
- Enhanced Customer Insights card on Executive Brief (priority relationship, opportunity, weekly health, portfolio)
- Relationship and opportunity business logic layer (`lib/crm-relationships-opportunities.ts`)
- Shared Executive Intelligence Layer (`lib/intelligence/`)
- Health Engine, Recommendation Engine, Executive Brief Engine
- CRM Intelligence Pipeline — first platform intelligence consumer
- AI provider contracts (empty, architecture-only)
- CRM refactored to consume shared intelligence engines
- Mission 17A Executive Intelligence Platform foundation
- ExecutiveProvider contract, generic models, registry lifecycle
- Platform constants, errors, and barrel exports (`lib/intelligence/index.ts`)
- Mission 17B Executive Intelligence Engines
- Health Engine, Recommendation Engine, Brief Engine (generic, provider-driven)
- Intelligence Pipeline orchestrator and engine interfaces
- Provider Registry engine delegation (`aggregateHealth`, `aggregateRecommendations`, `aggregateSummaries`, `prepareBrief`)
- Platform metrics (`lib/intelligence/platform-metrics.ts`)
- CRM intelligence pipeline relocated to `lib/crm/crm-intelligence-pipeline.ts`
- ORION Constitution v1.0 ratified
- ORION v1.0 Architecture Baseline (Phase I frozen)
- ORION Founder's Letter
- CTO Retrospective Template and Phase I Retrospective (CTO-001)
- Founder Assignment FA-001 — Project Sunrise (Executive Question Discovery)
- Founder Assignment FA-002 — Project Compass (Executive Decision Mapping)
- Founder Assignment FA-003 — Project Pulse (Executive Attention Mapping)
- ORION Product Constitution v1.0 (Foundational Product Blueprint)
- ORION Engineering Manifesto v1.0 (Foundational Engineering Blueprint)
- ORION Intelligence Constitution v1.0 (Foundational Intelligence Blueprint)
- ORION Decision Framework v1.0 (Foundational Intelligence Blueprint)
- ORION Product Bible v1.0 (Master Blueprint · Living Document)
- OS-001 Naming Standards v1.0 (Engineering Standard)
- OS-002 Work Item Lifecycle v1.0 (Engineering Standard)
- ORION Decision Log v1.0 (Governance · DL-2026-001 seeded)
- ORION Governance Framework v1.0 (Foundational)
- ORION Project Charter v1.0.0 (Construction Phase authorized)
- ORION Non-Negotiables v1.0.0 (Foundational commitments)
- ES-022 Executive Dashboard specification (Construction Phase · Approved)
- ES-023 Hospitality Workspace specification (Construction Phase · Approved)
- ES-024 Commerce Workspace specification (Construction Phase · Approved)
- ES-025 Finance Workspace canonical specification (15A–15C delivered · Construction alignment pending)
- ES-026 Marketing Workspace specification (Construction Phase · Approved · overview foundation only)
- ES-027 CRM Workspace canonical specification (16A–16D delivered · Construction alignment pending)
- ES-028 Executive Brief Engine canonical specification (17B engine delivered · Construction alignment pending)
- ES-029 Recommendation Engine canonical specification (17B engine delivered · Construction alignment pending)
- ES-030 Alert Engine canonical specification (interim aggregation delivered · dedicated engine pending)
- ES-031 Trend Engine specification (Construction Phase · Approved · not implemented)
- ES-032 Business Health Engine canonical specification (17B engine delivered · Construction alignment pending)
- ES-033 Event & Messaging Architecture specification (ES-011 foundation · Construction alignment pending)
- ES-034 Provider & Data Contract Standards specification (Executive Provider delivered · full standard pending)
- ES-035 API Design Standards specification (Construction Phase · Approved · not implemented)
- ES-036 Database & Persistence Architecture canonical specification (ES-010 foundation · Construction alignment pending)
- ES-037 Authentication & Authorisation Architecture canonical specification (ES-009 foundation · Construction alignment pending)
- ES-038 Audit Logging & Observability Architecture canonical specification (ES-011 foundation · Construction alignment pending)
- ES-039 AI Orchestration & Agent Framework canonical specification (Mission 17A–17B foundation · AI agents pending)
- ES-040 Sprint 1 Implementation Plan (Approved · foundation partial · auth/API/CI gaps open)
- ES-041 Sprint 1 Work Breakdown Structure (Approved · 12 work packages mapped)
- ES-042 Sprint 1 Engineering Task Catalogue (Approved · 56 tasks · S1-001–S1-223)
- ES-043 Engineering Governance & Delivery Standards (Approved · extends Engineering Standards v1.4)
- ES-044 Sprint 2 Implementation Plan (Approved · Advisor/Brief partial · ES-022 alignment pending)
- ES-045 Sprint 2 Work Breakdown Structure (Approved · 11 work packages mapped)
- ES-046 Sprint 2 Engineering Task Catalogue (Approved · 55 tasks · S2-001–S2-203)
- ES-047 Sprint 3 Implementation Plan (Approved · Hospitality overview · operational pending)
- ES-048 Sprint 3 Work Breakdown Structure (Approved · 12 work packages mapped)
- ES-049 Sprint 3 Engineering Task Catalogue (Approved · 72 tasks · S3-001–S3-224)
- ES-050 ORION Enterprise Reference Architecture (Approved · master blueprint · six layers)
- ES-051 ORION Technical Roadmap & Product Evolution Strategy (Approved · five-year phases · AI L1–L5)
- ES-052 Architecture Decision Record Framework (Approved · ADR lifecycle · docs/10_Decisions/)
- ES-053 ORION Risk Management & Technical Debt Framework (Approved · TD register · risk register planned)
- ES-054 ORION Quality Assurance & Engineering Excellence Framework (Approved · testing · CI/CD targets)
- ES-055 ORION DevSecOps & Continuous Delivery Architecture (Approved · pipeline · environments)
- ES-056 ORION Data Governance & Information Architecture (Approved · domains · MDM · lifecycle)
- ES-057 ORION AI Governance & Responsible Intelligence Framework (Approved · responsible AI · human oversight)
- ES-058 ORION Enterprise Operations & Service Management Framework (Approved · ITSM · service catalogue)
- ES-059 ORION Platform Security & Zero Trust Architecture (Approved · Zero Trust · identity)
- ES-060 ORION Platform Extensibility, Plugin & Marketplace Architecture (Approved · plugins · SDK · marketplace)
- ES-061 ORION v0.4 Master Development Plan (Approved · master plan · workspaces · intelligence · AI · integrations)
- ES-063 Sprint 4 Work Breakdown Structure (Approved · 110 work packages · S4-001–S4-110)
- ES-064 Sprint 4 Engineering Task Catalogue (Approved · 93 tasks · S4T-001–S4T-108)
- ES-065 Executive Intelligence Architecture (Approved · pipeline · engines · AI integration)

### Engineering

- Mission 15A completed (RR-009)
- Mission 15B completed (RR-010)
- Mission 15C completed (RR-011)
- Mission 16A completed (RR-012)
- Mission 16B completed (RR-013)
- Mission 16C completed (RR-014)
- Mission 16D completed (RR-015)
- Mission 17A completed (RR-016)
- Mission 17B completed (RR-017)

---

## v1.1.0 – Executive Experience

**Release Status:** Released  
**Release Date:** 23 July 2026  
**Git Tag:** v1.1.0

### Summary

ORION v1.1.0 delivers the Executive Experience — a unified app shell, Executive Brief as the default landing surface, and a global Command Palette with Universal Search across the platform.

### Added

- Executive Experience Foundation
- Executive Brief (Advisor)
- Command Palette & Universal Search
- Global keyboard shortcut (Ctrl+K / ⌘+K)
- Universal Search with categorized results
- Recent and Favorites sections
- Search ranking engine
- Lazy-loaded Command Palette
- Accessibility improvements
- Responsive search experience

### Changed

- Advisor is now the default landing page.
- Root (`/`) redirects to Advisor.
- Mission Control moved to `/mission-control`.

### Engineering

- Mission 14A completed
- Mission 14B completed
- Mission 14C completed

| Check | Status |
|-------|--------|
| Build | PASS |
| Lint | PASS |

---

## v0.7 – Foundation Complete

**Release Status:** Released  
**Release Date:** 22 July 2026  
**Git Tag:** v0.7

### Summary

ORION v0.7 completes the foundational platform — executive workspaces, shared design system, platform polish, and a stable architecture for future development.

### Highlights

- Executive Command Center implemented
- Intelligence Workspace implemented
- Configuration Workspace completed
- Shared Design System
- Platform Polish
- Stable architecture
- Clean Git workflow

### Status

**Stable Internal Release**

This release marks the completion of ORION's foundational platform and establishes the architecture, design system, engineering workflow, and executive user experience for future development.

---

## v0.4.0 – Persistence Foundation

**Release Status:** Released

### Summary

ORION now includes a complete persistence architecture supporting repository contracts, in-memory repository implementations, persistence services, dependency injection, and adapter-based persistence configuration.

### Highlights

- Completed ES-010 Persistence Foundation
- Added repository contracts
- Added strongly typed persistence result model
- Added tenant-aware persistence architecture
- Added in-memory repositories
- Added persistence services
- Added transaction placeholders
- Added audit placeholders
- Added persistence factory
- Added dependency injection container
- Prepared future PostgreSQL adapter architecture

### Engineering

| Check | Status |
|-------|--------|
| Build | PASS |
| Lint | PASS |
| Git | Completed |
| Architecture | Stable |

---

## v0.3.0 – Identity Platform Foundation
### Added

- Authentication UI
- Identity Engine
- Session Provider
- Route Protection
- Permission Hooks

### Changed

- Application wrapped in SessionProvider
- Middleware added

### Fixed

- N/A
