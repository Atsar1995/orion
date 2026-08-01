# ORION Product Backlog

**Document ID:** PB-001

**Version:** 1.0

**Status:** Approved for Review

**Classification:** Product Backlog — Single Source of Truth

**Owner:** Founder & Chief Architect

**Date:** 28 July 2026

**Supersedes:** Informal backlog tracking in [ORION_Product_Backlog.md](../01_Product/ORION_Product_Backlog.md) (retained as historical reference)

**Related:**

| Document | Purpose |
|----------|---------|
| [ORION_Platform_Vision_and_Roadmap_v1.md](./ORION_Platform_Vision_and_Roadmap_v1.md) | Strategic vision and five-year phases |
| [Technical_Debt_Register.md](../09_Standards/Technical_Debt_Register.md) | Formal TD-xxx register |
| [ORION_Product_Constitution.md](../01_Product/ORION_Product_Constitution.md) | Product principles gate |

---

## Purpose

This document is the **single source of truth** for all future ORION work.

Every enhancement, bug fix, architectural improvement, technical debt item, design refinement, accessibility issue, performance optimization, and future feature **must be tracked here before implementation**.

No work enters a sprint without a backlog ID. Engineering Specifications (ES-xxx) describe *how*; this backlog defines *what* and *why*.

**Governance rules:**

1. New items receive the next available `PB-xxx` ID.
2. Technical debt items cross-reference `TD-xxx` in the [Technical Debt Register](../09_Standards/Technical_Debt_Register.md).
3. Priorities are reviewed quarterly or at programme milestones.
4. Status transitions: `Backlog` → `Ready` → `In Progress` → `In Verification` → `Done` → `Cancelled`.
5. Every item must pass the [Product Test](../01_Product/ORION_Product_Constitution.md) before `Ready`.

---

## Priority Definitions

| Priority | Label | Definition |
|----------|-------|------------|
| **P0** | Critical | Production blocker, security risk, or executive experience failure. Must be addressed immediately. |
| **P1** | High | High business value; directly improves executive decision-making or platform integrity. |
| **P2** | Medium | Improves platform quality, consistency, or maintainability. |
| **P3** | Low | Future enhancements; valuable but not time-sensitive. |

---

## Backlog Statistics

| Metric | Count |
|--------|------:|
| **Total items** | 52 |
| P0 | 2 |
| P1 | 22 |
| P2 | 20 |
| P3 | 8 |
| **Done** | 8 |
| **In Progress** | 6 |
| **Backlog / Ready** | 38 |

*Statistics as of PB-001 v1.0 · 28 July 2026*

---

## Roadmap View

| Horizon | Focus | Representative Items |
|---------|-------|----------------------|
| **Now** | Phase 1 completion · executive polish · intelligence consolidation | PB-002, PB-003, PB-010, PB-011, PB-012, PB-020 |
| **Next** | Phase 2 · API integration · RBAC · unified engines | PB-001, PB-004, PB-013, PB-030, PB-031, PB-040 |
| **Later** | Phase 3 · full workspaces · commerce · analytics | PB-050, PB-051, PB-052, PB-060, PB-061 |
| **Future** | Phase 4–5 · automation · predictive intelligence | PB-070, PB-071, PB-080, PB-081 |

---

## Categories

Items are grouped below. Full field set per item: **ID · Title · Priority · Category · Description · Business Value · Dependencies · Status · Target Sprint · Owner · Notes**

---

### Executive Experience

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-010 | Morning Executive Brief v1.0 polish | P1 | Decision-urgency layout, progressive disclosure, explainability, signature experience (Sprints 17A/17E) | 60-second executive orientation | PB-011, PB-012 | **Done** | Sprint 17 | ORION CTO | RR-018 adjacent · verified 340 tests |
| PB-011 | Command Center ↔ Brief cross-navigation | P1 | Links between `/brief` and `/command-center`; consistent morning flow | Reduces context switching | PB-010 | **Done** | Sprint 17E | ORION CTO | ExecutiveHeader + BriefEndSummary |
| PB-012 | Mobile Executive Shell | P1 | Collapsible sidebar, responsive layout below 768px | Executive access on tablet/mobile | DS-001 | Backlog | Phase 2 · Sprint 5 | ORION CTO | Fixed `pl-64` today |
| PB-013 | Executive Dashboard (ES-022) unified | P1 | Wire `/dashboard` widget registry to live intelligence; replace mock widgets | Single executive home surface | PB-030, PB-031 | In Progress | Phase 2 · Sprint 6 | ORION CTO | `/advisor` partial overlap |
| PB-014 | Brief lifecycle states (stale/updated/offline) | P2 | Implement `updated`, `stale`, `incomplete`, `offline` in repository layer | Executive trust in data freshness | PB-030 | Backlog | Phase 2 | ORION CTO | Banner UI exists; data hardcoded `fresh` |
| PB-015 | Recommendation action persistence | P1 | Wire Act / Delegate / Snooze / Complete to task or workflow service | Closes decision loop | PB-070 | Backlog | Phase 4 | ORION CTO | UI-only today |

---

### Executive Intelligence

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-020 | Recommendation ranking consolidation (17B) | P1 | Unified ranking, grouping, capping across Brief, CRM Insights, Command Center | Consistent executive guidance | PB-021 | Backlog | Phase 2 · Sprint 5 | ORION CTO | Dual engines today (ES-029 + provider registry) |
| PB-021 | Shared RecommendationPresentation layer | P1 | Platform service: `selectFeatured`, `groupByCategory`, progressive disclosure limits | Platform reuse; no surface overload | PB-020 | Backlog | Phase 2 · Sprint 5 | ORION CTO | Brief has caps; other surfaces flat |
| PB-022 | Business Health Engine runtime integration | P1 | Wire CRM/workspace mappers into platform `BusinessHealthEngine` runtime | Cross-domain health in Brief | PB-030 | Backlog | Phase 2 | ORION CTO | Mapper exists; not in runtime |
| PB-023 | Alert Engine runtime integration | P1 | Replace workspace-level alerts with platform `AlertEngine` UI | Unified alert lifecycle | ES-030 | In Progress | Phase 2 | ORION CTO | Sprint 4 module delivered |
| PB-024 | Trend Engine standalone | P2 | Material overnight deltas from trend detection, not static mappers | Accurate "what happened" | ES-031 | Backlog | Phase 2 | ORION CTO | Pipeline aggregation only |
| PB-025 | Intelligence Bus brief cap enforcement | P2 | Final slice on merged recommendations in `map-intelligence-bus-to-brief` | Prevents brief overload | PB-020 | Backlog | Phase 2 · Sprint 5 | ORION CTO | Merge has no final cap |
| PB-026 | Explainability at scale | P1 | Evidence + confidence on every recommendation surface | Executive trust (Constitution P6) | PB-020 | In Progress | Phase 2 | ORION CTO | Brief wired; CRM Insights partial |

---

### CRM

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-030 | TD-002 — CRM API integration | P1 | Replace placeholder data with business platform API / persistence | Live customer intelligence | ES-036, PB-040 | Backlog | Phase 2 · v2.x | ORION CTO | **TD-002** · `lib/crm/data/*` |
| PB-031 | Opportunity data unification | P1 | Merge `MANAGED_OPPORTUNITIES` and `CRM_OPPORTUNITY_RECORDS` | Single pipeline truth | PB-030 | Backlog | Phase 2 | ORION CTO | RR-018 debt |
| PB-032 | CRM organisations module | P1 | `/crm/companies` route; ES-027 organisations alignment | Complete relationship model | ES-027 | Backlog | Phase 3 | ORION CTO | ES-027 Construction Phase gap |
| PB-033 | Dimensional relationship health metrics | P2 | Full dimensional Relationship Health scores per ES-027 | Nuanced retention signals | PB-030 | Backlog | Phase 3 | ORION CTO | Overview uses segments today |
| PB-034 | CRM dashboard explainable recommendations | P2 | Replace static `EXECUTIVE_RECOMMENDATIONS.slice(0,3)` with intelligence engine | Consistent CRM guidance | PB-020, PB-030 | Backlog | Phase 2 | ORION CTO | `dashboard.ts` static slice |
| PB-035 | CRM legacy route cleanup | P3 | Redirect or remove `/crm/relationships`, communications, reports, settings | Reduced confusion | — | Backlog | Phase 2 | ORION CTO | 5 active sub-nav routes |
| PB-036 | CRM legacy component removal | P3 | Remove superseded `CrmCustomersManagement`, `CrmIntelligencePanel`, etc. | Maintainability | PB-035 | Backlog | Phase 2 | ORION CTO | Documented RR-018 |
| PB-037 | CRM Workspace v1.0 release | P1 | Missions 16A.3–16A.8 — five routes, Brief integration, readiness | CRM as business workspace | PB-010 | **Done** | 16A.8 | ORION CTO | RR-018 · 340 tests |
| PB-038 | Server-side CRM query/pagination | P2 | Move filter/sort/pagination to API layer | Performance at scale | PB-030 | Backlog | Phase 2 | ORION CTO | Client-side today |

---

### Finance

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-040 | TD-001 — Finance API integration | P1 | Replace placeholder finance data with accounting service | Live financial intelligence | ES-036 | Backlog | Phase 2 · v2.x | ORION CTO | **TD-001** · `lib/finance-data.ts` |
| PB-041 | Finance budget performance section | P2 | ES-025 budget performance views | Complete finance workspace | PB-040 | Backlog | Phase 3 | ORION CTO | ES-025 alignment |
| PB-042 | Dimensional financial health scores | P2 | ES-025 dimensional health | Richer Brief contribution | PB-022, PB-040 | Backlog | Phase 3 | ORION CTO | — |
| PB-043 | Finance Workspace foundation | P1 | Missions 15A–15C — overview, AR/AP, cash, revenue | Financial executive surface | — | **Done** | 15A–15C | ORION CTO | RR-009–RR-011 |

---

### Commerce

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-050 | Commerce Workspace foundation | P1 | ES-024 workspace — products, orders, inventory overview | Revenue & product intelligence | ES-024 | Backlog | Phase 3 | ORION CTO | Specified only |
| PB-051 | Commerce executive provider | P2 | `commerceExecutiveProvider` → Intelligence Bus | Cross-domain Brief | PB-050, PB-020 | Backlog | Phase 3 | ORION CTO | ADR-006 pattern |
| PB-052 | ATSAR module integration | P2 | Products, inventory, orders, shipping (Product Backlog ATSAR section) | Commerce operator workflow | PB-050 | Backlog | Phase 3 | Founder | — |

---

### Hospitality

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-060 | Hospitality Workspace operational | P1 | ES-023 full workspace beyond overview placeholder | Guest & property intelligence | ES-023 | In Progress | Phase 3 | ORION CTO | Overview at `/hospitality` · RR-005 partial |
| PB-061 | Hospitality executive provider | P2 | `hospitalityExecutiveProvider` → Brief | Occupancy & guest signals in Brief | PB-060 | Backlog | Phase 3 | ORION CTO | — |
| PB-062 | ORANIA reservations & operations | P2 | Reservations, housekeeping, guest messaging (ORANIA backlog) | Hospitality operator execution | PB-060 | Backlog | Phase 3 | Founder | PMS integration future |

---

### Marketing

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-070 | Marketing Workspace sub-routes | P1 | ES-026 sub-navigation and section routes (Mission 21A) | Growth intelligence workspace | ES-026 | Backlog | Phase 3 | ORION CTO | Overview only today |
| PB-071 | marketingExecutiveProvider | P1 | Marketing contribution to Intelligence Bus | Campaign signals in Brief | PB-020 | Backlog | Phase 3 | ORION CTO | ES-026 |
| PB-072 | Marketing ROI & budget views | P2 | ES-026 ROI and budget performance | Marketing spend decisions | PB-070 | Backlog | Phase 3 | ORION CTO | — |

---

### Operations

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-080 | Operations Workspace foundation | P2 | Cross-functional execution health workspace | Operational executive view | Phase 3 | Backlog | Phase 3 | ORION CTO | Future module per PV-001 |
| PB-081 | SLA & process health signals | P3 | Operations provider for Brief | Execution risk visibility | PB-080 | Backlog | Phase 4 | ORION CTO | — |

---

### Analytics

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-090 | Analytics Workspace foundation | P2 | Unified metrics catalogue, trend synthesis | Cross-domain analytics | PB-022, PB-024 | Backlog | Phase 3 | ORION CTO | PV-001 Phase 3 |
| PB-091 | Executive metrics authority (One Truth) | P1 | Canonical metric registry; eliminate duplicate calculations | Constitution Principle 5 | ES-056 | Backlog | Phase 2 | ORION CTO | ES-056 Data Governance |

---

### AI

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-100 | AI Orchestration foundation | P1 | ES-039 intelligence foundation; deterministic-first | AI-ready architecture | — | **Done** | 17A–17B | ORION CTO | RR-016, RR-017 |
| PB-101 | AI roadmap L3–L5 maturity | P2 | ES-051 AI maturity levels: assisted synthesis → autonomous prep | Progressive AI value | PB-100, ES-057 | Backlog | Phase 4–5 | ORION CTO | L1–L2 today |
| PB-102 | Predictive Intelligence engine | P3 | Forecast scenarios, risk probability (Phase 5) | Anticipate vs report | PB-101, PB-090 | Backlog | Phase 5 | Founder | PV-001 Phase 5 |
| PB-103 | Governed AI agents | P2 | Human-in-the-loop agents per ES-057 | Automation with oversight | PB-070, ES-039 | Backlog | Phase 4 | ORION CTO | — |

---

### Platform Services

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-110 | Command Palette / Universal Search | P1 | Mission 14C search and navigation | Executive wayfinding | — | **Done** | 14C | ORION CTO | RR-008 |
| PB-111 | Workflow Engine | P1 | Cross-workspace approvals, delegation, task routing (Phase 4) | Execution orchestration | PB-015 | Backlog | Phase 4 | ORION CTO | PV-001 Phase 4 |
| PB-112 | Automation Engine | P2 | Event-driven automation rules across workspaces | Reduce manual executive ops | PB-111, ES-033 | Backlog | Phase 4 | ORION CTO | — |
| PB-113 | Notifications platform service | P2 | Actionable notification lifecycle; not workspace alerts | Constitution: timely, actionable | PB-023 | Backlog | Phase 2 | ORION CTO | UI patterns only |
| PB-114 | Event & messaging backbone | P2 | ES-033 full architecture beyond in-memory | Real-time intelligence refresh | ES-033 | Backlog | Phase 4 | ORION CTO | Foundation delivered |
| PB-115 | Reporting platform service | P2 | Executive report generation across workspaces | Export without losing Brief UX | — | Backlog | Phase 3 | ORION CTO | Placeholder report routes |
| PB-116 | Settings & configuration service | P2 | Unified platform + workspace settings | Operator self-service | — | In Progress | Phase 2 | ORION CTO | `/configuration` partial |

---

### Design System

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| DS-001 | Design token migration (17C) | P2 | Replace `text-white/55` opacity tokens with `orion-muted` platform-wide | Visual consistency | — | In Progress | Phase 2 · Sprint 5 | ORION CTO | Partial · constants expanded |
| DS-002 | Table & Pagination components | P2 | Shared DS Table and Pagination for CRM/Finance directories | Eliminate ad-hoc table CSS | — | Backlog | Phase 2 | ORION CTO | RR-018 limitation |
| DS-003 | WorkspacePageHeader adoption | P2 | Migrate Marketing, Hospitality, Finance, Advisor to shared header | DRY headers | DS-001 | In Progress | Phase 2 | ORION CTO | `workspace-format.ts` created |
| DS-004 | Domain badge platform pattern | P3 | Promote CRM badge wrappers if reused by Finance/Hospitality | Shared domain labels | — | Backlog | Phase 3 | ORION CTO | — |

---

### Accessibility

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-120 | WCAG 2.1 AA executive surfaces audit | P1 | Formal accessibility audit Brief + Command Center + Shell | Inclusive executive access | — | Backlog | Phase 2 | ORION CTO | Patterns in place; audit pending |
| PB-121 | Keyboard navigation full workspace audit | P2 | Verify filter bars, tables, pipeline boards | Keyboard-first executives | DS-002 | Backlog | Phase 2 | ORION CTO | Brief focus rings added 17E |
| PB-122 | Screen reader Brief section announcements | P2 | `aria-live` on status banner and priority changes | Assistive technology support | PB-010 | In Progress | Phase 2 | ORION CTO | Partial in BriefStatusBanner |

---

### Performance

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-130 | Brief load time budget | P2 | Target ≤ 2s TTFB for `/brief` on production hardware | 60-second orientation | PB-030 | Backlog | Phase 2 | ORION CTO | SSR today |
| PB-131 | Client-side query migration | P2 | Server-side filter/sort for CRM/Finance directories | Scale placeholder → live data | PB-030, PB-038 | Backlog | Phase 2 | ORION CTO | — |
| PB-132 | Bundle analysis & code splitting review | P3 | Identify large components; lazy load where appropriate | Faster shell navigation | — | Backlog | Phase 2 | ORION CTO | App Router splits routes |

---

### Security

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-140 | RBAC enforcement live | P1 | Enforce `CRM_ROUTE_PERMISSIONS` and platform roles on routes/actions | Enterprise readiness | ES-037 | Backlog | Phase 2 | ORION CTO | Metadata prepared |
| PB-141 | RBAC enhancements — workspace actions | P2 | Act/Delegate/Snooze permission gates | Least privilege | PB-140, PB-015 | Backlog | Phase 2 | ORION CTO | — |
| PB-142 | MFA & Zero Trust (ES-059) | P1 | Multi-factor authentication; Zero Trust alignment | Platform security | ES-037, ES-059 | Backlog | Phase 2 | ORION CTO | Placeholder auth today |
| PB-143 | Secrets & credential audit | P2 | Verify no secrets in repo; integration credential vault | Trust & compliance | ES-059 | Backlog | Phase 2 | ORION CTO | CRM audit clean RR-018 |

---

### Documentation

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-150 | Platform Vision & Roadmap v1 | P1 | Master strategic product document PV-001 | Guides all future work | — | **Done** | Jul 2026 | Founder | [ORION_Platform_Vision_and_Roadmap_v1.md](./ORION_Platform_Vision_and_Roadmap_v1.md) |
| PB-151 | Product Backlog v1 (this document) | P1 | Single source of truth for work | Sprint planning gate | PB-150 | **Done** | Jul 2026 | Founder | PB-001 |
| PB-152 | Link PV-001 from Project Charter | P3 | Cross-reference vision doc in charter and doc baseline | Discoverability | PB-150 | Backlog | — | ORION CTO | — |
| PB-153 | RR-019 Sprint 17 Executive Experience release record | P2 | Document Sprints 17A–17E delivery | Release governance | PB-010 | Backlog | Phase 2 | ORION CTO | — |

---

### Technical Debt

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-160 | TD-001 Finance placeholder data | P2 | See [Technical Debt Register](../09_Standards/Technical_Debt_Register.md) | Live finance | PB-040 | Open | Phase 2 | ORION CTO | **TD-001** |
| PB-161 | TD-002 CRM placeholder data | P2 | See Technical Debt Register | Live CRM | PB-030 | Open | Phase 2 | ORION CTO | **TD-002** |
| PB-162 | Dual recommendation engines | P1 | Consolidate `recommendation-engine.ts` and ES-029 `RecommendationEngine` | Single ranking truth | PB-020 | Backlog | Phase 2 | ORION CTO | Same export name risk |
| PB-163 | Legacy intelligence pipeline migration | P2 | Migrate remaining legacy paths to ES-065 architecture | Maintainability | PB-100 | In Progress | Phase 2 | ORION CTO | ES-065 partial |
| PB-164 | Coverage folder lint warning | P3 | Remove or fix `coverage/block-navigation.js` eslint directive | Clean lint gate | — | Backlog | — | ORION CTO | Pre-existing warning |

---

### Developer Experience

| ID | Title | P | Description | Business Value | Dependencies | Status | Sprint | Owner | Notes |
|----|-------|---|-------------|----------------|--------------|--------|--------|-------|-------|
| PB-170 | CI/CD pipeline (ES-055) | P1 | Automated typecheck, lint, test, build on PR | Quality gate enforcement | ES-054 | Backlog | Phase 2 | ORION CTO | Local verification only |
| PB-171 | Automated test coverage reporting | P2 | Coverage thresholds on critical paths | Regression confidence | PB-170 | Backlog | Phase 2 | ORION CTO | 340 tests today |
| PB-172 | Workspace scaffolding CLI | P3 | Generator for ADR-005 workspace boilerplate | Faster module addition | — | Backlog | Phase 3 | ORION CTO | ES-060 extensibility |

---

## Completed Items (Reference)

| ID | Title | Released In |
|----|-------|-------------|
| PB-010 | Morning Executive Brief v1.0 polish | Sprint 17A/17E |
| PB-011 | Command Center ↔ Brief cross-navigation | Sprint 17E |
| PB-037 | CRM Workspace v1.0 release | RR-018 · Mission 16A.8 |
| PB-043 | Finance Workspace foundation | RR-009–RR-011 |
| PB-100 | AI Orchestration foundation | RR-016, RR-017 |
| PB-110 | Command Palette / Universal Search | RR-008 |
| PB-150 | Platform Vision & Roadmap v1 | PV-001 |
| PB-151 | Product Backlog v1 | PB-001 |

---

## Backlog Change Log

| Date | Version | Change |
|------|---------|--------|
| 28 July 2026 | 1.0 | Initial PB-001 — 52 items from release records, TD register, PV-001, Sprints 16A–17E |

---

## How to Add an Item

1. Assign next `PB-xxx` (or `DS-xxx` for design-system-only items).
2. Complete all fields in the category table.
3. If technical debt, register or reference `TD-xxx`.
4. Submit for product review against Product Constitution.
5. Set status to `Ready` when ES-xxx exists or spike is complete.
6. Target sprint assigned at programme planning.

---

# Document Control

| Field | Value |
|-------|-------|
| **Version** | 1.0 |
| **Next review** | Q4 2026 programme planning |
| **Owner** | Founder & Chief Architect |
