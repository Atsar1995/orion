# Foundation Readiness Audit

**Document ID:** FRA-2026-001  
**Sprint:** 6.1 — Foundation Readiness Audit  
**Classification:** Engineering Architecture Review  
**Author:** ORION Principal Software Architect  
**Date:** 2026-07-25  
**Status:** READY FOR CTO REVIEW  
**Inputs:** [EC-001](../05_Product/EC-001_Morning_Executive_Brief.md) · [EC-002](../05_Product/EC-002_Business_Health_Engine.md) · [EC-003](../05_Product/EC-003_Executive_Recommendation_Engine.md) · [EC-004](../05_Product/EC-004_Executive_Decision_Center.md) · [EC-005](../05_Product/EC-005_AI_Executive_Copilot.md) · [Product Architecture Review v1](../06_Architecture/Product_Architecture_Review_v1.md) · [Engineering Master Plan v1](./Engineering_Master_Plan_v1.md) · [EC-001 Sprint 6 Implementation](./EC-001_Sprint_6_Implementation.md)

**Baseline:** `main` @ Sprint 6 — Intelligence Orchestrator, Provider Framework, Integration Center, Command Center, EC-001 Brief vertical slice (`/brief`), 93 unit tests, Quality Gate CI

---

# Executive Summary

This audit evaluates whether the ORION codebase can implement **EC-001 through EC-005** without architectural changes. The answer is **no** — not for the full executive capability programme.

The platform has a **strong Sprint 4–5 foundation**: orchestrator pipeline, provider framework, plugin lifecycle, integration center, and partial intelligence engines. Sprint 6 has begun EC-001 correctly with repository-backed services and shared executive types. However, **~60% of the EMP target architecture is missing**: executive service boundaries beyond brief, API contracts, decision/copilot/memory types, persistence wiring, real auth, and consolidation of five parallel executive UI stacks.

**Verdict:** The codebase is **ready to continue EC-001 vertical-slice work** and **ready to begin EC-000 contract hardening**, but **not ready to implement EC-002 through EC-005 at production scale without targeted architectural work first**.

Implementing EC-002–EC-005 on today's fragmented stack would recreate the dual-architecture debt identified in QA-001 (Finding C-01) and PAR-2026-001.

---

# Readiness Scores

| Dimension | Score | Grade | Summary |
|-----------|------:|-------|---------|
| **Engineering Readiness** | **52** | D+ | Foundation exists; consolidation and contracts incomplete |
| Architecture Readiness | 55 | D+ | Orchestrator strong; parallel stacks and missing service layer |
| Frontend Readiness | 66 | C | RSC-first, tokens, EC-001 UI started; fragmented surfaces |
| Backend Readiness | 44 | F | No executive API; placeholder auth; in-memory persistence |
| AI Layer Readiness | 24 | F | No copilot service, narration, memory, or streaming |
| Integration Readiness | 72 | C+ | Provider + plugin framework production-capable |
| Testing Readiness | 58 | D+ | 93 unit tests; no E2E; narrow coverage scope |
| Deployment Readiness | 38 | F | CI gate only; no deploy pipeline or env template |
| **Overall Production Readiness** | **48** | **F** | Alpha-ready for internal dev; not production-ready |

*Scores are 0–100. Grades: A ≥90 · B ≥80 · C ≥70 · D ≥60 · F <60*

---

# Area Reviews

## 1. Architecture

| Field | Assessment |
|-------|------------|
| **Current State** | Layered stack exists: Providers → Orchestrator → Intelligence Engines → UI surfaces. `lib/orchestrator/` (11 files) coordinates a 10-stage pipeline. `lib/intelligence/` (50 files) hosts Health, Brief, Recommendation, and Alert engines. `lib/executive/` contains **brief only** (6 files). Five executive UI surfaces coexist: `/advisor` (static), `/brief` (mock repository), `/command-center` (orchestrator), `/dashboard` (orchestrator), `/intelligence` (static). |
| **Strengths** | Clear orchestrator entry point (`getDashboardSnapshot()`). Repository pattern introduced for EC-001 (`BriefRepository`, `MockBriefRepository`, `OrchestratorBriefRepository`). Mapper bridges orchestrator → `BriefView`. EMP-aligned folder intent documented. |
| **Weaknesses** | Dual intelligence paths (legacy `intelligence-bus` references + Sprint 4 orchestrator). Duplicate engines: `brief-engine.ts` vs `ExecutiveBriefEngine.ts`, `recommendation-engine.ts` vs `RecommendationEngine.ts`. No `lib/executive/{health,recommendations,decisions,copilot,learning,memory,narration,confidence,categories,snapshot}/`. Root redirect (`/`) → `/advisor`; nav → `/brief` — IA conflict unresolved. |
| **Technical Debt** | QA-001 C-01 dual architectures. PAR-2026-001 navigation conflict. Four× aggregation logic duplication per QA-001. Legacy advisor stack not retired. |
| **Required Improvements** | Complete EC-000 contracts. Establish `lib/executive/` service boundaries per EMP. ADR for navigation IA. Retire or redirect legacy surfaces. Single snapshot composer. |
| **Priority** | **Critical** |
| **Estimated Effort** | 2–3 sprints (EC-000 + consolidation) |

---

## 2. Folder Structure

| Field | Assessment |
|-------|------------|
| **Current State** | `app/` — 43 route files, 33 pages, **0 API routes**. `lib/` — 176+ files across orchestrator, intelligence, providers, plugins, integrations, persistence, platform. `components/` — 206 files; `components/executive/` (18 files, Sprint 6). `types/executive/` (7 files, partial EC-000). `tests/` — 22 test files. |
| **Strengths** | EMP target structure documented and partially aligned. Platform `(auth)` and `(platform)` route groups clean. Integration and command-center modules well-scoped. |
| **Weaknesses** | Missing `app/(platform)/decisions/`, `app/api/v1/executive/`, `tests/e2e/`, `tests/performance/`, `lib/executive/contracts/`. Static `lib/*-data.ts` fixtures power legacy pages in parallel with service layer. |
| **Technical Debt** | Workspace-specific component duplication (crm, finance, hospitality folders). Multiple `BusinessHealthCard` implementations across advisor, executive, intelligence, dashboard. |
| **Required Improvements** | Create missing EMP folders before EC-004/EC-005. Deprecate static-data pages incrementally. Centralize executive UI in `components/executive/`. |
| **Priority** | **High** |
| **Estimated Effort** | 1 sprint (scaffolding) + ongoing migration |

---

## 3. Shared Types

| Field | Assessment |
|-------|------------|
| **Current State** | **Three parallel type systems:** `types/intelligence.ts` (orchestrator/dashboard), `types/{brief,alerts,recommendations}.ts` (pre-EC-000 engines), `types/executive/` (EC-000 partial — evidence, confidence, explanation, health, recommendation, snapshot). Missing: `decision.ts`, `copilot.ts`, `memory.ts`, `learning.ts`, `category.ts`, `audit.ts`. |
| **Strengths** | Sprint 6 EC-000 slice is well-structured. `BriefView`, `HealthSnapshot`, `ExecutiveRecommendation`, `ExecutiveEvidence`, `ConfidenceScore` defined. Barrel export at `types/executive/index.ts`. |
| **Weaknesses** | `Recommendation` in `types/intelligence.ts` ≠ `ExecutiveRecommendation` in `types/executive/`. Confidence models differ across EC-002/003/005 specs (PAR finding). No contract validators in `lib/executive/contracts/`. |
| **Technical Debt** | EMP calls for extending `types/intelligence.ts` via re-exports; not done. Types will drift without contract tests. |
| **Required Improvements** | Complete EC-000 type files. Add contract validators. Re-export and deprecate duplicates over 2 sprints per EMP. |
| **Priority** | **Critical** |
| **Estimated Effort** | 1 sprint |

---

## 4. Design System

| Field | Assessment |
|-------|------------|
| **Current State** | Comprehensive CSS tokens in `app/globals.css` (colors, spacing, radius, shadows, typography, z-index). Tailwind v4 `@theme inline` mapping. `components/ui/` — 9 primitives (Button, Card, EmptyState, LoadingState, StatCard, Input, SearchBox, SectionHeader, Divider). `components/executive/` — 18 EC-specific components using tokens. |
| **Strengths** | Dark-mode-compatible token system. Consistent Card/EmptyState/LoadingState patterns. Executive components use design tokens exclusively (Sprint 6 verified). |
| **Weaknesses** | Only 9 shared UI primitives vs 206 component files. Button lacks secondary/ghost/loading variants. No Storybook. Component inventory doc (`docs/04_Design/Component_Inventory.md`) ahead of implementation. |
| **Technical Debt** | Bespoke styling in workspace folders. Duplicate status indicators and health cards. |
| **Required Improvements** | Expand shared primitives (Button variants, Badge consolidation). Migrate executive surfaces to `components/executive/`. |
| **Priority** | **Medium** |
| **Estimated Effort** | 1–2 sprints (incremental) |

---

## 5. Routing

| Field | Assessment |
|-------|------------|
| **Current State** | `/brief` (EC-001, dynamic RSC), `/command-center`, `/dashboard`, `/integrations` (dynamic RSC), `/advisor` (static legacy), `/intelligence` (static). Root `/` redirects to `/advisor`. Sidebar nav points Executive Brief → `/brief`. DL-2026-001 specifies advisor as default landing. |
| **Strengths** | EC-001 route with `loading.tsx` and `error.tsx`. `force-dynamic` on intelligence-fed pages. Middleware protects all platform routes. |
| **Weaknesses** | Navigation IA conflict (PAR-2026-001, DL-2026-001 vs EMP). No `/decisions` route. No API routes. No feature flags for EC surfaces. |
| **Technical Debt** | Two "Executive Brief" experiences (`/advisor` vs `/brief`). Users land on legacy surface by default. |
| **Required Improvements** | ADR-gated navigation resolution before EC-004. Redirect `/` → `/brief` or feature-flag. Add `/decisions` scaffold. |
| **Priority** | **Critical** |
| **Estimated Effort** | 2–3 days (ADR + redirect) |

---

## 6. State Management

| Field | Assessment |
|-------|------------|
| **Current State** | Server-first: async RSC pages fetch from services. React `cache()` on orchestrator pipeline. One server actions file: `lib/integrations/integration-actions.ts`. Client state minimal: `useState` in interactive panels, `SessionProvider`, `CommandPaletteProvider`. No global client store (Zustand/Redux). |
| **Strengths** | Aligns with EMP principle "server-first executive data." Correct pattern for executive surfaces. Integration actions demonstrate server action pattern. |
| **Weaknesses** | No server actions for EC-003 feedback (accept/reject/defer), EC-004 decision lifecycle, or EC-005 copilot messages. No optimistic UI patterns. No brief viewed-state persistence. |
| **Technical Debt** | Executive action buttons (Act/Delegate/Snooze) are UI-only with no backend wiring. |
| **Required Improvements** | Server actions mirroring `/api/v1/executive/*` for V1. Brief session state for delta banner. |
| **Priority** | **High** (required before EC-003/004 interactions) |
| **Estimated Effort** | 1 sprint per EC interaction surface |

---

## 7. Service Layer

| Field | Assessment |
|-------|------------|
| **Current State** | `ExecutiveIntelligenceService` — orchestrator facade for dashboard/command-center. `BriefService` — EC-001 with swappable repository (defaults to mock). Intelligence engines in `lib/intelligence/`. No `lib/executive/health|recommendations|decisions|copilot|learning|memory|narration|confidence|categories|snapshot`. |
| **Strengths** | BriefService demonstrates correct EMP pattern. OrchestratorBriefRepository + mapper ready for swap-in. Integration center service complete. Platform services (audit, activity, events) exist in `lib/platform/`. |
| **Weaknesses** | EC-001 not wired to orchestrator by default. EC-002–EC-005 have engine code in `lib/intelligence/` but no executive service boundary. No snapshot composer separate from orchestrator. |
| **Technical Debt** | Two brief paths: `ExecutiveBriefEngine` (orchestrator) vs `BriefService` (mock). Consumers split across surfaces. |
| **Required Improvements** | Migrate engines into `lib/executive/{health,recommendations}/`. Wire `OrchestratorBriefRepository`. Add decision/copilot/memory services. |
| **Priority** | **Critical** |
| **Estimated Effort** | 4–6 sprints (EMP critical path) |

---

## 8. Provider Layer

| Field | Assessment |
|-------|------------|
| **Current State** | `lib/providers/` — BaseProvider, ProviderManager, ProviderFactory, ProviderRegistry, MockProvider (CRM/Finance/Hospitality/Marketing), Google Analytics production provider. `dashboard-aggregator.ts` composes provider contributions. Plugin framework in `lib/plugins/` (11 files) integrated with Integration Center. |
| **Strengths** | Production-quality provider abstraction. GA4 live integration with health checks. Mock providers enable full pipeline without external deps. Integration Center operational. |
| **Weaknesses** | Only GA4 is a live provider; CRM/Finance/Hospitality/Marketing remain mock. Redundant provider fetches per pipeline run (QA-002). No provider-level caching. |
| **Technical Debt** | Performance: 7× redundant `fetchProviderContributions()` per pipeline (QA-002). |
| **Required Improvements** | Pipeline-level contribution cache. Additional live providers per workspace roadmap. |
| **Priority** | **Medium** (performance High; new providers Medium) |
| **Estimated Effort** | 3–5 days (caching) · 1+ sprint per live provider |

---

## 9. Mock Infrastructure

| Field | Assessment |
|-------|------------|
| **Current State** | `MockBriefRepository` + `mock-brief-data.ts` (EC-001 default). `MockProvider` (workspace providers). `lib/intelligence/mock/executive-intelligence-mock.ts`. Static fixtures: `advisor-data.ts`, `command-center-data.ts`, `intelligence-data.ts`, etc. Test fixtures in `tests/fixtures/`. |
| **Strengths** | Realistic EC-001 mock aligned with wireframe. Swappable repository pattern proven. Test fixtures mirror production types. Mock providers feed orchestrator pipeline. |
| **Weaknesses** | Too many mock sources (static page data + service mocks + provider mocks). No mock for decisions, copilot, or memory. MockBriefRepository still default for `/brief` despite orchestrator availability. |
| **Technical Debt** | Static `lib/*-data.ts` bypasses service layer on legacy pages. |
| **Required Improvements** | Consolidate mocks behind repositories. Add decision/copilot mock repositories. Switch brief default to orchestrator when ready. |
| **Priority** | **Medium** |
| **Estimated Effort** | 3–5 days |

---

## 10. API Contracts

| Field | Assessment |
|-------|------------|
| **Current State** | **Zero API routes.** `app/api/` is empty. EMP specifies 20+ endpoints under `/api/v1/executive/*`. Pages call services directly via RSC. |
| **Strengths** | RSC direct service calls valid for V1 per EMP ("Server actions mirror above for RSC pages during V1"). Integration server actions demonstrate pattern. |
| **Weaknesses** | No REST API for external consumers, mobile, or copilot streaming. No OpenAPI spec. No PATCH feedback for recommendations. No decision lifecycle endpoints. No copilot streaming endpoint. |
| **Technical Debt** | EC-005 requires streaming API — cannot be server-action-only. |
| **Required Improvements** | Scaffold `/api/v1/executive/` route handlers. OpenAPI contract doc. Streaming endpoint for copilot. |
| **Priority** | **Critical** (before EC-004/005) · **High** (before EC-002/003 feedback) |
| **Estimated Effort** | 1 sprint (scaffold + brief/health/recs) · 2 sprints (decisions + copilot) |

---

## 11. Testing

| Field | Assessment |
|-------|------------|
| **Current State** | Vitest 4 + Testing Library. **22 test files, 93 tests passing.** Coverage thresholds: 80% lines/statements/functions, 75% branches — scoped to Sprint 4 modules only. Setup: jsdom, jest-dom, Next Link mock. |
| **Strengths** | Quality Gate CI runs typecheck, lint, build, test, coverage, npm audit. Orchestrator, provider, intelligence engine tests comprehensive. Sprint 6 brief tests added. |
| **Weaknesses** | No E2E (`tests/e2e/` missing). No performance tests. Coverage excludes `components/executive/`, `lib/executive/`, `lib/integrations/`. No API route tests. No a11y automation (jest-axe). QA-001 "Test coverage: D" is stale. |
| **Technical Debt** | Coverage scope artificially narrow. Executive UI largely untested beyond brief slice. |
| **Required Improvements** | Expand coverage scope. Add Playwright E2E for executive flows. Contract tests for EC-000 types. a11y checks in CI. |
| **Priority** | **High** |
| **Estimated Effort** | 1 sprint (E2E + coverage expansion) |

---

## 12. CI/CD

| Field | Assessment |
|-------|------------|
| **Current State** | Single workflow: `.github/workflows/quality-gate.yml` — tsc, lint, build, test, coverage, npm audit on push/PR to `main`. PR template with DoD checklist. No deploy workflow. No branch protection configured (TODO in QUALITY_GATE.md). |
| **Strengths** | Quality gate operational. Concurrency control. Node 20, npm ci. |
| **Weaknesses** | No deploy pipeline (ES-055 target). No Prettier/format check. No unused export detection. Branch protection not enforced. No staging/production environments. |
| **Technical Debt** | Docs (ES-055, QA-003, README) stale — say "CI not configured" but workflow exists. |
| **Required Improvements** | Branch protection on `main`. Deploy workflow. `.env.example`. Prettier. Update stale docs. |
| **Priority** | **High** (branch protection Critical for production) |
| **Estimated Effort** | 3–5 days (branch protection + env template) · 1 sprint (deploy pipeline) |

---

## 13. Performance

| Field | Assessment |
|-------|------------|
| **Current State** | RSC-first (30/33 pages server-rendered). `force-dynamic` on 4 intelligence pages. `React.cache()` on orchestrator only. No ISR, no `unstable_cache`, minimal Suspense. QA-002 grade: C+. |
| **Strengths** | Server-side data fetching. Bounded list rendering. Mock pipeline ~47 ms locally. 14/16 dashboard widgets are Server Components. |
| **Weaknesses** | 7× redundant provider fetches per pipeline run. No request-level snapshot cache. ~533 KB uncompressed shared client JS. Monolithic dashboard fetch. Sequential pipeline stages 5–7. |
| **Technical Debt** | QA-002 findings unresolved. Performance will degrade with live providers. |
| **Required Improvements** | Pipeline contribution cache. Snapshot cache with event invalidation. Suspense/streaming for brief sections. |
| **Priority** | **High** (before live provider scale) |
| **Estimated Effort** | 1 sprint |

---

## 14. Accessibility

| Field | Assessment |
|-------|------------|
| **Current State** | `lang="en"` on html. ESLint jsx-a11y via `eslint-config-next/core-web-vitals`. Ad hoc patterns: `aria-label`, `role="status"`, `aria-live`, `sr-only` labels in ui/ and executive/ components. Manual DoD attestation in PR template. |
| **Strengths** | Sprint 6 executive components include semantic headings, aria labels, confidence announcements. LoadingState/EmptyState accessible by default. |
| **Weaknesses** | No automated a11y tests. ~65 of 206 component files have a11y attributes. No skip links. No focus trap utilities. No WCAG contrast audit in CI. |
| **Technical Debt** | Accessibility verification is manual and inconsistent. |
| **Required Improvements** | jest-axe in component tests. Playwright a11y checks. WCAG checklist per EC surface. |
| **Priority** | **Medium** |
| **Estimated Effort** | 3–5 days (tooling) · ongoing per surface |

---

## 15. Security

| Field | Assessment |
|-------|------------|
| **Current State** | Middleware redirects unauthenticated users to `/login`. Auth is **placeholder only** (`isAuthenticatedPlaceholder()` — enabled by default unless `NEXT_PUBLIC_ORION_PLACEHOLDER_AUTH=false`). In-memory session stubs in `lib/auth/`. RBAC scaffolding in `roles.ts`/`permissions.ts`. npm audit in CI. |
| **Strengths** | Middleware pattern correct. Auth route separation. RBAC types exist. GA4 credentials server-side only. |
| **Weaknesses** | **No real authentication** (ES-037 approved, not implemented). No CSRF, rate limiting, or session persistence. No tenant isolation enforcement on executive services. No secrets scanning. No `.env.example`. |
| **Technical Debt** | Placeholder auth is a production blocker. Executive APIs will require auth before exposure. |
| **Required Improvements** | Implement ES-037 auth. Tenant context on all executive services. RBAC on EC-004/005 actions. `.env.example`. |
| **Priority** | **Critical** (before production) · **High** (before API exposure) |
| **Estimated Effort** | 2–3 sprints |

---

## 16. Documentation

| Field | Assessment |
|-------|------------|
| **Current State** | ~201 files in `docs/` — product specs (EC-001–005), engineering specs (ES-001–065), PAR, EMP, QA audits, ADRs, quality gate, component inventory. Sprint 6 implementation doc exists. AGENTS.md minimal. |
| **Strengths** | Exceptional specification depth. EMP provides clear critical path. PAR identifies consolidation needs. QA audits document known debt. |
| **Weaknesses** | QA-001, QA-003, ES-055, README partially stale post-Sprint 5/6. AGENTS.md underdeveloped. No `.env.example`. No OpenAPI spec. |
| **Technical Debt** | Doc–code drift on test counts, CI status, landing page. |
| **Required Improvements** | Reconcile stale docs. Add OpenAPI when API scaffolded. Expand AGENTS.md with executive architecture rules. |
| **Priority** | **Medium** |
| **Estimated Effort** | 2–3 days |

---

# EC Capability Readiness Matrix

| Capability | Engine | Service | Types | UI | API | Route | Can build without arch changes? |
|------------|--------|---------|-------|-----|-----|-------|--------------------------------|
| **EC-001** Brief | ✅ Partial | ✅ Mock | ✅ Partial | ✅ Sprint 6 | ❌ | ✅ `/brief` | **Partial yes** — continue slice; wire orchestrator |
| **EC-002** Health | ✅ Exists | ❌ Missing | ✅ Partial | ✅ Card exists | ❌ | N/A (embedded) | **No** — needs `lib/executive/health/` |
| **EC-003** Recommendations | ✅ Exists | ❌ Missing | ✅ Partial | ✅ Card exists | ❌ | N/A (embedded) | **No** — needs service + feedback API |
| **EC-004** Decisions | ❌ Missing | ❌ Missing | ❌ Missing | ⚠️ Placeholder | ❌ | ❌ | **No** — full greenfield |
| **EC-005** Copilot | ❌ Missing | ❌ Missing | ❌ Missing | ⚠️ Placeholder | ❌ | N/A | **No** — full greenfield + streaming |

---

# Prioritized Checklist

## Critical

| # | Item | Blocks | Effort |
|---|------|--------|--------|
| C1 | Complete EC-000 shared types (decision, copilot, memory, learning, category, audit) | EC-004, EC-005 | 1 sprint |
| C2 | Resolve navigation IA ADR (`/` landing, `/advisor` vs `/brief` vs `/decisions`) | EC-001, EC-004 | 2–3 days |
| C3 | Establish `lib/executive/` service boundaries (health, recommendations minimum) | EC-002, EC-003 | 1–2 sprints |
| C4 | Scaffold `/api/v1/executive/` contract (snapshot, brief, health, recommendations) | All ECs | 1 sprint |
| C5 | Consolidate dual intelligence stacks (retire legacy paths per engine) | All ECs | 2 sprints |
| C6 | Wire EC-001 to orchestrator (`OrchestratorBriefRepository` as default) | EC-001 production | 2–3 days |
| C7 | Implement real authentication (ES-037) before production API exposure | Production | 2–3 sprints |

## High

| # | Item | Blocks | Effort |
|---|------|--------|--------|
| H1 | Add Playwright E2E suite (`tests/e2e/`) | Release confidence | 1 sprint |
| H2 | Expand test coverage to `lib/executive/` and `components/executive/` | Regression safety | 3–5 days |
| H3 | Pipeline performance: deduplicate provider fetches, add snapshot cache | Live provider scale | 1 sprint |
| H4 | Server actions for EC-003 feedback and EC-004 decision lifecycle | Interactive ECs | 1 sprint each |
| H5 | Branch protection + required status checks on `main` | Production governance | 1 day |
| H6 | Create `app/(platform)/decisions/` route scaffold | EC-004 | 2–3 days |
| H7 | Add `.env.example` documenting all required variables | Developer onboarding | 1 day |
| H8 | Migrate duplicate executive UI to `components/executive/` | Maintainability | 1–2 sprints |

## Medium

| # | Item | Effort |
|---|------|--------|
| M1 | Expand design system primitives (Button variants, shared Badge) | 3–5 days |
| M2 | Add jest-axe accessibility checks to component tests | 2–3 days |
| M3 | Reconcile stale documentation (QA-001, README, ES-055) | 2–3 days |
| M4 | Prettier + format check in CI | 1–2 days |
| M5 | Feature flags for EC surface exposure | 3–5 days |
| M6 | OpenAPI specification for executive API | 3–5 days |
| M7 | Consolidate mock infrastructure behind repositories | 3–5 days |
| M8 | Brief viewed-state persistence (delta banner) | 3–5 days |

## Low

| # | Item | Effort |
|---|------|--------|
| L1 | Storybook for executive components | 1 sprint |
| L2 | Pre-commit hooks (Husky + lint-staged) | 1 day |
| L3 | Unused export detection (knip) in CI | 1 day |
| L4 | Performance benchmark suite (`tests/performance/`) | 3–5 days |
| L5 | Skip links and focus trap utilities | 2–3 days |
| L6 | Bundle analyzer in next.config | 1 day |

---

# Minimum Work Before Full EC-001–EC-005 Implementation

If the programme goal is **all five executive capabilities at production quality without rework**, the following **must complete first**:

### Phase 0 — Contract & IA Gate (Sprint 6.2, ~1 sprint)

1. **EC-000 type completion** — `decision.ts`, `copilot.ts`, `memory.ts`, `learning.ts`, `category.ts`, `audit.ts` + contract tests
2. **Navigation ADR** — resolve DL-2026-001 vs EMP; update root redirect
3. **API scaffold** — `/api/v1/executive/snapshot`, `/brief`, `/health`, `/recommendations` (can return mock initially)
4. **Wire EC-001 to orchestrator** — switch `briefService` default to `OrchestratorBriefRepository`

### Phase 1 — Service Boundaries (Sprint 7–8, ~2 sprints)

5. **`lib/executive/health/`** — wrap existing health engine with EC-002 service interface
6. **`lib/executive/recommendations/`** — wrap existing recommendation engine with EC-003 service interface
7. **`lib/executive/confidence/`** — unified confidence model (PAR consolidation)
8. **Retire legacy engine duplicates** — single path per engine through orchestrator

### Phase 2 — Interactive Capabilities (Sprint 9–11, ~3 sprints)

9. **`lib/executive/decisions/`** + `/decisions` route + persistence layer wiring
10. **`lib/executive/copilot/`** + `/api/v1/executive/copilot/*` streaming
11. **`lib/executive/memory/`** + narration service
12. **Real auth (ES-037)** before external API exposure

**Estimated calendar time to production-ready EC-001–EC-005:** ~6 months at 2-week sprints (consistent with EMP).

---

# Final Determination

## Can Sprint 6 implementation begin immediately?

### **NO** — not for the full EC-001 through EC-005 programme without architectural changes.

### Qualification

| Scope | Answer | Rationale |
|-------|--------|-----------|
| **EC-001 vertical slice (Sprint 6)** | **Already in progress — continue** | Route, UI, mock service, types, and tests exist. Remaining: orchestrator wiring, navigation ADR. |
| **EC-002 through EC-005** | **NO — blocked on architecture** | Missing service boundaries, types, API contracts, persistence, auth, and UI scaffolds. Building now would create parallel stacks. |
| **Full programme without architectural changes** | **NO** | EMP itself defines architectural work (EC-000, `lib/executive/*`, API layer, consolidation) as prerequisites. |

### Minimum work before EC-002–EC-005 implementation begins

1. EC-000 contract completion + contract tests (**Critical**)
2. Navigation IA ADR resolution (**Critical**)
3. `lib/executive/health/` and `lib/executive/recommendations/` service scaffolds (**Critical**)
4. `/api/v1/executive/` route scaffold (**Critical**)
5. Dual-stack consolidation plan executed per engine (**Critical**)
6. EC-001 orchestrator wiring as reference pattern (**High**)

**Estimated minimum gate duration:** 1–2 sprints before EC-002 implementation should begin in earnest.

---

# Appendix A — Evidence Base

| Source | Path | Relevance |
|--------|------|-----------|
| Engineering Master Plan | `docs/07_Engineering/Engineering_Master_Plan_v1.md` | Target architecture |
| Product Architecture Review | `docs/06_Architecture/Product_Architecture_Review_v1.md` | Consolidation gaps |
| Engineering Audit | `docs/03_Quality/Engineering-Audit-Report.md` | Dual-stack finding C-01 |
| Performance Audit | `docs/03_Quality/Performance-Audit.md` | Pipeline caching debt |
| Sprint 6 Implementation | `docs/07_Engineering/EC-001_Sprint_6_Implementation.md` | EC-001 current state |
| Quality Gate | `.github/workflows/quality-gate.yml` | CI status |
| Test suite | `tests/` — 22 files, 93 tests | Testing baseline |

---

# Appendix B — Parallel Stack Inventory

```
Executive Data Paths (current)
├── /advisor          → lib/advisor-data.ts (static)
├── /brief            → MockBriefRepository (mock service)
├── /command-center   → executiveIntelligenceService → orchestrator
├── /dashboard        → executiveIntelligenceService → orchestrator
└── /intelligence     → lib/intelligence-data.ts (static)

Target (EMP)
└── All surfaces → lib/executive/* services → orchestrator → providers
```

---

**Document status:** READY FOR CTO REVIEW  
**Next action:** CTO approval of Phase 0 gate scope · Assign Sprint 6.2 to EC-000 + IA ADR + API scaffold  
**Review cadence:** Re-audit after Phase 0 completion or at Sprint 8 midpoint
