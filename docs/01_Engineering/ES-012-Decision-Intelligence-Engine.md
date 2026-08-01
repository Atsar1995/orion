# ES-012 — Decision Intelligence Engine

**Document ID:** ES-012 (Decision Intelligence Programme)  
**Blueprint:** [BP-004 — Decision Intelligence](../00_BLUEPRINT/BP-004-Decision-Intelligence.md)  
**Classification:** Engineering Specification  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** ORION CTO  
**Audience:** Founder · Chief Architect · Engineering · QA  

> **Document ID note:** ES-012 in the **Decision Intelligence programme** denotes the Decision Intelligence Engine (DIE). This is distinct from [ES-012 — Engineering Workspace](../02_Engineering/ES-012-Engineering-Workspace.md) (platform workspace surface). Programme documents live under `docs/01_Engineering/`; platform workspace documents live under `docs/02_Engineering/`.

**Governed by:**

- [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)
- [ORION Architecture Handbook](../03_Architecture/ORION_Architecture_Handbook.md)
- [ORION Engineering Principles](../09_Standards/ORION_Engineering_Principles.md)

**Related specifications:**

- [BP-004 — Decision Intelligence](../00_BLUEPRINT/BP-004-Decision-Intelligence.md)
- [EC-003 — Executive Recommendation Engine](../05_Product/EC-003_Executive_Recommendation_Engine.md)
- [EC-004 — Executive Decision Center](../05_Product/EC-004_Executive_Decision_Center.md)
- [EC-002A — Business Health Engine Core](../07_Engineering/EC-002A_Business_Health_Engine_Core.md)
- [ES-010 — Explainability & Confidence Engine](../07_Engineering/ES-010_Explainability_Confidence_Engine.md)
- [EC-002B Release Review](./EC-002B_Release_Review.md)
- [ES-029 — Recommendation Engine](../02_Engineering/ES-029-Recommendation-Engine.md) — legacy Sprint 4 engine (supersession target)
- [ES-065 — Executive Intelligence Architecture](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md)
- [Architecture Audit v0.4.0](./Architecture_Audit_v0.4.md)
- [DC-012 — Decision Intelligence Engine](./DC-012-Decision-Intelligence-Engine.md)

---

# Purpose

The Decision Intelligence Engine (DIE) is the **reasoning layer** of ORION.

Its responsibility is to transform deterministic business intelligence into structured **executive decision packages**.

The engine itself performs **no AI reasoning**.

It orchestrates deterministic decision services.

---

# Objectives

The Decision Intelligence Engine shall:

- analyze business intelligence
- evaluate applicable rules
- generate recommendations
- prioritize actions
- estimate impact
- calculate confidence
- validate recommendations
- produce executive-ready decision packages

---

# Design Principles

The engine must be:

- deterministic
- modular
- composable
- explainable
- immutable
- testable
- configuration-driven

No business logic may exist inside UI components.

---

# High-Level Architecture

```
Business Health Engine (EC-002A)
            │
Explainability Engine (EC-002B)
            │
Confidence Engine (EC-002B)
            │
            ▼
Decision Intelligence Engine (DIE)
            │
 ┌──────────┼──────────┐
 │          │          │
 ▼          ▼          ▼
Recommendation  Priority   Validation
Engine          Engine     Engine
            │
            ▼
Decision Package Builder
            │
            ▼
Executive Surfaces (Dashboard · Brief · Command Center · Decisions)
```

---

# Engine Responsibilities

The engine coordinates the complete decision pipeline.

It does **not**:

- own business metrics (EC-002A)
- own explainability narrative generation (EC-002B)
- own UI rendering (EP-001/002 components)
- perform persistence (ES-010 Persistence Foundation)

---

# Inputs

| Input | Source module | Required |
|-------|---------------|----------|
| Business Health | `lib/business-health/` (EC-002A) | Yes |
| Explainability Results | `lib/explainability/` (EC-002B) | Yes |
| Confidence Results | `ConfidenceEngine` (EC-002B) | Yes |
| Business Metrics | Orchestrator snapshot / provider aggregation | Yes |
| Trend Analysis | Orchestrator / provider trends | Optional |
| Executive Context | `PlatformContext` (EP-001 contract) | Optional V1 |
| Configuration | `DecisionIntelligenceConfig` | Yes |
| Rule Registry | `DecisionRuleRegistry` | Yes |

---

# Outputs

## Decision Package

Each package is an **immutable** object containing one or more validated recommendations.

| Field | Required | Description |
|-------|----------|-------------|
| `recommendation` | Yes | Action proposal |
| `evidence` | Yes | Measurable support |
| `confidence` | Yes | Inherited deterministic score |
| `impact` | Yes | Expected business improvement |
| `urgency` | Yes | Time sensitivity |
| `priority` | Yes | Rank among peers |
| `assumptions` | No | Explicit assumptions |
| `dependencies` | No | Blocking or related items |
| `risks` | No | Risk of action or inaction |
| `alternatives` | No | Other viable options |

---

# Internal Components

## Recommendation Engine

Produces executive recommendations from rule evaluation output.

**V1 scope:** Wrap and supersede Sprint 4 `lib/intelligence/recommendations/RecommendationEngine.ts` behind DIE facade.

---

## Priority Engine

Ranks recommendations using deterministic criteria:

- business impact
- urgency
- confidence
- effort
- dependencies
- strategic importance

**V1 scope:** Unify `RecommendationPrioritizer` and EP-002 priority mock into single engine.

---

## Impact Estimator

Calculates expected business improvement from rule metadata and health/metric deltas.

**V1 scope:** Rule-declared impact templates; no ML.

---

## Recommendation Validator

Verifies completeness before package emission.

---

## Rule Registry

Discovers active decision rules.

Supports:

- registration
- versioning
- enable/disable
- configuration

Rules remain completely independent (Open/Closed Principle).

---

## Decision Package Builder

Produces immutable output objects.

No mutation after build.

---

# Processing Pipeline

```
Collect Inputs
        ↓
Normalize Context
        ↓
Load Rules
        ↓
Evaluate Rules
        ↓
Generate Recommendations
        ↓
Estimate Impact
        ↓
Calculate Priority
        ↓
Validate
        ↓
Build Decision Package
        ↓
Return Result
```

---

# Rule Registry

Each rule must implement a common interface.

Example responsibilities:

- determine applicability
- evaluate conditions
- generate evidence
- estimate impact
- produce recommendation draft

Rules shall remain completely independent.

### Proposed contract (design only)

```typescript
interface DecisionRule {
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly category: DecisionRuleCategory;

  isApplicable(context: DecisionEvaluationContext): boolean;
  evaluate(context: DecisionEvaluationContext): DecisionRuleResult;
}

interface DecisionRuleResult {
  readonly recommendation: RecommendationDraft | null;
  readonly evidence: readonly EvidenceItem[];
  readonly impact: ImpactEstimate | null;
  readonly errors: readonly RuleEvaluationError[];
}
```

---

# Rule Lifecycle

```
Registered
    ↓
Enabled
    ↓
Evaluated
    ↓
Produces Recommendation
    ↓
Validated
    ↓
Returned
```

---

# Validation Rules

Every recommendation must contain:

| Mandatory field | Validation |
|-----------------|------------|
| unique identifier | Non-empty, stable across runs for same input |
| title | Non-empty string |
| summary | Non-empty string |
| recommendation | Action object with label and description |
| evidence | ≥ 1 evidence item with source reference |
| confidence | Score ∈ [0, 1] from ConfidenceEngine path |
| impact | Impact estimate object |
| urgency | Enum: `immediate` · `today` · `this_week` · `monitor` |
| priority | Positive integer rank |

If any mandatory field is missing, **validation fails** and the recommendation is excluded from the package (with audit log entry).

---

# Determinism

The same inputs shall always produce the same outputs.

- No randomness is permitted.
- No `Date.now()` in evaluation path — timestamps supplied by caller.
- Rule evaluation order is stable (registry sort by `id`).

---

# Explainability

Every recommendation shall expose:

- why it exists (`reason` / narrative from EC-002B)
- supporting evidence (structured `EvidenceItem[]`)
- originating rules (`ruleId`, `ruleVersion`)
- confidence source (`ConfidenceFactor[]` from EC-002B)

Explainability is **read-only consumption** of EC-002B output — DIE does not regenerate narratives.

---

# Error Handling

- Invalid rules shall **not** stop engine execution.
- Rule failures shall be isolated per rule.
- The engine continues processing remaining rules.
- Failed rules emit `RuleEvaluationError` in result metadata.

---

# Extensibility

Future engines integrate without modification to existing components:

| Future engine | BP-004 capability | Integration point |
|---------------|-------------------|-------------------|
| Risk Engine | Capability 3 | Post-recommendation enrichment |
| Opportunity Engine | Capability 4 | Rule category extension |
| Scenario Engine | Capability 5 | Parallel evaluation branch |
| Decision Validator | Capability 6 | EC-004 lifecycle hook |

Architecture follows the **Open/Closed Principle**.

---

# Performance

| Stage | Target |
|-------|--------|
| Rule evaluation | < 500 ms |
| Recommendation generation | < 250 ms |
| Complete decision package | < 1 second |

Measured on deterministic mock fixtures in CI (not provider network calls).

---

# Security

- No rule may modify business data.
- The engine is **read-only**.
- No network calls in core evaluation path.
- No database dependencies in V1.

---

# Proposed Module Layout

Target location: `lib/decision-intelligence/` (not yet implemented).

```
lib/decision-intelligence/
  models/
    DecisionPackage.ts
    Recommendation.ts
    Evidence.ts
    ImpactEstimate.ts
    DecisionEvaluationContext.ts
  engine/
    DecisionIntelligenceEngine.ts    # Orchestrator
    RecommendationEngine.ts          # Capability 1
    PriorityEngine.ts                # Capability 2
    ImpactEstimator.ts
    RecommendationValidator.ts
  rules/
    DecisionRuleRegistry.ts
    DecisionRule.ts                  # Interface
    default-rules/                   # Configuration-driven catalogue
  builder/
    DecisionPackageBuilder.ts
  index.ts                           # Public API
```

**Dependency direction:**

```
lib/decision-intelligence/
  → lib/business-health/
  → lib/explainability/
  → types/executive/
  ✗ components/
  ✗ lib/providers/ (direct — via orchestrator snapshot only)
```

---

# Testing Requirements

## Unit tests

- rules (applicability, evaluation, isolation)
- validators (mandatory field enforcement)
- prioritization (deterministic ordering)
- impact estimation
- package builder (immutability)

## Integration tests

- engine orchestration (full pipeline)
- rule execution (multi-rule, failure isolation)
- package generation (EC-002A/B input fixtures)

## Snapshot tests

- executive decision packages (golden files)

## Performance tests

- evaluation latency (< 1 s budget)
- scalability (100+ rules — future)

---

# Engineering Standards

| Constraint | Enforcement |
|------------|-------------|
| No mutable shared state | Immutable outputs; fresh context per run |
| No circular dependencies | DIE → EC-002A/B only |
| No UI imports | lib layer only |
| No database dependencies | V1 in-memory / snapshot inputs |
| No AI dependencies | EC-005 is downstream consumer |
| No network calls | Pure deterministic reasoning |
| No business logic in UI | EP-002 widgets consume packages only |

---

# Current State (v0.4.0 Baseline)

Per [Architecture Audit v0.4.0](./Architecture_Audit_v0.4.md):

| ES-012 component | v0.4.0 status |
|------------------|---------------|
| Decision Intelligence Engine | **Not implemented** |
| Recommendation Engine (DIE) | Partial — `lib/intelligence/recommendations/` (Sprint 4) |
| Priority Engine (DIE) | Partial — `RecommendationPrioritizer` only |
| Impact Estimator | **Not implemented** |
| Recommendation Validator | **Not implemented** |
| Rule Registry (DIE) | Partial — `RecommendationRules.ts` (Sprint 4) |
| Decision Package Builder | **Not implemented** |
| EC-002A/B wired to recommendations | **No** |

**Prerequisites before DIE implementation:**

1. P0 — Consolidate executive data paths (Architecture Audit)
2. P0 — Wire EC-002A into orchestrator snapshot
3. P1 — Wire EC-002B confidence/explainability into recommendation contract
4. ADR — Supersession of ES-029 Sprint 4 engine vs DIE module

---

# Relationship to ES-029

| Aspect | ES-029 (Sprint 4) | ES-012 (DIE) |
|--------|-------------------|--------------|
| Scope | Provider-fed recommendations | Full decision packages with evidence + confidence |
| EC-002A/B | Not integrated | Mandatory inputs |
| Output | `RecommendationBundle` | `DecisionPackage` |
| Validation | Partial | Mandatory field validation |
| Status | Implemented (orchestrator path) | Approved — greenfield module |

**Migration strategy:** DIE Recommendation Engine wraps ES-029 rules initially; ES-029 deprecated after parity tests pass.

---

# Future Evolution

The architecture supports:

- hundreds of rules
- multiple recommendation categories
- AI-assisted explanations (EC-005 — language only)
- organization-specific rule packs
- plugin rule providers
- enterprise customization

without redesign.

---

# Acceptance Criteria

The Decision Intelligence Engine is complete when it:

- [ ] generates deterministic recommendations from EC-002A/B-enriched context
- [ ] validates every recommendation (mandatory fields)
- [ ] produces complete immutable decision packages
- [ ] isolates rule failures without stopping pipeline
- [ ] supports extensible rule registration (register / enable / disable)
- [ ] passes all unit, integration, and performance tests
- [ ] exposes public API via `lib/decision-intelligence/index.ts`
- [ ] contains zero UI imports
- [ ] meets < 1 s package generation target on mock fixtures

---

# Engineering Philosophy

The Decision Intelligence Engine is the reasoning core of ORION.

Every executive recommendation originates here.

Trust is achieved through deterministic reasoning, explainability, and evidence — not through opaque algorithms.

---

# Open Questions (Founder / Architect)

| # | Question | Options |
|---|----------|---------|
| 1 | **ES-012 ID** — collision with Engineering Workspace | Keep programme namespace in `01_Engineering/` · Renumber to ES-040+ |
| 2 | **DC-012** — data contract spec timing | Draft alongside first implementation sprint |
| 3 | **ES-029 retirement** | Big-bang replace · Parallel run with adapter |
| 4 | **First consumer surface** | `/command-center` · `/dashboard` · `/brief` · `/decisions` |
| 5 | **Rule pack location** | `lib/decision-intelligence/rules/default/` · JSON config files |

---

# Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-27 | ORION CTO | Initial specification — approved |

---

**Status: APPROVED — AWAITING FOUNDER CONFIRMATION ON PREREQUISITES AND OPEN QUESTIONS**
