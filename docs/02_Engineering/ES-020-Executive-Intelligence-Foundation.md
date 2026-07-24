# ES-020 – Executive Intelligence Foundation

> **Canonical specification:** [ES-039 — AI Orchestration & Agent Framework](./ES-039-AI-Orchestration-Agent-Framework.md) (Approved · extends intelligence platform for Construction Phase AI orchestration)

## Executive Summary

**Status:** Approved

**Priority:** Critical

**Product Version:** v2.0.0 – Executive Intelligence Platform

**Document Version:** 1.0

**Mission:** 17A

**Outcome:** ORION's shared Executive Intelligence Platform foundation — provider contract, generic models, registry lifecycle, constants, errors, and barrel exports.

---

## Founder Promise

Build the intelligence layer once. Every Business Workspace publishes through a standard Provider. The registry discovers and aggregates — the Executive Brief never imports workspaces directly.

---

## Success Criteria

- `lib/intelligence/` permanent platform module
- `ExecutiveProvider` contract in `provider.ts`
- Generic platform models in `models.ts` (no workspace-specific types)
- Provider registry with register, unregister, discover, aggregate lifecycle
- Platform constants and errors
- Barrel export via `index.ts`
- Intelligence README with lifecycle documentation
- No React dependencies in foundation layer
- No behavioural changes to existing features

---

## Platform Modules (Mission 17A Scope)

| Module | Purpose |
|--------|---------|
| `provider.ts` | ExecutiveProvider contract |
| `models.ts` | HealthScore, BusinessAlert, ExecutiveRecommendation, etc. |
| `provider-registry.ts` | Registration lifecycle |
| `constants.ts` | Platform version, workspace IDs, thresholds |
| `errors.ts` | Standard platform errors |
| `index.ts` | Barrel export |

---

## Out of Scope (Mission 17A)

Health Engine, Recommendation Engine, Brief Engine, Pipeline, workspace providers, AI, Executive Dashboard — these exist from prior missions but are not 17A deliverables.

---

## ADR Reference

[ADR-006 — Executive Intelligence Provider Framework](../10_Decisions/ADR-006-Executive-Intelligence-Provider-Framework.md)

---

## Document Approval

| Field | Value |
|-------|-------|
| **Approved By** | ORION CTO |
| **Date** | 24 July 2026 |
| **Release Record** | RR-016 |
