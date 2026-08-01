# BP-004 — Decision Intelligence

**Blueprint ID:** BP-004  
**Classification:** Product Blueprint  
**Version:** 1.0.0  
**Status:** Approved for Engineering  
**Author:** ORION CTO  
**Audience:** Founder · Chief Architect · Product · Design · Engineering  

**Governed by:**

- [ORION Constitution](../00_PROJECT/ORION_CONSTITUTION.md)
- [ORION Architecture Handbook](../03_Architecture/ORION_Architecture_Handbook.md)
- [ORION Engineering Principles](../09_Standards/ORION_Engineering_Principles.md)
- [ORION North Star](../00_Strategy/Founders_Manifesto.md)

**Related specifications:**

- [EC-003 — Executive Recommendation Engine](../05_Product/EC-003_Executive_Recommendation_Engine.md)
- [EC-004 — Executive Decision Center](../05_Product/EC-004_Executive_Decision_Center.md)
- [EC-002 — Business Health Engine](../05_Product/EC-002_Business_Health_Engine.md)
- [EC-002A — Business Health Engine Core](../07_Engineering/EC-002A_Business_Health_Engine_Core.md)
- [EC-002B Release Review](../01_Engineering/EC-002B_Release_Review.md)
- [ES-029 — Recommendation Engine](../02_Engineering/ES-029-Recommendation-Engine.md)
- [ES-065 — Executive Intelligence Architecture](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md)
- [Architecture Audit v0.4.0](../01_Engineering/Architecture_Audit_v0.4.md)
- [ES-012 — Decision Intelligence Engine](../01_Engineering/ES-012-Decision-Intelligence-Engine.md)
- [DC-012 — Decision Intelligence Engine](../01_Engineering/DC-012-Decision-Intelligence-Engine.md)
- [BP-003 — Morning Executive Brief](./BP-003-Morning-Executive-Brief.md)

---

# North Star Question

> *"What should I do — and why should I trust that advice?"*

Decision Intelligence is the **reasoning layer** of the Executive Operating System — not a single screen, but the deterministic foundation that powers recommendations, priorities, risk, opportunity, and scenario analysis across ORION.

---

# Vision

Decision Intelligence is the core capability that transforms ORION from an Executive Dashboard into an **Executive Operating System**.

Its purpose is to help executives make better decisions by combining deterministic analysis, explainability, confidence, and business context into actionable guidance.

Decision Intelligence does not replace executive judgment.

It improves executive judgment.

---

# Mission

Enable executives to answer five fundamental questions:

1. What is happening?
2. Why is it happening?
3. What should I do?
4. What should I do first?
5. What happens if I do nothing?

---

# Philosophy

ORION must never recommend an action that cannot be explained.

Every recommendation must be:

- deterministic
- evidence-based
- confidence-scored
- explainable
- traceable

AI may improve communication.

AI must never replace deterministic business reasoning.

---

# Executive Decision Cycle

```
Business Awareness
        ↓
Business Understanding
        ↓
Decision Intelligence
        ↓
Execution
        ↓
Measurement
        ↓
Learning
        ↓
Continuous Improvement
```

---

# Capabilities

Decision Intelligence is composed of multiple independent capabilities.

## Capability 1 — Recommendation Engine

Answers:

> What should I do?

**Product anchor:** [EC-003](../05_Product/EC-003_Executive_Recommendation_Engine.md)  
**Engineering anchor:** [ES-029](../02_Engineering/ES-029-Recommendation-Engine.md)

---

## Capability 2 — Priority Engine

Answers:

> What should I do first?

**Product anchor:** Prioritisation within EC-003; executive brief priorities surface (BP-003)

---

## Capability 3 — Risk Engine

Answers:

> What happens if I wait?

**Product anchor:** Alert + health degradation signals; formal Risk Engine — **greenfield**

---

## Capability 4 — Opportunity Engine

Answers:

> Where should I invest attention?

**Product anchor:** Recommendation categories (opportunity type); formal Opportunity Engine — **greenfield**

---

## Capability 5 — Scenario Engine

Answers:

> What if I choose another option?

**Product anchor:** EC-005 copilot scenario prompts; formal Scenario Engine — **greenfield**

---

## Capability 6 — Decision Validator

Answers:

> Is this recommendation still valid?

**Product anchor:** [EC-004](../05_Product/EC-004_Executive_Decision_Center.md) decision lifecycle

---

# Recommendation Principles

Every recommendation must include:

| Required field | Description |
|----------------|-------------|
| Action | What the executive should do |
| Reason | Why the action is proposed |
| Evidence | Measurable support |
| Confidence | Inherited deterministic score |
| Expected Impact | Anticipated business outcome |
| Priority | Rank among competing actions |
| Urgency | Time sensitivity |

Optional:

- Dependencies
- Estimated Effort
- Assumptions
- Risks
- Alternatives

---

# Evidence First

Recommendations are never opinions.

Every recommendation must be supported by measurable evidence.

Evidence may include:

- KPI trends
- Business Health (EC-002A)
- Explainability (EC-002B)
- Confidence (EC-002B)
- Historical performance
- Cross-engine analysis

If evidence cannot be presented, the recommendation shall not be generated.

---

# Confidence

Every recommendation carries a confidence score.

- Confidence is inherited from deterministic engines.
- Confidence is never guessed.
- Confidence is never generated by AI.

**Engineering source of truth:** `lib/explainability/engine/ConfidenceEngine.ts` (EC-002B)

---

# Explainability

Every recommendation must answer **Why?**

The executive must always understand:

- why the recommendation exists
- what evidence supports it
- what assumptions were used

**Engineering source of truth:** `lib/explainability/` (EC-002B)

---

# Prioritization

Recommendations shall be ranked using deterministic criteria including:

- business impact
- urgency
- confidence
- effort
- dependencies
- strategic importance

---

# Executive Trust

ORION must optimize for trust before optimization.

An explainable recommendation is always preferred over an opaque recommendation.

---

# Future AI

AI may assist with:

- language refinement
- executive summaries
- conversational interaction
- report generation

AI shall never:

- invent evidence
- invent KPIs
- fabricate confidence
- replace deterministic calculations

---

# Product Principles

Decision Intelligence must always be:

- Explainable
- Deterministic
- Modular
- Extensible
- Testable
- Configuration-driven
- Executive-first

---

# Success Criteria

A successful Decision Intelligence capability enables an executive to:

- understand the recommendation
- trust the recommendation
- validate the evidence
- understand the expected outcome
- make a decision within minutes

---

# Long-Term Vision

Decision Intelligence becomes the central reasoning layer of ORION.

Every future capability — including Recommendations, Risk Analysis, Opportunity Detection, Scenario Planning, Executive Memory, and AI Copilot — will build upon this foundation.

Decision Intelligence is not a feature.

It is the reasoning engine of the Executive Operating System.

---

# Architecture Baseline (v0.4.0)

Mapping from [Architecture Audit v0.4.0](../01_Engineering/Architecture_Audit_v0.4.md) — **review only, no implementation in this blueprint**.

## Current state vs BP-004 capabilities

| BP-004 Capability | v0.4.0 code state | Integration status |
|-------------------|-------------------|--------------------|
| Recommendation Engine | `lib/intelligence/recommendations/RecommendationEngine.ts` | Partial — Sprint 4 orchestrator path only |
| Priority Engine | `RecommendationPrioritizer.ts`, EP-002 `PrioritiesWidget` (mock) | Partial — not unified |
| Risk Engine | Alert engine + health degradation signals | Implicit — no dedicated Risk Engine |
| Opportunity Engine | Recommendation categories in ES-029 | Partial — rules only |
| Scenario Engine | — | **Not implemented** |
| Decision Validator | — | **Not implemented** — EC-004 greenfield |

## Upstream dependencies (required inputs)

| Input | Module | Wired to recommendations? |
|-------|--------|-------------------------|
| Business Health | `lib/business-health/` (EC-002A) | ❌ Not wired — Sprint 4 uses legacy `health-engine` |
| Explainability | `lib/explainability/` (EC-002B) | ❌ Not wired — tests only |
| Confidence | `ConfidenceEngine` (EC-002B) | ❌ Not wired to UI |
| Provider signals | `lib/providers/` + orchestrator | ✅ `/command-center` path |
| Alerts | `lib/alerts/` (EP-003) + `lib/intelligence/alerts/` | ⚠️ Parallel stacks — not unified |

## Architectural constraints (from Sprint 0 audit)

Before BP-004 engineering begins:

1. **Consolidate executive data paths** — single snapshot contract for recommendations
2. **Wire EC-002A/B** — confidence and explainability must feed recommendations per this blueprint
3. **Unify alert/recommendation type systems** — three parallel type families today
4. **Establish `lib/executive/` service boundaries** — Decision Intelligence belongs above engines, below UI

## Proposed module boundary (target — not yet implemented)

```
lib/decision-intelligence/
  models/          Recommendation, Evidence, Priority, Risk, Scenario
  engine/          DecisionIntelligenceEngine (orchestrates sub-engines)
  composer/        Configuration-driven recommendation bundles
  validator/       Decision Validator (EC-004 integration point)
  index.ts         Public API
```

Sub-engines may wrap or replace:

- `lib/intelligence/recommendations/*` (Sprint 4 legacy)
- Future `lib/decision-intelligence/risk/`, `opportunity/`, `scenario/`

---

# Scope

## In scope (BP-004 V1 — engineering target)

| Area | Description |
|------|-------------|
| Unified recommendation contract | Evidence + confidence + explainability on every recommendation |
| EC-002A/B integration | Health and explainability as mandatory inputs |
| Priority ranking | Deterministic prioritisation across recommendation set |
| EC-003 alignment | Formalise Recommendation Engine as Capability 1 |
| Configuration-driven rules | Rule catalogue without provider rewrite |
| Test coverage | Deterministic fixtures; no AI in core path |

## Out of scope (BP-004 V1)

| Area | Rationale |
|------|-----------|
| Scenario Engine full implementation | EC-005 / later sprint |
| Decision Validator UI | EC-004 greenfield |
| AI language refinement | EC-005 |
| Provider implementation | Provider Framework exists |
| Executive Memory / Learning loop | Future capability |

---

# Open Questions (Founder / Architect)

| # | Question | Options |
|---|----------|---------|
| 1 | **EC ID namespace** — BP-003 references EC-003 as Morning Brief; product docs define EC-003 as Recommendation Engine | Renumber brief to EC-003-MEB · Renumber recommendation · Accept dual namespace with prefix |
| 2 | **Module location** — extend `lib/intelligence/recommendations/` vs new `lib/decision-intelligence/` | Extend (faster) · New module (cleaner boundary) |
| 3 | **Default surface** — where does Decision Intelligence first appear? | `/command-center` · `/dashboard` · `/brief` · `/decisions` (EC-004) |
| 4 | **Legacy engine retirement** — `recommendation-engine.ts` vs `RecommendationEngine.ts` duplicate | ADR required before BP-004 implementation |
| 5 | **Risk vs Alert boundary** — Risk Engine (Capability 3) vs Alert Engine (ES-030) vs EP-003 Alert Center | Unified risk-alert model · Separate domains |

---

# Document History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0.0 | 2026-07-27 | ORION CTO | Initial blueprint — approved for engineering |

---

**Status: APPROVED FOR ENGINEERING — AWAITING FOUNDER CONFIRMATION ON OPEN QUESTIONS**
