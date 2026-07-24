# ORION Changelog

This document records the notable changes made to the ORION Platform.

During pre-release development, ORION follows milestone-based semantic versioning.

The format is based on "Keep a Changelog" principles.

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
