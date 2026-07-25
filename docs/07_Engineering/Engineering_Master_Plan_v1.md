# ORION Engineering Master Plan v1.0

**Document ID:** EMP-2026-001  
**Sprint:** 5B — Engineering Master Plan  
**Classification:** Engineering Execution Plan  
**Author:** Chief Technology Officer  
**Date:** 2026-07-25  
**Status:** READY FOR IMPLEMENTATION  
**Version:** 1.0  

**Inputs:** [EC-001](../05_Product/EC-001_Morning_Executive_Brief.md) · [EC-002](../05_Product/EC-002_Business_Health_Engine.md) · [EC-003](../05_Product/EC-003_Executive_Recommendation_Engine.md) · [EC-004](../05_Product/EC-004_Executive_Decision_Center.md) · [EC-005](../05_Product/EC-005_AI_Executive_Copilot.md) · [Product Architecture Review v1](../06_Architecture/Product_Architecture_Review_v1.md) · [ES-065](../02_Engineering/ES-065-Executive-Intelligence-Architecture.md)

**Target release:** `v0.5.0-executive-capabilities` (proposed)

---

# Executive Summary

This Engineering Master Plan converts approved Executive Capabilities EC-001 through EC-005 into a **production engineering roadmap** for ORION. It incorporates findings from the Product Architecture Review (PAR-2026-001) and maps work against the **existing codebase** (`lib/orchestrator/`, `lib/intelligence/`, `lib/providers/`, Sprint 5 deliverables).

**Current baseline (`main` @ Sprint 5):**

- Intelligence Orchestrator with 10-stage pipeline  
- Provider Framework with mock providers + GA4 production provider  
- Command Center (`/command-center`) · Integration Center (`/integrations`)  
- Plugin Framework · partial Health/Recommendation/Alert/Brief engines  
- Dual-stack: legacy `intelligence-bus` + Sprint 4 orchestrator path  

**Engineering goal:** Deliver the executive loop **orient → interpret → propose → decide → think** as production code with shared contracts, unified APIs, persistent decision lifecycle, and governed AI narration — without reimplementing five parallel stacks.

**Programme shape:** 13 epics · 12 engineering sprints · 4 milestones · ~6 months at 2-week sprints.

**Critical path:** EC-000 Contracts → Orchestrator unification → EC-002 Health → EC-003 Recommendations → EC-001 Brief → EC-004 Decisions → EC-005 Copilot.

---

# Engineering Principles

1. **Contracts before features** — EC-000 shared types and APIs precede surface delivery  
2. **One pipeline, many surfaces** — Orchestrator snapshot composed once; Brief/Decisions/Copilot are views  
3. **Deterministic before generative** — Engines compute; AI narrates with citation validation  
4. **Evidence or silence** — No user-facing claim without traceable source  
5. **Incremental migration** — Legacy `intelligence-bus` retired per-engine, not big-bang  
6. **Test the contract** — Shared types have contract tests consumed by all EC modules  
7. **Feature flags for EC surfaces** — Ship infrastructure before UX exposure  
8. **Minimal diff discipline** — Extend existing modules; avoid parallel implementations  
9. **Security by default** — Tenant isolation, audit, RBAC on every new API  
10. **Measure outcomes** — Decision and recommendation loops persist for learning  

---

# Architecture Principles

1. **Layered intelligence** — Providers → Orchestrator → Engines → Services → Surfaces → Copilot  
2. **Service boundaries by EC ownership** — Health (EC-002), Recommendations (EC-003), Decisions (EC-004), Copilot (EC-005)  
3. **Shared platform services** — Narration, Confidence, Explainability, Learning, Memory, Analytics  
4. **Event-driven invalidation** — Provider sync invalidates cache; optional event bus (ES-033) in V1.1  
5. **Server-first executive data** — RSC + server actions/API routes; client for interaction only  
6. **Append-only audit** — Decision and AI audit logs immutable  
7. **Graceful degradation** — Missing providers reduce confidence, never fabricate data  
8. **ADR-gated navigation** — Brief / Decisions / Command Center IA resolved before EC-001/004 build  

---

# Repository Structure

```
orion-app/
├── app/
│   ├── (platform)/
│   │   ├── brief/                    # EC-001 (new · default landing target)
│   │   ├── command-center/           # Situational awareness (exists)
│   │   ├── decisions/                # EC-004 (new)
│   │   ├── dashboard/                # ES-022 (exists)
│   │   ├── integrations/             # Integration Center (exists)
│   │   └── advisor/                  # Legacy · migrate → brief
│   └── api/
│       └── v1/
│           └── executive/            # Executive Intelligence API
├── components/
│   ├── executive/                    # Shared EC UI library (new)
│   ├── command-center/               # Exists
│   └── integrations/                 # Exists
├── lib/
│   ├── executive/                    # EC domain services (new)
│   │   ├── contracts/                # EC-000 types · validators
│   │   ├── health/                   # EC-002 service
│   │   ├── recommendations/          # EC-003 service
│   │   ├── decisions/                # EC-004 service
│   │   ├── copilot/                  # EC-005 service
│   │   ├── learning/                 # Unified learning loop
│   │   ├── memory/                   # Executive memory
│   │   ├── narration/                # AI narration + validation
│   │   ├── confidence/               # Confidence engine
│   │   ├── categories/               # Category registry
│   │   └── snapshot/                 # Snapshot composer
│   ├── intelligence/                 # Existing engines · migrate into executive/
│   ├── orchestrator/                 # Exists · extend
│   ├── providers/                      # Exists · extend
│   ├── integrations/                   # Exists
│   └── plugins/                        # Exists
├── types/
│   └── executive/                      # Canonical EC types (EC-000)
└── tests/
    ├── executive/                      # EC contract + integration tests
    ├── e2e/                            # Playwright executive flows
    └── performance/                    # Pipeline benchmarks
```

---

# Module Structure

| Module | Path | Owner EC | Status |
|--------|------|----------|--------|
| **Contracts** | `lib/executive/contracts/` | EC-000 | New |
| **Snapshot Composer** | `lib/executive/snapshot/` | Platform | Extend orchestrator |
| **Health Service** | `lib/executive/health/` | EC-002 | Extend `health-engine.ts` |
| **Recommendation Service** | `lib/executive/recommendations/` | EC-003 | Extend `RecommendationEngine.ts` |
| **Decision Service** | `lib/executive/decisions/` | EC-004 | New |
| **Copilot Service** | `lib/executive/copilot/` | EC-005 | New |
| **Narration Service** | `lib/executive/narration/` | Platform AI | New |
| **Learning Service** | `lib/executive/learning/` | EC-003/004/005 | New |
| **Memory Service** | `lib/executive/memory/` | EC-005 | New |
| **Confidence Engine** | `lib/executive/confidence/` | Platform | New |
| **Category Registry** | `lib/executive/categories/` | Platform | New |
| **Provider Framework** | `lib/providers/` | Platform | Exists |
| **Orchestrator** | `lib/orchestrator/` | Platform | Exists |
| **Integration Center** | `lib/integrations/` | Platform | Exists |

---

# Service Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  Brief · Decisions · Command Center · Copilot Panel · Dashboard│
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      EXECUTIVE APPLICATION SERVICES                │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│ Brief        │ Health       │ Recommend.   │ Decision │ Copilot  │
│ Composer     │ Service      │ Service      │ Service  │ Service  │
│ (EC-001)     │ (EC-002)     │ (EC-003)     │ (EC-004) │ (EC-005) │
└──────┬───────┴──────┬───────┴──────┬───────┴────┬─────┴────┬─────┘
       │              │              │            │          │
┌──────▼──────────────▼──────────────▼────────────▼──────────▼─────┐
│                    EXECUTIVE PLATFORM SERVICES                     │
│  Snapshot Composer │ Narration │ Confidence │ Learning │ Memory   │
│  Explainability    │ Category Registry │ Analytics KPI           │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                   INTELLIGENCE ORCHESTRATOR (ES-065)               │
│  PipelineRunner │ EngineRegistry │ ExecutionLogger │ Cache         │
└───────────────────────────────┬───────────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│              PROVIDER FRAMEWORK │ PLUGIN FRAMEWORK                   │
└───────────────────────────────────────────────────────────────────┘
```

**Boundary rules:**

- Surfaces **never** call providers directly  
- EC-005 Copilot **never** writes decisions — read + draft only  
- EC-003 owns ORS; EC-004 consumes ranked recommendations  
- EC-002 owns health calculation; EC-001 only renders  
- Learning Service is sole writer of feedback/outcome persistence  

---

# Domain Model

## Core Entities

| Entity | ID Pattern | Owner | Persistence V1 |
|--------|------------|-------|----------------|
| `ExecutiveSnapshot` | `snap-{org}-{ts}` | Platform | Cache |
| `HealthSnapshot` | part of snapshot | EC-002 | Cache + daily DB |
| `Recommendation` | `rec-{org}-{uuid}` | EC-003 | Cache + DB |
| `Decision` | `dec-{org}-{uuid}` | EC-004 | DB |
| `DecisionOutcome` | `out-{dec}-{uuid}` | EC-004 | DB |
| `ExecutiveEvidence` | `ev-{uuid}` | Platform | Embedded |
| `ExecutiveExplanation` | `exp-{ref}` | Platform | Cache |
| `ConfidenceScore` | embedded | Platform | Computed |
| `CopilotConversation` | `conv-{user}-{uuid}` | EC-005 | DB |
| `CopilotMessage` | `msg-{uuid}` | EC-005 | DB |
| `MemoryEntry` | `mem-{org}-{uuid}` | EC-005 | DB |
| `LearningEvent` | `learn-{uuid}` | Platform | DB |
| `AuditEntry` | `aud-{uuid}` | Platform | Append-only DB |

## Entity Relationships

```
ExecutiveSnapshot 1──1 HealthSnapshot
ExecutiveSnapshot 1──* Recommendation
Recommendation 0..1──1 Decision        (promotion on accept)
Decision 1──* DecisionOutcome
Decision 1──* AuditEntry
Recommendation *──* ExecutiveEvidence
Decision *──* ExecutiveEvidence
CopilotConversation 1──* CopilotMessage
CopilotMessage *──* ExecutiveEvidence
LearningEvent *──1 Recommendation | Decision
MemoryEntry *──0..1 Decision
```

---

# Shared Components

## UI (`components/executive/`)

| Component | Used By | Epic |
|-----------|---------|------|
| `BusinessHealthCard` | EC-001, EC-002, Command Center, Copilot | E8 |
| `ExecutiveRecommendationCard` | EC-001, EC-003, Command Center | E8 |
| `DecisionCard` | EC-004 | E8 |
| `ExplainabilityDrawer` | All EC surfaces | E8 |
| `EvidenceList` | All EC surfaces | E8 |
| `ConfidenceIndicator` | All EC surfaces | E8 |
| `ExecutiveActionBar` | EC-001, EC-003, EC-004 | E8 |
| `ExecutiveStatStrip` | EC-001, EC-004 | E8 |
| `AlternativesCompare` | EC-004, EC-005 | E8 |
| `OutcomeVarianceBadge` | EC-004 | E8 |
| `CopilotPanel` | EC-005 | E7 |
| `CopilotResponse` | EC-005 | E7 |
| `BriefSection` | EC-001 | E5 |

---

# Shared Types

**Location:** `types/executive/` (EC-000)

| File | Contents |
|------|----------|
| `evidence.ts` | `ExecutiveEvidence`, `EvidenceType` |
| `explanation.ts` | `ExecutiveExplanation`, `ExplainabilityQuestion` |
| `confidence.ts` | `ConfidenceScore`, `ConfidenceBreakdown`, `ConfidenceContext` |
| `category.ts` | `ExecutiveCategory`, `CategoryMeta` |
| `health.ts` | `HealthSnapshot`, `DomainHealth`, `HealthExplanation` |
| `recommendation.ts` | `Recommendation`, `RecommendationSnapshot`, `ORSBreakdown` |
| `decision.ts` | `Decision`, `DecisionAlternative`, `DecisionStatus`, `DecisionOutcome` |
| `copilot.ts` | `CopilotConversation`, `CopilotMessage`, `CopilotResponse` |
| `memory.ts` | `MemoryEntry`, `MemoryType` |
| `learning.ts` | `LearningEvent`, `FeedbackSignal` |
| `snapshot.ts` | `ExecutiveSnapshot`, `BriefView`, `DecisionQueueView` |
| `audit.ts` | `AuditEntry`, `AuditAction` |
| `index.ts` | Barrel exports |

**Migration:** Extend existing `types/intelligence.ts` via re-exports; deprecate duplicates over 2 sprints.

---

# API Contracts

**Base path:** `/api/v1/executive`

| Method | Path | EC | Description |
|--------|------|-----|-------------|
| GET | `/snapshot` | Platform | Full executive snapshot |
| GET | `/brief` | EC-001 | Brief-composed view |
| GET | `/health` | EC-002 | Health snapshot |
| GET | `/health/explain` | EC-002 | Explainability bundle |
| GET | `/recommendations` | EC-003 | Ranked recommendations |
| PATCH | `/recommendations/{id}` | EC-003 | Feedback: accept/reject/defer |
| GET | `/decisions` | EC-004 | Decision list + filters |
| POST | `/decisions` | EC-004 | Create decision |
| GET | `/decisions/{id}` | EC-004 | Decision detail |
| POST | `/decisions/{id}/approve` | EC-004 | Approve |
| POST | `/decisions/{id}/reject` | EC-004 | Reject |
| POST | `/decisions/{id}/defer` | EC-004 | Defer |
| POST | `/decisions/{id}/delegate` | EC-004 | Delegate |
| POST | `/decisions/{id}/complete` | EC-004 | Mark complete |
| POST | `/decisions/{id}/measure` | EC-004 | Record outcome |
| GET | `/decisions/queue/critical` | EC-004 | Critical queue |
| GET | `/copilot/conversations` | EC-005 | List conversations |
| POST | `/copilot/conversations` | EC-005 | New conversation |
| POST | `/copilot/conversations/{id}/messages` | EC-005 | Send message (stream) |
| GET | `/memory/search` | EC-005 | Search memory |
| GET | `/analytics/kpis` | Platform | KPI dictionary metrics |

**Server actions (Next.js):** Mirror above for RSC pages during V1; API routes required for Copilot streaming and external consumers.

---

# Event Model

**Namespace:** `executive.*`

| Event | Payload | Producers | Consumers |
|-------|---------|-----------|-----------|
| `executive.snapshot.generated` | `{ orgId, snapshotId }` | Orchestrator | Cache, Brief |
| `executive.health.degraded` | `{ orgId, domain, score }` | EC-002 | Alerts, Notifications |
| `executive.health.recovered` | `{ orgId, domain }` | EC-002 | Brief delta |
| `executive.recommendation.generated` | `{ recId, ors }` | EC-003 | Brief, Decisions |
| `executive.recommendation.feedback` | `{ recId, signal }` | EC-003/004 | Learning |
| `executive.decision.created` | `{ decId }` | EC-004 | Audit, Memory |
| `executive.decision.approved` | `{ decId, approverId }` | EC-004 | Delegation, Audit |
| `executive.decision.delegated` | `{ decId, ownerId }` | EC-004 | Notifications |
| `executive.decision.completed` | `{ decId }` | EC-004 | Outcome scheduler |
| `executive.decision.outcome.measured` | `{ decId, variance }` | EC-004 | Learning, Analytics |
| `executive.copilot.message` | `{ convId, msgId }` | EC-005 | Audit |
| `executive.provider.synced` | `{ providerId }` | Providers | Cache invalidation |

**V1 implementation:** In-process event emitter (`lib/executive/events/`). **V1.1:** ES-033 message bus.

---

# State Management Strategy

| Layer | Strategy |
|-------|----------|
| **Server snapshot** | `React.cache()` + 15-min TTL cache (exists in Orchestrator) |
| **RSC pages** | Server fetch on render · `force-dynamic` for executive routes |
| **Client interaction** | Server Actions → revalidatePath · optimistic UI for actions |
| **Copilot streaming** | Route handler SSE · client accumulates tokens |
| **Decision queue** | Server source of truth · client filters local-only |
| **Copilot conversation** | Server persisted · client thread cache |
| **Feature flags** | Server-side env + org config · no client-only gating |
| **Offline (V2)** | Service worker cache of last Brief snapshot |

**No global client store (Redux/Zustand) for executive data in V1.**

---

# Data Flow

```
Providers sync
     │
     ▼
Orchestrator Pipeline (10 stages)
     │
     ├──► Health Service ──► HealthSnapshot
     ├──► Recommendation Service ──► RecommendationSnapshot
     ├──► Alert Engine ──► AlertSnapshot
     └──► Snapshot Composer ──► ExecutiveSnapshot
                │
     ┌──────────┼──────────┬──────────────┐
     ▼          ▼          ▼              ▼
  Brief     Command    Decisions      Copilot
  Composer  Center     Service        Context
     │                     │              │
     ▼                     ▼              ▼
  /brief              /decisions    Copilot Panel
                           │
                    Decision DB
                           │
                    Outcome ──► Learning Service ──► Memory
```

---

# Caching Strategy

| Cache Key | TTL | Invalidation |
|-----------|-----|--------------|
| `exec:snapshot:{orgId}` | 15 min | Provider sync · manual refresh |
| `exec:health:{orgId}` | 15 min | Health domain change event |
| `exec:recs:{orgId}` | 15 min | Recommendation generated |
| `exec:brief:{orgId}` | 15 min | Snapshot invalidation |
| `exec:explain:{snapshotId}` | 60 min | Immutable per snapshot |
| `exec:copilot:ctx:{orgId}` | 5 min | Snapshot invalidation |
| Provider GA4 snapshot | 5 min | GA4 sync (exists) |

**L1:** In-process (single instance). **V1.1:** Redis for multi-instance. **V2:** CDN edge for static brief shell.

---

# Security Architecture

| Control | Implementation |
|---------|----------------|
| **Authentication** | ES-037 path · session middleware (upgrade from placeholder) |
| **Authorization** | Executive RBAC matrix · persona profiles (EC-005 §3) |
| **Tenant isolation** | `orgId` on every query · middleware enforcement |
| **API auth** | Session cookie + CSRF · API keys V2 |
| **Audit** | Append-only `executive_audit_log` table |
| **AI audit** | Evidence packet hash + model version per Copilot response |
| **PII masking** | Role-based field redaction in Copilot + exports |
| **Input validation** | Zod schemas on all API inputs |
| **Rate limiting** | Copilot endpoints · per-user quotas |
| **Secrets** | Env vars only · Integration Center pattern |

---

# Multi-tenancy

| Aspect | V1 | V2 |
|--------|----|----|
| **Org isolation** | Single org per deployment config | Full multi-org DB partition |
| **Data partition** | `org_id` column all tables | Row-level security |
| **Cache partition** | Key prefix `{orgId}` | Redis namespace |
| **Config partition** | Org executive config JSON | Admin UI |
| **Analytics** | Org-scoped only | Cross-org benchmarks opt-in |

**V1 assumption:** Single-tenant ORION deployment (founder instance). Schema supports multi-tenant from day one.

---

# AI Layer

```
┌─────────────────────────────────────────────────────────────┐
│                  AI Narration & Validation Service           │
│  lib/executive/narration/                                    │
├─────────────────────────────────────────────────────────────┤
│  assembleEvidencePacket()                                    │
│  applyBusinessRules()                                        │
│  generateNarrative(template | llm)                           │
│  validateCitations()                                         │
│  calculateConfidence(ConfidenceContext)                      │
│  labelInferences()                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    Brief Summary    Recommendation      Copilot Response
    (EC-001)         root cause (EC-003)  (EC-005)
                     Decision Advisor
                     (EC-004)
```

| Phase | AI Capability |
|-------|---------------|
| **V1.0** | Template narration · citation validation · no external LLM required for Brief |
| **V1.1** | LLM narration with validation gate · Copilot basic Q&A |
| **V1.2** | Multi-turn Copilot · Decision Advisor · streaming |
| **V2.0** | Voice · predictive dialogue · memory embeddings |

**LLM provider:** Abstract via `lib/executive/narration/llm-adapter.ts` · ES-057 governance · ES-039 alignment.

---

# Testing Strategy

## Unit

| Scope | Target |
|-------|--------|
| EC-000 type validators | 100% critical paths |
| Confidence engine | All context weight profiles |
| ORS prioritization | EC-003 scoring |
| Health calculation | EC-002 domain weights |
| Decision lifecycle transitions | EC-004 state machine |
| Citation validator | Narration service |
| Category registry | Mapping consistency |

**Framework:** Vitest (exists · 84 tests baseline)

## Integration

| Scope | Target |
|-------|--------|
| Orchestrator → Snapshot Composer | Full pipeline output |
| Recommendation → Decision promotion | EC-003 → EC-004 |
| Provider → Health → Recommendation | End-to-end mock providers |
| GA4 provider → Marketing health | Live env optional |
| Server actions → revalidation | Decision CRUD |
| Learning feedback loop | Accept → outcome → weight |

## E2E

| Flow | Tool |
|------|------|
| Morning Brief load · expand health · act on recommendation | Playwright |
| Decision approve · delegate · complete | Playwright |
| Copilot ask · evidence display · follow-up | Playwright |
| Integration Center connect · Brief reflects data | Playwright |

## Performance

| Benchmark | Target |
|-----------|--------|
| Cold snapshot pipeline | P95 ≤ 3s |
| Cached brief page TTFB | P95 ≤ 500ms |
| Decision list API | P95 ≤ 300ms |
| Copilot first token | P95 ≤ 800ms |

**Tool:** Vitest bench + optional k6 for API routes

## Security

| Test | Scope |
|------|-------|
| RBAC enforcement | Each API route per persona |
| Tenant isolation | Cross-org access denied |
| Audit completeness | Every decision transition logged |
| Copilot injection | Prompt injection test suite |
| PII leakage | Copilot response scan |

## Accessibility

| Standard | Scope |
|----------|-------|
| WCAG 2.2 AA | All executive components |
| Screen reader | Brief · Decision · Copilot flows |
| Keyboard | Action bar · Copilot · drawers |
| Reduced motion | All animations |

---

# Engineering Epics

## Epic 1 — EC-000 Executive Platform Contracts

| Field | Value |
|-------|-------|
| **Purpose** | Canonical types, validators, category registry, KPI dictionary |
| **Business Value** | Prevents five duplicate implementations · enables parallel EC development |
| **Dependencies** | PAR-2026-001 recommendations |
| **Complexity** | Medium |
| **Estimated Sprints** | **1** |

## Epic 2 — Orchestrator Unification & Snapshot Composer

| Field | Value |
|-------|-------|
| **Purpose** | Single `ExecutiveSnapshot` from pipeline · retire duplicate aggregation paths |
| **Business Value** | One source of truth for all EC surfaces |
| **Dependencies** | Epic 1 |
| **Complexity** | High |
| **Estimated Sprints** | **1.5** |

## Epic 3 — EC-002 Business Health Engine (Production)

| Field | Value |
|-------|-------|
| **Purpose** | Domain scoring · confidence · explainability · risk/opportunity signals |
| **Business Value** | Executive trust anchor · feeds all downstream ECs |
| **Dependencies** | Epic 1, 2 |
| **Complexity** | High |
| **Estimated Sprints** | **2** |

## Epic 4 — EC-003 Recommendation Engine (Production)

| Field | Value |
|-------|-------|
| **Purpose** | ORS prioritization · lifecycle · evidence · learning hooks |
| **Business Value** | Actionable prioritized guidance |
| **Dependencies** | Epic 3 |
| **Complexity** | High |
| **Estimated Sprints** | **2** |

## Epic 5 — EC-001 Morning Executive Brief

| Field | Value |
|-------|-------|
| **Purpose** | `/brief` surface · Brief composer · AI summary · navigation ADR |
| **Business Value** | Daily executive habit · orient in ≤ 5 min |
| **Dependencies** | Epic 3, 4, 8 (partial) |
| **Complexity** | Medium |
| **Estimated Sprints** | **1.5** |

## Epic 6 — EC-004 Executive Decision Center

| Field | Value |
|-------|-------|
| **Purpose** | Decision domain · lifecycle · delegation · outcomes · `/decisions` |
| **Business Value** | Decision accountability · institutional memory |
| **Dependencies** | Epic 4, 10 (persistence) |
| **Complexity** | Very High |
| **Estimated Sprints** | **2.5** |

## Epic 7 — EC-005 AI Executive Copilot (V1)

| Field | Value |
|-------|-------|
| **Purpose** | Copilot panel · context engine · structured responses · conversation persistence |
| **Business Value** | Conversational access to entire EC stack |
| **Dependencies** | Epic 3, 4, 6, 11 |
| **Complexity** | Very High |
| **Estimated Sprints** | **2.5** |

## Epic 8 — Shared Executive UI Component Library

| Field | Value |
|-------|-------|
| **Purpose** | `components/executive/*` · design system alignment |
| **Business Value** | Consistent UX · faster EC surface delivery |
| **Dependencies** | Epic 1 |
| **Complexity** | Medium |
| **Estimated Sprints** | **1.5** (parallel throughout) |

## Epic 9 — Executive Intelligence API & Events

| Field | Value |
|-------|-------|
| **Purpose** | `/api/v1/executive/*` · event emitter · OpenAPI spec |
| **Business Value** | External integrations · Copilot streaming · mobile-ready |
| **Dependencies** | Epic 1, 2 |
| **Complexity** | Medium |
| **Estimated Sprints** | **1.5** |

## Epic 10 — Persistence & Database Layer

| Field | Value |
|-------|-------|
| **Purpose** | Decisions · outcomes · conversations · memory · audit · learning events |
| **Business Value** | Durability · outcome tracking · compliance |
| **Dependencies** | Epic 1 · ES-036 alignment |
| **Complexity** | High |
| **Estimated Sprints** | **2** (starts Sprint 7 · parallel) |

## Epic 11 — AI Narration & Validation Service

| Field | Value |
|-------|-------|
| **Purpose** | Shared narration · citation validation · confidence · LLM adapter |
| **Business Value** | One AI stack · trust · ES-057 compliance |
| **Dependencies** | Epic 1, 3 |
| **Complexity** | High |
| **Estimated Sprints** | **2** |

## Epic 12 — Executive Learning & Memory

| Field | Value |
|-------|-------|
| **Purpose** | Unified learning loop · memory store · EC-003 weight feedback |
| **Business Value** | Continuous improvement · Copilot continuity |
| **Dependencies** | Epic 4, 6, 10 |
| **Complexity** | Medium |
| **Estimated Sprints** | **1.5** |

## Epic 13 — QA, Security, DevOps & Release

| Field | Value |
|-------|-------|
| **Purpose** | E2E suite · CI gates · security audit · release v0.5.0 |
| **Business Value** | Production readiness |
| **Dependencies** | All epics |
| **Complexity** | Medium |
| **Estimated Sprints** | **1** (continuous) + final hardening |

**Total estimated effort:** ~**12 sprints** (with parallelization · calendar ~7–8 months)

---

# User Stories

## EC-001 — Morning Executive Brief

| ID | User Story | Acceptance Criteria | Priority | Dependencies |
|----|------------|---------------------|----------|--------------|
| US-001 | As an executive, I open `/brief` and see my morning orientation in ≤ 5 min | Brief loads ≤ 3s cached · Health + top 3 recs above fold · End-of-brief summary | P0 | E3, E4, E5 |
| US-002 | As an executive, I see Business Health with explainability | Health card · "Why this score?" drawer · confidence badge | P0 | E3, E8 |
| US-003 | As an executive, I see critical alerts prioritized | Alerts sorted by severity · max 5 above fold | P0 | Alert engine |
| US-004 | As an executive, I read an AI summary with citations | Summary ≤ 6 sentences · 100% cited facts · confidence shown | P0 | E11 |
| US-005 | As an executive, I act on a recommendation from the Brief | Action bar · creates/opens Decision · revalidates | P0 | E6, E8 |
| US-006 | As an executive, I see overnight deltas | Delta strip when changes since last view | P1 | E2 |
| US-007 | As an executive, I see domain signal chips | Collapsed healthy domains · expanded anomalies | P1 | E3 |
| US-008 | As an executive, I see stale data warnings | Provider freshness · confidence discount visible | P1 | E2 |

## EC-002 — Business Health Engine

| ID | User Story | Acceptance Criteria | Priority | Dependencies |
|----|------------|---------------------|----------|--------------|
| US-010 | As an executive, I see an overall health score 0–100 | Score · status band · trend arrow | P0 | E2, E3 |
| US-011 | As an executive, I understand health drivers | Top 3 positive/negative drivers with evidence | P0 | E3, E8 |
| US-012 | As a system, health reflects all connected providers | Missing provider reduces confidence · never fabricates | P0 | Providers |
| US-013 | As an executive, I see domain breakdown | ≥ 5 domain mini-bars with scores | P1 | E3 |
| US-014 | As a system, risk signals penalize health | Critical alerts apply score penalty per EC-002 spec | P1 | Alerts |
| US-015 | As an executive, I see health history comparison | vs yesterday · vs last week | P2 | E10 |

## EC-003 — Executive Recommendation Engine

| ID | User Story | Acceptance Criteria | Priority | Dependencies |
|----|------------|---------------------|----------|--------------|
| US-020 | As an executive, I see recommendations ranked by ORS | Sorted list · ORS transparent on expand | P0 | E4 |
| US-021 | As an executive, every recommendation has evidence | ≥ 1 evidence object · no publish without | P0 | E1 |
| US-022 | As an executive, I understand why now / why me | Explainability answers all 6 questions | P0 | E8, E11 |
| US-023 | As an executive, I accept/reject/defer recommendations | Feedback persisted · learning event emitted | P0 | E12 |
| US-024 | As a system, duplicate recommendations merge | Dedup per EC-003 rules | P1 | E4 |
| US-025 | As an executive, I see ≤ 3 recommendations on Brief | Surfacing cap enforced | P0 | E5 |

## EC-004 — Executive Decision Center

| ID | User Story | Acceptance Criteria | Priority | Dependencies |
|----|------------|---------------------|----------|--------------|
| US-030 | As an executive, I manage decisions at `/decisions` | Queue · critical · delegated views | P0 | E6, E10 |
| US-031 | As an executive, I approve a decision with alternatives | ≥ 2 alternatives when material · approver logged | P0 | E6 |
| US-032 | As an executive, I delegate with owner and due date | Delegation SLA · acknowledgment tracking | P0 | E6 |
| US-033 | As an executive, I track delegated work status | On Track · At Risk · Overdue chips | P0 | E6 |
| US-034 | As an executive, I record decision outcomes | Expected vs actual · variance classification | P1 | E10, E12 |
| US-035 | As an executive, I capture lessons learned | Post-measurement form · feeds memory | P1 | E12 |
| US-036 | As a system, accepting a recommendation creates a Decision | Promotion contract EC-003 → EC-004 | P0 | E4, E6 |
| US-037 | As an executive, I search decision history | Full-text · filters · role-scoped | P2 | E10 |

## EC-005 — AI Executive Copilot

| ID | User Story | Acceptance Criteria | Priority | Dependencies |
|----|------------|---------------------|----------|--------------|
| US-040 | As an executive, I ask business questions in Copilot | Structured response model · evidence · confidence | P1 | E7, E11 |
| US-041 | As an executive, Copilot explains health and recommendations | Workflow routing · correct context injection | P1 | E3, E4, E7 |
| US-042 | As an executive, Copilot supports decision review | Decision Support workflow · never approves | P1 | E6, E7 |
| US-043 | As an executive, I see inference labelled separately from facts | Inference badge · confidence cap 75% | P0 | E11 |
| US-044 | As an executive, Copilot refuses when data insufficient | Helpful refusal · missing provider list | P0 | E11 |
| US-045 | As an executive, I search past conversations | Thread search · pinned conversations | P2 | E10 |
| US-046 | As an executive, I use quick commands (`/brief`, `/health`) | Command router · correct workflow | P2 | E7 |

---

# Implementation Tasks

## Frontend

| Task | Epic | Sprint |
|------|------|--------|
| Create `components/executive/*` library | E8 | S6–S10 |
| Build `/brief` page and BriefComposer | E5 | S9 |
| Build `/decisions` page and DecisionDashboard | E6 | S10–S11 |
| Build CopilotPanel + CopilotResponse | E7 | S11–S12 |
| Migrate Command Center to shared executive components | E8 | S9 |
| Implement ExplainabilityDrawer + EvidenceList | E8 | S7 |
| Navigation ADR · sidebar updates | E5 | S8 |
| Mobile responsive layouts all EC surfaces | E8 | S10–S12 |
| Feature flags for EC routes | E13 | S8 |

## Backend

| Task | Epic | Sprint |
|------|------|--------|
| Implement `lib/executive/contracts/` | E1 | S6 |
| Implement Snapshot Composer | E2 | S6–S7 |
| Implement Health Service (extend health-engine) | E3 | S7–S8 |
| Implement Recommendation Service (extend engine) | E4 | S8–S9 |
| Implement Decision Service + lifecycle | E6 | S10–S11 |
| Implement Copilot Service + context engine | E7 | S11–S12 |
| Implement `/api/v1/executive/*` routes | E9 | S8–S10 |
| Server actions for decision CRUD | E6 | S10 |
| Event emitter `lib/executive/events/` | E9 | S8 |
| Category registry + org config | E1 | S6 |

## Database

| Task | Epic | Sprint |
|------|------|--------|
| Schema: decisions · outcomes · alternatives | E10 | S7 |
| Schema: copilot conversations · messages | E10 | S11 |
| Schema: memory · learning · audit | E10 | S8, S12 |
| Schema: health history daily snapshots | E10 | S9 |
| Migrations tooling (Prisma/Drizzle ADR) | E10 | S7 |
| Row-level org_id on all tables | E10 | S7 |

## AI

| Task | Epic | Sprint |
|------|------|--------|
| Narration service template engine | E11 | S7 |
| Citation validator | E11 | S8 |
| Confidence engine unified | E11 | S7 |
| LLM adapter + ES-057 guardrails | E11 | S11 |
| Copilot workflow router | E7 | S11 |
| Brief AI summary integration | E11 | S9 |
| Decision Advisor narration | E11 | S11 |
| Prompt registry + versioning | E11 | S11 |

## Integrations

| Task | Epic | Sprint |
|------|------|--------|
| Wire GA4 into Health Marketing domain | E3 | S7 |
| Provider freshness metadata in snapshot | E2 | S7 |
| Integration Center → Brief stale badges | E5 | S9 |
| Plugin AI skills registry for Copilot | E7 | S12 |

## Infrastructure

| Task | Epic | Sprint |
|------|------|--------|
| Executive cache layer abstraction | E2 | S7 |
| SSE streaming route for Copilot | E7 | S12 |
| Redis cache evaluation (ADR) | E2 | S10 |
| Background outcome measurement job | E12 | S11 |

## DevOps

| Task | Epic | Sprint |
|------|------|--------|
| Extend quality-gate.yml for executive tests | E13 | S8+ |
| Executive API contract tests in CI | E9 | S9 |
| Performance benchmark gate | E13 | S11 |
| Feature flag env configuration | E13 | S8 |
| Staging environment executive seed data | E13 | S9 |

## Testing

| Task | Epic | Sprint |
|------|------|--------|
| EC-000 contract unit tests | E1 | S6 |
| Health + ORS unit tests | E3, E4 | S8 |
| Decision lifecycle unit tests | E6 | S10 |
| Pipeline integration tests | E2 | S7 |
| Promotion EC-003→EC-004 integration | E6 | S10 |
| Playwright Brief E2E | E5 | S9 |
| Playwright Decision E2E | E6 | S11 |
| Playwright Copilot E2E | E7 | S12 |
| Security RBAC test suite | E13 | S10 |
| a11y audit executive surfaces | E13 | S11 |

## Documentation

| Task | Epic | Sprint |
|------|------|--------|
| ES-066 Executive Capabilities Engineering Spec | E1 | S6 |
| EC-000 data contracts doc | E1 | S6 |
| API OpenAPI spec `/api/v1/executive` | E9 | S9 |
| ADR Executive Navigation IA | E5 | S6 |
| ADR Persistence layer selection | E10 | S7 |
| ES alignment updates EC-002–005 | E13 | S12 |
| Release notes v0.5.0 | E13 | S12 |

---

# Engineering Timeline

## Sprint Plan

| Sprint | Focus | Epics | Milestone |
|--------|-------|-------|-----------|
| **S6** | Contracts · Composer · ADR | E1, E2, E8 (start) | M0 — Foundation |
| **S7** | Health production · DB schema · Narration templates | E3, E10, E11 | M1 — Intelligence Core |
| **S8** | Recommendations · API · Events · UI components | E4, E8, E9, E11 | M1 |
| **S9** | Morning Brief · GA4 health wiring | E5, E3, E11 | M2 — Executive Surfaces |
| **S10** | Decision Center · Persistence · E2E start | E6, E10, E8 | M2 |
| **S11** | Decision outcomes · LLM · Copilot start | E6, E11, E7, E12 | M3 — Decision OS |
| **S12** | Copilot V1 · Learning · Memory · Release | E7, E12, E13 | M3 — **v0.5.0** |

## Milestones

| Milestone | Sprint | Deliverable |
|-----------|--------|-------------|
| **M0 — Foundation** | S6 | EC-000 types · Snapshot Composer · Navigation ADR |
| **M1 — Intelligence Core** | S7–S8 | Production Health + Recommendations · API v1 alpha |
| **M2 — Executive Surfaces** | S9–S10 | `/brief` live · `/decisions` alpha · shared UI lib |
| **M3 — Decision OS** | S11–S12 | Copilot V1 · learning loop · v0.5.0 release |

## Critical Path

```
S6: EC-000 → Snapshot Composer
         │
S7: Health Service ──────────────────────────┐
         │                                    │
S8: Recommendation Service                   │
         │                                    │
S9: Brief Composer ◄─────────────────────────┘
         │
S10: Decision Service + DB
         │
S11: Narration LLM + Decision outcomes
         │
S12: Copilot V1 + Release
```

**Parallel tracks:** UI component library (S6–S10) · API layer (S8–S10) · DB schema (S7–S11) · DevOps/QA (continuous)

---

# Risks & Mitigation

## High-Risk Tasks

| Task | Risk | Mitigation |
|------|------|------------|
| Orchestrator unification | Breaks `/dashboard` and `/command-center` | Contract tests · feature flag · parallel run 1 sprint |
| Decision persistence ADR | Wrong DB choice delays EC-004 | ADR in S6 · Drizzle/Prisma spike in S7 |
| LLM integration | Hallucination · cost · latency | Template-first V1 · validation gate · ES-057 |
| Legacy intelligence-bus migration | Dual-stack regression | Engine-by-engine migration · 84 existing tests baseline |
| Navigation ADR | Product disagreement blocks UI | ADR decision in S6 before Brief build |
| Copilot scope creep | Replaces all surfaces | Strict EC-005 boundary · facade only |

## Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| In-memory stores in multi-instance | Medium | High | Cache abstraction S7 · Redis ADR S10 |
| Confidence formula disputes | Medium | Medium | EC-000 Confidence Engine · single implementation |
| GA4 unavailable in dev | Low | Low | Mock marketing provider fallback (exists) |
| Test coverage gap on new modules | Medium | High | Contract tests required in DoD |

## Architecture Risks

| Risk | Mitigation |
|------|------------|
| Five EC teams diverging on types | EC-000 gate · no EC surface without shared types |
| AI validation duplicated | Epic 11 blocks EC-001/005 AI features |
| Decision/Recommendation confusion | Promotion contract tested · documented |

---

# Definition of Ready

A user story is **Ready** when:

- [ ] Linked to EC spec section and epic  
- [ ] EC-000 types defined for all entities touched  
- [ ] Acceptance criteria testable  
- [ ] Dependencies completed or flagged with stub  
- [ ] API contract sketched if backend involved  
- [ ] UI wireframe referenced from EC spec  
- [ ] Security/privacy impact assessed  
- [ ] Estimated ≤ 1 sprint  
- [ ] Product owner priority assigned  

---

# Definition of Done

A user story is **Done** when:

- [ ] Code merged to `main`  
- [ ] Unit tests pass · coverage ≥ 80% on new modules  
- [ ] Integration tests pass where applicable  
- [ ] ESLint + TypeScript strict pass  
- [ ] EC-000 contracts used · no duplicate type definitions  
- [ ] Evidence/explainability requirements met per EC spec  
- [ ] Audit logging for decision/AI actions  
- [ ] Accessible (keyboard + screen reader smoke test)  
- [ ] Documented in ES/engine README if new module  
- [ ] Feature flagged if not ready for default exposure  

---

# Release Gates

## Gate 1 — Intelligence Core (post S8)

- [ ] Health snapshot with confidence + explainability  
- [ ] Recommendations with ORS + evidence  
- [ ] Snapshot composer single pipeline  
- [ ] ≥ 100 unit tests · pipeline integration green  
- [ ] API v1 alpha documented  

## Gate 2 — Executive Surfaces (post S10)

- [ ] `/brief` live behind feature flag  
- [ ] `/decisions` alpha with CRUD + delegation  
- [ ] Shared executive UI components in use  
- [ ] E2E Brief + Decision flows green  
- [ ] Navigation ADR implemented  

## Gate 3 — v0.5.0 Release (post S12)

- [ ] Copilot V1 with citation validation  
- [ ] Learning loop persisting feedback + outcomes  
- [ ] All P0 user stories complete  
- [ ] Security RBAC test suite green  
- [ ] Performance benchmarks met  
- [ ] Release notes · ES docs updated  
- [ ] No P0/P1 open defects  

---

# Appendix — Epic Dependency Graph

```
E1 (Contracts)
 └── E2 (Composer)
      ├── E3 (Health)
      │    ├── E4 (Recommendations)
      │    │    ├── E5 (Brief)
      │    │    └── E6 (Decisions) ─── E10 (DB)
      │    │              └── E12 (Learning)
      │    └── E11 (Narration)
      │         ├── E5 (Brief AI)
      │         ├── E6 (Advisor)
      │         └── E7 (Copilot)
      ├── E8 (UI Components) ── all surfaces
      └── E9 (API/Events)
E13 (QA/DevOps) ── continuous
```

---

**Status:** READY FOR IMPLEMENTATION  
**Version:** 1.0  
**Next Action:** Sprint S6 kickoff — Epic 1 EC-000 contracts + Navigation ADR + Snapshot Composer  
**Owner:** Chief Technology Officer
