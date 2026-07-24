# ES-021 – Executive Intelligence Engines

> **Canonical specification:** [ES-039 — AI Orchestration & Agent Framework](./ES-039-AI-Orchestration-Agent-Framework.md) (Approved · extends intelligence platform for Construction Phase AI orchestration)

## Executive Summary

**Status:** Approved

**Priority:** Critical

**Product Version:** v2.0.0 – Executive Intelligence Platform

**Document Version:** 1.0

**Mission:** 17B

**Outcome:** Reusable Executive Intelligence Engines that transform provider output into platform-wide executive intelligence — generic, deterministic, and workspace-independent.

---

## Founder Promise

Every workspace contributes intelligence through Providers. Every executive decision is produced by the Executive Intelligence Platform. Engines remain permanent platform services — never CRM, Finance, or UI code.

---

## Success Criteria

- Health Engine aggregates provider health with configurable thresholds
- Recommendation Engine aggregates and sorts recommendations, priorities, opportunities, and alerts
- Brief Engine produces `ExecutiveBriefSnapshot` from engine outputs
- Intelligence Pipeline orchestrates engines without business calculations
- Provider Registry delegates to engines (`aggregateHealth`, `aggregateRecommendations`, `aggregateSummaries`, `prepareBrief`)
- Engine interfaces allow future replacement without affecting providers
- Platform metrics expose registry and engine statistics
- CRM workspace pipeline moved to `lib/crm/crm-intelligence-pipeline.ts`
- No React dependencies in engine layer
- No behavioural changes to existing features

---

## Platform Modules (Mission 17B Scope)

| Module | Purpose |
|--------|---------|
| `health-engine.ts` | Platform and workspace health aggregation |
| `recommendation-engine.ts` | Recommendation, priority, and alert aggregation |
| `brief-engine.ts` | Executive brief snapshot preparation |
| `pipeline.ts` | Generic engine orchestration |
| `engine-models.ts` | Engine-specific types |
| `engine-interfaces.ts` | HealthEngine, RecommendationEngine, BriefEngine, PipelineEngine |
| `platform-metrics.ts` | Platform statistics and engine execution metrics |
| `provider-registry.ts` | Engine delegation (updated) |

---

## Engine Architecture

```
Executive Providers
        ↓
Provider Registry
        ↓
Health Engine → Recommendation Engine → Brief Engine
        ↓
Intelligence Pipeline
        ↓
Executive Shell
```

---

## Out of Scope (Mission 17B)

AI, forecasting, machine learning, LLM integration, chat interfaces, predictive analytics, workflow automation, UI changes.

---

## ADR Reference

[ADR-006 — Executive Intelligence Provider Framework](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md)

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | ORION CTO |
| **Date** | 24 July 2026 |
| **Release Record** | RR-017 · [ES-028](./ES-028-Executive-Brief-Engine.md) · [ES-029](./ES-029-Recommendation-Engine.md) · [ES-030](./ES-030-Alert-Engine.md) · [ES-031](./ES-031-Trend-Engine.md) · [ES-032](./ES-032-Business-Health-Engine.md) (canonical specs) |
