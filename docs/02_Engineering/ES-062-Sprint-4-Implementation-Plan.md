# ES-062 — Sprint 4 Implementation Plan

**Version:** 1.1.0

**Status:** Approved · **In Progress**

**Classification:** Engineering Implementation Plan

**Author:** Founder & Chief Architect

**Related specifications:** [ES-061 — ORION v0.4 Master Development Plan](./ES-061-ORION-v0.4-Master-Development-Plan.md) · [ES-063 — Sprint 4 WBS](./ES-063-Sprint-4-Work-Breakdown-Structure.md) · [ES-064 — Sprint 4 Task Catalogue](./ES-064-Sprint-4-Engineering-Task-Catalogue.md) · [ES-065 — Executive Intelligence Architecture](./ES-065-Executive-Intelligence-Architecture.md) · [ES-022 — Executive Dashboard](./ES-022-Executive-Dashboard.md) · [ES-060 — Platform Extensibility](./ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md)

**Code baseline:** `main` @ `cc4a282` · Sprint 4 intelligence layer committed · documentation sync 25 July 2026

---

# Purpose

Sprint 4 delivers **v0.4 Phase 1 intelligence and dashboard foundations** — the Provider Framework, Sprint 4 intelligence engines (Brief, Recommendation, Alert), Intelligence Orchestrator, Executive Intelligence Service, and the `/dashboard` Executive Dashboard surface.

This document is the **approved Sprint 4 implementation plan** mapped against actual codebase state as of 25 July 2026.

> **Master programme:** [ES-061 — ORION v0.4 Master Development Plan](./ES-061-ORION-v0.4-Master-Development-Plan.md)

> **Work breakdown:** [ES-063 — Sprint 4 Work Breakdown Structure](./ES-063-Sprint-4-Work-Breakdown-Structure.md)

> **Task catalogue:** [ES-064 — Sprint 4 Engineering Task Catalogue](./ES-064-Sprint-4-Engineering-Task-Catalogue.md)

> **Architecture reference:** [ES-065 — Executive Intelligence Architecture](./ES-065-Executive-Intelligence-Architecture.md)

---

# Sprint Goal

Deliver a unified Executive Dashboard fed by a governed intelligence orchestration pipeline — Provider Framework → engines → `DashboardSnapshot` — with mock workspace providers and production-quality module structure.

**Status:** **Partial** — core intelligence stack and `/dashboard` delivered · widget registry, legacy migration, API, CI, and M9 acceptance **pending**.

---

# Sprint Duration

**Recommended:** 4 Weeks

**Execution started:** July 2026 (post `v0.3.0-enterprise-foundation`)

---

# Sprint Objectives

| Objective | Status |
|-----------|--------|
| Implement Provider Framework (ES-060) | **Done** · `lib/providers/` · 7 mock providers |
| Implement Executive Brief Engine (ES-028) | **Done** · `lib/intelligence/brief/` |
| Implement Recommendation Engine (ES-029) | **Done** · `lib/intelligence/recommendations/` · rule-driven |
| Implement Alert Engine (ES-030) | **Done** · `lib/intelligence/alerts/` · rule-driven |
| Implement Intelligence Orchestrator (ES-065) | **Done** · `lib/orchestrator/` · 10-stage pipeline |
| Deliver `/dashboard` Executive Dashboard (ES-022) | **Partial** · route live · no widget registry |
| Migrate Advisor/Command Center to orchestrator | **Open** · legacy `intelligence-bus` still active |
| REST API v1 foundation | **Open** |
| Production auth · CI/CD Phase A–B | **Open** |
| Sprint 4 test suite · M9 acceptance | **Partial** · Vitest locally · CI not wired |

---

# Deliverables

## Provider Framework (ES-060)

| Deliverable | Location | Status |
|-------------|----------|--------|
| Provider contract & types | `types/providers.ts` | **Done** |
| Base provider | `lib/providers/BaseProvider.ts` | **Done** |
| Mock providers (7 domains) | `lib/providers/MockProvider.ts` | **Done** |
| Provider registry | `lib/providers/ProviderRegistry.ts` | **Done** |
| Provider manager | `lib/providers/ProviderManager.ts` | **Done** |
| Provider health | `lib/providers/ProviderHealth.ts` | **Done** |
| Dashboard aggregator | `lib/providers/dashboard-aggregator.ts` | **Done** · legacy helpers remain |

## Intelligence Engines

| Engine | Location | Status |
|--------|----------|--------|
| Executive Brief Engine | `lib/intelligence/brief/` | **Done** |
| Recommendation Engine | `lib/intelligence/recommendations/` | **Done** · explainability UI pending |
| Alert Engine | `lib/intelligence/alerts/` | **Done** |
| Business Health (orchestrator stage) | `PipelineRunner` aggregation | **Partial** · 4 mock workspace drivers |
| Trend Engine (ES-031) | `lib/orchestrator/` trend stage | **Partial** · aggregation only · no `trend-engine.ts` |

## Orchestrator & Service Layer (ES-065)

| Deliverable | Location | Status |
|-------------|----------|--------|
| 10-stage pipeline definition | `lib/orchestrator/OrchestratorPipeline.ts` | **Done** |
| Pipeline runner | `lib/orchestrator/PipelineRunner.ts` | **Done** |
| Engine registry | `lib/orchestrator/EngineRegistry.ts` | **Done** |
| Execution context · logger · metrics · scheduler | `lib/orchestrator/` | **Done** |
| Executive Intelligence Service | `lib/intelligence/ExecutiveIntelligenceService.ts` | **Done** |
| Dashboard snapshot type | `types/intelligence.ts` · `types/orchestrator.ts` | **Done** |

## Executive Dashboard (ES-022)

| Deliverable | Route / component | Status |
|-------------|-------------------|--------|
| Dashboard page | `app/(platform)/dashboard/page.tsx` | **Done** |
| Health score widget | `components/dashboard/HealthScore.tsx` | **Done** |
| Metric cards | `components/dashboard/MetricCard.tsx` | **Done** |
| Brief card | `components/dashboard/BriefCard.tsx` | **Done** |
| Recommendation cards | `components/dashboard/RecommendationCard.tsx` | **Done** |
| Alert panel | `components/dashboard/AlertPanel.tsx` | **Done** |
| Task list | `components/dashboard/TaskList.tsx` | **Done** |
| Widget registry | — | **Open** |
| `/dashboard` canonical nav | — | **Open** · `/advisor` still default landing |
| Loading / dynamic revalidation | — | **Open** · static prerender at build |

## Quality & Governance

| Deliverable | Status |
|-------------|--------|
| Vitest test suite (Sprint 4 scope) | **Partial** · local · not in CI |
| Engineering audit | **Done** · [Engineering-Audit-Report.md](../03_Quality/Engineering-Audit-Report.md) |
| Performance audit | **Done** · [Performance-Audit.md](../03_Quality/Performance-Audit.md) |
| RR-018 Release Record | **Open** |
| M9 Sprint acceptance | **Not met** |

---

# Architecture Notes

## Dual intelligence stacks (known gap)

Sprint 4 introduced a **second intelligence path** alongside Mission 17B:

| Path | Entry | Consumers |
|------|-------|-----------|
| **Legacy** | `lib/intelligence/intelligence-bus.ts` | `/advisor`, CRM cards, platform metrics |
| **Sprint 4** | `lib/intelligence/ExecutiveIntelligenceService.ts` → `lib/orchestrator/` | `/dashboard` |

Remediation tracked in [Engineering Audit](../03_Quality/Engineering-Audit-Report.md) (C-01, C-02, C-03).

## Pipeline data flow (as-built)

```
/dashboard page
  → executiveIntelligenceService.getDashboardSnapshot()
    → intelligenceOrchestrator.getDashboardSnapshot()
      → PipelineRunner (10 stages)
        → ProviderManager + engines
          → DashboardSnapshot
```

---

# Remaining Sprint 4 Work

| Priority | Item | WBS / Task refs |
|----------|------|-----------------|
| P0 | Eliminate redundant provider fetches in pipeline | ES-065 · Performance Audit |
| P0 | Migrate Advisor to orchestrator · remove static bypass | S4-034 · S4T-022 |
| P0 | Widget registry and ES-022 full acceptance | S4-013–S4-018 · S4T-004–S4T-005 |
| P0 | CI/CD Phase A–B · wire Vitest | S4-043–S4-044 · S4T-080 |
| P0 | Standalone Trend Engine (ES-031) | S4-028 · S4T-060–S4T-068 |
| P1 | REST API `/api/v1/` | S4-049–S4-056 |
| P1 | Production authentication | S4-039–S4-041 |
| P1 | Legacy stack deprecation plan | ES-065 · ES-061 D3 |
| P1 | RR-018 · CHANGELOG · M9 sign-off | S4-107–S4-110 · S4T-090–S4T-108 |
| P2 | Executive Copilot MVP | S4-079–S4-086 |
| P2 | Phase 1 integrations | S4-087–S4-098 |

---

# Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Sprint goal and objectives documented | **Delivered** |
| Deliverables mapped to codebase | **Delivered** · this document v1.1.0 |
| Remaining work enumerated | **Delivered** |
| Alignment with ES-061 · ES-063 · ES-064 · ES-065 | **Delivered** |
| M9 Sprint 4 acceptance | **Not met** |

---

# References

| Document | Location |
|----------|----------|
| ES-061 v0.4 Master Plan | [ES-061-ORION-v0.4-Master-Development-Plan.md](./ES-061-ORION-v0.4-Master-Development-Plan.md) |
| ES-063 Sprint 4 WBS | [ES-063-Sprint-4-Work-Breakdown-Structure.md](./ES-063-Sprint-4-Work-Breakdown-Structure.md) |
| ES-064 Sprint 4 Task Catalogue | [ES-064-Sprint-4-Engineering-Task-Catalogue.md](./ES-064-Sprint-4-Engineering-Task-Catalogue.md) |
| ES-065 Executive Intelligence Architecture | [ES-065-Executive-Intelligence-Architecture.md](./ES-065-Executive-Intelligence-Architecture.md) |
| Engineering Audit | [Engineering-Audit-Report.md](../03_Quality/Engineering-Audit-Report.md) |
| Performance Audit | [Performance-Audit.md](../03_Quality/Performance-Audit.md) |

---

Approved

Founder

Chief Architect

---

ORION

Engineering clarity for better executive decisions.
