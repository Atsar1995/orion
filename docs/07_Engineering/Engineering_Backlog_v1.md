# ORION Engineering Backlog v1.0

**Document ID:** EB-2026-001  
**Sprint:** 6.2 — Engineering Backlog Generation  
**Classification:** Engineering Programme Backlog  
**Author:** ORION Engineering Program Manager  
**Date:** 2026-07-25  
**Status:** READY FOR EXECUTION  
**Target Release:** `v1.0.0` (Executive Capabilities · proposed `v0.5.0-executive-capabilities` interim)  
**Inputs:** [EC-001–EC-005](../05_Product/) · [PAR v1](../06_Architecture/Product_Architecture_Review_v1.md) · [EMP v1](./Engineering_Master_Plan_v1.md) · [FRA v1](./Foundation_Readiness_Audit.md)

---

# Executive Summary

This backlog decomposes ORION Version 1.0 executive capabilities (EC-001 through EC-005) into **5 Initiatives · 13 Epics · 42 Features · 54 User Stories · 120+ Engineering Tasks**. It aligns with the Engineering Master Plan critical path and incorporates Foundation Readiness Audit gate items.

**Baseline:** Sprint 6 EC-001 vertical slice complete (`/brief`, mock service, 93 tests). **Next:** Phase 0 foundation gate (EC-000, orchestrator wiring, navigation ADR, API scaffold).

| Metric | Value |
|--------|-------|
| **Total story points (v1.0 scope)** | ~340 SP |
| **Sprint velocity assumption** | 34 SP / 2-week sprint |
| **Calendar estimate** | ~10 sprints (S6–S15) · ~5 months |
| **Critical path duration** | S6 → S12 (7 sprints to v0.5.0 executive release) |
| **Team assumption** | 2 full-stack engineers · 0.5 QA · 0.25 PM/Architect |

---

# Hierarchy

```
Initiatives (I1–I5)
  └── Epics (E1–E13)
        └── Features (F#.#)
              └── User Stories (US-NNN)
                    └── Engineering Tasks (TASK-XX-NNN)
                          └── Subtasks (checkbox items)
```

**Complexity → Story Points**

| Complexity | Points |
|------------|--------|
| XS | 1 |
| S | 2 |
| M | 3 |
| L | 5 |
| XL | 8 |

---

# Initiatives

| ID | Initiative | Outcome | Epics | Sprints |
|----|------------|---------|-------|---------|
| **I1** | Executive Platform Foundation | Shared contracts, orchestrator, API, events | E1, E2, E9, E10 (start) | S6–S8 |
| **I2** | Executive Intelligence Core | Production Health + Recommendations | E3, E4, E11 (start) | S7–S9 |
| **I3** | Executive Surfaces | Brief + Decisions + shared UI | E5, E6, E8 | S6–S10 |
| **I4** | AI Executive Layer | Narration, Copilot, Memory, Learning | E7, E11, E12 | S9–S12 |
| **I5** | Production Excellence | QA, security, DevOps, release | E13 | S6–S12 (continuous) |

---

# Epics

| Epic | Title | Initiative | SP Est. | Sprint Range | Status |
|------|-------|------------|---------|--------------|--------|
| **E1** | EC-000 Executive Platform Contracts | I1 | 21 | S6 | 🟡 In progress |
| **E2** | Orchestrator Unification & Snapshot Composer | I1 | 26 | S6–S7 | 🔴 Not started |
| **E3** | EC-002 Business Health Engine (Production) | I2 | 34 | S7–S8 | 🔴 Not started |
| **E4** | EC-003 Recommendation Engine (Production) | I2 | 34 | S8–S9 | 🔴 Not started |
| **E5** | EC-001 Morning Executive Brief | I3 | 26 | S6, S9 | 🟡 Slice done |
| **E6** | EC-004 Executive Decision Center | I3 | 42 | S10–S11 | 🔴 Not started |
| **E7** | EC-005 AI Executive Copilot (V1) | I4 | 42 | S11–S12 | 🔴 Not started |
| **E8** | Shared Executive UI Component Library | I3 | 21 | S6–S10 | 🟡 Started |
| **E9** | Executive Intelligence API & Events | I1 | 26 | S8–S10 | 🔴 Not started |
| **E10** | Persistence & Database Layer | I1 | 34 | S7–S11 | 🔴 Not started |
| **E11** | AI Narration & Validation Service | I4 | 34 | S7–S11 | 🔴 Not started |
| **E12** | Executive Learning & Memory | I4 | 21 | S11–S12 | 🔴 Not started |
| **E13** | QA, Security, DevOps & Release | I5 | 34 | S6–S12 | 🟡 CI exists |

---

# Features

| Feature ID | Epic | Feature | Stories |
|------------|------|---------|---------|
| F1.1 | E1 | EC-000 type system completion | US-F01–F04 |
| F1.2 | E1 | Contract validators & tests | US-F05 |
| F1.3 | E1 | Category registry & KPI dictionary | US-F06 |
| F2.1 | E2 | Snapshot composer | US-F10 |
| F2.2 | E2 | Pipeline deduplication & cache | US-F11 |
| F2.3 | E2 | Legacy stack retirement plan | US-F12 |
| F3.1 | E3 | Health service boundary | US-010–015 |
| F3.2 | E3 | Health explainability API | US-002, US-011 |
| F4.1 | E4 | Recommendation service boundary | US-020–025 |
| F4.2 | E4 | ORS scoring & dedup | US-024 |
| F4.3 | E4 | Recommendation feedback loop | US-023 |
| F5.1 | E5 | Brief route & composer | US-001, US-006–008 |
| F5.2 | E5 | Brief orchestrator integration | US-F20 |
| F5.3 | E5 | Navigation IA & default landing | US-F21 |
| F6.1 | E6 | Decision service & lifecycle | US-030–036 |
| F6.2 | E6 | Decision UI & queue views | US-033 |
| F6.3 | E6 | Outcome tracking | US-034–035 |
| F7.1 | E7 | Copilot service & context | US-040–042 |
| F7.2 | E7 | Copilot streaming & commands | US-046 |
| F7.3 | E7 | Inference labelling & refusal | US-043–044 |
| F8.1 | E8 | Core executive components | US-002, US-021–022 |
| F8.2 | E8 | Command Center migration | TASK-FE-020 |
| F9.1 | E9 | REST API scaffold | US-F30 |
| F9.2 | E9 | Event emitter | US-F31 |
| F10.1 | E10 | Decision schema & migrations | US-F40 |
| F10.2 | E10 | Copilot & memory schema | US-F41 |
| F11.1 | E11 | Template narration engine | US-004 |
| F11.2 | E11 | Citation validator & confidence | US-043 |
| F11.3 | E11 | LLM adapter (V1.1) | US-040 |
| F12.1 | E12 | Learning loop | US-023, US-035 |
| F12.2 | E12 | Executive memory store | US-045 |
| F13.1 | E13 | E2E test suite | US-F50 |
| F13.2 | E13 | Auth & security hardening | US-F51 |
| F13.3 | E13 | Deploy pipeline | US-F52 |

---

# User Stories

## Foundation & Platform (Phase 0 Gate)

### US-F01 — Complete EC-000 decision types

| Field | Value |
|-------|-------|
| **Story ID** | US-F01 |
| **Title** | Complete EC-000 decision domain types |
| **Description** | As a platform engineer, I need canonical Decision, DecisionAlternative, DecisionStatus, and DecisionOutcome types so that EC-004 can be implemented without ad-hoc models. |
| **Business Value** | Prevents decision model duplication across EC-004, EC-005, and persistence layer. |
| **Acceptance Criteria** | `types/executive/decision.ts` created · exported from index · matches EC-004 spec §4 · contract test passes |
| **Dependencies** | PAR consolidation recommendations |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 6 |
| **Story Points** | 3 |

### US-F02 — Complete EC-000 copilot & memory types

| Field | Value |
|-------|-------|
| **Story ID** | US-F02 |
| **Title** | Complete EC-000 copilot and memory types |
| **Description** | As a platform engineer, I need CopilotConversation, CopilotMessage, MemoryEntry, and LearningEvent types so EC-005 and E12 can share one contract. |
| **Business Value** | Unblocks Copilot and learning loop without parallel type systems. |
| **Acceptance Criteria** | `types/executive/copilot.ts`, `memory.ts`, `learning.ts` created · barrel exports · contract tests |
| **Dependencies** | US-F01 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 6 |
| **Story Points** | 3 |

### US-F03 — Complete EC-000 audit & category types

| Field | Value |
|-------|-------|
| **Story ID** | US-F03 |
| **Title** | Complete EC-000 audit and category types |
| **Description** | As a platform engineer, I need AuditEntry, ExecutiveCategory, and CategoryMeta types for governance and recommendation categorization. |
| **Business Value** | Enables audit trail and unified category registry per PAR. |
| **Acceptance Criteria** | `types/executive/audit.ts`, `category.ts` created · validators stub in `lib/executive/contracts/` |
| **Dependencies** | None |
| **Priority** | P0 |
| **Complexity** | S |
| **Suggested Sprint** | Sprint 6 |
| **Story Points** | 2 |

### US-F04 — Unified confidence model

| Field | Value |
|-------|-------|
| **Story ID** | US-F04 |
| **Title** | Implement unified confidence engine contract |
| **Description** | As a platform engineer, I need one ConfidenceScore calculation model used by Health, Recommendations, Brief, and Copilot so executives see consistent trust signals. |
| **Business Value** | Resolves PAR finding on inconsistent confidence formulas across EC-002/003/005. |
| **Acceptance Criteria** | `lib/executive/confidence/` scaffold · single weight profile · unit tests · used by BriefView mapper |
| **Dependencies** | US-F03 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 5 |

### US-F05 — EC-000 contract validators

| Field | Value |
|-------|-------|
| **Story ID** | US-F05 |
| **Title** | EC-000 runtime contract validators |
| **Description** | As a platform engineer, I need Zod validators for all EC-000 types so API and service boundaries enforce schema integrity. |
| **Business Value** | Prevents invalid data reaching executive surfaces; required for API layer. |
| **Acceptance Criteria** | `lib/executive/contracts/` with validators for snapshot, health, recommendation, decision · 100% critical path coverage in tests |
| **Dependencies** | US-F01, US-F02, US-F03 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 6 |
| **Story Points** | 5 |

### US-F06 — Category registry

| Field | Value |
|-------|-------|
| **Story ID** | US-F06 |
| **Title** | Executive category registry |
| **Description** | As a system, I need a category registry mapping recommendation and alert categories to metadata so all EC surfaces use consistent labels. |
| **Business Value** | Eliminates category string drift across engines and UI. |
| **Acceptance Criteria** | `lib/executive/categories/` · registry API · maps EC-003 categories · unit tests |
| **Dependencies** | US-F03 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 3 |

### US-F10 — Executive snapshot composer

| Field | Value |
|-------|-------|
| **Story ID** | US-F10 |
| **Title** | Single executive snapshot composer |
| **Description** | As a platform engineer, I need one Snapshot Composer producing `ExecutiveSnapshot` from the orchestrator pipeline so all EC surfaces consume identical data. |
| **Business Value** | One source of truth; eliminates dual-stack aggregation (QA-001 C-01). |
| **Acceptance Criteria** | `lib/executive/snapshot/` · composes health + recs + alerts + brief · integration test with mock providers · command-center and brief consume same composer |
| **Dependencies** | US-F05, E2 |
| **Priority** | P0 |
| **Complexity** | XL |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 8 |

### US-F11 — Pipeline performance cache

| Field | Value |
|-------|-------|
| **Story ID** | US-F11 |
| **Title** | Deduplicate provider fetches and add snapshot cache |
| **Description** | As a system, I need provider contributions fetched once per pipeline run and snapshots cached with TTL so executive pages load within SLA. |
| **Business Value** | Resolves QA-002 performance findings; required before live provider scale. |
| **Acceptance Criteria** | Single fetch per provider per run · 15-min TTL cache · P95 cold pipeline ≤ 3s · benchmark test |
| **Dependencies** | US-F10 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 5 |

### US-F12 — Legacy intelligence stack retirement

| Field | Value |
|-------|-------|
| **Story ID** | US-F12 |
| **Title** | Retire duplicate intelligence engine paths |
| **Description** | As a platform engineer, I need legacy `brief-engine.ts` and `recommendation-engine.ts` retired in favour of canonical engines so maintenance burden is halved. |
| **Business Value** | Reduces regression risk and developer confusion. |
| **Acceptance Criteria** | Duplicate files removed or deprecated · all tests pass · no imports from legacy paths · migration note in CHANGELOG |
| **Dependencies** | US-F10 |
| **Priority** | P1 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 5 |

### US-F20 — Wire Brief to orchestrator

| Field | Value |
|-------|-------|
| **Story ID** | US-F20 |
| **Title** | Wire EC-001 Brief to orchestrator repository |
| **Description** | As an executive, I want my Morning Brief powered by live orchestrator data (mock providers today) so I see consistent intelligence across Brief and Command Center. |
| **Business Value** | Completes EC-001 production data path; validates repository swap pattern. |
| **Acceptance Criteria** | `briefService` defaults to `OrchestratorBriefRepository` · `/brief` shows orchestrator data · tests updated · feature flag for rollback |
| **Dependencies** | US-F10, US-001 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 3 |

### US-F21 — Navigation IA ADR

| Field | Value |
|-------|-------|
| **Story ID** | US-F21 |
| **Title** | Resolve executive navigation IA |
| **Description** | As a product owner, I need an ADR resolving default landing (`/advisor` vs `/brief` vs `/decisions`) so engineering can implement navigation without rework. |
| **Business Value** | Unblocks EC-001 default landing and EC-004 route placement (PAR-2026-001). |
| **Acceptance Criteria** | ADR published in `docs/10_Decisions/` · root redirect updated · sidebar aligned · DL-2026-001 updated or superseded |
| **Dependencies** | None |
| **Priority** | P0 |
| **Complexity** | S |
| **Suggested Sprint** | Sprint 6 |
| **Story Points** | 2 |

### US-F30 — Executive API scaffold

| Field | Value |
|-------|-------|
| **Story ID** | US-F30 |
| **Title** | Scaffold `/api/v1/executive/*` routes |
| **Description** | As an integrator, I need REST endpoints for snapshot, brief, health, and recommendations so external consumers and Copilot streaming can integrate. |
| **Business Value** | API-first executive platform per EMP; mobile and automation ready. |
| **Acceptance Criteria** | Routes: GET `/snapshot`, `/brief`, `/health`, `/recommendations` · Zod validation · auth middleware · contract tests |
| **Dependencies** | US-F05, US-F10 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 5 |

### US-F31 — Executive event emitter

| Field | Value |
|-------|-------|
| **Story ID** | US-F31 |
| **Title** | In-process executive event emitter |
| **Description** | As a system, I need `executive.*` domain events emitted on snapshot, health, recommendation, and decision changes so cache invalidation and learning hooks work. |
| **Business Value** | Foundation for event-driven architecture per EMP §Event Model. |
| **Acceptance Criteria** | `lib/executive/events/` · 8 core events · typed payloads · unit tests · wired to orchestrator completion |
| **Dependencies** | US-F10 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-F40 — Decision persistence schema

| Field | Value |
|-------|-------|
| **Story ID** | US-F40 |
| **Title** | Decision database schema and migrations |
| **Description** | As a platform engineer, I need durable storage for decisions, alternatives, outcomes, and audit logs so EC-004 survives restarts. |
| **Business Value** | EC-004 production blocker; compliance and accountability. |
| **Acceptance Criteria** | ORM ADR (Drizzle/Prisma) · schema with `org_id` · migrations · repository pattern · supersedes in-memory for decisions |
| **Dependencies** | US-F01, ADR persistence |
| **Priority** | P0 |
| **Complexity** | XL |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 8 |

### US-F50 — Playwright E2E suite

| Field | Value |
|-------|-------|
| **Story ID** | US-F50 |
| **Title** | Playwright executive E2E test suite |
| **Description** | As QA, I need E2E tests for Brief, Decisions, and Copilot flows so regressions are caught before release. |
| **Business Value** | Closes FRA testing gap; required for production confidence. |
| **Acceptance Criteria** | `tests/e2e/` · Brief load smoke · Decision approve flow · CI job · ≥ 3 critical paths |
| **Dependencies** | US-001, US-030 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 9 |
| **Story Points** | 5 |

### US-F51 — Real authentication (ES-037)

| Field | Value |
|-------|-------|
| **Story ID** | US-F51 |
| **Title** | Replace placeholder authentication |
| **Description** | As a security officer, I need real session-based authentication replacing the placeholder so executive data is protected in production. |
| **Business Value** | Production security blocker identified in FRA. |
| **Acceptance Criteria** | ES-037 implemented · session cookies · CSRF · placeholder disabled in prod · RBAC scaffold wired · security tests |
| **Dependencies** | E10 |
| **Priority** | P0 |
| **Complexity** | XL |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 8 |

### US-F52 — Deploy pipeline

| Field | Value |
|-------|-------|
| **Story ID** | US-F52 |
| **Title** | Staging and production deploy pipeline |
| **Description** | As DevOps, I need automated deploy to staging and production with env validation so releases are repeatable. |
| **Business Value** | Closes FRA deployment readiness gap (score 38/100). |
| **Acceptance Criteria** | Deploy workflow · `.env.example` · staging seed data · rollback procedure documented |
| **Dependencies** | US-F51 |
| **Priority** | P1 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 5 |

---

## EC-001 — Morning Executive Brief

### US-001 — Morning orientation

| Field | Value |
|-------|-------|
| **Story ID** | US-001 |
| **Title** | Open `/brief` and see morning orientation in ≤ 5 min |
| **Description** | As an executive, I want to open the Morning Executive Brief and immediately understand business condition, top priority, and first action so I can start my day oriented. |
| **Business Value** | Core EC-001 habit loop; targets ≤ 90s time-to-orientation. |
| **Acceptance Criteria** | Brief loads ≤ 3s cached · Health + top recommendation above fold · End-of-brief summary visible · responsive mobile/tablet/desktop |
| **Dependencies** | E3, E4, E5, US-F20 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 6 ✅ (slice) · Sprint 9 (production) |
| **Story Points** | 3 |

### US-002 — Business health explainability

| Field | Value |
|-------|-------|
| **Story ID** | US-002 |
| **Title** | See Business Health with explainability |
| **Description** | As an executive, I want to see my business health score and ask "Why this score?" so I trust the number before acting. |
| **Business Value** | Trust anchor for entire executive loop (EC-002 → EC-001). |
| **Acceptance Criteria** | Health card on Brief · "Why this score?" opens ExplainabilityDrawer · confidence badge · domain breakdown |
| **Dependencies** | E3, E8, US-011 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 3 |

### US-003 — Critical alerts prioritized

| Field | Value |
|-------|-------|
| **Story ID** | US-003 |
| **Title** | See critical alerts prioritized |
| **Description** | As an executive, I want critical alerts sorted by severity with age labels so I know what requires judgment today. |
| **Business Value** | Surfaces must-see risk items; reduces alert fatigue. |
| **Acceptance Criteria** | Alerts sorted critical first · max 5 above fold · empty state when clear · age labels shown |
| **Dependencies** | Alert engine |
| **Priority** | P0 |
| **Complexity** | S |
| **Suggested Sprint** | Sprint 6 ✅ |
| **Story Points** | 2 |

### US-004 — AI summary with citations

| Field | Value |
|-------|-------|
| **Story ID** | US-004 |
| **Title** | Read AI executive summary with citations |
| **Description** | As an executive, I want a plain-language AI summary with source citations and confidence so I can trust the narrative. |
| **Business Value** | EC-001 differentiation; compresses 45–90 min synthesis to ≤ 5 min. |
| **Acceptance Criteria** | Summary ≤ 6 sentences · sources listed · confidence shown · 100% cited facts (template narration V1) |
| **Dependencies** | E11 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 9 |
| **Story Points** | 5 |

### US-005 — Act on recommendation from Brief

| Field | Value |
|-------|-------|
| **Story ID** | US-005 |
| **Title** | Act on a recommendation from the Brief |
| **Description** | As an executive, I want to tap Act Now on a recommendation and have it create or open a Decision so I convert orientation into action. |
| **Business Value** | Action conversion metric target ≥ 60%; connects EC-001 → EC-004. |
| **Acceptance Criteria** | Action bar wired · Act creates Decision · page revalidates · delegate/snooze persist intent |
| **Dependencies** | E6, E8, US-036 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 5 |

### US-006 — Overnight deltas

| Field | Value |
|-------|-------|
| **Story ID** | US-006 |
| **Title** | See overnight material deltas |
| **Description** | As an executive, I want an overnight changes strip showing material deltas so I know what changed while I was away. |
| **Business Value** | Answers "what changed overnight?" — top EC-001 executive question. |
| **Acceptance Criteria** | Delta strip when changes exist · direction indicators · hidden when no material changes |
| **Dependencies** | E2, US-F10 |
| **Priority** | P1 |
| **Complexity** | S |
| **Suggested Sprint** | Sprint 6 ✅ |
| **Story Points** | 2 |

### US-007 — Domain signal chips

| Field | Value |
|-------|-------|
| **Story ID** | US-007 |
| **Title** | See collapsed domain signal chips |
| **Description** | As an executive, I want healthy domains shown as compact chips and anomalous domains expanded so I scan quickly without chart overload. |
| **Business Value** | Progressive disclosure per EC-001 spec; reduces cognitive load. |
| **Acceptance Criteria** | ≥ 5 domain chips · auto-expand on anomaly · collapsed by default when healthy |
| **Dependencies** | E3 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 9 |
| **Story Points** | 3 |

### US-008 — Stale data warnings

| Field | Value |
|-------|-------|
| **Story ID** | US-008 |
| **Title** | See stale data warnings |
| **Description** | As an executive, I want visible warnings when provider data is stale so I do not decide on outdated intelligence. |
| **Business Value** | Trust and graceful degradation per ORION Constitution. |
| **Acceptance Criteria** | Provider freshness in snapshot · confidence discount visible · stale banner on Brief · sync CTA |
| **Dependencies** | E2, Integration Center |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 9 |
| **Story Points** | 3 |

---

## EC-002 — Business Health Engine

### US-010 — Overall health score

| Field | Value |
|-------|-------|
| **Story ID** | US-010 |
| **Title** | See overall business health score 0–100 |
| **Description** | As an executive, I want a single 0–100 health score with status band and trend so I instantly know business condition. |
| **Business Value** | Primary EC-002 output; feeds all downstream ECs. |
| **Acceptance Criteria** | Score 0–100 · status band (healthy/attention/critical) · trend arrow · shown on Brief and Command Center |
| **Dependencies** | E2, E3 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 3 |

### US-011 — Health drivers with evidence

| Field | Value |
|-------|-------|
| **Story ID** | US-011 |
| **Title** | Understand health drivers |
| **Description** | As an executive, I want to see top positive and negative health drivers with evidence so I understand why the score changed. |
| **Business Value** | Explainability requirement; builds executive trust. |
| **Acceptance Criteria** | Top 3 drivers shown · evidence linked · ExplainabilityDrawer · confidence on explanation |
| **Dependencies** | E3, E8 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 5 |

### US-012 — Provider-aware health

| Field | Value |
|-------|-------|
| **Story ID** | US-012 |
| **Title** | Health reflects connected providers without fabrication |
| **Description** | As a system, I must compute health from connected providers only, reducing confidence when data is missing — never fabricating metrics. |
| **Business Value** | ORION Constitution compliance; prevents false confidence. |
| **Acceptance Criteria** | Missing provider reduces confidence · no synthetic metrics · degradation badge on Brief |
| **Dependencies** | Providers, US-F04 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 7 |
| **Story Points** | 3 |

### US-013 — Domain breakdown

| Field | Value |
|-------|-------|
| **Story ID** | US-013 |
| **Title** | See domain health breakdown |
| **Description** | As an executive, I want ≥ 5 domain mini-scores (Finance, CRM, Ops, Marketing, etc.) so I know which area needs attention. |
| **Business Value** | Domain-level orientation per EC-002 wireframes. |
| **Acceptance Criteria** | ≥ 5 domains · mini-bars or cards · status indicators · on Brief and health detail |
| **Dependencies** | E3 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-014 — Alert penalty on health

| Field | Value |
|-------|-------|
| **Story ID** | US-014 |
| **Title** | Critical alerts penalize health score |
| **Description** | As a system, I must apply score penalties when critical alerts are active per EC-002 scoring rules. |
| **Business Value** | Aligns health score with real operational risk. |
| **Acceptance Criteria** | Penalty formula per EC-002 spec · unit tests · visible in explainability |
| **Dependencies** | Alert engine, E3 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-015 — Health history comparison

| Field | Value |
|-------|-------|
| **Story ID** | US-015 |
| **Title** | Compare health vs yesterday and last week |
| **Description** | As an executive, I want health trend comparisons so I see direction not just point-in-time score. |
| **Business Value** | Answers "healthier or weaker than yesterday?" |
| **Acceptance Criteria** | vs yesterday · vs last week · requires daily snapshots in DB |
| **Dependencies** | E10 |
| **Priority** | P2 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 5 |

---

## EC-003 — Executive Recommendation Engine

### US-020 — ORS-ranked recommendations

| Field | Value |
|-------|-------|
| **Story ID** | US-020 |
| **Title** | See recommendations ranked by ORS |
| **Description** | As an executive, I want recommendations sorted by ORION Recommendation Score with transparent ranking so I trust priority order. |
| **Business Value** | Core EC-003 value; replaces manual prioritization. |
| **Acceptance Criteria** | Sorted by ORS · score visible on expand · ≤ 10 on Command Center · ≤ 3 on Brief |
| **Dependencies** | E4 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-021 — Evidence on every recommendation

| Field | Value |
|-------|-------|
| **Story ID** | US-021 |
| **Title** | Every recommendation has traceable evidence |
| **Description** | As an executive, I require ≥ 1 evidence object on every recommendation so I never act on unsupported guidance. |
| **Business Value** | 100% evidence coverage target in EC-001 metrics. |
| **Acceptance Criteria** | ≥ 1 `ExecutiveEvidence` per recommendation · publish blocked without evidence · EvidenceList in UI |
| **Dependencies** | E1 |
| **Priority** | P0 |
| **Complexity** | S |
| **Suggested Sprint** | Sprint 6 ✅ |
| **Story Points** | 2 |

### US-022 — Recommendation explainability

| Field | Value |
|-------|-------|
| **Story ID** | US-022 |
| **Title** | Understand why now and why me |
| **Description** | As an executive, I want explainability answering all 6 EC-003 questions so I understand recommendation context. |
| **Business Value** | Reduces false urgency rate target ≤ 10%. |
| **Acceptance Criteria** | ExplainabilityDrawer · 6 questions answered · template + evidence · confidence shown |
| **Dependencies** | E8, E11 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 5 |

### US-023 — Recommendation feedback

| Field | Value |
|-------|-------|
| **Story ID** | US-023 |
| **Title** | Accept, reject, or defer recommendations |
| **Description** | As an executive, I want to accept, reject, or defer recommendations with persisted feedback so ORION learns my preferences. |
| **Business Value** | Learning loop input; action conversion tracking. |
| **Acceptance Criteria** | PATCH API or server action · feedback persisted · `executive.recommendation.feedback` event · UI updates |
| **Dependencies** | E12, E9 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 9 |
| **Story Points** | 5 |

### US-024 — Recommendation deduplication

| Field | Value |
|-------|-------|
| **Story ID** | US-024 |
| **Title** | Duplicate recommendations merge |
| **Description** | As a system, I must deduplicate recommendations per EC-003 rules so executives do not see redundant actions. |
| **Business Value** | Reduces noise; improves recommendation quality. |
| **Acceptance Criteria** | Dedup by dedupeKey · merge logic unit tested · max 3 on Brief enforced |
| **Dependencies** | E4 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-025 — Brief recommendation cap

| Field | Value |
|-------|-------|
| **Story ID** | US-025 |
| **Title** | ≤ 3 recommendations on Brief |
| **Description** | As an executive, I want at most 3 recommendations on the Brief so I am not overwhelmed. |
| **Business Value** | EC-001 progressive disclosure; protects executive attention. |
| **Acceptance Criteria** | Hard cap 3 on Brief · top ORS shown · remainder accessible via Command Center |
| **Dependencies** | E5 |
| **Priority** | P0 |
| **Complexity** | XS |
| **Suggested Sprint** | Sprint 9 |
| **Story Points** | 1 |

---

## EC-004 — Executive Decision Center

### US-030 — Decision queue at `/decisions`

| Field | Value |
|-------|-------|
| **Story ID** | US-030 |
| **Title** | Manage decisions at `/decisions` |
| **Description** | As an executive, I want a Decision Center with queue, critical, and delegated views so I manage accountability in one place. |
| **Business Value** | EC-004 primary surface; institutional decision memory. |
| **Acceptance Criteria** | `/decisions` route · queue/critical/delegated tabs · server-rendered · empty states |
| **Dependencies** | E6, E10, US-F40 |
| **Priority** | P0 |
| **Complexity** | XL |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 8 |

### US-031 — Approve with alternatives

| Field | Value |
|-------|-------|
| **Story ID** | US-031 |
| **Title** | Approve a decision with alternatives |
| **Description** | As an executive, I want to approve decisions with ≥ 2 alternatives when material so I record deliberate choices. |
| **Business Value** | Decision quality and audit trail. |
| **Acceptance Criteria** | ≥ 2 alternatives when material · approver logged · AlternativesCompare UI · audit entry |
| **Dependencies** | E6 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 5 |

### US-032 — Delegate with SLA

| Field | Value |
|-------|-------|
| **Story ID** | US-032 |
| **Title** | Delegate with owner and due date |
| **Description** | As an executive, I want to delegate decisions with owner, due date, and SLA tracking so work does not stall. |
| **Business Value** | Executive leverage; operational accountability. |
| **Acceptance Criteria** | Delegate action · owner + due date required · SLA tracking · notification hook stub |
| **Dependencies** | E6 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 5 |

### US-033 — Delegation status tracking

| Field | Value |
|-------|-------|
| **Story ID** | US-033 |
| **Title** | Track delegated work status |
| **Description** | As an executive, I want On Track / At Risk / Overdue chips on delegated decisions so I spot slippage early. |
| **Business Value** | Visibility without micromanagement. |
| **Acceptance Criteria** | Status chips · auto At Risk near due · Overdue past due · filterable view |
| **Dependencies** | E6 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 3 |

### US-034 — Record decision outcomes

| Field | Value |
|-------|-------|
| **Story ID** | US-034 |
| **Title** | Record expected vs actual outcomes |
| **Description** | As an executive, I want to record decision outcomes with variance classification so ORION measures decision quality. |
| **Business Value** | Closes decision loop; feeds learning engine. |
| **Acceptance Criteria** | Outcome form · expected vs actual · OutcomeVarianceBadge · persisted |
| **Dependencies** | E10, E12 |
| **Priority** | P1 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 11 |
| **Story Points** | 5 |

### US-035 — Capture lessons learned

| Field | Value |
|-------|-------|
| **Story ID** | US-035 |
| **Title** | Capture lessons learned post-decision |
| **Description** | As an executive, I want to capture lessons after outcome measurement so institutional memory grows. |
| **Business Value** | Long-term ORION compounding value. |
| **Acceptance Criteria** | Post-measurement form · feeds memory store · searchable by Copilot |
| **Dependencies** | E12 |
| **Priority** | P1 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 11 |
| **Story Points** | 3 |

### US-036 — Recommendation → Decision promotion

| Field | Value |
|-------|-------|
| **Story ID** | US-036 |
| **Title** | Accepting recommendation creates Decision |
| **Description** | As a system, when an executive accepts a recommendation, I must promote it to a Decision per EC-003 → EC-004 contract. |
| **Business Value** | Connects intelligence to accountability; US-005 dependency. |
| **Acceptance Criteria** | Promotion service · Decision created with recommendation link · audit · integration test |
| **Dependencies** | E4, E6 |
| **Priority** | P0 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 10 |
| **Story Points** | 5 |

### US-037 — Search decision history

| Field | Value |
|-------|-------|
| **Story ID** | US-037 |
| **Title** | Search decision history |
| **Description** | As an executive, I want full-text search and filters on decision history so I find past judgments quickly. |
| **Business Value** | Institutional memory access; audit support. |
| **Acceptance Criteria** | Full-text search · filters (status, date, owner) · role-scoped · paginated |
| **Dependencies** | E10 |
| **Priority** | P2 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 11 |
| **Story Points** | 5 |

---

## EC-005 — AI Executive Copilot

### US-040 — Ask business questions

| Field | Value |
|-------|-------|
| **Story ID** | US-040 |
| **Title** | Ask business questions in Copilot |
| **Description** | As an executive, I want to ask business questions and receive structured responses with evidence and confidence so I have conversational access to ORION intelligence. |
| **Business Value** | EC-005 primary value; conversational executive OS. |
| **Acceptance Criteria** | CopilotPanel · structured response model · evidence · confidence · persisted thread |
| **Dependencies** | E7, E11 |
| **Priority** | P1 |
| **Complexity** | XL |
| **Suggested Sprint** | Sprint 11 |
| **Story Points** | 8 |

### US-041 — Copilot explains health and recommendations

| Field | Value |
|-------|-------|
| **Story ID** | US-041 |
| **Title** | Copilot explains health and recommendations |
| **Description** | As an executive, I want Copilot to correctly route explain-health and explain-recommendation workflows with proper context injection. |
| **Business Value** | Reduces need to navigate multiple surfaces for explanations. |
| **Acceptance Criteria** | Workflow router · correct context from snapshot · citations · no hallucinated metrics |
| **Dependencies** | E3, E4, E7 |
| **Priority** | P1 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 11 |
| **Story Points** | 5 |

### US-042 — Copilot decision review

| Field | Value |
|-------|-------|
| **Story ID** | US-042 |
| **Title** | Copilot supports decision review |
| **Description** | As an executive, I want Copilot to help review decisions but never auto-approve so human judgment remains final. |
| **Business Value** | ES-057 compliance; decision support not decision replacement. |
| **Acceptance Criteria** | Decision Support workflow · never approves · presents alternatives · audit logged |
| **Dependencies** | E6, E7 |
| **Priority** | P1 |
| **Complexity** | L |
| **Suggested Sprint** | Sprint 11 |
| **Story Points** | 5 |

### US-043 — Inference labelling

| Field | Value |
|-------|-------|
| **Story ID** | US-043 |
| **Title** | Inference labelled separately from facts |
| **Description** | As an executive, I want AI inferences clearly labelled with confidence capped at 75% so I distinguish facts from interpretation. |
| **Business Value** | Trust and ES-057 governance requirement. |
| **Acceptance Criteria** | Inference badge · confidence cap 75% for inference · facts require citations |
| **Dependencies** | E11 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-044 — Copilot refusal when insufficient data

| Field | Value |
|-------|-------|
| **Story ID** | US-044 |
| **Title** | Copilot refuses when data insufficient |
| **Description** | As an executive, I want Copilot to refuse gracefully when data is insufficient, listing missing providers so I know what to connect. |
| **Business Value** | Prevents fabricated answers; drives integration adoption. |
| **Acceptance Criteria** | Refusal template · missing provider list · helpful next steps · no fabricated metrics |
| **Dependencies** | E11 |
| **Priority** | P0 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 8 |
| **Story Points** | 3 |

### US-045 — Search past conversations

| Field | Value |
|-------|-------|
| **Story ID** | US-045 |
| **Title** | Search past Copilot conversations |
| **Description** | As an executive, I want to search and pin past Copilot threads so I can revisit prior analysis. |
| **Business Value** | Continuity; reduces repeated questions. |
| **Acceptance Criteria** | Thread search · pin/unpin · persisted in DB · role-scoped |
| **Dependencies** | E10 |
| **Priority** | P2 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 12 |
| **Story Points** | 3 |

### US-046 — Copilot quick commands

| Field | Value |
|-------|-------|
| **Story ID** | US-046 |
| **Title** | Use quick commands (`/brief`, `/health`) |
| **Description** | As an executive, I want slash commands routing to correct Copilot workflows so I navigate intelligence quickly. |
| **Business Value** | Power-user efficiency; reduces UI navigation. |
| **Acceptance Criteria** | Command router · `/brief`, `/health`, `/decisions` · correct workflow dispatch · help text |
| **Dependencies** | E7 |
| **Priority** | P2 |
| **Complexity** | M |
| **Suggested Sprint** | Sprint 12 |
| **Story Points** | 3 |

---

# Engineering Tasks

## Sprint 6 — Foundation & EC-001 Completion

### Frontend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-FE-001 | Finalize BriefPageContent responsive layouts | US-001 | Mobile breakpoints · tablet grid · a11y audit |
| TASK-FE-002 | Wire ExplainabilityDrawer to health card | US-002 | Connect button · mock explanation data |
| TASK-FE-003 | Add domain signal chips component | US-007 | ExecutiveStatStrip · collapse/expand |
| TASK-FE-004 | Legacy `/advisor` deprecation banner | US-F21 | Link to `/brief` · sunset notice |

### Backend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-BE-001 | Create `types/executive/decision.ts` | US-F01 | Types · exports · JSDoc |
| TASK-BE-002 | Create copilot/memory/learning types | US-F02 | 3 files · barrel |
| TASK-BE-003 | Create audit/category types | US-F03 | 2 files · enums |
| TASK-BE-004 | Implement `lib/executive/contracts/` validators | US-F05 | Zod schemas · validate helpers |
| TASK-BE-005 | Contract unit tests | US-F05 | `tests/executive/contracts/` |

### API

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-API-001 | API route folder scaffold | US-F30 | `app/api/v1/executive/` · health check stub |

### Testing

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-QA-001 | Expand vitest coverage scope | E13 | Add executive/ to vitest.config |
| TASK-QA-002 | Brief component test expansion | US-001 | a11y assertions · empty states |

### Documentation

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DOC-001 | ADR Executive Navigation IA | US-F21 | Draft · review · publish |
| TASK-DOC-002 | EC-000 data contracts doc | US-F05 | `docs/07_Engineering/EC-000_Contracts.md` |

### Accessibility

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-A11Y-001 | Brief page WCAG spot check | US-001 | Keyboard nav · screen reader · contrast |

---

## Sprint 7 — Intelligence Core Start

### Frontend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-FE-010 | Health explainability drawer (production) | US-011 | Wire to health service |
| TASK-FE-011 | Health detail domain breakdown UI | US-013 | Domain mini-bars |
| TASK-FE-012 | Command Center → shared BusinessHealthCard | E8 | Replace BusinessHealthPanel |

### Backend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-BE-010 | `lib/executive/health/HealthService.ts` | US-010 | Wrap health-engine · repository |
| TASK-BE-011 | `lib/executive/snapshot/SnapshotComposer.ts` | US-F10 | Compose ExecutiveSnapshot |
| TASK-BE-012 | Wire OrchestratorBriefRepository default | US-F20 | Feature flag · tests |
| TASK-BE-013 | Pipeline provider dedup | US-F11 | Single fetch · cache layer |
| TASK-BE-014 | `lib/executive/confidence/` engine | US-F04 | Unified weights · tests |

### API

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-API-010 | GET `/api/v1/executive/health` | US-010 | Handler · validation · tests |
| TASK-API-011 | GET `/api/v1/executive/health/explain` | US-011 | Explainability bundle |

### AI

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-AI-010 | Template narration engine | US-004 | `lib/executive/narration/templates/` |
| TASK-AI-011 | Citation validator stub | US-043 | validateCitations() · tests |

### Testing

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-QA-010 | Health service unit tests | US-010 | Score · drivers · penalties |
| TASK-QA-011 | Snapshot composer integration test | US-F10 | Full pipeline mock |
| TASK-QA-012 | Pipeline performance benchmark | US-F11 | Vitest bench · baseline |

### DevOps

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DO-010 | Persistence ORM ADR spike | US-F40 | Drizzle vs Prisma · decision |
| TASK-DO-011 | Create `.env.example` | US-F52 | All env vars documented |

### Documentation

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DOC-010 | ADR Persistence layer | US-F40 | Selection · rationale |

### Performance

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-PERF-010 | Snapshot TTL cache | US-F11 | 15-min TTL · invalidation hook |

### Security

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-SEC-010 | Tenant context middleware stub | US-F51 | orgId injection · types |

---

## Sprint 8 — Recommendations & API

### Frontend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-FE-020 | Migrate Command Center recommendation panel | E8 | Shared ExecutiveRecommendationCard |
| TASK-FE-021 | Recommendation explainability UI | US-022 | 6-question drawer |
| TASK-FE-022 | Recommendation feedback UI | US-023 | Accept/reject/defer buttons |

### Backend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-BE-020 | `lib/executive/recommendations/RecommendationService.ts` | US-020 | Wrap engine · ORS |
| TASK-BE-021 | Recommendation dedup merge | US-024 | dedupeKey logic |
| TASK-BE-022 | `lib/executive/events/` emitter | US-F31 | 8 events · typed |
| TASK-BE-023 | Retire legacy recommendation-engine.ts | US-F12 | Migration · test |

### API

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-API-020 | GET `/api/v1/executive/recommendations` | US-020 | Ranked list |
| TASK-API-021 | PATCH `/api/v1/executive/recommendations/{id}` | US-023 | Feedback endpoint |
| TASK-API-022 | GET `/api/v1/executive/snapshot` | US-F30 | Full snapshot |
| TASK-API-023 | GET `/api/v1/executive/brief` | US-001 | BriefView JSON |

### AI

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-AI-020 | Citation validator (production) | US-043 | Block uncited claims |
| TASK-AI-021 | Inference labelling in narration | US-043 | Badge · cap 75% |
| TASK-AI-022 | Copilot refusal templates | US-044 | Missing provider list |

### Testing

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-QA-020 | ORS scoring unit tests | US-020 | All weight profiles |
| TASK-QA-021 | API contract tests | US-F30 | Supertest/route tests |
| TASK-QA-022 | Recommendation dedup tests | US-024 | Edge cases |

### DevOps

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DO-020 | Feature flag env config | E13 | EC route flags |
| TASK-DO-021 | Branch protection on `main` | E13 | Required quality gate |

### Documentation

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DOC-020 | OpenAPI spec draft | US-F30 | `/api/v1/executive` |

### Accessibility

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-A11Y-020 | jest-axe setup | E13 | Component test integration |

### Performance

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-PERF-020 | API response benchmarks | US-F30 | P95 ≤ 300ms target |

### Security

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-SEC-020 | API input validation audit | US-F30 | Zod on all routes |
| TASK-SEC-021 | Rate limiting stub for API | E13 | Per-IP basic limit |

---

## Sprint 9 — Brief Production & E2E

### Frontend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-FE-030 | Domain signal chips on Brief | US-007 | Anomaly expansion |
| TASK-FE-031 | Stale data banner | US-008 | Provider freshness UI |
| TASK-FE-032 | Brief recommendation cap (3) | US-025 | Composer logic + UI |
| TASK-FE-033 | Brief delta banner | US-006 | changesSinceLastView |
| TASK-FE-034 | Integration Center → Brief stale badges | US-008 | Cross-link |

### Backend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-BE-030 | Brief composer service | US-004 | Compose from snapshot + narration |
| TASK-BE-031 | Brief viewed-state persistence | US-006 | Last viewed timestamp |
| TASK-BE-032 | GA4 → Marketing health domain | US-012 | Wire GA4 provider |
| TASK-BE-033 | Provider freshness metadata | US-008 | Snapshot field |

### API

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-API-030 | Brief API production hardening | US-001 | Error codes · caching headers |

### AI

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-AI-030 | Brief AI summary integration | US-004 | Template narration · citations |
| TASK-AI-031 | Confidence on Brief summary | US-004 | Unified confidence engine |

### Testing

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-QA-030 | Playwright Brief E2E | US-F50 | Load · health · rec · summary |
| TASK-QA-031 | Brief composer unit tests | US-004 | Template output validation |

### DevOps

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DO-030 | Staging executive seed data | E13 | Mock org snapshot |
| TASK-DO-031 | Extend quality-gate for E2E | US-F50 | Playwright in CI |

### Documentation

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DOC-030 | OpenAPI spec v1 publish | US-F30 | Reviewed · versioned |

### Accessibility

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-A11Y-030 | Brief E2E a11y checks | US-001 | axe in Playwright |

### Performance

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-PERF-030 | Cached brief TTFB benchmark | US-001 | P95 ≤ 500ms |

---

## Sprint 10 — Decision Center Alpha

### Frontend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-FE-040 | `/decisions` page scaffold | US-030 | Queue · critical · delegated views |
| TASK-FE-041 | DecisionCard production component | US-031 | AlternativesCompare |
| TASK-FE-042 | Delegation UI with SLA chips | US-032, US-033 | Status chips |
| TASK-FE-043 | Brief Act Now → Decision flow | US-005 | Navigation · revalidation |
| TASK-FE-044 | OutcomeVarianceBadge | US-034 | Variance display |

### Backend

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-BE-040 | `lib/executive/decisions/DecisionService.ts` | US-030 | CRUD · lifecycle |
| TASK-BE-041 | Decision state machine | US-030 | Approve · reject · defer · delegate · complete |
| TASK-BE-042 | Recommendation → Decision promotion | US-036 | Promotion contract |
| TASK-BE-043 | Decision server actions | US-030 | CRUD actions · revalidatePath |
| TASK-BE-044 | Health daily snapshot persistence | US-015 | Schema · repository |

### API

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-API-040 | Decision CRUD routes | US-030 | GET/POST/PATCH |
| TASK-API-041 | Decision lifecycle actions | US-031 | approve/reject/defer/delegate/complete |
| TASK-API-042 | GET `/decisions/queue/critical` | US-030 | Critical queue |

### Testing

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-QA-040 | Decision lifecycle unit tests | US-030 | All transitions |
| TASK-QA-041 | EC-003→EC-004 promotion integration | US-036 | End-to-end |
| TASK-QA-042 | Playwright Decision E2E (start) | US-030 | Approve flow |

### DevOps

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DO-040 | Deploy pipeline v1 | US-F52 | Staging deploy workflow |

### Documentation

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-DOC-040 | EC-004 engineering spec update | US-030 | ES alignment |

### Accessibility

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-A11Y-040 | Decision Center keyboard nav | US-030 | Action bar · queue |

### Performance

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-PERF-040 | Decision list API benchmark | US-030 | P95 ≤ 300ms |

### Security

| Task ID | Title | Story | Subtasks |
|---------|-------|-------|----------|
| TASK-SEC-040 | ES-037 auth implementation | US-F51 | Session · CSRF · RBAC |
| TASK-SEC-041 | Decision audit log | US-031 | Append-only · immutable |
| TASK-SEC-042 | RBAC test suite | US-F51 | Role matrix tests |

---

# Sprint Plan (S6–S10)

## Sprint 6 — Foundation Gate & EC-001 Completion

| Field | Value |
|-------|-------|
| **Goal** | Complete Phase 0 gate; finalize EC-001 mock vertical slice |
| **Capacity** | 34 SP |
| **Committed** | 32 SP |

| Story | SP | Status |
|-------|---:|--------|
| US-001 (slice) | 3 | ✅ Done |
| US-003 | 2 | ✅ Done |
| US-006 | 2 | ✅ Done |
| US-021 | 2 | ✅ Done |
| US-F01 | 3 | 🔲 |
| US-F02 | 3 | 🔲 |
| US-F03 | 2 | 🔲 |
| US-F05 | 5 | 🔲 |
| US-F21 | 2 | 🔲 |
| TASK-DOC-001 | 2 | 🔲 |
| TASK-QA-001 | 2 | 🔲 |
| Buffer | 2 | — |

**Exit criteria:** EC-000 types complete · validators in CI · Navigation ADR published · Brief tests green

---

## Sprint 7 — Intelligence Core

| Field | Value |
|-------|-------|
| **Goal** | Production Health service · Snapshot Composer · orchestrator wiring |
| **Capacity** | 34 SP |
| **Committed** | 34 SP |

| Story | SP |
|-------|---:|
| US-F10 | 8 |
| US-F11 | 5 |
| US-F04 | 5 |
| US-F20 | 3 |
| US-F40 | 8 |
| US-010 | 3 |
| US-012 | 3 |
| Buffer | 2 |

**Exit criteria:** Health service live · Brief on orchestrator · DB schema migrated · pipeline cache

**Milestone:** M1 Intelligence Core — started

---

## Sprint 8 — Recommendations & API Alpha

| Field | Value |
|-------|-------|
| **Goal** | Production Recommendation service · Executive API v1 alpha |
| **Capacity** | 34 SP |
| **Committed** | 33 SP |

| Story | SP |
|-------|---:|
| US-020 | 3 |
| US-022 | 5 |
| US-024 | 3 |
| US-F30 | 5 |
| US-F31 | 3 |
| US-043 | 3 |
| US-044 | 3 |
| US-F12 | 5 |
| US-013 | 3 |
| Buffer | 2 |

**Exit criteria:** API routes tested in CI · Recommendations ranked by ORS · legacy engines retired

**Milestone:** M1 Intelligence Core — complete

---

## Sprint 9 — Brief Production

| Field | Value |
|-------|-------|
| **Goal** | Production Morning Brief · AI summary · E2E suite |
| **Capacity** | 34 SP |
| **Committed** | 34 SP |

| Story | SP |
|-------|---:|
| US-004 | 5 |
| US-023 | 5 |
| US-007 | 3 |
| US-008 | 3 |
| US-025 | 1 |
| US-002 | 3 |
| US-011 | 5 |
| US-F50 | 5 |
| US-001 (production) | 3 |
| Buffer | 1 |

**Exit criteria:** Brief production-ready · Playwright Brief E2E green · OpenAPI v1 published

**Milestone:** M2 Executive Surfaces — Brief live

---

## Sprint 10 — Decision Center Alpha

| Field | Value |
|-------|-------|
| **Goal** | Decision Center alpha · auth · deploy pipeline |
| **Capacity** | 34 SP |
| **Committed** | 34 SP |

| Story | SP |
|-------|---:|
| US-030 | 8 |
| US-031 | 5 |
| US-032 | 5 |
| US-036 | 5 |
| US-005 | 5 |
| US-F51 | 8 |
| Buffer | 3 |

**Exit criteria:** `/decisions` alpha · recommendation promotion works · real auth · staging deploy

**Milestone:** M2 Executive Surfaces — Decisions alpha

---

# Estimates & Velocity

## Velocity Assumptions

| Parameter | Value |
|-----------|-------|
| Sprint length | 2 weeks |
| Team size | 2 FTE engineers + 0.5 QA |
| Velocity (baseline) | 34 SP / sprint |
| Velocity (ramp-up S6) | 30 SP |
| Velocity (steady S8+) | 36 SP |
| Bug/fix capacity | 15% per sprint |
| Tech debt capacity | 10% per sprint |

## Story Point Summary by Initiative

| Initiative | SP | Sprints |
|------------|---:|---------|
| I1 Platform Foundation | 89 | S6–S8 |
| I2 Intelligence Core | 68 | S7–S9 |
| I3 Executive Surfaces | 76 | S6–S10 |
| I4 AI Layer | 55 | S9–S12 |
| I5 Production Excellence | 52 | S6–S12 |
| **Total v1.0** | **~340** | **~10** |

---

# Critical Path

```
S6  EC-000 types + validators + Navigation ADR
         │
S7  Snapshot Composer + Health Service + DB schema
         │
S8  Recommendation Service + API v1 + Confidence/Narration
         │
S9  Brief production + AI summary + E2E
         │
S10 Decision Service + Auth + Promotion contract
         │
S11 Decision outcomes + LLM adapter + Copilot V1
         │
S12 Copilot streaming + Learning/Memory + v0.5.0 release
```

**Parallel tracks:** E8 UI library (S6–S10) · E13 QA/DevOps (continuous) · E10 persistence (S7–S11)

---

# Release Milestones

| Milestone | Sprint | Deliverable | Tag |
|-----------|--------|-------------|-----|
| **M0 — Foundation** | S6 | EC-000 types · validators · Navigation ADR · Brief slice | — |
| **M1 — Intelligence Core** | S7–S8 | Health + Recommendations production · API v1 alpha | `v0.5.0-alpha.1` |
| **M2 — Executive Surfaces** | S9–S10 | `/brief` live · `/decisions` alpha · E2E · auth | `v0.5.0-beta.1` |
| **M3 — Decision OS** | S11–S12 | Copilot V1 · learning loop · memory | `v0.5.0` |
| **M4 — v1.0 Production** | S13–S15 | Multi-tenant · live providers · hardening | `v1.0.0` |

---

# GitHub Labels

Full label sync file: [`.github/labels.yml`](../../.github/labels.yml)

| Label | Color | Purpose |
|-------|-------|---------|
| `epic` | `#5319E7` | Epic (E1–E13) |
| `feature` | `#1D76DB` | Feature |
| `user-story` | `#0E8A16` | User story (US-NNN) |
| `task` | `#FBCA04` | Engineering task |
| `P0-critical` | `#B60205` | Must ship this sprint |
| `P1-high` | `#E99695` | High priority |
| `P2-medium` | `#C5DEF5` | Medium priority |
| `sprint-6` … `sprint-10` | `#0052CC` | Sprint commitment |
| `ec-001` … `ec-005`, `ec-000` | `#F9D0C4` | Executive capability |
| `frontend` `backend` `api` `ai` `testing` `devops` `documentation` `accessibility` `performance` `security` | various | Task category |
| `tech-debt` | `#FBCA04` | Debt paydown |
| `blocked` | `#000000` | Blocked |
| `ready` | `#0E8A16` | Meets DoR |

**Setup command:**

```bash
# Install github-label-sync or create manually via gh CLI
gh label create epic --color 5319E7 --description "Epic E1-E13"
```

---

# GitHub Milestones

| Milestone | Due | Description | Stories |
|-----------|-----|-------------|---------|
| **M0 — Foundation** | Sprint 6 end | EC-000 + ADR + Brief slice | US-F01–F05, US-F21, US-001–003, US-006, US-021 |
| **M1 — Intelligence Core** | Sprint 8 end | Health + Recommendations + API | US-F10–F12, US-F30–F31, US-010–014, US-020–024, US-043–044 |
| **M2 — Executive Surfaces** | Sprint 10 end | Brief live + Decisions alpha | US-001, US-004–008, US-025, US-030–036, US-005, US-F50–F51 |
| **M3 — Decision OS** | Sprint 12 end | Copilot V1 + Learning | US-034–035, US-037, US-040–046 |
| **v1.0.0 Production** | Sprint 15 end | Full production release | Remaining P2 · hardening · live providers |

---

# Issue Templates

| Template | Path | Use |
|----------|------|-----|
| User Story | [`.github/ISSUE_TEMPLATE/user_story.yml`](../../.github/ISSUE_TEMPLATE/user_story.yml) | US-NNN with DoR checklist |
| Engineering Task | [`.github/ISSUE_TEMPLATE/engineering_task.yml`](../../.github/ISSUE_TEMPLATE/engineering_task.yml) | TASK-XX-NNN by category |
| Epic | [`.github/ISSUE_TEMPLATE/epic.yml`](../../.github/ISSUE_TEMPLATE/epic.yml) | E1–E13 tracking |
| Bug Report | [`.github/ISSUE_TEMPLATE/bug_report.md`](../../.github/ISSUE_TEMPLATE/bug_report.md) | Defects |
| Feature Request | [`.github/ISSUE_TEMPLATE/feature_request.md`](../../.github/ISSUE_TEMPLATE/feature_request.md) | Ad-hoc features |

---

# Pull Request Template

Existing template: [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)

**Required links per PR:**

- Story ID (US-NNN or TASK-XX-NNN)
- Epic (E#)
- Sprint label
- DoD checklist (automated + manual attestation)

---

# Definition of Ready

Full document: [DEFINITION_OF_READY.md](../08_Standards/DEFINITION_OF_READY.md)

**Summary:** Story must have ID, acceptance criteria, dependencies, priority, complexity, sprint assignment, and design attachment (UI) before entering sprint.

---

# Definition of Done

Full document: [DEFINITION_OF_DONE.md](../08_Standards/DEFINITION_OF_DONE.md)

**Summary:** Quality Gate green · tests · coverage · docs · CHANGELOG · a11y · security review · no console errors.

---

# Prioritized Backlog Checklist

## Critical (Sprint 6–7)

- [ ] US-F01 — Decision types
- [ ] US-F02 — Copilot/memory types
- [ ] US-F03 — Audit/category types
- [ ] US-F05 — Contract validators
- [ ] US-F21 — Navigation ADR
- [ ] US-F10 — Snapshot Composer
- [ ] US-F11 — Pipeline cache
- [ ] US-F20 — Wire Brief to orchestrator
- [ ] US-F40 — Decision DB schema

## High (Sprint 7–9)

- [ ] US-F04 — Unified confidence
- [ ] US-F30 — API scaffold
- [ ] US-010 — Health score production
- [ ] US-011 — Health explainability
- [ ] US-020 — ORS recommendations
- [ ] US-023 — Recommendation feedback
- [ ] US-004 — AI summary with citations
- [ ] US-F50 — Playwright E2E

## Medium (Sprint 8–10)

- [ ] US-F12 — Legacy stack retirement
- [ ] US-F31 — Event emitter
- [ ] US-007 — Domain signal chips
- [ ] US-008 — Stale data warnings
- [ ] US-F52 — Deploy pipeline
- [ ] TASK-A11Y-020 — jest-axe

## Low (Sprint 11+)

- [ ] US-015 — Health history
- [ ] US-037 — Decision search
- [ ] US-045 — Conversation search
- [ ] US-046 — Copilot commands
- [ ] Storybook for executive components

---

# Traceability Matrix

| EC | Epic | Primary Sprint | Key Stories |
|----|------|----------------|-------------|
| EC-000 | E1 | S6 | US-F01–F06 |
| EC-001 | E5 | S6, S9 | US-001–008 |
| EC-002 | E3 | S7–S8 | US-010–015 |
| EC-003 | E4 | S8–S9 | US-020–025 |
| EC-004 | E6 | S10–S11 | US-030–037 |
| EC-005 | E7 | S11–S12 | US-040–046 |

---

**Document status:** READY FOR EXECUTION  
**Next action:** Import milestones and Sprint 6 stories into GitHub Projects · Sprint 6 planning session  
**Owner:** Engineering Program Manager · CTO approval required for sprint commitment
