# DC-011 — Morning Executive Brief

**Development Contract ID:** DC-011  
**Engineering Specification:** [ES-011 — Morning Executive Brief](./ES-011-Morning-Executive-Brief.md)  
**Blueprint:** [BP-003 — Morning Executive Brief](../00_BLUEPRINT/BP-003-Morning-Executive-Brief.md)  
**Executive Capability:** EC-003  
**Version:** 1.0.0  
**Status:** Ready for Implementation Planning  
**Author:** ORION CTO  

**Governed by:**

- [ORION Constitution (Ratified)](../09_Standards/ORION_Constitution_Ratified.md)
- [ORION Engineering Principles](../09_Standards/ORION_Engineering_Principles.md)
- [QUALITY_GATE](../08_Standards/QUALITY_GATE.md)

---

# Purpose

This Development Contract translates [ES-011](./ES-011-Morning-Executive-Brief.md) into concrete implementation tasks for EC-003.

Cursor SHALL implement only the items described in this document.

No additional features are to be introduced.

---

# Engineering rules

Cursor SHALL follow:

- SOLID principles
- Clean Architecture
- Strict TypeScript
- Composition over inheritance
- Dependency injection via constructor options
- Immutable data models where practical
- No circular dependencies

---

# General rules

- Keep functions small and files focused
- Do not modify EC-002A scoring formulas
- Do not modify EC-002B deterministic algorithms
- Do not introduce AI into health or confidence calculations
- Prefer extending `lib/executive/brief/` over new parallel modules
- Comments only where they improve understanding
- Maintain existing project conventions (`lib/` not `src/`)

---

# Implementation phases

## Phase 1 — Brief configuration and templates

**Create:**

```
lib/executive/brief/
  BriefConfig.ts
  BriefTemplates.ts
  BriefLifecycle.ts
```

**Requirements:**

- Central configuration constants only in `BriefConfig.ts`
- All user-facing deterministic strings in `BriefTemplates.ts`
- Lifecycle state resolver with pure functions

**Acceptance:** Models compile; lifecycle unit tests pass

---

## Phase 2 — Brief composer

**Create:**

```
lib/executive/brief/
  BriefComposer.ts
  map-health-to-snapshot.ts
  map-explainability-to-brief.ts
```

**Requirements:**

- Map `HealthScore` + `ExplainabilitySnapshot` → `HealthSnapshot`
- Compose greeting, end summary, priorities from templates
- No scoring logic; sorting and truncation only
- Deterministic output for identical input

**Acceptance:** Composer unit tests ≥ 90% coverage

---

## Phase 3 — Repository and orchestrator integration

**Modify:**

```
lib/executive/brief/BriefRepository.ts
lib/executive/brief/BriefService.ts
lib/executive/brief/map-dashboard-to-brief.ts
```

**Requirements:**

- `OrchestratorBriefRepository` extracts KPIs for EC-002A
- Invoke `BusinessHealthEngine` + `ExplainabilityEngine` in service layer
- Preserve `{ success, data | error }` result pattern
- Mock repository remains for offline development

**Acceptance:** Integration test from orchestrator fixture → `BriefView`

---

## Phase 4 — Explainability drill-down

**Create:**

```
components/executive/BusinessHealthExplainDrawer.tsx
lib/executive/brief/get-brief-explainability.ts
```

**Requirements:**

- "Why this score?" opens drawer with EC-002B explanation items
- Display confidence factors and executive narrative
- No score recalculation in UI
- Insufficient confidence disclosure per EC-002B integration guide

**Acceptance:** Drawer renders from `ExplainabilitySnapshot`; a11y test pass

---

## Phase 5 — `/brief` UI alignment

**Modify:**

```
app/(platform)/brief/page.tsx
components/executive/BriefPageContent.tsx
components/executive/BusinessHealthCard.tsx
```

**Requirements:**

- Remove static/mock health data paths
- Wire live `BriefView` from `BriefService`
- Match [Morning Executive Brief UI](../04_Design/Morning_Executive_Brief_UI.md)
- WCAG 2.2 AA compliance

**Acceptance:** Visual review + Playwright smoke test

---

## Phase 6 — AI summary async lane (optional V1)

**Create:**

```
lib/executive/brief/AiSummaryBuilder.ts
components/executive/AiExecutiveSummary.tsx (enhance)
```

**Requirements:**

- Async load after deterministic shell
- Evidence packet from composed brief only
- Template fallback when AI unavailable or confidence insufficient
- AI must not alter deterministic sections

**Acceptance:** Fallback test when AI disabled; no blocking render

---

## Phase 7 — Unit and integration tests

**Create:**

```
tests/executive/brief/BriefComposer.test.ts
tests/executive/brief/BriefLifecycle.test.ts
tests/integration/brief/BriefPipeline.test.ts
tests/fixtures/morning-brief.ts
tests/e2e/brief.spec.ts
```

**Edge cases (mandatory):**

- Empty snapshot
- Insufficient confidence
- Zero recommendations
- Stale / offline lifecycle
- Deterministic golden output
- Performance budget (< 2s compose)

**Coverage target:** ≥ 85% on `lib/executive/brief/` (excluding mock data)

---

## Phase 8 — Documentation

**Create:**

```
docs/07_Engineering/EC-003_Morning_Executive_Brief.md
```

**Modify:**

```
docs/04_Design/Morning_Executive_Brief_UI.md (as-built notes post-implementation)
```

**Acceptance:** Documentation synchronized with implementation

---

# Files to create

| Path | Phase |
|------|-------|
| `lib/executive/brief/BriefConfig.ts` | 1 |
| `lib/executive/brief/BriefTemplates.ts` | 1 |
| `lib/executive/brief/BriefLifecycle.ts` | 1 |
| `lib/executive/brief/BriefComposer.ts` | 2 |
| `lib/executive/brief/map-health-to-snapshot.ts` | 2 |
| `lib/executive/brief/map-explainability-to-brief.ts` | 2 |
| `components/executive/BusinessHealthExplainDrawer.tsx` | 4 |
| `lib/executive/brief/get-brief-explainability.ts` | 4 |
| `lib/executive/brief/AiSummaryBuilder.ts` | 6 |
| `tests/executive/brief/*` | 7 |
| `tests/integration/brief/*` | 7 |
| `tests/e2e/brief.spec.ts` | 7 |
| `docs/07_Engineering/EC-003_Morning_Executive_Brief.md` | 8 |

# Files to modify

| Path | Change | Phase |
|------|--------|-------|
| `lib/executive/brief/BriefService.ts` | EC-002A/002B pipeline | 3 |
| `lib/executive/brief/BriefRepository.ts` | KPI extraction | 3 |
| `lib/executive/brief/map-dashboard-to-brief.ts` | Composer delegation | 3 |
| `app/(platform)/brief/page.tsx` | Error handling | 5 |
| `components/executive/BriefPageContent.tsx` | Layout alignment | 5 |
| `components/executive/BusinessHealthCard.tsx` | Live data + drawer trigger | 5 |
| `vitest.config.ts` | Coverage include if needed | 7 |

# Files NOT to modify

| Path | Reason |
|------|--------|
| `lib/business-health/engine/BusinessHealthEngine.ts` | EC-002A frozen |
| `lib/business-health/strategies/*` | Scoring formulas unchanged |
| `lib/explainability/engine/*` | EC-002B algorithms frozen |
| `lib/explainability/builder/*` | EC-002B frozen |
| `lib/explainability/narrative/*` | EC-002B frozen |
| `.github/workflows/*` | No CI changes in EC-003 V1 unless required |

---

# Validation commands

Run sequentially after implementation:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

All commands MUST succeed.

---

# Quality gates

| Gate | Threshold | Blocking |
|------|-----------|----------|
| TypeScript | Zero errors | Yes |
| ESLint | Zero errors | Yes |
| Unit tests | 100% pass | Yes |
| Coverage (`lib/executive/brief/`) | ≥ 85% | Yes |
| Build | Next.js production build pass | Yes |
| Determinism | Golden brief tests pass | Yes |
| Performance | Brief compose ≤ 2s p95 | Yes |
| Accessibility | axe-core zero critical | Yes |
| No health algorithm changes | Code review | Yes |
| No AI in health/confidence path | Code review | Yes |

---

# Deliverables

| Deliverable | Phase |
|-------------|-------|
| BriefComposer (deterministic) | 2 |
| EC-002A/002B integration | 3 |
| Explainability drill-down UI | 4 |
| `/brief` live vertical slice | 5 |
| AI summary async lane | 6 |
| Unit + integration tests | 7 |
| Engineering documentation | 8 |

---

# Out of scope

Do NOT implement:

- EC-002A or EC-002B changes
- Recommendation engine rewrite
- Voice briefing
- Email digest
- Database persistence
- Default landing route change (separate decision)
- Git commit / push / tag

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

EC-003 V1 is complete when:

- [ ] ES-011 requirements implemented
- [ ] All DC-011 phases complete
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Build passes
- [ ] `/brief` displays live EC-002A + EC-002B data
- [ ] Documentation updated
- [ ] Ready for Architecture Review

---

# Version history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 26 July 2026 | ORION CTO | Initial development contract · EC-003 |

---

**Status:** Ready for Implementation Planning — **awaiting Founder approval before code.**
