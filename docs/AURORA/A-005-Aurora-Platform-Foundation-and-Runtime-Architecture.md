# A-005 — Project Aurora Platform Foundation & Runtime Architecture

**Document ID:** A-005  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-005 — Aurora Platform Foundation & Runtime Architecture  
**Version:** 1.0  
**Status:** Ratified — Authoritative Runtime Reference  
**Classification:** Platform Architecture · Runtime · Composition · Operations  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Parent:** [A-001 Aurora Constitution](./A-001-Aurora-Constitution.md) · [A-002 Enterprise Engineering Blueprint](./A-002-Aurora-Enterprise-Engineering-Blueprint.md) · [A-003 AI Workforce Architecture](./A-003-Aurora-AI-Workforce-Architecture.md) · [A-004 Enterprise Knowledge & Memory Architecture](./A-004-Aurora-Enterprise-Knowledge-and-Memory-Architecture.md)  
**Platform Parent:** [ORION Enterprise Platform v2.0](../00_FOUNDATION/ORION_CANON_v1.md)  
**Effective Date:** 7 August 2026  
**Supersedes:** A-002 §5 (Composition Root summary) · A-002 §3 (Application layers summary) for runtime detail  
**Subordinate To:** A-001 · ORION Canon v1.0 (platform-wide)

**Rule:** This document defines **how Aurora initializes, boots, composes, orchestrates, executes, monitors, and shuts down**. All Aurora implementation missions must comply with these runtime patterns. This document **completes Aurora Core Architecture Phase** and **authorizes transition to implementation planning**.

**Scope:** Platform foundation · runtime lifecycle · composition root · module runtime · agent runtime · infrastructure · observability · resilience · ORION integration. **No implementation.** **No code.** **No REST APIs.** **No UI.**

---

## Engineering Principles (Binding)

| # | Principle | Enforcement |
|---|-----------|-------------|
| **RP-1** | **AuroraFacade is the only public entry point** | All external consumers use Facade — never services |
| **RP-2** | **createAuroraWiring() is the sole composition root** | All DI occurs in one factory function |
| **RP-3** | **Services never call LLMs directly** | AI via AgentOrchestrator only |
| **RP-4** | **Agents propose** | Agents output recommendations · never mutate state directly |
| **RP-5** | **Business services validate** | Domain rules enforced in service layer |
| **RP-6** | **Execution services execute** | Publish · schedule · sync after approval |
| **RP-7** | **External integrations via provider interfaces** | ConnectorRegistry · no direct HTTP from services |
| **RP-8** | **Modules independently testable** | Each module wired via sub-factories |
| **RP-9** | **Multi-tenant runtime** | tenant_id on every operation · RLS enforced |
| **RP-10** | **Deterministic startup and shutdown** | Ordered sequence · idempotent · verifiable |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Platform Foundation](#2-platform-foundation)
3. [Runtime Architecture](#3-runtime-architecture)
4. [Composition Root](#4-composition-root)
5. [Module Runtime](#5-module-runtime)
6. [Agent Runtime](#6-agent-runtime)
7. [Runtime Infrastructure](#7-runtime-infrastructure)
8. [Observability](#8-observability)
9. [Enterprise Resilience](#9-enterprise-resilience)
10. [ORION Integration](#10-orion-integration)
11. [Implementation Readiness](#11-implementation-readiness)
12. [Executive Closing Statement](#12-executive-closing-statement)

**Appendices:** [A — Runtime Startup Flow](#appendix-a--runtime-startup-flow) · [B — Shutdown Flow](#appendix-b--shutdown-flow) · [C — Dependency Graph](#appendix-c--dependency-graph) · [D — Module Registry](#appendix-d--module-registry) · [E — Service Registry](#appendix-e--service-registry) · [F — Mission Register](#appendix-f--mission-register)

---

# Preamble

Architecture without runtime is blueprint without engine.

Aurora's constitutional documents (A-001 through A-004) define **what** Aurora is — product vision, engineering structure, AI workforce, and institutional knowledge. This document defines **how Aurora runs** — the boot sequence that brings fourteen agents online, the composition root that wires every service, the scheduler that publishes at midnight, the circuit breaker that survives Google API outages, and the shutdown sequence that preserves campaign state.

Every line of Aurora implementation code will execute within the runtime boundaries defined herein.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Define complete runtime architecture for Project Aurora |
| **Audience** | Platform engineers · DevOps · architects · mission leads |
| **Binding authority** | All Aurora implementation missions ES-AURORA-005+ |
| **Milestone** | Completes Aurora Core Architecture Phase (A-001–A-005) |

This document answers:

- How does Aurora boot within the ORION monorepo?
- What is the deterministic startup and shutdown sequence?
- How does createAuroraWiring() compose all services?
- How do modules, agents, and infrastructure components initialize?
- How is multi-tenant runtime context propagated?
- How does Aurora observe, recover, and degrade gracefully?
- How does Aurora integrate with ORION at runtime?

## 1.2 Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Platform foundation** | Aurora identity · ORION shared services · lifecycle |
| 2 | **Runtime lifecycle** | Deterministic boot · init · shutdown · recovery |
| 3 | **Composition root** | Single factory · full DI graph · testable sub-wiring |
| 4 | **Module runtime** | 13 modules · ordered init · dependency resolution |
| 5 | **Agent runtime** | 14 agents · registry · scheduling · health |
| 6 | **Infrastructure** | Scheduler · queue · events · workflow · retry · circuit breaker |
| 7 | **Observability** | Health · metrics · logging · tracing · alerting |
| 8 | **Resilience** | Isolation · degradation · state restoration · DR |
| 9 | **ORION integration** | Runtime wiring to all platform services |
| 10 | **Implementation readiness** | Phase 1 runtime authorized for ES-AURORA-005 |

## 1.3 Runtime Philosophy

| Commitment | Meaning |
|------------|---------|
| **Deterministic** | Same configuration produces same startup state every time |
| **Idempotent** | Boot and shutdown safe to retry without side effects |
| **Isolated** | Module failure does not crash platform · tenant failure does not cross tenants |
| **Observable** | Every runtime state transition is logged and measurable |
| **Recoverable** | Warm restart restores composition root and domain hydration |
| **Governed** | Agents propose · services validate · execution executes — never blurred |
| **ORION-native** | Aurora runtime is a module within ORION process — not a separate deployment (Phase 1) |

## 1.4 Relationship with A-001

| A-001 Element | A-005 Runtime Response |
|---------------|------------------------|
| §4 ORION relationship | Platform boot waits for ORION platform readiness |
| §7 Multi-tenant | RuntimeContext carries tenant_id on every operation |
| §7 Approval workflow | Approval Engine initialized in composition root |
| §8 Technology stack | Runtime uses Next.js · Node.js · PostgreSQL · Redis |
| Engineering principles RP-1–10 | Enforced at runtime boundary |

## 1.5 Relationship with A-002

| A-002 Element | A-005 Runtime Response |
|---------------|------------------------|
| §2 Repository structure | Runtime loads modules from defined paths |
| §3 Layer model | Runtime initializes layers bottom-up (ORION → infra → agents → facade) |
| §5 Composition Root | **Fully specified** — createAuroraWiring() sequence |
| §7 Event architecture | EventDispatcher wired at boot · subscribers registered |
| §8 Security | RBAC enforced at API boundary · tenant context from ORION Identity |
| §11 Quality · observability | Runtime metrics and health checks defined (§8) |

## 1.6 Relationship with A-003

| A-003 Element | A-005 Runtime Response |
|---------------|------------------------|
| 14 agents | AgentRegistry populated at boot (Phase 1: 10 · Phase 2: 14) |
| AgentOrchestrator | Initialized after Knowledge + Memory services |
| Decision Engine | Wired into agent execution pipeline |
| Agent vs Execution boundary | Runtime enforces: agents → services → execution services |
| Department model | Task routing configured in AgentRegistry |

## 1.7 Relationship with A-004

| A-004 Element | A-005 Runtime Response |
|---------------|------------------------|
| Knowledge services | Initialized before AgentOrchestrator |
| Memory tiers | MemoryService + Redis connection at boot |
| Retrieval pipeline | Mandatory pre-flight before agent LLM call |
| Learning System | Background worker for consolidation jobs |
| EmbeddingService | pgvector index verified at startup |

### Core Architecture Phase Completion

```
A-001 Product Constitution        ✅ Ratified
A-002 Engineering Blueprint       ✅ Ratified
A-003 AI Workforce Architecture   ✅ Ratified
A-004 Knowledge & Memory          ✅ Ratified
A-005 Platform Foundation & Runtime ✅ Ratified ← THIS DOCUMENT
    ↓
ES-AURORA-005+ Implementation Planning AUTHORIZED
```

---

# 2. Platform Foundation

## 2.1 Aurora Platform Identity

| Field | Value |
|-------|-------|
| **Platform codename** | `aurora` |
| **Module key** | `AURORA_MODULE_KEY = "aurora"` |
| **IIL service ID** | `AURORA_IIL_SERVICE_ID = "aurora.platform"` |
| **Base path** | `/aurora` |
| **API prefix** | `/api/aurora` |
| **Library root** | `lib/aurora/` |
| **Workspace ID** | `aurora-workspace` |

## 2.2 Aurora as ORION Module

Aurora Phase 1 runtime executes **within the ORION Next.js process** — sharing ORION's infrastructure, identity, and platform services. Aurora is not a separate microservice in Phase 1.

```
ORION Process (Node.js / Next.js)
├── ORION Platform Bootstrap
│   ├── PlatformStoreFactory.initialize()
│   ├── ORION Identity
│   ├── Event Bus
│   └── Executive Provider Registry
├── Domain Modules (HCM · CRM · Finance · Procurement)
└── Aurora Module
    ├── createAuroraWiring()
    ├── AuroraFacade
    ├── 13 Module Runtimes
    ├── 14 Agent Runtimes (phased)
    └── Runtime Infrastructure
```

## 2.3 Shared ORION Foundation

| ORION Service | Aurora Runtime Dependency | Boot Order |
|---------------|--------------------------|:--------:|
| **PlatformStore** | All Aurora persistence | 1 |
| **Identity (ES-009)** | Auth · session · RBAC | 1 |
| **Event Bus (ES-033)** | Aurora canonical events | 2 |
| **AI Provider Framework** | AgentOrchestrator LLM calls | 3 |
| **Notification Service** | Approval · publish alerts | 3 |
| **Search Service** | Entity indexing | 4 |
| **Audit Service (ES-038)** | Agent · knowledge audit | 2 |
| **Executive Provider Registry** | auroraExecutiveProvider | 5 |
| **EnterpriseReadinessService** | Aurora health contribution | 5 |

### ORION Readiness Gate

Aurora boot **must not proceed** until ORION platform reports `initialized` lifecycle state. Aurora registers its own readiness probe with `EnterpriseReadinessService`.

## 2.4 Platform Services (Aurora-Owned)

| Service | Responsibility | Init Phase |
|---------|---------------|:----------:|
| **AuroraFacade** | Public API entry point | 5 |
| **AgentOrchestrator** | Agent routing · execution | 4 |
| **PublishPipeline** | Multi-channel publish | 4 |
| **ApprovalEngine** | Workflow gates | 3 |
| **KnowledgeRetrievalService** | Context assembly | 3 |
| **MemoryService** | Memory tier access | 3 |
| **ConnectorRegistry** | External integrations | 4 |
| **WorkflowEngine** | Automation rules | 4 |
| **SchedulerService** | Time-based execution | 4 |
| **QueueManager** | Background job dispatch | 3 |

## 2.5 Platform Lifecycle

| State | Description | Transitions |
|-------|-------------|-------------|
| `created` | Wiring factory invoked · not yet initialized | → initializing |
| `initializing` | Boot sequence in progress | → ready · → failed |
| `ready` | All modules · agents · workers operational | → draining · → degraded |
| `degraded` | Partial functionality · some integrations down | → ready · → draining |
| `draining` | Shutdown in progress · no new work accepted | → shutdown |
| `shutdown` | All resources released | → initializing (restart) |
| `failed` | Boot failure · requires intervention | → initializing (retry) |

## 2.6 Platform Capabilities

| Capability | Phase 1 | Phase 2 | Phase 3 |
|------------|:-------:|:-------:|:-------:|
| Multi-tenant runtime | ✅ | ✅ | ✅ |
| Multi-brand context | ✅ | ✅ | ✅ |
| Agent orchestration (10) | ✅ | — | — |
| Agent orchestration (14) | — | ✅ | ✅ |
| Knowledge retrieval | ✅ | ✅ | ✅ |
| Publish pipeline | ✅ | ✅ | ✅ |
| Background workers | ✅ | ✅ | ✅ |
| Standalone deployment | — | — | ✅ |
| Horizontal scaling | — | Partial | ✅ |

---

# 3. Runtime Architecture

## 3.1 Application Boot

Aurora boot is triggered by ORION platform initialization — not independently. The boot entry point is invoked when the ORION composition root completes domain module wiring.

| Boot Trigger | Entry Point | Context |
|--------------|-------------|---------|
| ORION server start | `initializeAuroraModule()` | Production |
| Test suite | `createAuroraWiring(testConfig)` | Test |
| Operational certification | `createAuroraWiring()` + verify | P-011 pattern |
| Development | Lazy init on first `/aurora` request | Dev |

## 3.2 Startup Sequence

```
Phase 0 — ORION Platform Ready
    ↓
Phase 1 — Configuration Load
    ├── Aurora environment variables
    ├── Tenant tier defaults
    ├── Feature flags
    └── Integration credentials (secrets vault)
    ↓
Phase 2 — Infrastructure Connect
    ├── PostgreSQL pool (Aurora schemas)
    ├── Redis connection
    ├── pgvector index verification
    └── Object storage client
    ↓
Phase 3 — Persistence Layer
    ├── AuroraPlatformBacking
    ├── createAuroraStore()
    └── Repository instances (all domains)
    ↓
Phase 4 — Knowledge & Memory
    ├── KnowledgeService · GraphService
    ├── EmbeddingService (index warm)
    ├── MemoryService (Redis + PostgreSQL)
    └── KnowledgeRetrievalService
    ↓
Phase 5 — Core Services
    ├── ApprovalEngine
    ├── AuroraEventPublisher
    ├── ConnectorRegistry (register connectors)
    └── Notification bindings
    ↓
Phase 6 — Domain Module Services
    ├── Admin · Marketing · Content · Media
    ├── SEO · Social · Ads · Email · Messaging
    ├── Analytics · Knowledge · Automation
    └── (ordered by dependency — §5)
    ↓
Phase 7 — Agent Runtime
    ├── AgentRegistry
    ├── AgentContextAssembler
    ├── AgentMemoryStore
    ├── Register agents (Phase 1: 10)
    └── AgentOrchestrator
    ↓
Phase 8 — Execution Infrastructure
    ├── PublishPipeline
    ├── WorkflowEngine
    ├── SchedulerService
    ├── QueueManager (start workers)
    └── RetryManager · CircuitBreaker registry
    ↓
Phase 9 — Facade & Integration
    ├── AuroraFacade (compose all services)
    ├── auroraExecutiveProvider → ORION registry
    ├── registerAuroraSubscribers(eventBus)
    └── Search index registration
    ↓
Phase 10 — Verification
    ├── Health check all modules
    ├── Agent registry completeness
    ├── Integration connectivity probe
    ├── Register EnterpriseReadinessService probe
    └── State → ready
```

### Startup Timing Targets

| Phase | Target Duration | Failure Action |
|-------|:---------------:|----------------|
| 1 — Configuration | < 100ms | Abort · failed |
| 2 — Infrastructure | < 2s | Retry 3× · then failed |
| 3 — Persistence | < 1s | Retry 3× · then failed |
| 4 — Knowledge/Memory | < 3s | Degraded (no semantic search) |
| 5 — Core Services | < 500ms | Abort · failed |
| 6 — Domain Modules | < 1s | Partial degraded |
| 7 — Agent Runtime | < 500ms | Abort · failed |
| 8 — Execution Infra | < 1s | Degraded (no background jobs) |
| 9 — Facade/Integration | < 500ms | Degraded (no Executive Brief) |
| 10 — Verification | < 2s | Degraded or failed |
| **Total** | **< 12s** | |

## 3.3 Initialization Rules

| Rule | Description |
|------|-------------|
| **INIT-1** | Phases execute sequentially — no parallel init across phases |
| **INIT-2** | Within Phase 6, modules init in dependency order (§5.3) |
| **INIT-3** | Failed non-critical module → degraded · not abort |
| **INIT-4** | Failed critical module (Facade · Orchestrator · Store) → abort |
| **INIT-5** | Init is idempotent — safe to call twice |
| **INIT-6** | All init steps logged with phase · duration · outcome |

## 3.4 Module Loading

Modules are not dynamically loaded plugins — they are **compile-time registered** services initialized in dependency order. Each module exposes:

```typescript
interface AuroraModuleRuntime {
  readonly moduleKey: string;
  readonly dependencies: readonly string[];
  initialize(wiring: AuroraWiringContext): Promise<ModuleInitResult>;
  healthCheck(): Promise<HealthStatus>;
  shutdown(): Promise<void>;
}
```

## 3.5 Agent Registration

Agents register with AgentRegistry during Phase 7:

| Step | Action |
|------|--------|
| 1 | Instantiate agent class with DI dependencies |
| 2 | Verify agent implements AuroraAgent interface |
| 3 | Load prompt template from PromptRegistry |
| 4 | Register capabilities and authority tier |
| 5 | Register with AgentOrchestrator routing table |
| 6 | Log registration · increment agent count metric |

## 3.6 Configuration

| Config Source | Priority | Examples |
|---------------|:--------:|---------|
| Environment variables | 1 (highest) | `AURORA_REDIS_URL` · `AURORA_AI_PROVIDER` |
| Tenant configuration | 2 | Tier limits · approval policies |
| Feature flags | 3 | Phase 2 agents enabled |
| Defaults (constants) | 4 (lowest) | Token budgets · retry counts |

### Required Configuration

| Variable | Required | Default | Phase |
|----------|:--------:|---------|-------|
| `AURORA_ENABLED` | Yes | `false` | 1 |
| `AURORA_REDIS_URL` | Phase 1+ | — | 1 |
| `AURORA_STORAGE_BUCKET` | Phase 1+ | — | 1 |
| PostgreSQL (via ORION) | Yes | ORION config | 1 |
| `AURORA_AI_PROVIDER` | Yes | ORION default | 1 |
| `AURORA_MAX_AGENT_TOKENS` | No | 50000/tenant/day | 1 |

## 3.7 Runtime Context

Every Aurora operation executes within `AuroraRuntimeContext`:

```typescript
interface AuroraRuntimeContext {
  // Identity (from ORION session)
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: readonly AuroraRole[];

  // Brand scope
  readonly brandId: string;
  readonly businessId: string;

  // Locale
  readonly locale: string;
  readonly timezone: string;

  // Tracing
  readonly requestId: string;
  readonly correlationId: string;
  readonly sessionId?: string;

  // Runtime state
  readonly platformState: PlatformLifecycleState;
  readonly featureFlags: Readonly<Record<string, boolean>>;
}
```

### Context Propagation

| Boundary | Context Source |
|----------|---------------|
| HTTP API request | ORION middleware → session → AuroraContextFactory |
| Server Component | Session + URL brand param |
| Background job | Job payload carries tenantId · brandId |
| Agent invocation | Inherited from initiating request |
| Event handler | Event metadata `_meta.tenantId` · `_meta.brandId` |
| Scheduled task | Schedule entry stores tenant · brand scope |

## 3.8 Shutdown Sequence

```
Shutdown signal (SIGTERM · ORION shutdown · admin command)
    ↓
State → draining
    ↓
1. Stop accepting new API requests (Aurora routes return 503)
    ↓
2. Stop SchedulerService (no new scheduled tasks)
    ↓
3. QueueManager: stop accepting new jobs
    ↓
4. Drain in-flight publish jobs (timeout: 30s)
    ↓
5. Drain in-flight agent sessions (timeout: 15s)
    ↓
6. Drain in-flight queue jobs (timeout: 30s)
    ↓
7. Flush AgentMemoryStore (working memory → persistence)
    ↓
8. Shutdown domain module services (reverse dependency order)
    ↓
9. Shutdown AgentOrchestrator
    ↓
10. Shutdown ConnectorRegistry (close OAuth refresh timers)
    ↓
11. Close Redis connections
    ↓
12. PlatformStore shutdown (via ORION)
    ↓
State → shutdown
    ↓
Log shutdown completion · duration · drained job counts
```

### Shutdown Rules

| Rule | Description |
|------|-------------|
| **SHUT-1** | Shutdown is graceful — in-flight work drained before exit |
| **SHUT-2** | Timeouts prevent infinite drain — force-cancel with audit |
| **SHUT-3** | Shutdown is idempotent |
| **SHUT-4** | Partial shutdown failure logged · best-effort continue |
| **SHUT-5** | Warm restart supported — shutdown → boot preserves PostgreSQL state |

## 3.9 Recovery

| Scenario | Recovery Procedure | RTO Target |
|----------|-------------------|:----------:|
| **Process crash** | ORION restart → Aurora boot sequence | < 30s |
| **Warm restart** | Shutdown → boot · PostgreSQL hydration | < 15s |
| **Redis loss** | Boot without cache · rebuild session cache | < 12s |
| **PostgreSQL reconnect** | PlatformStoreFactory reconnect · repository rehydrate | < 10s |
| **Agent failure mid-task** | Retry 1× · escalate to human · audit | < 5s |
| **Integration outage** | Circuit breaker open · degraded mode | Immediate |
| **Partial module failure** | Degraded state · other modules operational | Immediate |

### Warm Restart Verification (ORION P-011.2 Pattern)

Aurora adopts ORION's operational certification pattern:

1. Seed data via Facade operations
2. `wiring.shutdown()`
3. `createAuroraWiring()` — new composition root
4. Verify repositories rehydrated from PostgreSQL
5. Verify agent registry restored
6. Verify scheduled jobs re-queued

---

# 4. Composition Root

## 4.1 AuroraFacade

`AuroraFacade` is the **only public entry point** for all Aurora domain operations (RP-1). External consumers — API routes, Server Components, ORION integrations, tests — interact exclusively through the Facade.

### Facade Interface

```typescript
interface AuroraFoundationOperations {
  // Administration
  readonly admin: AdminOperations;
  // Domain modules
  readonly content: ContentOperations;
  readonly creative: CreativeOperations;
  readonly seo: SeoOperations;
  readonly social: SocialOperations;
  readonly ads: AdOperations;
  readonly email: EmailOperations;
  readonly whatsapp: WhatsAppOperations;
  readonly analytics: AnalyticsOperations;
  readonly knowledge: KnowledgeOperations;
  readonly planner: PlannerOperations;
  // AI Workforce
  readonly agents: AgentOperations;
  // Execution
  readonly publish: PublishOperations;
  readonly approval: ApprovalOperations;
  // Platform
  readonly health: AuroraHealthOperations;
}
```

### Facade Rules

| Rule | Description |
|------|-------------|
| **FAC-1** | Facade methods accept `AuroraRuntimeContext` as first parameter |
| **FAC-2** | Facade delegates to domain services — contains no business logic |
| **FAC-3** | Facade never exposed to agents directly — agents use AgentOrchestrator |
| **FAC-4** | Repositories never exposed through Facade |
| **FAC-5** | Facade instance is singleton per wiring (per process) |

## 4.2 createAuroraWiring()

The sole composition root (RP-2). Mirrors `createHcmWiring()` · `createCrmWiring()` patterns.

```typescript
function createAuroraWiring(config: AuroraWiringConfig): AuroraWiring;
```

### AuroraWiring Return Type

```typescript
interface AuroraWiring {
  readonly facade: AuroraFacade;
  readonly orchestrator: AgentOrchestrator;
  readonly publishPipeline: PublishPipeline;
  readonly eventPublisher: AuroraEventPublisher;
  readonly executiveProvider: AuroraExecutiveProvider;
  readonly connectorRegistry: ConnectorRegistry;
  readonly queueManager: QueueManager;
  readonly scheduler: SchedulerService;
  readonly lifecycle: PlatformLifecycleState;
  readonly shutdown: () => Promise<void>;
  readonly healthCheck: () => Promise<AuroraHealthReport>;
}
```

## 4.3 Dependency Injection Graph

```
AuroraWiringConfig
    │
    ├── PlatformStore (ORION)
    ├── EventBus (ORION)
    ├── AIProvider (ORION)
    ├── NotificationService (ORION)
    ├── AuditService (ORION)
    │
    ├── AuroraPlatformBacking
    │   └── Repositories (12)
    │
    ├── KnowledgeRetrievalService ← EmbeddingService · KnowledgeService
    ├── MemoryService ← Redis
    ├── ApprovalEngine ← ApprovalRepository
    ├── AuroraEventPublisher ← EventBus
    │
    ├── Domain Services (20+) ← Repositories · EventPublisher · Approval
    │
    ├── AgentOrchestrator ← AIProvider · ContextAssembler · MemoryStore
    │   └── Agents (10-14)
    │
    ├── PublishPipeline ← ConnectorRegistry · EventPublisher
    ├── WorkflowEngine ← QueueManager
    ├── SchedulerService ← QueueManager
    ├── QueueManager ← Redis
    │
    ├── AuroraFacade ← All domain services · Orchestrator · Publish
    └── auroraExecutiveProvider ← Facade · AnalyticsService
```

## 4.4 Factory Pattern

| Factory | Purpose | Test Support |
|---------|---------|--------------|
| `createAuroraWiring(config)` | Full production wiring | `AuroraWiringConfig` overrides |
| `createAuroraPersistenceWiring(config)` | Repository layer only | In-memory store |
| `createAuroraAgentWiring(config)` | Agent subsystem | Mock AI provider |
| `createAuroraIntegrationWiring(config)` | Connectors only | Mock connectors |
| `createTestAuroraWiring(overrides?)` | Full wiring with test defaults | All mocks |

## 4.5 Service Registration

All services instantiated within `createAuroraWiring()` — **no global singletons** · **no service locator**.

| Registration Order | Service Category | Count |
|:------------------:|-----------------|:-----:|
| 1 | Infrastructure connections | 3 |
| 2 | Repositories | 12 |
| 3 | Knowledge & Memory services | 6 |
| 4 | Core platform services | 5 |
| 5 | Domain services | 22 |
| 6 | Agent subsystem | 12 |
| 7 | Execution infrastructure | 6 |
| 8 | Facade + integrations | 3 |
| **Total** | | **~69** |

## 4.6 Provider Registry

| Registry | Location | Registration At |
|----------|----------|:---------------:|
| **AgentRegistry** | `lib/aurora/agents/AgentRegistry.ts` | Phase 7 |
| **ConnectorRegistry** | `lib/aurora/integrations/registry/` | Phase 5 |
| **PromptRegistry** | `lib/aurora/agents/prompts/` | Phase 7 |
| **CircuitBreakerRegistry** | `lib/aurora/infrastructure/` | Phase 8 |
| **ORION ExecutiveProvider Registry** | `lib/intelligence/register-executive-providers.ts` | Phase 9 |

## 4.7 Lifecycle Management

| Lifecycle Event | Handler | Action |
|-----------------|---------|--------|
| `onReady` | All modules | Enable request processing |
| `onDegraded` | Observability | Alert · reduce non-critical workers |
| `onDrain` | QueueManager | Stop new jobs · drain in-flight |
| `onShutdown` | All services | Release resources in reverse order |
| `onRestart` | createAuroraWiring | Full re-initialization |

---

# 5. Module Runtime

## 5.1 Module Registry

| # | Module | Key | Service | Phase |
|---|--------|-----|---------|-------|
| 1 | Administration | `admin` | TenantService · BrandService | 1 |
| 2 | Knowledge | `knowledge` | KnowledgeService · RetrievalService | 1 |
| 3 | Memory | `memory` | MemoryService · LearningService | 1 |
| 4 | Content | `content` | ContentService · GenerationService | 1 |
| 5 | SEO | `seo` | KeywordService · SeoAuditService | 1 |
| 6 | Creative | `creative` | CreativeService · AssetStorageService | 1 |
| 7 | Campaign | `campaign` | CampaignService · PlannerService · BudgetService | 1 |
| 8 | Analytics | `analytics` | AnalyticsIngestion · Report · HealthService | 1 |
| 9 | Social | `social` | SocialPostService · ScheduleService | 1 |
| 10 | Advertising | `ads` | AdCampaignService · BidOptimizationService | 2 |
| 11 | Email | `email` | EmailCampaignService · ListService | 2 |
| 12 | Automation | `automation` | WorkflowService · PublishPipeline | 1 |
| 13 | Executive | `executive` | auroraExecutiveProvider | 1 |

## 5.2 Module Initialization Order

```
Tier 0 — Foundation (no Aurora dependencies)
    admin
    ↓
Tier 1 — Intelligence Layer
    knowledge → memory
    ↓
Tier 2 — Content Layer (depends on knowledge)
    content → seo → creative
    ↓
Tier 3 — Campaign Layer (depends on content)
    campaign → analytics
    ↓
Tier 4 — Channel Layer (depends on campaign + content)
    social → ads → email
    ↓
Tier 5 — Execution Layer (depends on all above)
    automation
    ↓
Tier 6 — Integration Layer
    executive
```

## 5.3 Module Dependencies

| Module | Depends On | Provides To |
|--------|-----------|-------------|
| **admin** | ORION Identity · PlatformStore | All modules (brand context) |
| **knowledge** | admin · PlatformStore · pgvector | All agents · content · seo |
| **memory** | admin · Redis · PlatformStore | agents · knowledge · learning |
| **content** | knowledge · memory · agents | social · email · campaign |
| **seo** | knowledge · content | content · campaign |
| **creative** | knowledge · admin (brand kit) | content · social · ads |
| **campaign** | content · analytics · admin | social · ads · automation |
| **analytics** | campaign · ORION integrations | executive · campaign · agents |
| **social** | content · creative · campaign · automation | analytics |
| **ads** | content · creative · campaign · analytics | campaign · analytics |
| **email** | content · campaign · automation | analytics |
| **automation** | approval · publish · scheduler · all content modules | social · email · ads |
| **executive** | analytics · campaign · knowledge | ORION Executive Brief |

## 5.4 Module Runtime Contract

Each module implements:

| Method | Purpose | Called When |
|--------|---------|-------------|
| `initialize(ctx)` | Wire services · verify dependencies | Boot Phase 6 |
| `healthCheck()` | Module-specific health probe | Boot Phase 10 · ongoing |
| `getMetrics()` | Module performance metrics | Observability scrape |
| `shutdown()` | Release module resources | Shutdown step 8 |

## 5.5 Module — Content Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | ContentRepository · ContentService · ContentGenerationService |
| **Agent binding** | Copywriter · Content Strategist |
| **Event subscriptions** | `aurora.content.approved` → publish queue |
| **Background jobs** | None (on-demand generation) |
| **Health check** | Repository connectivity · agent availability |
| **Degraded mode** | Read-only content · no AI generation |

## 5.6 Module — SEO Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | SeoRepository · KeywordService · SeoAuditService · RankTrackingService |
| **Agent binding** | SEO Specialist |
| **Scheduled jobs** | Weekly rank check · monthly audit |
| **Integration deps** | Google Search Console (Phase 1) |
| **Health check** | Integration connectivity · keyword count |

## 5.7 Module — Campaign Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | CampaignRepository · CampaignService · BudgetService · PlannerService |
| **Agent binding** | Campaign Manager · Marketing Director |
| **Event subscriptions** | Campaign lifecycle events |
| **Background jobs** | Budget pacing check (hourly) · KPI monitor |
| **Health check** | Active campaign count · budget service |

## 5.8 Module — Advertising Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | AdCampaignRepository · AdCampaignService · BidOptimizationService |
| **Agent binding** | Advertising Manager · Campaign Optimizer |
| **Scheduled jobs** | Performance sync (hourly) · optimization cycle |
| **Integration deps** | Google Ads · Meta Ads (Phase 2) |
| **Health check** | Integration connectivity · active ad campaigns |

## 5.9 Module — Creative Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | CreativeRepository · CreativeService · AssetStorageService · BrandKitService |
| **Agent binding** | Creative Director |
| **Storage deps** | S3-compatible object storage |
| **Health check** | Storage connectivity · asset count |

## 5.10 Module — Analytics Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | AnalyticsRepository · IngestionService · ReportService · MarketingHealthService |
| **Agent binding** | Analytics Manager |
| **Scheduled jobs** | Metric ingestion (daily) · health score calculation (daily) |
| **Health check** | Data freshness · ingestion lag |

## 5.11 Module — Knowledge Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | All knowledge services (§A-004 §2.3) |
| **Agent binding** | Knowledge Manager |
| **Scheduled jobs** | Staleness check (daily) · consolidation (bi-weekly) |
| **Health check** | Entity count · embedding index · retrieval latency |

## 5.12 Module — Memory Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | MemoryService · Redis connection · all memory repositories |
| **Scheduled jobs** | Expiration purge (daily) · consolidation (bi-weekly) |
| **Health check** | Redis connectivity · memory tier counts |

## 5.13 Module — Automation Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | WorkflowService · PublishPipeline · ScheduleService · QueueManager workers |
| **Execution services** | PublishPipeline · ScheduleEngine · EmailSender |
| **Background workers** | Publish worker · schedule worker · sync worker |
| **Health check** | Queue depth · worker count · failed job rate |

## 5.14 Module — Executive Runtime

| Aspect | Specification |
|--------|---------------|
| **Init** | auroraExecutiveProvider registration |
| **Agent binding** | Executive Advisor |
| **Scheduled jobs** | Weekly briefing generation |
| **ORION deps** | Executive Provider Registry · Intelligence Bus |
| **Health check** | Provider registration verified · last brief timestamp |

---

# 6. Agent Runtime

## 6.1 Agent Registry

| Phase | Agents Registered | Count |
|-------|------------------|:-----:|
| Phase 1 boot | director · advisor · strategist · copywriter · creative · seo · analytics · ads · campaign · social | 10 |
| Phase 2 boot | + knowledge · brand_intel · cx · sales_intel | 14 |

### Registration Record

```typescript
interface AgentRegistration {
  readonly codename: string;
  readonly agent: AuroraAgent;
  readonly promptVersion: string;
  readonly capabilities: readonly string[];
  readonly authorityTier: AgentAuthorityTier;
  readonly departmentHead?: string;
  readonly phase: 1 | 2;
  readonly healthCheck: () => Promise<AgentHealthStatus>;
}
```

## 6.2 Agent Discovery

| Discovery Method | Use Case |
|-----------------|----------|
| **By codename** | Direct invocation: `orchestrator.invoke('agent.copywriter', task)` |
| **By capability** | Auto-routing: `orchestrator.route({ type: 'content.generate' })` |
| **By task type** | Task routing table (A-003 §6.4) |
| **By department** | Marketing Director delegation |

## 6.3 Agent Lifecycle

```
Registered (boot)
    ↓
Idle (awaiting task)
    ↓
Context Assembly (retrieval pre-flight — mandatory)
    ↓
Executing (LLM inference + guardrails)
    ↓
Output Validation (brand safety · PII · format)
    ↓
Decision Engine (confidence · risk · approval)
    ↓
    ├── Tier 0-1 → Complete (return output)
    ├── Tier 2 → Approval Gate → Complete/Rejected
    └── Tier 3 → Guardrail Check → Execute/Block
    ↓
Memory Write (session · learning signal)
    ↓
Audit Log
    ↓
Idle
```

## 6.4 Task Scheduling

| Schedule Type | Trigger | Executor |
|---------------|---------|----------|
| **On-demand** | User request · API call | AgentOrchestrator (sync) |
| **Event-driven** | Aurora event · ORION event | EventDispatcher → Orchestrator |
| **Cron** | SchedulerService | QueueManager → Orchestrator |
| **Agent-initiated** | Agent handoff (`handoffTo`) | Orchestrator (chained) |

### Scheduled Agent Tasks

| Agent | Schedule | Task |
|-------|----------|------|
| Marketing Director | Daily 07:00 | Daily briefing assembly |
| SEO Specialist | Weekly Mon 06:00 | Rank check |
| SEO Specialist | Monthly 1st | SEO audit |
| Analytics Manager | Daily 06:00 | Metric ingestion |
| Analytics Manager | Daily 18:00 | Health score calculation |
| Knowledge Manager | Daily 08:00 | Staleness review |
| Campaign Manager | Hourly | Budget pacing check |
| Executive Advisor | Weekly Mon 07:30 | Executive briefing |
| Brand Intelligence Manager | Weekly Wed | Competitor scan |

## 6.5 Execution Context

Agent execution context is immutable once assembled:

| Context Layer | Source | Max Tokens |
|---------------|--------|:----------:|
| Runtime context | AuroraRuntimeContext | — |
| Brand knowledge | KnowledgeRetrievalService | 600 |
| Task knowledge | Domain-specific retrieval | 800 |
| Campaign context | Campaign Memory + Knowledge | 400 |
| Graph entities | KnowledgeGraphService | 500 |
| Learning preferences | Brand Memory + Learning Memory | 300 |
| Session history | Session Memory | 400 |
| Agent constraints | Decision Engine + tenant config | — |

## 6.6 Agent Health

| Check | Frequency | Failure Action |
|-------|-----------|----------------|
| Agent registered | Boot | Abort boot |
| Prompt template loaded | Boot | Abort boot |
| AI provider reachable | Boot + every 5min | Degraded |
| Last invocation < 24h (scheduled agents) | Hourly | Alert |
| Error rate < 5% (rolling 1h) | Continuous | Alert · circuit break |
| Token budget not exceeded | Per invocation | Block · notify admin |

## 6.7 Background Processing

| Worker | Queue | Concurrency | Priority |
|--------|-------|:-----------:|:--------:|
| **Agent worker** | `aurora:agent:tasks` | 10 | High |
| **Publish worker** | `aurora:publish:jobs` | 5 | High |
| **Schedule worker** | `aurora:schedule:tasks` | 3 | Medium |
| **Sync worker** | `aurora:sync:integrations` | 2 | Low |
| **Learning worker** | `aurora:learning:consolidation` | 1 | Low |
| **Report worker** | `aurora:reports:generate` | 2 | Low |

## 6.8 Agent Recovery

| Failure | Recovery |
|---------|----------|
| LLM timeout | Retry 1× with reduced context · then fail with audit |
| LLM rate limit | Backoff · queue retry · alert if persistent |
| Guardrail rejection | Return rejection reason · no retry |
| Context assembly failure | Proceed with session memory only · flag low confidence |
| Agent exception | Log · audit · notify · return error to caller |
| Orchestrator failure | Circuit break agent · route to Marketing Director |

---

# 7. Runtime Infrastructure

## 7.1 Scheduler

| Field | Specification |
|-------|---------------|
| **Implementation** | SchedulerService + Redis sorted sets |
| **Precision** | ± 30 seconds |
| **Timezone** | Per-brand timezone from RuntimeContext |
| **Persistence** | PostgreSQL `aurora_schedule` table |
| **Recovery** | On boot: scan missed schedules · re-queue |

### Scheduler Rules

- Schedules tied to approved content only (unless auto-approve configured)
- Missed schedules (> 1 hour late) flagged · not auto-executed
- Emergency stop cancels all pending schedules immediately

## 7.2 Queue Manager

| Field | Specification |
|-------|---------------|
| **Implementation** | Bull/BullMQ on Redis |
| **Queues** | 6 named queues (§6.7) |
| **Retry** | Via RetryManager (§7.7) |
| **Monitoring** | Queue depth · processing rate · failure rate |
| **Dead letter** | Failed jobs after max retries → DLQ · alert |

## 7.3 Event Dispatcher

| Field | Specification |
|-------|---------------|
| **Implementation** | AuroraEventPublisher + ORION EventBus |
| **Pattern** | Publish-subscribe · at-least-once |
| **Handlers** | Registered via `registerAuroraSubscribers()` at boot |
| **Ordering** | No ordering guarantee · handlers must be idempotent |
| **Async** | Event handlers execute via QueueManager (non-blocking) |

### Event Handler Registry

| Event | Handler | Queue |
|-------|---------|-------|
| `aurora.content.approved` | `onContentApproved` | publish |
| `aurora.campaign.completed` | `onCampaignCompleted` | learning |
| `aurora.analytics.snapshot` | `onAnalyticsSnapshot` | agent |
| `aurora.approval.requested` | `onApprovalRequested` | notification |
| `aurora.publish.failed` | `onPublishFailed` | notification |

## 7.4 Workflow Engine

| Field | Specification |
|-------|---------------|
| **Purpose** | Multi-step automation rules |
| **Trigger types** | Event · schedule · manual · agent recommendation |
| **Step types** | Agent invoke · approval · publish · notify · wait · condition |
| **State** | PostgreSQL `aurora_workflow` + `aurora_workflow_execution` |
| **Concurrency** | One active execution per workflow instance |

## 7.5 Notification Engine

| Field | Specification |
|-------|---------------|
| **Implementation** | ORION NotificationService bindings |
| **Templates** | 8 Aurora notification templates (A-002 §8.5) |
| **Channels** | In-app · email · push (enterprise) |
| **Rate limit** | 100 notifications/user/hour |
| **Priority** | Critical · high · normal · low |

## 7.6 Background Workers

| Worker Lifecycle | Description |
|-----------------|-------------|
| **Start** | QueueManager.startWorkers() in Phase 8 |
| **Poll** | Blocking pop from Redis queue |
| **Execute** | Delegate to appropriate service |
| **Complete** | Ack job · emit metrics |
| **Fail** | Retry via RetryManager · DLQ on exhaustion |
| **Stop** | Graceful on shutdown · drain in-flight |

## 7.7 Retry Manager

| Policy | Max Retries | Backoff | Applicable To |
|--------|:-----------:|---------|---------------|
| **Agent LLM call** | 1 | Immediate | AgentOrchestrator |
| **Publish job** | 3 | Exponential 5s·30s·120s | PublishPipeline |
| **Integration sync** | 3 | Exponential 30s·120s·600s | Connectors |
| **Event handler** | 2 | Fixed 10s | EventDispatcher |
| **Embedding generation** | 2 | Fixed 5s | EmbeddingService |
| **Report generation** | 1 | Fixed 30s | Report worker |

## 7.8 Circuit Breaker

| Integration | Failure Threshold | Open Duration | Half-Open Test |
|-------------|:-----------------:|:-------------:|:--------------:|
| Google APIs | 5 failures / 1min | 60s | 1 request |
| Meta APIs | 5 failures / 1min | 60s | 1 request |
| LLM Provider | 3 failures / 30s | 30s | 1 request |
| Redis | 3 failures / 10s | 15s | 1 ping |
| PostgreSQL | 3 failures / 10s | 30s | 1 query |
| Object Storage | 3 failures / 30s | 60s | 1 head request |

### Circuit Breaker States

```
Closed (normal) → Open (failures exceeded) → Half-Open (test) → Closed/Open
```

When open: operations fail fast with `AURORA_ERR_5030` · degraded mode activated.

---

# 8. Observability

## 8.1 Health Checks

| Probe | Endpoint | Frequency | Pass Criteria |
|-------|----------|-----------|---------------|
| **Aurora platform** | `/api/aurora/health` | 30s | lifecycle = ready |
| **Module health** | Internal | 60s | All modules pass |
| **Agent health** | Internal | 300s | All registered agents pass |
| **Integration health** | Internal | 900s | Connectors reachable |
| **Queue health** | Internal | 60s | Workers active · DLQ < 10 |
| **Knowledge health** | Internal | 3600s | Retrieval latency < 500ms |

### Aurora Health Report

```typescript
interface AuroraHealthReport {
  readonly lifecycle: PlatformLifecycleState;
  readonly modules: Record<string, HealthStatus>;
  readonly agents: Record<string, AgentHealthStatus>;
  readonly integrations: Record<string, HealthStatus>;
  readonly queues: Record<string, QueueHealthStatus>;
  readonly knowledge: { entityCount: number; retrievalLatencyP95: number };
  readonly uptime: number;
  readonly degradedReasons: readonly string[];
}
```

## 8.2 Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `aurora_platform_lifecycle` | Gauge | state |
| `aurora_module_health` | Gauge | module |
| `aurora_agent_invocations_total` | Counter | agent · status |
| `aurora_agent_latency_seconds` | Histogram | agent |
| `aurora_agent_tokens_total` | Counter | agent · tenant |
| `aurora_publish_jobs_total` | Counter | channel · status |
| `aurora_queue_depth` | Gauge | queue |
| `aurora_queue_processing_seconds` | Histogram | queue |
| `aurora_retrieval_latency_seconds` | Histogram | domain |
| `aurora_circuit_breaker_state` | Gauge | integration |
| `aurora_api_requests_total` | Counter | route · status |
| `aurora_api_latency_seconds` | Histogram | route |

## 8.3 Logging

| Field | Standard |
|-------|----------|
| **Format** | Structured JSON |
| **Correlation** | `requestId` · `correlationId` · `tenantId` on every log |
| **Levels** | error · warn · info · debug |
| **Agent logs** | `agentCodename` · `confidence` · `tokensUsed` · no full prompts |
| **PII** | Never logged · masked in debug |
| **Retention** | 30 days (starter) · 90 days (enterprise) |

## 8.4 Tracing

| Span | Parent | Attributes |
|------|--------|------------|
| `aurora.request` | HTTP span | route · tenant · brand |
| `aurora.facade.operation` | request | operation · module |
| `aurora.service.method` | facade | service · method |
| `aurora.agent.invoke` | service | agent · task · confidence |
| `aurora.retrieval` | agent | domains · entityCount · latency |
| `aurora.publish` | service | channels · jobId |
| `aurora.integration.call` | service | provider · endpoint |

## 8.5 Performance Targets

| Operation | p50 | p95 | p99 |
|-----------|:---:|:---:|:---:|
| Facade read operation | 50ms | 200ms | 500ms |
| Facade write operation | 100ms | 500ms | 1s |
| Agent invocation | 2s | 8s | 15s |
| Knowledge retrieval | 100ms | 500ms | 1s |
| Publish job (single channel) | 1s | 5s | 10s |
| Health check | 50ms | 200ms | 500ms |
| Platform boot | — | 12s | 20s |
| Platform shutdown | — | 30s | 60s |

## 8.6 Diagnostics

| Diagnostic | Command/Endpoint | Purpose |
|------------|-----------------|---------|
| Platform state | `/api/aurora/health` | Lifecycle · module status |
| Agent registry | `/api/aurora/agents` (admin) | Registered agents · last invocation |
| Queue status | Internal metrics | Depth · DLQ · worker count |
| Knowledge stats | Internal metrics | Entity count · freshness · gaps |
| Integration status | `/api/aurora/integrations` | Connected · last sync · circuit state |
| Wiring graph | Test utility | DI graph verification |

## 8.7 Operational Dashboard

| Panel | Data Source | Audience |
|-------|------------|----------|
| Platform lifecycle | Health probe | DevOps |
| Module health matrix | Module health checks | Engineering |
| Agent activity | Agent metrics | AI team |
| Queue depth & throughput | QueueManager metrics | DevOps |
| Publish success rate | PublishPipeline metrics | Operations |
| Integration status | ConnectorRegistry | DevOps |
| Token usage by tenant | Agent metrics | Finance · admin |
| Knowledge freshness | KnowledgeService | Knowledge Manager |

## 8.8 Alerting

| Alert | Condition | Severity | Channel |
|-------|-----------|:--------:|---------|
| Platform failed | lifecycle = failed | Critical | PagerDuty |
| Platform degraded > 15min | lifecycle = degraded | High | Slack · email |
| Agent error rate > 5% | Rolling 1h | High | Slack |
| Publish failure rate > 5% | Rolling 1h | High | Slack · email |
| Queue DLQ > 10 | Any queue | Medium | Slack |
| Integration circuit open > 5min | Any connector | Medium | Slack |
| Token budget > 90% | Tenant tier limit | Medium | Email to admin |
| Boot time > 20s | Startup | Low | Slack |
| Knowledge retrieval > 1s p95 | Rolling 1h | Low | Slack |

---

# 9. Enterprise Resilience

## 9.1 Failure Isolation

| Failure Domain | Isolation Boundary | Impact Scope |
|----------------|-------------------|--------------|
| **Single agent failure** | Agent circuit breaker | That agent only · others operational |
| **Single module failure** | Module health gate | That module degraded · others operational |
| **Single integration failure** | Connector circuit breaker | That channel unavailable · others operational |
| **Single tenant overload** | Rate limiting · token budget | That tenant throttled · others unaffected |
| **Redis failure** | Graceful degradation | No session cache · no queues · sync-only mode |
| **PostgreSQL failure** | Platform abort | Aurora unavailable · ORION may continue |
| **LLM provider failure** | Provider failover | Secondary provider · or no AI generation |

## 9.2 Retry Policies

Consolidated from §7.7 with enterprise overrides:

| Operation | Retries | Backoff | Idempotent | DLQ |
|-----------|:-------:|---------|:----------:|:---:|
| Agent LLM | 1 | Immediate | Yes | No |
| Publish | 3 | Exponential | Yes | Yes |
| Integration sync | 3 | Exponential | Yes | Yes |
| Event handler | 2 | Fixed 10s | Required | Yes |
| Approval notification | 3 | Fixed 30s | Yes | Yes |
| Embedding | 2 | Fixed 5s | Yes | No |
| Database query | 2 | Fixed 1s | Read: yes · Write: conditional | No |

## 9.3 Timeouts

| Operation | Timeout | On Timeout |
|-----------|:-------:|------------|
| HTTP API request | 30s | 504 response |
| Agent invocation | 15s | Retry 1× · then fail |
| Knowledge retrieval | 2s | Degrade to session memory |
| Publish (per channel) | 10s | Mark channel failed · continue others |
| Integration API call | 15s | Circuit breaker increment |
| Database query | 5s | Retry · then fail |
| Boot phase (total) | 30s | Failed state |
| Shutdown drain (total) | 60s | Force cancel · audit |

## 9.4 Graceful Degradation

| Degraded Capability | Trigger | Fallback Behaviour |
|--------------------|---------|-----------------|
| **AI generation** | LLM unavailable | Manual content only · notify user |
| **Semantic search** | pgvector down | Keyword search only |
| **Background jobs** | Redis down | Synchronous-only mode |
| **External publish** | Integration circuit open | Queue for retry · notify user |
| **Analytics ingestion** | Integration down | Stale data with freshness warning |
| **Executive Brief** | Provider registration failed | Aurora dashboard only |
| **Notifications** | Notification service down | In-app only (if UI available) |

## 9.5 Recovery Procedures

| Scenario | Automated Recovery | Manual Intervention |
|----------|-------------------|---------------------|
| Agent crash mid-task | Retry · audit · notify | Review audit log |
| Publish partial failure | Retry failed channels · report | Manual republish |
| Queue worker crash | Worker restart by QueueManager | Check DLQ |
| Circuit breaker open | Auto half-open test | Check integration credentials |
| Boot failure | Retry boot 1× | Check config · logs |
| Data corruption | None — alert | Restore from backup |

## 9.6 State Restoration

| State | Storage | Restoration Method |
|-------|---------|-------------------|
| Domain entities | PostgreSQL | PlatformStore hydration on boot |
| Scheduled jobs | PostgreSQL + Redis | Re-scan on boot |
| In-flight publish | PostgreSQL job table | Re-queue incomplete jobs |
| Agent sessions | Redis (ephemeral) | Lost on restart — acceptable |
| Circuit breaker state | In-memory | Reset on boot — re-discover |
| Workflow executions | PostgreSQL | Resume from last checkpoint |

## 9.7 Disaster Recovery Integration

| Component | RPO | RTO | ORION Alignment |
|-----------|-----|-----|-----------------|
| PostgreSQL (Aurora tables) | 1 hour | 4 hours | Gate 7 DR target |
| Redis | N/A (ephemeral) | 12s (rebuild) | Acceptable loss |
| Object storage | 24 hours | 4 hours | S3 versioning |
| Knowledge embeddings | 24 hours | 2 hours (regenerate) | Reindex from entities |
| Configuration | 0 (git-managed) | Immediate | Environment variables |

---

# 10. ORION Integration

## 10.1 Runtime Integration Map

```
ORION Platform Boot
    ↓
PlatformStoreFactory.initialize()
Identity Service ready
Event Bus ready
    ↓
createAuroraWiring(orionConfig)
    ↓
┌─────────────────────────────────────────────┐
│ Aurora Runtime                               │
│  ├── Uses: PlatformStore (persistence)       │
│  ├── Uses: Identity (auth context)           │
│  ├── Uses: EventBus (aurora.* events)        │
│  ├── Uses: AIProvider (agent LLM)            │
│  ├── Uses: Notifications (alerts)            │
│  ├── Uses: Search (entity indexing)          │
│  ├── Uses: Audit (agent · knowledge audit)   │
│  ├── Registers: auroraExecutiveProvider       │
│  ├── Registers: EnterpriseReadiness probe    │
│  ├── Consumes: CRM events (Phase 2)          │
│  ├── Consumes: Finance events (Phase 2)      │
│  └── Publishes: aurora.analytics.snapshot    │
└─────────────────────────────────────────────┘
```

## 10.2 Identity Integration

| Runtime Point | ORION Service | Aurora Usage |
|---------------|--------------|--------------|
| HTTP middleware | Session validation | Extract tenant · user · roles |
| AuroraContextFactory | Session → AuroraRuntimeContext | Brand scope resolution |
| Agent service accounts | ORION service identity | Agent audit attribution |
| RBAC enforcement | ORION permissions | Knowledge · module access |

## 10.3 PlatformStore Integration

| Aurora Entity Group | ORION Pattern | Migration |
|--------------------|--------------|-----------|
| Knowledge entities | PlatformStore entity | `aurora_*` tables |
| Memory tiers | PlatformStore entity | `aurora_memory_*` tables |
| Campaign · Content · etc. | Domain repositories | ES-010 pattern |
| Audit entries | ORION AuditStore extension | Aurora-specific fields |

## 10.4 Executive Provider Integration

| Boot Step | Action |
|-----------|--------|
| Phase 9 | Instantiate `auroraExecutiveProvider` |
| Phase 9 | Register in `register-executive-providers.ts` |
| Phase 9 | Verify registration via health check |
| Runtime | Provider contributes on `aurora.analytics.snapshot` |
| Runtime | Executive Brief card refresh on schedule |

## 10.5 Event Bus Integration

| Direction | Namespace | Count |
|-----------|-----------|:-----:|
| Aurora publishes | `aurora.*` | 42 events |
| Aurora consumes (internal) | `aurora.*` handlers | 10 handlers |
| Aurora consumes (ORION) | `crm.*` · `finance.*` | Phase 2 |
| Aurora publishes (to ORION) | `aurora.analytics.snapshot` | Executive Brief |

## 10.6 CRM Runtime Integration (Phase 2)

| Event | Aurora Handler | Action |
|-------|---------------|--------|
| `crm.lead.created` | `onCrmLeadCreated` | Customer Memory · Campaign Knowledge |
| `crm.revenue.recognized` | `onCrmRevenue` | Campaign Knowledge · Sales Intel context |

## 10.7 Finance Runtime Integration (Phase 2)

| Event | Aurora Handler | Action |
|-------|---------------|--------|
| Finance spend data | Scheduled sync | Campaign budget tracking |
| Revenue attribution | Scheduled sync | Analytics · Executive Knowledge |

## 10.8 HCM · Procurement Integration (Phase 3)

| Domain | Runtime Usage |
|--------|--------------|
| HCM Organization | Business Memory context only |
| Procurement | Industry Knowledge (if relevant) |

## 10.9 Shared Services

| ORION Service | Aurora Runtime Binding | Init Phase |
|-------------|-------------------------|:----------:|
| Search | Index Aurora entities on create/update events | 9 |
| Notification | Template bindings for 8 Aurora templates | 5 |
| Audit | Agent · knowledge · approval audit entries | 2 |
| AI Provider | AgentOrchestrator LLM calls | 7 |
| Health | Aurora probe in EnterpriseReadinessService | 10 |

---

# 11. Implementation Readiness

## 11.1 Phase 1 Runtime Deliverables

| Component | ES Spec | Priority |
|-----------|---------|:--------:|
| `createAuroraWiring()` | ES-AURORA-005 | P0 |
| `AuroraFacade` | ES-AURORA-005 | P0 |
| Platform lifecycle management | ES-AURORA-005 | P0 |
| Admin · Knowledge · Memory modules | ES-AURORA-005 | P0 |
| Content · SEO · Campaign · Analytics modules | ES-AURORA-006–009 | P0 |
| Agent runtime (10 agents) | ES-AURORA-014 | P0 |
| Publish pipeline | ES-AURORA-010 | P0 |
| Scheduler + QueueManager | ES-AURORA-005 | P0 |
| Health checks + metrics | ES-AURORA-005 | P0 |
| ORION integration (Identity · Store · Events · Provider) | ES-AURORA-015 | P0 |

## 11.2 Phase 2 Runtime Deliverables

| Component | Priority |
|-----------|:--------:|
| Advertising · Email modules | P1 |
| 4 additional agents (14 total) | P1 |
| CRM · Finance event consumers | P1 |
| Advanced observability dashboard | P2 |
| Circuit breaker for all integrations | P1 |

## 11.3 Phase 3 Runtime Deliverables

| Component | Priority |
|-----------|:--------:|
| Standalone Aurora deployment | P2 |
| Horizontal scaling · load balancing | P2 |
| Full ORION Knowledge Graph federation | P1 |
| Multi-region runtime | P2 |

## 11.4 Critical Path

```
A-005 Runtime Architecture (THIS DOCUMENT)
    ↓
ES-AURORA-005 Platform Foundation Implementation Spec
    ↓
A-006 Implementation: createAuroraWiring + AuroraFacade + lifecycle
    ↓
A-007 Implementation: Knowledge + Memory modules
    ↓
A-014 Implementation: Agent runtime
    ↓
A-006–009 Implementation: Content · SEO · Campaign · Analytics modules
    ↓
A-015 Implementation: ORION integration
    ↓
Operational certification (P-011.2 pattern for Aurora)
```

## 11.5 Dependencies

| Dependency | Owner | Aurora Impact | Status |
|------------|-------|---------------|--------|
| ORION PlatformStore | ORION Platform | Persistence | Partial (ES-010) |
| ORION Identity | ORION Platform | Auth · RBAC | Partial (ES-009) |
| ORION Event Bus | ORION Platform | Events | Partial (ES-033) |
| ORION AI Provider | ORION Intelligence | Agent LLM | Architecture only |
| PostgreSQL | Infrastructure | All persistence | Gate 7 target |
| Redis | Infrastructure | Queue · cache · session | Phase 1 required |
| pgvector | Infrastructure | Knowledge retrieval | Phase 1 required |
| Object Storage | Infrastructure | Creative assets | Phase 1 required |

## 11.6 Engineering Readiness Checklist

| # | Criterion | Status |
|---|-----------|:------:|
| 1 | Product constitution ratified (A-001) | ✅ |
| 2 | Engineering blueprint ratified (A-002) | ✅ |
| 3 | AI workforce defined (A-003) | ✅ |
| 4 | Knowledge & memory defined (A-004) | ✅ |
| 5 | Runtime architecture defined (A-005) | ✅ |
| 6 | Composition root fully specified | ✅ |
| 7 | Module init order defined | ✅ |
| 8 | Agent runtime specified | ✅ |
| 9 | Infrastructure components specified | ✅ |
| 10 | Observability requirements defined | ✅ |
| 11 | Resilience patterns defined | ✅ |
| 12 | ORION integration points mapped | ✅ |
| 13 | ES-AURORA-005 authorized | ✅ |

---

# 12. Executive Closing Statement

## 12.1 Architecture Verdict

### **AURORA CORE ARCHITECTURE PHASE — COMPLETE**

| Document | Status | Scope |
|----------|:------:|-------|
| A-001 Product Constitution | ✅ Ratified | Product vision · principles · modules |
| A-002 Engineering Blueprint | ✅ Ratified | Repository · layers · domains · events |
| A-003 AI Workforce Architecture | ✅ Ratified | 14 agents · collaboration · memory · learning |
| A-004 Knowledge & Memory Architecture | ✅ Ratified | Knowledge graph · 10 memory tiers · retrieval |
| A-005 Platform Foundation & Runtime | ✅ Ratified | Boot · compose · execute · observe · recover |

Five constitutional documents. One complete architecture. Zero implementation — by design.

Implementation planning is now **authorized**.

## 12.2 Runtime Readiness

| Dimension | Assessment |
|-----------|:----------:|
| **Boot sequence** | ✅ 10 phases · deterministic · < 12s target |
| **Composition root** | ✅ Single factory · ~69 services · testable sub-wiring |
| **Module runtime** | ✅ 13 modules · tiered init · dependency graph |
| **Agent runtime** | ✅ 14 agents (phased) · lifecycle · scheduling · recovery |
| **Infrastructure** | ✅ 8 components · retry · circuit breaker |
| **Observability** | ✅ Health · metrics · logging · tracing · alerting |
| **Resilience** | ✅ Isolation · degradation · state restoration · DR |
| **ORION integration** | ✅ 9 integration points at runtime |
| **Engineering principles** | ✅ RP-1 through RP-10 enforced |

## 12.3 Approval Matrix

| Role | Decision | Date |
|------|:--------:|------|
| **Founder & Chief Architect** | ✅ APPROVED | 7 August 2026 |
| **Aurora Architecture Review Board** | ✅ APPROVED | 7 August 2026 |
| **ORION Chief Enterprise Architect** | ✅ APPROVED | 7 August 2026 |
| **DevOps / Operations Review** | ✅ APPROVED (design) | 7 August 2026 |

| Authorization | Status |
|---------------|:------:|
| Aurora Core Architecture Phase | **COMPLETE** |
| ES-AURORA-005 Platform Foundation spec | **AUTHORIZED TO DRAFT** |
| A-006+ implementation missions | **AUTHORIZED TO PLAN** |
| Operational certification harness (Aurora) | **AUTHORIZED TO DESIGN** |

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Runtime Startup Flow

```
[ORION Boot Complete]
        │
        ▼
[AURORA_ENABLED?] ──No──→ [Skip Aurora Init]
        │Yes
        ▼
[Phase 1: Load Config] ──Fail──→ [FAILED]
        │Pass
        ▼
[Phase 2: Connect Infra] ──Fail──→ [Retry 3×] ──Fail──→ [FAILED]
        │Pass
        ▼
[Phase 3: Persistence] ──Fail──→ [Retry 3×] ──Fail──→ [FAILED]
        │Pass
        ▼
[Phase 4: Knowledge/Memory] ──Fail──→ [DEGRADED]
        │Pass/Degraded
        ▼
[Phase 5: Core Services] ──Fail──→ [FAILED]
        │Pass
        ▼
[Phase 6: Domain Modules] ──Partial Fail──→ [DEGRADED]
        │Pass/Degraded
        ▼
[Phase 7: Agent Runtime] ──Fail──→ [FAILED]
        │Pass
        ▼
[Phase 8: Execution Infra] ──Fail──→ [DEGRADED]
        │Pass/Degraded
        ▼
[Phase 9: Facade/Integration] ──Partial Fail──→ [DEGRADED]
        │Pass/Degraded
        ▼
[Phase 10: Verification] ──Fail──→ [DEGRADED/FAILED]
        │
        ▼
[READY / DEGRADED]
```

## Appendix B — Shutdown Flow

```
[SIGTERM / Admin Shutdown / ORION Shutdown]
        │
        ▼
[State → DRAINING]
        │
        ▼
[Stop API requests] (503 on Aurora routes)
        │
        ▼
[Stop Scheduler] → [Stop Queue intake]
        │
        ▼
[Drain publish jobs] (30s timeout)
        │
        ▼
[Drain agent sessions] (15s timeout)
        │
        ▼
[Drain queue jobs] (30s timeout)
        │
        ▼
[Flush agent memory → persistence]
        │
        ▼
[Shutdown modules] (reverse tier order)
        │
        ▼
[Shutdown agents → connectors → Redis → Store]
        │
        ▼
[State → SHUTDOWN]
        │
        ▼
[Log: duration · drained counts · force-cancelled jobs]
```

## Appendix C — Dependency Graph

```
                    ORION Platform
                    (Store · Identity · Events · AI)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           admin      knowledge      memory
              │            │            │
              └────────┬───┴───┬────────┘
                       ▼       ▼
                   content   seo
                       │       │
                       └───┬───┘
                           ▼
                       creative
                           │
                           ▼
                       campaign
                           │
                           ▼
                      analytics
                      ╱      ╲
                     ▼        ▼
                 social      ads
                     │        │
                     └───┬────┘
                         ▼
                    automation
                         │
                         ▼
                    executive
                         │
                         ▼
                  AuroraFacade
```

## Appendix D — Module Registry

| Key | Module | Tier | Phase | Agents | Workers |
|-----|--------|:----:|:-----:|--------|---------|
| `admin` | Administration | 0 | 1 | — | — |
| `knowledge` | Knowledge | 1 | 1 | Knowledge Manager | Consolidation |
| `memory` | Memory | 1 | 1 | — | Expiration |
| `content` | Content Studio | 2 | 1 | Copywriter · Strategist | — |
| `seo` | SEO Engine | 2 | 1 | SEO Specialist | Rank check |
| `creative` | Creative Studio | 2 | 1 | Creative Director | — |
| `campaign` | Campaign/Planner | 3 | 1 | Campaign Mgr · Director | Budget pacing |
| `analytics` | Analytics | 3 | 1 | Analytics Manager | Ingestion |
| `social` | Social Media | 4 | 1 | Social Manager | — |
| `ads` | Advertising | 4 | 2 | Ads Manager | Perf sync |
| `email` | Email Marketing | 4 | 2 | Copywriter | — |
| `automation` | Automation | 5 | 1 | — | Publish · Schedule |
| `executive` | Executive | 6 | 1 | Executive Advisor | Weekly brief |

## Appendix E — Service Registry

| # | Service | Module | Layer |
|---|---------|--------|-------|
| 1 | TenantService | admin | Domain |
| 2 | BrandService | admin | Domain |
| 3 | KnowledgeService | knowledge | Domain |
| 4 | KnowledgeGraphService | knowledge | Domain |
| 5 | KnowledgeRetrievalService | knowledge | Domain |
| 6 | KnowledgeIngestionService | knowledge | Domain |
| 7 | KnowledgeValidationService | knowledge | Domain |
| 8 | EmbeddingService | knowledge | Infrastructure |
| 9 | MemoryService | memory | Domain |
| 10 | LearningService | memory | Domain |
| 11 | ContentService | content | Domain |
| 12 | ContentGenerationService | content | Domain |
| 13 | ContentVersionService | content | Domain |
| 14 | KeywordService | seo | Domain |
| 15 | SeoAuditService | seo | Domain |
| 16 | RankTrackingService | seo | Domain |
| 17 | CreativeService | creative | Domain |
| 18 | AssetStorageService | creative | Infrastructure |
| 19 | BrandKitService | creative | Domain |
| 20 | CampaignService | campaign | Domain |
| 21 | PlannerService | campaign | Domain |
| 22 | BudgetService | campaign | Domain |
| 23 | AnalyticsIngestionService | analytics | Domain |
| 24 | AnalyticsReportService | analytics | Domain |
| 25 | MarketingHealthService | analytics | Domain |
| 26 | SocialPostService | social | Domain |
| 27 | SocialScheduleService | social | Domain |
| 28 | AdCampaignService | ads | Domain |
| 29 | BidOptimizationService | ads | Domain |
| 30 | EmailCampaignService | email | Domain |
| 31 | ApprovalService | automation | Infrastructure |
| 32 | PublishPipeline | automation | Execution |
| 33 | WorkflowService | automation | Infrastructure |
| 34 | ScheduleService | automation | Infrastructure |
| 35 | AgentOrchestrator | agents | AI |
| 36 | AgentRegistry | agents | AI |
| 37 | AgentContextAssembler | agents | AI |
| 38 | AgentMemoryStore | agents | AI |
| 39 | AuroraEventPublisher | platform | Infrastructure |
| 40 | ConnectorRegistry | integrations | Infrastructure |
| 41 | QueueManager | platform | Infrastructure |
| 42 | SchedulerService | platform | Infrastructure |
| 43 | RetryManager | platform | Infrastructure |
| 44 | CircuitBreakerRegistry | platform | Infrastructure |
| 45 | AuroraFacade | platform | Facade |
| 46 | auroraExecutiveProvider | executive | Integration |

## Appendix F — Mission Register

| Mission | Title | Phase | Status |
|---------|-------|-------|--------|
| **A-001** | Aurora Constitution | Foundation | ✅ Ratified |
| **A-002** | Enterprise Engineering Blueprint | Foundation | ✅ Ratified |
| **A-003** | AI Workforce Architecture | Foundation | ✅ Ratified |
| **A-004** | Enterprise Knowledge & Memory | Foundation | ✅ Ratified |
| **A-005** | Platform Foundation & Runtime | Foundation | ✅ Ratified |
| **A-006** | Platform Foundation Implementation | 1 | Authorized |
| **A-007** | Knowledge + Memory Implementation | 1 | Planned |
| **A-008** | Content Studio Implementation | 1 | Planned |
| **A-009** | SEO Engine Implementation | 1 | Planned |
| **A-010** | Campaign + Planner Implementation | 1 | Planned |
| **A-011** | Analytics Implementation | 1 | Planned |
| **A-012** | Social Media Implementation | 1 | Planned |
| **A-013** | Google Integrations | 1 | Planned |
| **A-014** | Agent Orchestration Implementation | 1 | Planned |
| **A-015** | ORION Platform Integration | 1 | Planned |
| **A-016–A-028** | Phase 2 missions | 2 | Planned |
| **A-029–A-038** | Phase 3 missions | 3 | Planned |

**Milestone:** Aurora Core Architecture Phase (A-001–A-005) **COMPLETE**. Implementation Phase **AUTHORIZED**.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | A-005 — Aurora Platform Foundation & Runtime Architecture |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Classification** | Platform Architecture · Runtime · Core Phase Completion |
| **Next Spec** | ES-AURORA-005 — Platform Foundation Implementation |
| **Next Mission** | A-006 — Platform Foundation Implementation |

---

### Project Aurora

*Boot · Compose · Execute · Observe · Recover · Powered by ORION*

**Let's build something remarkable.**
