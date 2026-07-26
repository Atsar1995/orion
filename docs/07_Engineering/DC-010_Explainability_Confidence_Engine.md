# DC-010 — Explainability & Confidence Engine

**Development Contract ID:** DC-010  
**Engineering Specification:** [ES-010 — Explainability & Confidence Engine](./ES-010_Explainability_Confidence_Engine.md)  
**Executive Capability:** EC-002B  
**Version:** 1.0.0  
**Status:** Ready for Implementation  
**Author:** ORION CTO  

**Governed by:**

- [ORION Constitution (Ratified)](../09_Standards/ORION_Constitution_Ratified.md)
- [ORION Engineering Principles](../09_Standards/ORION_Engineering_Principles.md)
- [QUALITY_GATE](../08_Standards/QUALITY_GATE.md)

---

# Purpose

This Development Contract translates [ES-010](./ES-010_Explainability_Confidence_Engine.md) into concrete implementation tasks for EC-002B.

Cursor SHALL implement only the items described in this document.

No additional features are to be introduced.

---

# Engineering rules

Cursor SHALL follow:

- SOLID principles
- Clean Architecture
- Strict TypeScript
- Composition over inheritance
- Strategy pattern where algorithms vary
- Dependency injection via constructor options
- Immutable data models where practical
- No circular dependencies

---

# General rules

- Keep functions small and files focused
- Avoid duplicated logic — reuse EC-002A utilities where appropriate
- Prefer interfaces over concrete implementations
- Comments only where they improve understanding
- Maintain existing project conventions (`lib/` not `src/`)
- **Do not modify** EC-002A scoring formulas
- **Do not introduce** AI, LLM, or non-deterministic narrative generation

---

# Implementation phases

## Phase 1 — Domain models

**Create:**

```
lib/business-health/explainability/models/
  ConfidenceScore.ts
  HealthExplanation.ts
  HealthDriver.ts
  ExecutiveNarrative.ts
  index.ts
```

**Requirements:**

- Strong typing
- Export interfaces and types only
- No business logic in model files
- No provider-specific fields

**Acceptance:** Models compile

---

## Phase 2 — Confidence Engine

**Create:**

```
lib/business-health/explainability/interfaces/ConfidenceEngine.ts
lib/business-health/explainability/confidence/DefaultConfidenceEngine.ts
lib/business-health/explainability/utils/ConfidenceUtils.ts
```

**Responsibilities:**

- Multi-factor category confidence (ES-010 weights)
- Overall confidence aggregation
- Confidence level resolution (`high` | `moderate` | `low` | `insufficient`)
- Freshness decay calculation
- Configurable factor weights via constructor options

**Acceptance:**

- Deterministic output
- Fully unit tested
- Edge cases: zero KPIs, missing timestamps, zero confidence

---

## Phase 3 — Narrative composer

**Create:**

```
lib/business-health/explainability/interfaces/NarrativeComposer.ts
lib/business-health/explainability/narrative/TemplateRegistry.ts
lib/business-health/explainability/narrative/NarrativeComposer.ts
lib/business-health/explainability/utils/NarrativeUtils.ts
```

**Responsibilities:**

- Template-based summary sentence (≤ 20 words)
- Executive narrative headline + body + confidence statement
- Deterministic template selection rule chain
- No LLM, no external API

**Acceptance:**

- Same input → same output (golden tests)
- Fully unit tested

---

## Phase 4 — Explainability pipeline

**Create:**

```
lib/business-health/explainability/pipeline/DriverRanker.ts
lib/business-health/explainability/pipeline/ChangeDetector.ts
lib/business-health/explainability/pipeline/ComparisonBuilder.ts
lib/business-health/explainability/pipeline/ExplainabilityPipeline.ts
lib/business-health/explainability/interfaces/ExplainabilityPipeline.ts
```

**Responsibilities:**

- Rank drivers from `ScoreBreakdown`
- Detect changes when prior context supplied
- Build baseline comparisons
- Orchestrate confidence + narrative stages
- No score mutation

**Acceptance:**

- Pipeline tested independently
- Graceful handling of missing prior snapshot

---

## Phase 5 — Explainability engine & service

**Create:**

```
lib/business-health/explainability/interfaces/ExplainabilityEngine.ts
lib/business-health/explainability/engine/ExplainabilityEngine.ts
lib/business-health/explainability/services/ExplainabilityService.ts
lib/business-health/explainability/index.ts
```

**Responsibilities:**

- Accept `HealthScore` from EC-002A
- Invoke pipeline
- Return `HealthExplanation` with `{ success, data | error }` result type
- Service facade: `explainFromHealthScore()` and `explainFromKPIs()` (delegates to `BusinessHealthEngine` + explain)

**Acceptance:**

- Engine does not contain confidence formulas inline (delegates to ConfidenceEngine)
- Engine remains provider independent
- Service tested end-to-end

---

## Phase 6 — Public exports

**Modify:**

```
lib/business-health/index.ts
```

**Add exports for:**

- Models, interfaces, engine, service
- Do not break existing EC-002A exports

**Acceptance:** Barrel exports compile

---

## Phase 7 — Unit tests

**Create:**

```
tests/business-health/explainability/
  ConfidenceEngine.test.ts
  NarrativeComposer.test.ts
  ExplainabilityPipeline.test.ts
  ExplainabilityEngine.test.ts
  ExplainabilityService.test.ts
tests/fixtures/explainability.ts
```

**Modify:**

```
vitest.config.ts
```

Add `lib/business-health/explainability/**/*.ts` to coverage include if not already covered by glob.

**Edge cases (mandatory):**

- Empty category scores
- Zero confidence KPIs
- Missing prior snapshot
- All positive / all negative drivers
- Insufficient confidence suppression narrative
- Duplicate driver IDs

**Coverage target:** ≥90% on explainability module

---

## Phase 8 — Documentation

**Create:**

```
docs/07_Engineering/EC-002B_Explainability_Confidence_Engine.md
```

**Include:**

- Architecture diagram
- Public interfaces
- Confidence algorithm summary
- Narrative template catalogue
- Extension points
- Relationship to EC-002A

**Acceptance:** Documentation synchronized with implementation

---

# Files to create

| Path | Phase |
|------|-------|
| `lib/business-health/explainability/models/*` | 1 |
| `lib/business-health/explainability/interfaces/*` | 2–5 |
| `lib/business-health/explainability/confidence/DefaultConfidenceEngine.ts` | 2 |
| `lib/business-health/explainability/narrative/*` | 3 |
| `lib/business-health/explainability/pipeline/*` | 4 |
| `lib/business-health/explainability/engine/ExplainabilityEngine.ts` | 5 |
| `lib/business-health/explainability/services/ExplainabilityService.ts` | 5 |
| `lib/business-health/explainability/utils/*` | 2–3 |
| `lib/business-health/explainability/index.ts` | 5 |
| `tests/business-health/explainability/*` | 7 |
| `tests/fixtures/explainability.ts` | 7 |
| `docs/07_Engineering/EC-002B_Explainability_Confidence_Engine.md` | 8 |

# Files to modify

| Path | Change |
|------|--------|
| `lib/business-health/index.ts` | Export explainability module |
| `vitest.config.ts` | Coverage include (if needed) |

# Files NOT to modify

| Path | Reason |
|------|--------|
| `lib/business-health/engine/BusinessHealthEngine.ts` | EC-002A scope frozen |
| `lib/business-health/strategies/*` | Scoring formulas unchanged |
| `lib/business-health/normalizers/*` | Provider layer unchanged |
| `app/**` | No UI in EC-002B |
| `.github/workflows/*` | No CI changes required |

---

# Validation commands

Run sequentially after implementation:

```bash
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
npm run audit:production
```

All commands MUST succeed.

---

# Quality gates

| Gate | Threshold | Blocking |
|------|-----------|----------|
| TypeScript | Zero errors | Yes |
| ESLint | Zero errors | Yes |
| Unit tests | 100% pass | Yes |
| Coverage (explainability module) | ≥ 90% lines/statements/functions | Yes |
| Coverage (global) | Existing thresholds in `vitest.config.ts` | Yes |
| Production audit | `npm run audit:production` pass | Yes |
| Build | Next.js production build pass | Yes |
| Determinism | Golden narrative tests pass | Yes |
| No AI imports | Code review | Yes |

---

# Coding standards

| Standard | Requirement |
|----------|-------------|
| TypeScript | Strict mode, no `any` |
| Result types | `{ success: boolean; data?; error? }` for recoverable failures |
| Pure utilities | Stateless functions in `utils/` |
| DI | Constructor options for engines and services |
| Naming | Match EC-002A conventions (`PascalCase` types, `camelCase` functions) |
| Tests | Co-located under `tests/business-health/explainability/` |
| Fixtures | Shared fixtures in `tests/fixtures/explainability.ts` |

---

# Deliverables

| Deliverable | Phase |
|-------------|-------|
| Confidence Engine | 2 |
| Narrative Composer (deterministic) | 3 |
| Explainability Pipeline | 4 |
| Explainability Engine | 5 |
| Explainability Service | 5 |
| Domain models | 1 |
| Unit tests | 7 |
| Documentation | 8 |
| Updated barrel exports | 6 |

---

# Out of scope

Do NOT implement:

- AI / LLM narration
- Recommendation generation
- Forecasting
- Dashboard UI
- Database persistence
- Orchestrator integration (follow-on sprint)
- Provider normalizers
- Changes to EC-002A scoring

---

# Git policy

Cursor SHALL NOT:

- Commit
- Push
- Rebase
- Merge
- Modify git history

Stop after successful validation.

Wait for Founder approval.

---

# Completion criteria

EC-002B is complete when:

- [ ] ES-010 requirements implemented
- [ ] All DC-010 phases complete
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Coverage ≥ 90% (explainability module)
- [ ] Build passes
- [ ] Production audit passes
- [ ] Documentation updated
- [ ] Ready for Architecture Review

---

# Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 26 July 2026 | ORION CTO | Initial development contract · EC-002B |

---

**Status:** Ready for Implementation — **awaiting Founder approval before code.**
