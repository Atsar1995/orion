# ADR-006 — Executive Intelligence Provider Framework

> **Canonical specification:** [ES-034 — Provider & Data Contract Standards](../02_Engineering/ES-034-Provider-Data-Contract-Standards.md) (Approved · Executive Intelligence profile delivered)

## Status

Accepted

## Date

24 July 2026

## Architecture Reference

[PA-001](../03_Architecture/ORION_Platform_Architecture.md) · [ADR-005](./ADR-005-Business-Workspace-Architecture.md)

## Supersedes

Mission 16D direct pipeline-to-brief wiring for Executive Brief components. Executive Brief components shall consume the Provider Registry via the Intelligence Bus.

---

## Context

ORION has successfully established multiple Business Workspaces that independently provide executive capabilities.

Current completed workspaces include:

- Finance
- Customer Intelligence

Future workspaces include Hospitality, Commerce, Marketing, Operations, HR, Legal, Projects, and Procurement.

Originally, the Executive Brief consumed intelligence directly from individual workspaces. Although suitable for early development, this approach creates increasing coupling as additional workspaces are introduced.

A scalable platform requires workspace independence while still allowing every workspace to contribute executive intelligence.

---

## Decision

ORION introduces the **Executive Intelligence Provider Framework**.

Every Business Workspace shall expose executive intelligence through a standard Provider interface.

The Executive Intelligence Platform shall aggregate provider output through a central Provider Registry.

The Executive Brief shall consume only aggregated intelligence.

It shall never communicate directly with individual workspaces.

---

## Platform Architecture

```
Executive Shell
       │
       ▼
Executive Intelligence Bus
       │
Provider Registry
       │
 ┌─────┼──────────────┐
 │     │              │
 ▼     ▼              ▼
Finance CRM     Hospitality
Provider Provider Provider
 │     │              │
 ▼     ▼              ▼
Workspace Logic Workspace Logic
```

---

## Provider Responsibilities

Each provider publishes executive information for its workspace.

Minimum responsibilities:

- Health
- Alerts
- Recommendations
- Executive Summary
- Metrics
- Risks
- Priorities

Providers own their own business logic.

Providers never consume intelligence from other providers.

---

## Provider Interface

```typescript
export interface ExecutiveProvider {
  id: string;
  workspace: string;
  getHealth(): HealthScore;
  getAlerts(): BusinessAlert[];
  getRecommendations(): ExecutiveRecommendation[];
  getExecutiveSummary(): ExecutiveSummary;
  getMetrics(): ExecutiveMetric[];
  getRisks(): RiskIndicator[];
  getPriorities(): ExecutivePriority[];
  getBriefingLine(): string;
  getBriefCardSnapshot(): unknown;
}
```

The interface may evolve through semantic versioning.

---

## Provider Registry

**Location:** `lib/intelligence/provider-registry.ts`

**Responsibilities:**

- Register Provider
- Unregister Provider
- Discover Providers
- Aggregate Intelligence
- Provide Executive Snapshot

The registry is the single source of provider discovery.

---

## Executive Intelligence Bus

**Location:** `lib/intelligence/intelligence-bus.ts`

The Intelligence Bus coordinates communication between providers and intelligence engines.

**Responsibilities:**

- Provider discovery
- Health aggregation
- Recommendation aggregation
- Alert aggregation
- Priority aggregation
- Executive Brief generation

Business Workspaces never communicate directly with one another.

---

## Shared Intelligence Engines

Mission 16D introduces reusable platform engines in `lib/intelligence/`:

- `health-engine.ts`
- `recommendation-engine.ts`
- `brief-engine.ts`
- `pipeline.ts`
- `models.ts`

These engines consume provider output rather than workspace implementations.

---

## Workspace Independence

Business Workspaces remain completely independent.

Adding or removing a workspace shall not require changes to existing workspaces.

Only the Provider Registry changes.

This minimises platform coupling.

---

## AI Readiness

Artificial Intelligence will integrate exclusively with the Executive Intelligence Platform.

Future AI services will consume provider output through standard interfaces (`ai-providers.ts`).

AI shall not access individual workspaces directly.

This preserves separation of concerns.

---

## Consequences

### Positive

- New workspaces require minimal platform changes
- Intelligence becomes reusable
- Executive Brief remains simple
- AI integration becomes straightforward
- Loose coupling and high cohesion
- Easier testing and consistent architecture

### Negative

- Additional abstraction layer
- Slight increase in platform complexity
- Provider versioning must be managed carefully

---

## Governance

All Business Workspaces shall implement the Executive Provider interface.

The Executive Brief shall consume only Provider Registry output via the Intelligence Bus.

Direct imports from Business Workspaces into Executive Brief components are prohibited.

---

## Compliance

This ADR is mandatory for:

- Finance
- Customer Intelligence
- Hospitality
- Commerce
- Marketing
- Operations
- HR
- Legal
- Future Business Workspaces

---

## CTO Approval

Approved.

This ADR establishes the Executive Intelligence Platform as the central architectural foundation for ORION Version 2.x.
