# ORION Executive Intelligence Platform

Version 2.0 · Mission 17B · ADR-006

---

## Purpose

`lib/intelligence/` is the permanent home for ORION's Executive Intelligence Platform. Every Business Workspace publishes executive intelligence through a standard Provider interface. The Provider Registry discovers providers and delegates aggregation to Intelligence Engines.

**Mission 17B** implements reusable Executive Intelligence Engines. No React. No UI. Pure TypeScript.

---

## Directory Structure

```
lib/intelligence/
├── index.ts                   # Barrel export (provider, models, registry, constants, errors)
├── provider.ts                # ExecutiveProvider contract (Mission 17A)
├── models.ts                  # Platform-generic models
├── constants.ts               # Platform constants
├── errors.ts                  # Platform errors
├── provider-registry.ts       # Registration lifecycle + engine delegation
├── engine-interfaces.ts       # HealthEngine, RecommendationEngine, BriefEngine, PipelineEngine
├── engine-models.ts           # Engine-specific types
├── health-engine.ts           # Platform health aggregation (Mission 17B)
├── recommendation-engine.ts   # Recommendation aggregation (Mission 17B)
├── brief-engine.ts            # Executive brief preparation (Mission 17B)
├── pipeline.ts                # Generic platform pipeline (Mission 17B)
├── platform-metrics.ts        # Platform statistics (Mission 17B)
├── intelligence-bus.ts        # Advisor entry point (ADR-006)
├── ai-providers.ts            # Future AI contracts
├── register-executive-providers.ts
└── workspace-providers/       # Workspace provider implementations
```

Workspace-specific pipelines live in workspace modules (e.g. `lib/crm/crm-intelligence-pipeline.ts`).

---

## Architecture

```
Executive Shell (Advisor)
        │
        ▼
Intelligence Bus
        │
Provider Registry
        │
   ┌────┴────┬──────────────┐
   ▼         ▼              ▼
Health    Recommendation   Brief
Engine      Engine        Engine
   │         │              │
   └────┬────┴──────────────┘
        ▼
Intelligence Pipeline
        │
Workspace Providers (Finance, CRM, …)
        │
Workspace Business Logic
```

---

## Provider Lifecycle

| Stage | Function | Description |
|-------|----------|-------------|
| Registration | `register()` | Validates and registers a provider |
| Discovery | `discover()` / `getProviders()` | Lists all registered providers |
| Validation | Internal | Version check, method validation, registry limits |
| Health | `aggregateHealth()` | Delegates to Health Engine |
| Recommendations | `aggregateRecommendations()` | Delegates to Recommendation Engine |
| Summaries | `aggregateSummaries()` | Delegates to Brief Engine helpers |
| Brief | `prepareBrief()` | Delegates to Brief Engine |
| Aggregation | `aggregate()` | Full platform snapshot via pipeline |
| Removal | `unregister()` | Removes a provider by id |

---

## Engine Interfaces

Defined in `engine-interfaces.ts` — allow future engine replacement without affecting providers:

- `HealthEngine` — `aggregate(providers) → PlatformHealthSnapshot`
- `RecommendationEngine` — `aggregate(providers) → RecommendationBundle`
- `BriefEngine` — `prepare(providers, health, recommendations, summaries) → ExecutiveBriefSnapshot`
- `PipelineEngine` — `run(providers) → AggregationResult`

---

## Dependency Rules

Engines may depend upon: `provider.ts`, `models.ts`, `engine-models.ts`, `constants.ts`, `errors.ts`.

Engines may NOT depend upon: CRM, Finance, Hospitality, React, Tailwind, Dashboard Components.

---

## Extension Strategy

### Adding a New Workspace

1. Implement `RegisteredExecutiveProvider` in `workspace-providers/`
2. Call `register()` in `register-executive-providers.ts`
3. No changes to existing workspaces or engines

### Future AI Integration

Register AI services in `ai-providers.ts`. AI consumes provider output through the Intelligence Bus — never individual workspaces.

---

## Versioning

| Version | Mission | Change |
|---------|---------|--------|
| 2.0 | 17B | Executive Intelligence Engines — generic, provider-driven |
| 1.0 | 17A | Platform foundation — provider, models, registry, constants, errors |
| 1.1 | 16D | Initial intelligence engines and CRM pipeline |
| 1.2 | ADR-006 | Provider registry, Intelligence Bus, workspace providers |

---

## Related Documentation

- [ORION Intelligence Constitution](../docs/05_AI/ORION_Intelligence_Constitution.md)
- [ORION Decision Framework](../docs/05_AI/ORION_Decision_Framework.md)
- [ADR-006 — Executive Intelligence Provider Framework](../docs/10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md)
- [ES-020 — Executive Intelligence Foundation](../docs/02_Engineering/ES-020-Executive-Intelligence-Foundation.md)
- [ES-021 — Executive Intelligence Engines](../docs/02_Engineering/ES-021-Executive-Intelligence-Engines.md)
- [ES-039 — AI Orchestration & Agent Framework](../docs/02_Engineering/ES-039-AI-Orchestration-Agent-Framework.md)
- [ES-057 — AI Governance & Responsible Intelligence Framework](../docs/02_Engineering/ES-057-ORION-AI-Governance-Responsible-Intelligence-Framework.md)
- [ES-060 — Platform Extensibility, Plugin & Marketplace Architecture](../docs/02_Engineering/ES-060-ORION-Platform-Extensibility-Plugin-Marketplace-Architecture.md)
- [ARCHITECTURE_INDEX.md](../docs/03_Architecture/ARCHITECTURE_INDEX.md)
