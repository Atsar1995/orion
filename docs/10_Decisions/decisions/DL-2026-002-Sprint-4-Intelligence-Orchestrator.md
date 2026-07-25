# DL-2026-002 — Sprint 4 Intelligence Orchestrator Architecture

**Decision ID:** DL-2026-002

**Date:** 2026-07-25

**Category:** Architecture

**Status:** Implemented

---

## Problem

Mission 17B delivered a single `intelligence-bus` + `pipeline.ts` path for Advisor and CRM surfaces. Sprint 4 required a governed executive dashboard pipeline with Provider Framework integration, rule-driven engines, and observability — without blocking on full legacy migration.

## Options Considered

1. **Extend Mission 17B pipeline in place** — Advantages: single stack. Disadvantages: incompatible provider model; high regression risk on Advisor/CRM.
2. **Replace legacy stack immediately** — Advantages: clean architecture. Disadvantages: large blast radius; delays Sprint 4 delivery.
3. **Introduce Sprint 4 orchestrator alongside legacy (dual stack)** — Advantages: `/dashboard` ships independently; incremental migration. Disadvantages: temporary duplication; consolidation debt.

## Decision

Implement a **new Intelligence Orchestrator** (`lib/orchestrator/`) and **Executive Intelligence Service** for `/dashboard`, running **alongside** the legacy Mission 17B intelligence bus until Advisor and CRM consumers are migrated.

## Rationale

Option 3 unblocks Sprint 4 delivery while preserving working Advisor/CRM paths. The orchestrator's 10-stage pipeline matches ES-065 target architecture and supports mock Provider Framework integration without rewriting Mission 17B engines first.

## Consequences

**Positive:**

- `/dashboard` consumes a single `DashboardSnapshot` from the orchestrator
- Sprint 4 Brief, Recommendation, and Alert engines ship as standalone modules
- Observability via `ExecutionLogger` and `PipelineMetrics`

**Negative:**

- Dual intelligence stacks until migration (Engineering Audit C-01)
- Redundant provider fetches across pipeline stages (Performance Audit P0)
- Duplicate aggregation logic in multiple modules

**Risks:**

- Consolidation deferred too long increases maintenance cost

**Trade-offs:**

- Accepted short-term duplication for faster Sprint 4 milestone delivery

## Related Documents

- [ES-065 — Executive Intelligence Architecture](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md)
- [ES-062 — Sprint 4 Implementation Plan](../02_Engineering/ES-062-Sprint-4-Implementation-Plan.md)
- [Engineering Audit Report](../03_Quality/Engineering-Audit-Report.md) (C-01, C-02, C-03)
- [Performance Audit Report](../03_Quality/Performance-Audit.md)
- [ADR-006 — Executive Intelligence Provider Framework](./ADR-006-Executive-Intelligence-Provider-Framework.md)

## Approved By

Founder · Chief Architect
