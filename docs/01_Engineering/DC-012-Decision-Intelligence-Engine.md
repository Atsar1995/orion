# DC-012 — Decision Intelligence Engine

**Development Contract ID:** DC-012  
**Engineering Specification:** [ES-012 — Decision Intelligence Engine](./ES-012-Decision-Intelligence-Engine.md)  
**Blueprint:** [BP-004 — Decision Intelligence](../00_BLUEPRINT/BP-004-Decision-Intelligence.md)  
**Classification:** Component Design  
**Version:** 1.0.0  
**Status:** Approved  
**Author:** ORION CTO  
**Audience:** Founder · Chief Architect · Engineering · QA  

> **Document ID note:** DC-012 in the **Decision Intelligence programme** (`docs/01_Engineering/`) is distinct from [DC-010 — Explainability & Confidence Engine](../07_Engineering/DC-010_Explainability_Confidence_Engine.md) (EC-002B programme in `docs/07_Engineering/`).

**Governed by:**

- [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)
- [ORION Engineering Principles](../09_Standards/ORION_Engineering_Principles.md)
- [QUALITY_GATE](../08_Standards/QUALITY_GATE.md)

**Related specifications:**

- [ES-012 — Decision Intelligence Engine](./ES-012-Decision-Intelligence-Engine.md)
- [BP-004 — Decision Intelligence](../00_BLUEPRINT/BP-004-Decision-Intelligence.md)
- [EC-003 — Executive Recommendation Engine](../05_Product/EC-003_Executive_Recommendation_Engine.md)
- [Architecture Audit v0.4.0](./Architecture_Audit_v0.4.md)

---

# Purpose

The Decision Intelligence Engine (DIE) is responsible for transforming deterministic business analysis into structured **executive decision packages**.

It orchestrates specialized decision capabilities while maintaining complete determinism, explainability, and modularity.

This document defines **component boundaries, interfaces, domain models, and dependency rules** for implementation per [ES-012](./ES-012-Decision-Intelligence-Engine.md).

---

# Component Hierarchy

```
Decision Intelligence Engine
├── Capability Registry
├── Recommendation Engine
├── Priority Engine
├── Impact Estimator
├── Recommendation Validator
├── Decision Package Builder
└── Decision Intelligence Facade
```

---

# Target Module Layout

All components SHALL live under `lib/decision-intelligence/` (not yet implemented).

```
lib/decision-intelligence/
  facade/
    DecisionIntelligenceFacade.ts
  registry/
    CapabilityRegistry.ts
    CapabilityDefinition.ts
  engine/
    RecommendationEngine.ts
    PriorityEngine.ts
    ImpactEstimator.ts
    RecommendationValidator.ts
  builder/
    DecisionPackageBuilder.ts
  models/
    DecisionPackage.ts
    Recommendation.ts
    Evidence.ts
    ImpactEstimate.ts
    DecisionEvaluationContext.ts
    DecisionDiagnostics.ts
    CapabilityLifecycle.ts
  contracts/
    DecisionCapability.ts
  index.ts
```

---

# Component Responsibilities

## Decision Intelligence Facade

**File:** `facade/DecisionIntelligenceFacade.ts`

Public entry point.

Responsibilities:

- receive requests
- coordinate execution
- return decision packages

Never contains business rules.

```typescript
interface DecisionIntelligenceFacade {
  evaluate(request: DecisionIntelligenceRequest): DecisionIntelligenceResult;
}

interface DecisionIntelligenceRequest {
  readonly context: DecisionEvaluationContext;
  readonly configuration?: DecisionIntelligenceConfig;
}

interface DecisionIntelligenceResult {
  readonly package: DecisionPackage;
  readonly diagnostics: DecisionDiagnostics;
}
```

---

## Capability Registry

**File:** `registry/CapabilityRegistry.ts`

Maintains every decision capability.

Responsibilities:

- registration
- discovery
- enable/disable
- version management

Future capabilities register automatically without modifying existing components.

```typescript
interface CapabilityRegistry {
  register(capability: DecisionCapabilityDefinition): void;
  unregister(capabilityId: string): void;
  get(capabilityId: string): DecisionCapabilityDefinition | undefined;
  list(): readonly DecisionCapabilityDefinition[];
  listEnabled(): readonly DecisionCapabilityDefinition[];
}

interface DecisionCapabilityDefinition {
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly executionOrder: number;
  readonly factory: CapabilityFactory;
}
```

---

## Recommendation Engine

**File:** `engine/RecommendationEngine.ts`

Produces executive recommendations.

Responsibilities:

- evaluate recommendation rules
- produce recommendation objects
- attach supporting evidence

Does not rank, validate, or package — delegates to sibling capabilities via orchestrator.

---

## Priority Engine

**File:** `engine/PriorityEngine.ts`

Ranks recommendations.

**Inputs:**

- urgency
- impact
- confidence
- effort
- strategic importance

**Outputs:**

- priority level (positive integer rank)
- priority band (`critical` · `high` · `medium` · `low`)

---

## Impact Estimator

**File:** `engine/ImpactEstimator.ts`

Predicts expected business improvement.

**Produces:**

- expected impact
- confidence interval (deterministic bounds from rule metadata)
- reasoning (reference to evidence — not AI-generated)

---

## Recommendation Validator

**File:** `engine/RecommendationValidator.ts`

Verifies recommendation completeness.

**Checks:**

- mandatory fields
- evidence (≥ 1 item)
- confidence (valid score, EC-002B source)
- impact (present)
- traceability (rule ID + version)

Rejects incomplete recommendations — they do not enter the package.

```typescript
interface ValidationResult {
  readonly valid: boolean;
  readonly recommendation: Recommendation | null;
  readonly errors: readonly ValidationError[];
}
```

---

## Decision Package Builder

**File:** `builder/DecisionPackageBuilder.ts`

Produces immutable decision packages.

Never performs calculations.

Only assembles validated components.

```typescript
interface DecisionPackageBuilder {
  build(input: DecisionPackageBuildInput): DecisionPackage;
}

interface DecisionPackageBuildInput {
  readonly recommendations: readonly Recommendation[];
  readonly generatedAt: string;
  readonly contextId: string;
}
```

---

# Processing Flow

```
Executive Request
        ↓
Collect Context
        ↓
Load Capabilities (Capability Registry)
        ↓
Execute Recommendation Engine
        ↓
Estimate Impact (Impact Estimator)
        ↓
Calculate Priority (Priority Engine)
        ↓
Validate Recommendation (Recommendation Validator)
        ↓
Build Decision Package (Decision Package Builder)
        ↓
Return Response (+ Diagnostics)
```

Orchestration is owned exclusively by **Decision Intelligence Facade** — capabilities do not call each other.

---

# Domain Models

## Decision Package

**File:** `models/DecisionPackage.ts`

Immutable after creation.

```typescript
interface DecisionPackage {
  readonly id: string;
  readonly generatedAt: string;
  readonly contextId: string;
  readonly recommendations: readonly Recommendation[];
  readonly metadata: DecisionPackageMetadata;
}

interface DecisionPackageMetadata {
  readonly engineVersion: string;
  readonly ruleCount: number;
  readonly validatedCount: number;
  readonly rejectedCount: number;
}
```

## Recommendation

**File:** `models/Recommendation.ts`

```typescript
interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly action: RecommendationAction;
  readonly evidence: readonly EvidenceItem[];
  readonly confidence: ConfidenceScore;
  readonly impact: ImpactEstimate;
  readonly priority: number;
  readonly urgency: RecommendationUrgency;
  readonly risks: readonly RiskItem[];
  readonly dependencies: readonly DependencyItem[];
  readonly assumptions: readonly string[];
  readonly alternatives: readonly AlternativeAction[];
  readonly traceability: RecommendationTraceability;
  readonly timestamp: string;
}

type RecommendationUrgency =
  | "immediate"
  | "today"
  | "this_week"
  | "monitor";

interface RecommendationTraceability {
  readonly ruleId: string;
  readonly ruleVersion: string;
  readonly capabilityId: string;
  readonly confidenceSource: string;
}
```

## Evidence

**File:** `models/Evidence.ts`

```typescript
interface EvidenceItem {
  readonly id: string;
  readonly source: EvidenceSource;
  readonly label: string;
  readonly value: string;
  readonly trend?: "up" | "down" | "flat";
  readonly reference?: string;
}

type EvidenceSource =
  | "business-health"
  | "kpi"
  | "trend"
  | "alert"
  | "explainability"
  | "rule";
```

## Impact Estimate

**File:** `models/ImpactEstimate.ts`

```typescript
interface ImpactEstimate {
  readonly expectedImpact: string;
  readonly magnitude: ImpactMagnitude;
  readonly confidenceLow: number;
  readonly confidenceHigh: number;
  readonly reasoning: string;
}

type ImpactMagnitude = "high" | "medium" | "low";
```

## Evaluation Context

**File:** `models/DecisionEvaluationContext.ts`

```typescript
interface DecisionEvaluationContext {
  readonly contextId: string;
  readonly evaluatedAt: string;
  readonly businessHealth: import("@/lib/business-health").HealthScore;
  readonly explainability: import("@/lib/explainability").ExplainabilityResult;
  readonly metrics: readonly MetricSnapshot[];
  readonly trends: readonly TrendSnapshot[];
  readonly executiveContext?: ExecutiveContextSlice;
}
```

---

# Recommendation Lifecycle

```
Created
    ↓
Evaluated (Recommendation Engine)
    ↓
Evidence Attached
    ↓
Impact Estimated (Impact Estimator)
    ↓
Priority Assigned (Priority Engine)
    ↓
Validated (Recommendation Validator)
    ↓
Packaged (Decision Package Builder)
    ↓
Returned (Facade)
```

---

# Rule Execution

Every recommendation rule is isolated.

**Rule failures:**

- logged in diagnostics
- reported per rule
- skipped — engine continues

Rule contracts defined in [ES-012](./ES-012-Decision-Intelligence-Engine.md#rule-registry).

---

# Component Interfaces

Every capability implements the shared lifecycle contract.

**File:** `contracts/DecisionCapability.ts`

```typescript
interface DecisionCapability {
  readonly id: string;
  readonly version: string;

  initialize(config: CapabilityConfig): void;
  evaluate(context: DecisionEvaluationContext): CapabilityEvaluationResult;
  validate(output: CapabilityEvaluationResult): ValidationResult;
  build(output: CapabilityEvaluationResult): CapabilityBuildResult;
  dispose(): void;
}

interface CapabilityEvaluationResult {
  readonly capabilityId: string;
  readonly recommendations: readonly RecommendationDraft[];
  readonly errors: readonly CapabilityError[];
}
```

No capability communicates directly with another capability.

Communication occurs **only** through the Decision Intelligence Facade.

---

# Dependency Rules

## Allowed

```
Capability
    ↓
Shared Domain Models (lib/decision-intelligence/models/)
    ↓
Upstream Engines (lib/business-health/, lib/explainability/)
    ↓
Shared Types (types/executive/)
```

## Forbidden

```
Capability → Capability          ❌
Component  → UI                  ❌
Component  → Database            ❌
Component  → Network / API       ❌
Component  → AI providers        ❌
lib/       → components/         ❌
```

---

# Configuration

Capabilities support:

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Include in pipeline |
| `disabled` | boolean | Skip execution |
| `version` | string | Semver capability version |
| `priority` | number | Registry ordering hint |
| `executionOrder` | number | Pipeline sequence |

Configuration driven via `DecisionIntelligenceConfig` — no hardcoded registrations in facade.

---

# Thread Safety

- Components are **stateless** between `evaluate()` calls.
- Shared mutable state is **prohibited**.
- Registry mutations occur only at bootstrap / config reload — not during evaluation.

---

# Error Isolation

- A failing capability cannot terminate the engine.
- Failures are returned as `CapabilityError[]` in diagnostics.
- Healthy capabilities continue execution.
- Incomplete recommendations are rejected by validator — not partially packaged.

---

# Diagnostics

**File:** `models/DecisionDiagnostics.ts`

Every execution records:

```typescript
interface DecisionDiagnostics {
  readonly durationMs: number;
  readonly capabilitiesExecuted: readonly string[];
  readonly rulesEvaluated: number;
  readonly recommendationsProduced: number;
  readonly validationFailures: number;
  readonly skippedRules: readonly SkippedRuleRecord[];
  readonly capabilityErrors: readonly CapabilityError[];
  readonly stageTimings: readonly StageTiming[];
}
```

Useful for observability, QA, and performance regression tests.

---

# Performance Targets

| Stage | Target |
|-------|--------|
| Capability loading | < 50 ms |
| Recommendation generation | < 250 ms |
| Validation | < 50 ms |
| Decision package assembly | < 25 ms |
| **Total engine execution** | **< 1 second** |

Measured on deterministic mock fixtures in CI per [ES-012](./ES-012-Decision-Intelligence-Engine.md#performance).

---

# Extension Strategy

Future capabilities register via Capability Registry:

| Future capability | BP-004 ref | Registration |
|-------------------|------------|--------------|
| Risk Engine | Capability 3 | New `DecisionCapability` |
| Opportunity Engine | Capability 4 | New `DecisionCapability` |
| Scenario Engine | Capability 5 | New `DecisionCapability` |
| Decision Validator | Capability 6 | EC-004 integration |
| Executive Memory Adapter | — | Read-only context enrichment |
| AI Explanation Adapter | EC-005 | Post-package language layer only |

No existing component requires modification (Open/Closed Principle).

---

# Testing Strategy

| Test type | Scope |
|-----------|-------|
| **Unit tests** | Every component in isolation |
| **Integration tests** | Full facade pipeline |
| **Contract tests** | `DecisionCapability` interface compliance |
| **Performance tests** | Stage timings vs targets |
| **Failure tests** | Capability isolation, rule skip behaviour |
| **Snapshot tests** | Golden `DecisionPackage` fixtures |

Test location: `tests/decision-intelligence/`

---

# Engineering Constraints

| Constraint | Rule |
|------------|------|
| Database access | ❌ Prohibited in V1 |
| UI rendering | ❌ Prohibited |
| API calls | ❌ Prohibited in core path |
| AI reasoning | ❌ Prohibited — EC-005 is downstream |
| Mutable shared state | ❌ Prohibited |
| Hidden dependencies | ❌ Prohibited — constructor injection only |
| EC-002A/B modification | ❌ Prohibited — read-only consumption |

Pure deterministic execution only.

---

# Design Principles

The Decision Intelligence Engine follows:

- **Single Responsibility Principle** — one capability, one concern
- **Open/Closed Principle** — extend via registry, not modification
- **Dependency Inversion Principle** — depend on `DecisionCapability` contract
- **Composition over Inheritance** — facade composes capabilities
- **Immutable Domain Objects** — `DecisionPackage`, `Recommendation` frozen after build
- **Configuration over Hardcoding** — registry-driven capability loading
- **Explainability by Design** — traceability on every recommendation

---

# Consumer Boundaries

| Consumer | Integration pattern |
|----------|---------------------|
| EP-002 Executive Dashboard | Consumes `DecisionPackage` via snapshot adapter |
| `/command-center` | Orchestrator enriches snapshot with DIE output |
| EC-001 Morning Brief | Brief composer reads top-N recommendations |
| EC-004 Decision Center | Decision Validator capability (future) |
| EC-005 AI Copilot | Read-only package access — no mutation |

UI components SHALL NOT import capability internals — only `DecisionPackage` via public facade or snapshot types.

---

# Success Criteria

The engine is production-ready when it:

- [ ] executes deterministic decision pipelines end-to-end
- [ ] supports pluggable capabilities via registry
- [ ] isolates failures without terminating pipeline
- [ ] generates immutable decision packages
- [ ] validates every recommendation (rejects incomplete)
- [ ] meets performance targets on mock fixtures
- [ ] achieves complete unit and integration test coverage
- [ ] exposes public API via `lib/decision-intelligence/index.ts`
- [ ] has zero forbidden dependencies (UI, DB, network, AI in core)

---

# Component Philosophy

The Decision Intelligence Engine is the executive reasoning core of ORION.

Every recommendation, priority, risk assessment, and future decision capability will pass through this engine.

Its purpose is not to automate executive thinking.

Its purpose is to amplify executive judgment through trusted, explainable, and deterministic reasoning.

---

# Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-27 | ORION CTO | Initial component design — approved |

---

**Status: APPROVED — AWAITING FOUNDER CONFIRMATION BEFORE IMPLEMENTATION**
