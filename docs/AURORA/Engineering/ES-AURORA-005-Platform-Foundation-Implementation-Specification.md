# ES-AURORA-005 — Aurora Platform Foundation Implementation Specification

**Document ID:** ES-AURORA-005  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-007 — Platform Foundation Implementation  
**Planning Mission:** A-006 — Product Backlog & Mission Breakdown  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Specification  
**Classification:** Engineering Specification · Platform Foundation · Composition Root  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Architecture Sources:** [A-005 Platform Foundation & Runtime](./A-005-Aurora-Platform-Foundation-and-Runtime-Architecture.md) · [A-006 Product Backlog](./A-006-Aurora-Product-Backlog-and-Mission-Breakdown.md)  
**Platform Parent:** [ORION Enterprise Platform v2.0](../00_FOUNDATION/ORION_CANON_v1.md) · [ES-010 Persistence Foundation](../02_Engineering/ES-010-Persistence-Foundation.md) · [ES-033 Event Messaging](../02_Engineering/ES-033-Event-Messaging-Architecture.md)  
**Effective Date:** 7 August 2026  
**Subordinate To:** A-001 · A-005 · A-005.1 · A-006

**Rule:** This document is the **authoritative engineering specification** for Aurora Platform Foundation implementation (Mission A-007). All code in `lib/aurora/` platform layer must comply with this specification. **No production implementation in this document.** **Specification only.**

**Scope Boundary:** Platform foundation · runtime · composition root · admin module · infrastructure services · health · configuration. **Excludes:** domain modules (content · SEO · campaign · etc.) · agents · integrations · UI — deferred to A-008+.

---

## Engineering Rules (Binding)

| # | Rule | Enforcement |
|---|------|-------------|
| **ER-1** | **AuroraFacade is the only public API** | Export only from `@/lib/aurora` |
| **ER-2** | **createAuroraWiring() is the sole composition root** | All DI in one factory |
| **ER-3** | **No direct provider access** | Services use ConnectorRegistry interfaces |
| **ER-4** | **No direct LLM access** | Reserved for AgentOrchestrator (A-017) |
| **ER-5** | **Business services validate** | Domain rules in service layer |
| **ER-6** | **Execution services execute** | Publish/schedule after approval (A-015) |
| **ER-7** | **Agents never modify persistence** | Agents propose via orchestrator |
| **ER-8** | **All persistence through repositories** | No raw SQL in services |
| **ER-9** | **Every service independently testable** | Constructor injection · sub-wiring |
| **ER-10** | **Every provider replaceable** | Interface + mock in tests |
| **ER-11** | **Multi-tenant by design** | `tenantId` on every operation |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Implementation Scope](#2-implementation-scope)
3. [Aurora Runtime](#3-aurora-runtime)
4. [Composition Root](#4-composition-root)
5. [Platform Services](#5-platform-services)
6. [Module Registration](#6-module-registration)
7. [Provider Architecture](#7-provider-architecture)
8. [Configuration](#8-configuration)
9. [Testing Strategy](#9-testing-strategy)
10. [Engineering Standards](#10-engineering-standards)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Executive Recommendation](#12-executive-recommendation)

**Appendices:** [A — Folder Layout](#appendix-a--folder-layout) · [B — Dependency Graph](#appendix-b--dependency-graph) · [C — Runtime Lifecycle](#appendix-c--runtime-lifecycle) · [D — Registration Matrix](#appendix-d--registration-matrix) · [E — Service Catalogue](#appendix-e--service-catalogue) · [F — Implementation Checklist](#appendix-f--implementation-checklist)

---

# Preamble

Specification without implementation discipline is wishful thinking.

A-005 defined **how Aurora runs**. A-006 defined **what to build and in what order**. ES-AURORA-005 defines **exactly how to build the platform foundation** — file by file, interface by interface, test by test.

Mission A-007 implements this specification. Every subsequent Aurora mission extends the wiring factory and facade — never replaces it.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Implementation-ready engineering specification for Aurora Platform Foundation |
| **Audience** | Platform engineers · architects · QA · DevOps |
| **Binding authority** | Mission A-007 implementation · all `lib/aurora/` platform code |
| **Deliverable type** | Engineering specification — no code in this document |

This specification answers:

- What files, interfaces, and classes constitute the platform foundation?
- How does `createAuroraWiring()` wire dependencies in exact order?
- How do boot, shutdown, recovery, and warm restart work at code level?
- What platform services are implemented in A-007 vs stubbed for later missions?
- What tests must pass before A-007 is complete?

## 1.2 Scope

### In Scope (A-007)

| Area | Implementation |
|------|----------------|
| `lib/aurora/` scaffold | Full folder structure |
| `createAuroraWiring()` | Composition root with platform services |
| `AuroraFacade` | Admin + health operations · stub groups for future modules |
| `AuroraRuntime` | Boot · shutdown · lifecycle state machine |
| Admin module | TenantService · BrandService · repositories |
| Platform infrastructure | Scheduler · Queue · Retry · CircuitBreaker · Events |
| Configuration | Environment · secrets · feature flags loader |
| Observability | Health · metrics · logging · tracing hooks |
| ORION integration hooks | PlatformStore backing · readiness probe registration |
| Tests | Wiring · lifecycle · health · admin · failure |

### Out of Scope (Deferred Missions)

| Exclusion | Mission |
|-----------|---------|
| Knowledge · Memory services | A-008 |
| Content · SEO · Campaign · Analytics · Creative · Social | A-009 – A-014 |
| AgentOrchestrator · agents | A-017 |
| PublishPipeline · WorkflowEngine (full) | A-015 |
| Connectors (Google · Meta) | A-016 |
| ORION Executive Provider | A-018 |
| UI pages | A-019 |

### Stub Strategy

Domain operation groups on `AuroraFacade` (content · seo · campaign · etc.) **must exist as typed interfaces** but return `AuroraError('AURORA_ERR_0501', 'Not implemented', 501)` until their mission completes. This ensures facade contract stability from A-007 onward.

## 1.3 Implementation Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Composition root** | `createAuroraWiring()` wires all A-007 services |
| 2 | **Public facade** | `AuroraFacade` exported from `@/lib/aurora` |
| 3 | **Deterministic boot** | 10-phase sequence · < 12s · idempotent |
| 4 | **Graceful shutdown** | Drain · flush · reverse-order teardown |
| 5 | **Warm restart** | P-011.2 verification pattern |
| 6 | **Admin module** | Tenant · brand CRUD with RLS |
| 7 | **Infrastructure** | Scheduler · queue · retry · circuit breaker |
| 8 | **Health probe** | EnterpriseReadinessService contribution |
| 9 | **Test coverage** | ≥ 80% platform layer · all acceptance tests pass |
| 10 | **Developer Preview** | v0.1.0-dp release authorized |

## 1.4 Relationship with Architecture Documents

| Document | ES-AURORA-005 Response |
|----------|------------------------|
| **A-001 Constitution** | Multi-tenant · facade-only · ORION-native enforced |
| **A-002 Blueprint** | Folder structure · naming · error patterns · layer rules |
| **A-003 AI Workforce** | AgentOrchestrator interface stubbed · registry placeholder |
| **A-004 Knowledge & Memory** | Repository backing scaffold · no knowledge services yet |
| **A-005 Runtime** | **Fully implemented** — boot phases · wiring · lifecycle |
| **A-006 Backlog** | A-007 mission deliverables · F-001–F-012 · F-180–F-186 |

## 1.5 ORION Pattern Alignment

| ORION Domain | Aurora Equivalent | Reference File |
|--------------|-------------------|----------------|
| `createHcmWiring()` | `createAuroraWiring()` | `lib/hcm/createHcmWiring.ts` |
| `createProcurementWiring()` | Persistence backing pattern | `lib/procurement/createProcurementWiring.ts` |
| `HcmFoundationFacade` | `AuroraFacade` | `lib/hcm/HcmFoundationFacade.ts` |
| `PlatformStoreFactory` | Aurora backing via `getAuroraBacking()` | `lib/platform/store/PlatformStoreFactory.ts` |
| `EnterpriseReadinessService` | Aurora readiness probe | `lib/platform/operations/EnterpriseReadinessService.ts` |

---

# 2. Implementation Scope

## 2.1 Platform Foundation

| Component | Package Path | A-007 Status |
|-----------|-------------|:------------:|
| Composition root | `lib/aurora/createAuroraWiring.ts` | Implement |
| Public export | `lib/aurora/index.ts` | Implement |
| Runtime controller | `lib/aurora/runtime/AuroraRuntime.ts` | Implement |
| Bootstrap | `lib/aurora/runtime/AuroraBootstrap.ts` | Implement |
| Shutdown | `lib/aurora/runtime/AuroraShutdown.ts` | Implement |
| Recovery | `lib/aurora/runtime/AuroraRecovery.ts` | Implement |
| Facade | `lib/aurora/AuroraFacade.ts` | Implement |
| Constants | `lib/aurora/constants.ts` | Implement |
| Types | `lib/aurora/types.ts` | Implement |
| Errors | `lib/aurora/errors/AuroraError.ts` | Implement |

## 2.2 Runtime Layer

| Component | Package Path | A-007 Status |
|-----------|-------------|:------------:|
| Runtime context | `lib/aurora/runtime/AuroraRuntimeContext.ts` | Implement |
| Context factory | `lib/aurora/runtime/AuroraContextFactory.ts` | Implement |
| Configuration | `lib/aurora/runtime/AuroraRuntimeConfiguration.ts` | Implement |
| Lifecycle state | `lib/aurora/runtime/PlatformLifecycleState.ts` | Implement |
| Module registry | `lib/aurora/runtime/AuroraModuleRegistry.ts` | Implement |
| Init orchestrator | `lib/aurora/runtime/AuroraInitOrchestrator.ts` | Implement |

## 2.3 Composition Root

| Component | Package Path | A-007 Status |
|-----------|-------------|:------------:|
| Wiring config | `lib/aurora/wiring/AuroraWiringConfig.ts` | Implement |
| Wiring types | `lib/aurora/wiring/AuroraWiring.ts` | Implement |
| Sub-factories | `lib/aurora/wiring/createTestAuroraWiring.ts` | Implement |
| Persistence wiring | `lib/aurora/wiring/createAuroraPersistenceWiring.ts` | Implement |
| Platform wiring | `lib/aurora/wiring/createAuroraPlatformWiring.ts` | Implement |

## 2.4 Persistence Layer

| Component | Package Path | A-007 Status |
|-----------|-------------|:------------:|
| Platform backing | `lib/aurora/persistence/AuroraPlatformBacking.ts` | Implement |
| Store factory | `lib/aurora/persistence/createAuroraStore.ts` | Implement |
| Admin repositories | `lib/aurora/admin/repositories/` | Implement |
| Repository factory | `lib/aurora/persistence/createAuroraRepositories.ts` | Implement |
| Postgres adapter | `lib/aurora/persistence/PostgresAuroraRepository.ts` | Implement |
| In-memory adapter | `lib/aurora/persistence/InMemoryAuroraRepository.ts` | Implement |
| Migrations | `lib/aurora/persistence/migrations/` | Implement (admin tables) |

## 2.5 Service Registry (A-007 Active Services)

| # | Service | Package | Mission |
|---|---------|---------|---------|
| 1 | TenantService | `lib/aurora/admin/services/TenantService.ts` | A-007 |
| 2 | BrandService | `lib/aurora/admin/services/BrandService.ts` | A-007 |
| 3 | ConfigurationService | `lib/aurora/platform/services/ConfigurationService.ts` | A-007 |
| 4 | SchedulerService | `lib/aurora/infrastructure/SchedulerService.ts` | A-007 |
| 5 | QueueManager | `lib/aurora/infrastructure/QueueManager.ts` | A-007 |
| 6 | RetryManager | `lib/aurora/infrastructure/RetryManager.ts` | A-007 |
| 7 | CircuitBreakerRegistry | `lib/aurora/infrastructure/CircuitBreakerRegistry.ts` | A-007 |
| 8 | AuroraEventPublisher | `lib/aurora/events/AuroraEventPublisher.ts` | A-007 |
| 9 | ConnectorRegistry | `lib/aurora/integrations/registry/ConnectorRegistry.ts` | A-007 (empty) |
| 10 | HealthStatusService | `lib/aurora/platform/services/AuroraHealthStatusService.ts` | A-007 |
| 11 | MetricsCollector | `lib/aurora/platform/services/AuroraMetricsCollector.ts` | A-007 |
| 12 | LoggingService | `lib/aurora/platform/services/AuroraLoggingService.ts` | A-007 |
| 13 | TracingService | `lib/aurora/platform/services/AuroraTracingService.ts` | A-007 |

**Stub services (interface only · wired in later missions):** WorkflowEngine · NotificationEngine bindings · AgentOrchestrator · PublishPipeline · domain services.

## 2.6 Provider Registry (A-007)

| Registry | Path | A-007 State |
|----------|------|:-----------:|
| ConnectorRegistry | `lib/aurora/integrations/registry/ConnectorRegistry.ts` | Empty · validated |
| CircuitBreakerRegistry | `lib/aurora/infrastructure/CircuitBreakerRegistry.ts` | Active |
| ModuleRegistry | `lib/aurora/runtime/AuroraModuleRegistry.ts` | Admin module only |
| AgentRegistry | `lib/aurora/agents/AgentRegistry.ts` | Stub · A-017 |
| PromptRegistry | `lib/aurora/agents/prompts/PromptRegistry.ts` | Stub · A-017 |

## 2.7 Lifecycle

| State | Implementation | Transitions Enforced By |
|-------|---------------|------------------------|
| `created` | `AuroraRuntime` constructor | → `initializing` on boot |
| `initializing` | `AuroraBootstrap.run()` | → `ready` · `degraded` · `failed` |
| `ready` | Boot Phase 10 complete | → `draining` · `degraded` |
| `degraded` | Non-critical failure | → `ready` · `draining` |
| `draining` | `AuroraShutdown.run()` | → `shutdown` |
| `shutdown` | Resources released | → `initializing` on restart |
| `failed` | Critical boot failure | → `initializing` on retry |

## 2.8 Health

| Probe | Path | Frequency |
|-------|------|-----------|
| Platform health | `GET /api/aurora/health` | 30s |
| Enterprise readiness | `EnterpriseReadinessService` probe | 60s |
| Module health | Internal via `AuroraHealthStatusService` | 60s |
| Redis connectivity | Infrastructure probe | Boot + 60s |
| PostgreSQL connectivity | PlatformStore probe | Boot + 60s |

## 2.9 Configuration

| Loader | Path | Sources |
|--------|------|---------|
| Environment | `AuroraRuntimeConfiguration.fromEnvironment()` | `AURORA_*` env vars |
| Secrets | `AuroraSecretsResolver` | Vault · env fallback (dev) |
| Feature flags | `FeatureFlagService` | Env · tenant config |
| Defaults | `lib/aurora/constants.ts` | Compile-time defaults |

---

# 3. Aurora Runtime

## 3.1 AuroraRuntime

Central runtime controller. Single instance per process. Owns lifecycle state and coordinates boot/shutdown.

**File:** `lib/aurora/runtime/AuroraRuntime.ts`

```typescript
export class AuroraRuntime {
  private state: PlatformLifecycleState = 'created';
  private wiring: AuroraWiring | null = null;
  private readonly config: AuroraRuntimeConfiguration;

  constructor(config: AuroraRuntimeConfiguration);

  /** Current lifecycle state — read-only externally */
  getLifecycleState(): PlatformLifecycleState;

  /** Active wiring — null before boot · after shutdown */
  getWiring(): AuroraWiring;

  /** Execute full boot sequence — idempotent if already ready */
  boot(): Promise<BootResult>;

  /** Graceful shutdown — idempotent */
  shutdown(options?: ShutdownOptions): Promise<ShutdownResult>;

  /** Warm restart: shutdown → boot */
  restart(): Promise<BootResult>;
}
```

| Method | Behaviour |
|--------|-----------|
| `boot()` | Delegates to `AuroraBootstrap.run()` · sets state |
| `shutdown()` | Delegates to `AuroraShutdown.run()` · nulls wiring |
| `restart()` | `shutdown()` then `boot()` · verifies state restoration |
| `getWiring()` | Throws `AURORA_ERR_0503` if not `ready` or `degraded` |

**Singleton access:** `initializeAuroraModule()` creates/returns process singleton. Tests use isolated instances via `createTestAuroraRuntime()`.

## 3.2 AuroraRuntimeContext

Immutable context propagated to every facade operation.

**File:** `lib/aurora/runtime/AuroraRuntimeContext.ts`

```typescript
export interface AuroraRuntimeContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: readonly AuroraRole[];
  readonly brandId: string;
  readonly businessId: string;
  readonly locale: string;
  readonly timezone: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly sessionId?: string;
  readonly platformState: PlatformLifecycleState;
  readonly featureFlags: Readonly<Record<string, boolean>>;
}

export type AuroraRole =
  | 'aurora.admin'
  | 'aurora.editor'
  | 'aurora.approver'
  | 'aurora.viewer'
  | 'aurora.agent.service';
```

| Rule | Description |
|------|-------------|
| **CTX-1** | Context is immutable — use `withBrand(brandId)` to derive scoped copy |
| **CTX-2** | `tenantId` required on every operation — no anonymous tenant |
| **CTX-3** | `platformState` must be `ready` or `degraded` for mutations |
| **CTX-4** | Background jobs carry context in job payload — reconstructed at dequeue |

## 3.3 AuroraRuntimeConfiguration

**File:** `lib/aurora/runtime/AuroraRuntimeConfiguration.ts`

```typescript
export interface AuroraRuntimeConfiguration {
  readonly enabled: boolean;
  readonly redisUrl: string;
  readonly storageBucket?: string;
  readonly aiProvider: string;
  readonly maxAgentTokensPerTenantDay: number;
  readonly bootPhaseTimeouts: Readonly<Record<BootPhase, number>>;
  readonly shutdownDrainTimeouts: ShutdownDrainTimeouts;
  readonly featureFlags: Readonly<Record<string, boolean>>;
  readonly logLevel: 'error' | 'warn' | 'info' | 'debug';
  readonly environment: 'development' | 'test' | 'staging' | 'production';
}

export interface AuroraWiringConfig extends AuroraRuntimeConfiguration {
  readonly platformStore?: PlatformStore;
  readonly eventBus?: EventBus;
  readonly skipWorkers?: boolean;       // Test: no background workers
  readonly skipExternalConnections?: boolean; // Test: in-memory only
}
```

**Factory:** `AuroraRuntimeConfiguration.fromEnvironment(): AuroraRuntimeConfiguration`

| Variable | Required | Default |
|----------|:--------:|---------|
| `AURORA_ENABLED` | Yes | `false` |
| `AURORA_REDIS_URL` | Prod | — |
| `AURORA_STORAGE_BUCKET` | Prod | — |
| `AURORA_AI_PROVIDER` | No | ORION default |
| `AURORA_MAX_AGENT_TOKENS` | No | `50000` |
| `AURORA_LOG_LEVEL` | No | `info` |
| `NODE_ENV` | Yes | — |

## 3.4 AuroraBootstrap

**File:** `lib/aurora/runtime/AuroraBootstrap.ts`

Executes 10-phase startup per A-005 §3.2. A-007 implements Phases 1–3 · 5 (partial) · 8 (partial) · 9 (partial) · 10. Phases 4 · 6 · 7 register stubs.

```typescript
export class AuroraBootstrap {
  constructor(
    private readonly config: AuroraWiringConfig,
    private readonly runtime: AuroraRuntime,
  );

  async run(): Promise<BootResult>;
}

export interface BootResult {
  readonly success: boolean;
  readonly state: PlatformLifecycleState;
  readonly wiring: AuroraWiring;
  readonly phaseResults: readonly PhaseResult[];
  readonly totalDurationMs: number;
  readonly degradedReasons: readonly string[];
}

export interface PhaseResult {
  readonly phase: BootPhase;
  readonly success: boolean;
  readonly durationMs: number;
  readonly error?: string;
}
```

### A-007 Boot Phase Implementation Matrix

| Phase | Name | A-007 Implementation |
|:-----:|------|---------------------|
| 0 | ORION Platform Ready | Verify `PlatformStoreFactory.isInitialized()` |
| 1 | Configuration Load | `AuroraRuntimeConfiguration.fromEnvironment()` |
| 2 | Infrastructure Connect | Redis ping · PostgreSQL via PlatformStore |
| 3 | Persistence Layer | `AuroraPlatformBacking` · admin repositories |
| 4 | Knowledge & Memory | **Stub** — register placeholder module · skip |
| 5 | Core Services | EventPublisher · ConnectorRegistry · ConfigService |
| 6 | Domain Modules | **Admin module only** — Tenant · Brand services |
| 7 | Agent Runtime | **Stub** — empty AgentRegistry |
| 8 | Execution Infra | Scheduler · QueueManager · Retry · CircuitBreaker |
| 9 | Facade & Integration | AuroraFacade · readiness probe registration |
| 10 | Verification | Health check · module registry · state → ready |

### Boot Error Handling

| Failure Type | Action |
|--------------|--------|
| Phase 1 · 2 · 3 · 5 critical | Abort → `failed` · retry 3× on infra |
| Phase 4 · 6 partial | Continue → `degraded` · log reason |
| Phase 8 partial | Continue → `degraded` · no background workers |
| Phase 10 verification fail | `degraded` or `failed` based on severity |

## 3.5 AuroraShutdown

**File:** `lib/aurora/runtime/AuroraShutdown.ts`

```typescript
export interface ShutdownOptions {
  readonly reason: 'sigterm' | 'admin' | 'orion_shutdown' | 'restart';
  readonly publishDrainTimeoutMs?: number;  // default 30000
  readonly agentDrainTimeoutMs?: number;    // default 15000
  readonly queueDrainTimeoutMs?: number;    // default 30000
  readonly force?: boolean;
}

export interface ShutdownResult {
  readonly success: boolean;
  readonly durationMs: number;
  readonly drainedJobs: number;
  readonly forceCancelledJobs: number;
  readonly phases: readonly ShutdownPhaseResult[];
}

export class AuroraShutdown {
  async run(wiring: AuroraWiring, options: ShutdownOptions): Promise<ShutdownResult>;
}
```

### Shutdown Step Implementation (A-007)

| Step | A-007 Action |
|:----:|-------------|
| 1 | Set state → `draining` |
| 2 | Stop SchedulerService |
| 3 | QueueManager.stopAccepting() |
| 4 | Drain queue jobs (timeout) |
| 5 | Shutdown admin module |
| 6 | Close ConnectorRegistry timers |
| 7 | Close Redis connection |
| 8 | Set state → `shutdown` |
| 9 | Log completion metrics |

Steps 4–7 for publish/agent flush are **no-op stubs** until A-015 · A-017.

## 3.6 AuroraRecovery

**File:** `lib/aurora/runtime/AuroraRecovery.ts`

```typescript
export class AuroraRecovery {
  /** Verify warm restart: shutdown → boot preserves PostgreSQL state */
  static async verifyWarmRestart(
    config: AuroraWiringConfig,
    seed: (wiring: AuroraWiring) => Promise<void>,
    verify: (wiring: AuroraWiring) => Promise<void>,
  ): Promise<RecoveryVerificationResult>;

  /** Handle Redis reconnection */
  static async recoverRedisConnection(
    queueManager: QueueManager,
  ): Promise<void>;

  /** Scan missed schedules on boot */
  static async recoverMissedSchedules(
    scheduler: SchedulerService,
  ): Promise<number>;
}
```

### Recovery Scenarios (A-007)

| Scenario | Implementation | Test |
|----------|---------------|------|
| Process crash → boot | Full boot sequence | Integration test |
| Warm restart | `AuroraRecovery.verifyWarmRestart()` | Certification test |
| Redis loss | Boot without cache · rebuild | Failure test |
| PostgreSQL reconnect | PlatformStoreFactory reconnect | Integration test |
| Missed schedules | Scheduler scan on boot Phase 8 | Unit test |

## 3.7 Startup Entry Points

| Trigger | Entry | File |
|---------|-------|------|
| ORION server start | `initializeAuroraModule()` | `lib/aurora/runtime/initializeAuroraModule.ts` |
| Test suite | `createTestAuroraWiring()` | `lib/aurora/wiring/createTestAuroraWiring.ts` |
| Certification | `createAuroraWiring()` + verify | Test harness |
| Dev lazy init | First `/api/aurora/*` request | API middleware |

```typescript
// lib/aurora/runtime/initializeAuroraModule.ts
let auroraRuntime: AuroraRuntime | null = null;

export async function initializeAuroraModule(): Promise<AuroraRuntime> {
  if (!process.env.AURORA_ENABLED || process.env.AURORA_ENABLED === 'false') {
    return createDisabledAuroraRuntime();
  }
  if (!auroraRuntime) {
    auroraRuntime = new AuroraRuntime(AuroraRuntimeConfiguration.fromEnvironment());
  }
  if (auroraRuntime.getLifecycleState() === 'created' ||
      auroraRuntime.getLifecycleState() === 'shutdown') {
    await auroraRuntime.boot();
  }
  return auroraRuntime;
}
```

---

# 4. Composition Root

## 4.1 createAuroraWiring()

**File:** `lib/aurora/createAuroraWiring.ts`

Authoritative composition root. Mirrors `createProcurementWiring()` structure with Aurora-specific lifecycle.

```typescript
export function createAuroraWiring(
  config: AuroraWiringConfig = AuroraRuntimeConfiguration.fromEnvironment(),
): AuroraWiring {
  // Implementation follows registration order §4.3
}

export type AuroraWiring = {
  readonly runtime: AuroraRuntime;
  readonly facade: AuroraFacade;
  readonly platformStore: PlatformStore;
  readonly backing: AuroraPlatformBacking;
  readonly repositories: AuroraRepositories;
  readonly tenantService: TenantService;
  readonly brandService: BrandService;
  readonly configurationService: ConfigurationService;
  readonly eventPublisher: AuroraEventPublisher;
  readonly connectorRegistry: ConnectorRegistry;
  readonly scheduler: SchedulerService;
  readonly queueManager: QueueManager;
  readonly retryManager: RetryManager;
  readonly circuitBreakerRegistry: CircuitBreakerRegistry;
  readonly healthService: AuroraHealthStatusService;
  readonly metricsCollector: AuroraMetricsCollector;
  readonly moduleRegistry: AuroraModuleRegistry;
  readonly lifecycle: PlatformLifecycleState;
  readonly shutdown: () => Promise<ShutdownResult>;
  readonly healthCheck: () => Promise<AuroraHealthReport>;
};
```

**Rules:**
- No global singletons except process-level `auroraRuntime` in initializer
- All services constructor-injected
- `shutdown` and `healthCheck` closures bound to wiring instance
- Return type exported as `AuroraWiring`

## 4.2 Registration Order

Exact instantiation sequence within `createAuroraWiring()`:

```
1. Resolve PlatformStore (config override || getDefaultPlatformStore())
2. Ensure AuroraPlatformBacking via ensureAuroraPlatformBacking(platformStore)
3. Create AuroraRepositories via createAuroraRepositories(backing)
4. Instantiate infrastructure connections (Redis · optional storage)
5. ConfigurationService
6. RetryManager
7. CircuitBreakerRegistry
8. AuroraEventPublisher(eventBus)
9. ConnectorRegistry (empty)
10. QueueManager(redis, retryManager)
11. SchedulerService(redis, queueManager, repositories.schedule)
12. TenantService(repositories.tenant, eventPublisher, audit)
13. BrandService(repositories.brand, tenantService, eventPublisher, audit)
14. AuroraHealthStatusService(repositories, redis, platformStore)
15. AuroraMetricsCollector()
16. AuroraLoggingService(config)
17. AuroraTracingService()
18. AuroraModuleRegistry — register admin module
19. AuroraFacade(all services + stub operation groups)
20. Register EnterpriseReadinessService probe
21. Return AuroraWiring
```

## 4.3 AuroraFacade

**File:** `lib/aurora/AuroraFacade.ts`

```typescript
export class AuroraFacade {
  constructor(deps: AuroraFacadeDependencies);

  // Active in A-007
  readonly admin: AdminOperations;
  readonly health: AuroraHealthOperations;
  readonly config: ConfigurationOperations;

  // Stubbed until later missions — typed · throws AURORA_ERR_0501
  readonly content: ContentOperations;
  readonly creative: CreativeOperations;
  readonly seo: SeoOperations;
  readonly social: SocialOperations;
  readonly ads: AdOperations;
  readonly email: EmailOperations;
  readonly analytics: AnalyticsOperations;
  readonly knowledge: KnowledgeOperations;
  readonly planner: PlannerOperations;
  readonly agents: AgentOperations;
  readonly publish: PublishOperations;
  readonly approval: ApprovalOperations;
}
```

### AdminOperations (A-007 Active)

```typescript
export interface AdminOperations {
  createTenant(ctx: AuroraRuntimeContext, input: CreateTenantInput): Promise<Tenant>;
  getTenant(ctx: AuroraRuntimeContext, tenantId: string): Promise<Tenant | null>;
  updateTenant(ctx: AuroraRuntimeContext, tenantId: string, input: UpdateTenantInput): Promise<Tenant>;
  listTenants(ctx: AuroraRuntimeContext): Promise<readonly Tenant[]>;

  createBrand(ctx: AuroraRuntimeContext, input: CreateBrandInput): Promise<Brand>;
  getBrand(ctx: AuroraRuntimeContext, brandId: string): Promise<Brand | null>;
  updateBrand(ctx: AuroraRuntimeContext, brandId: string, input: UpdateBrandInput): Promise<Brand>;
  listBrands(ctx: AuroraRuntimeContext, tenantId: string): Promise<readonly Brand[]>;
  switchBrand(ctx: AuroraRuntimeContext, brandId: string): AuroraRuntimeContext;
}
```

### AuroraHealthOperations (A-007 Active)

```typescript
export interface AuroraHealthOperations {
  getPlatformHealth(): Promise<AuroraHealthReport>;
  getModuleHealth(moduleKey: string): Promise<HealthStatus>;
  getLifecycleState(): PlatformLifecycleState;
}
```

### Facade Implementation Rules

| Rule | Implementation |
|------|---------------|
| FAC-1 | Every method: `(ctx: AuroraRuntimeContext, ...args)` |
| FAC-2 | Delegate to service — zero business logic |
| FAC-3 | Validate `ctx.platformState` before mutations |
| FAC-4 | Stub operations use `createNotImplementedStub<T>(moduleName)` |
| FAC-5 | Export `AuroraFacade` only via `@/lib/aurora` |

## 4.4 Sub-Wiring Factories

| Factory | File | Purpose |
|---------|------|---------|
| `createTestAuroraWiring(overrides?)` | `wiring/createTestAuroraWiring.ts` | In-memory store · mock Redis · skip workers |
| `createAuroraPersistenceWiring(config)` | `wiring/createAuroraPersistenceWiring.ts` | Repositories only |
| `createAuroraPlatformWiring(config)` | `wiring/createAuroraPlatformWiring.ts` | Infrastructure services only |

```typescript
export function createTestAuroraWiring(
  overrides: Partial<AuroraWiringConfig> = {},
): AuroraWiring {
  return createAuroraWiring({
    ...AuroraRuntimeConfiguration.forTest(),
    platformStore: new InMemoryPlatformStore(),
    skipWorkers: true,
    skipExternalConnections: true,
    ...overrides,
  });
}
```

## 4.5 Public Export Surface

**File:** `lib/aurora/index.ts`

```typescript
// Public exports ONLY
export { AuroraFacade } from './AuroraFacade';
export { createAuroraWiring, type AuroraWiring } from './createAuroraWiring';
export { createTestAuroraWiring } from './wiring/createTestAuroraWiring';
export { initializeAuroraModule } from './runtime/initializeAuroraModule';
export type { AuroraRuntimeContext, AuroraRole } from './runtime/AuroraRuntimeContext';
export type { AuroraHealthReport, PlatformLifecycleState } from './types';
export { AuroraError } from './errors/AuroraError';
export { AURORA_MODULE_KEY, AURORA_IIL_SERVICE_ID } from './constants';

// FORBIDDEN: repository · service · agent · connector exports
```

## 4.6 Lifecycle Management on Wiring

```typescript
// Returned by createAuroraWiring()
wiring.shutdown = async () => {
  const runtime = wiring.runtime;
  return runtime.shutdown({ reason: 'admin' });
};

wiring.healthCheck = async () => {
  return wiring.healthService.getPlatformHealth();
};
```

---

# 5. Platform Services

## 5.1 SchedulerService

**File:** `lib/aurora/infrastructure/SchedulerService.ts`

| Field | Specification |
|-------|---------------|
| **Storage** | Redis sorted sets + PostgreSQL `aurora_schedule` |
| **Precision** | ± 30 seconds |
| **Timezone** | Per-brand from RuntimeContext |
| **Boot recovery** | Scan missed · re-queue via `AuroraRecovery.recoverMissedSchedules()` |

```typescript
export interface SchedulerService {
  schedule(ctx: AuroraRuntimeContext, entry: ScheduleEntry): Promise<ScheduleId>;
  cancel(ctx: AuroraRuntimeContext, scheduleId: ScheduleId): Promise<void>;
  cancelAll(ctx: AuroraRuntimeContext): Promise<number>;  // Emergency stop
  listPending(ctx: AuroraRuntimeContext): Promise<readonly ScheduleEntry[]>;
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
}
```

| Method | Validation |
|--------|------------|
| `schedule` | Requires `ready` state · tenant scoped · future timestamp |
| `cancelAll` | Admin role required · audit logged |

## 5.2 QueueManager

**File:** `lib/aurora/infrastructure/QueueManager.ts`

| Field | Specification |
|-------|---------------|
| **Backend** | BullMQ on Redis |
| **Queues (A-007)** | `aurora:platform:tasks` · `aurora:schedule:tasks` |
| **Queues (later)** | agent · publish · sync · learning · reports |
| **DLQ** | `aurora:dlq:{queueName}` |

```typescript
export interface QueueManager {
  enqueue<T>(queue: AuroraQueueName, job: QueueJob<T>): Promise<JobId>;
  startWorkers(handlers: QueueHandlerRegistry): Promise<void>;
  stopAccepting(): void;
  drain(timeoutMs: number): Promise<DrainResult>;
  getQueueHealth(queue: AuroraQueueName): Promise<QueueHealthStatus>;
  healthCheck(): Promise<HealthStatus>;
}

export type AuroraQueueName =
  | 'aurora:platform:tasks'
  | 'aurora:schedule:tasks';
  // Extended in A-015 · A-017
```

**A-007 workers:** Platform maintenance worker · schedule dispatch worker.

## 5.3 WorkflowEngine

**File:** `lib/aurora/infrastructure/WorkflowEngine.ts`

| A-007 Status | **Interface stub only** — full implementation A-015 |
|--------------|------------------------------------------------------|

```typescript
export interface WorkflowEngine {
  createWorkflow(ctx: AuroraRuntimeContext, def: WorkflowDefinition): Promise<WorkflowId>;
  trigger(ctx: AuroraRuntimeContext, workflowId: WorkflowId, payload: unknown): Promise<ExecutionId>;
  getExecution(ctx: AuroraRuntimeContext, executionId: ExecutionId): Promise<WorkflowExecution | null>;
  healthCheck(): Promise<HealthStatus>;
}

// A-007: WorkflowEngineStub implements interface · all methods throw 501
```

## 5.4 Event Dispatcher (AuroraEventPublisher)

**File:** `lib/aurora/events/AuroraEventPublisher.ts`

```typescript
export interface AuroraEventPublisher {
  publish(event: AuroraDomainEvent): Promise<void>;
  publishBatch(events: readonly AuroraDomainEvent[]): Promise<void>;
}

export interface AuroraDomainEvent {
  readonly name: string;           // aurora.{domain}.{action}
  readonly tenantId: string;
  readonly brandId?: string;
  readonly payload: Record<string, unknown>;
  readonly metadata: EventMetadata;
}
```

| A-007 Event | When |
|-------------|------|
| `aurora.tenant.created` | TenantService.createTenant |
| `aurora.tenant.updated` | TenantService.updateTenant |
| `aurora.brand.created` | BrandService.createBrand |
| `aurora.brand.updated` | BrandService.updateBrand |
| `aurora.platform.ready` | Boot Phase 10 complete |
| `aurora.platform.degraded` | Boot degradation |
| `aurora.platform.shutdown` | Shutdown complete |

**Integration:** Maps to ORION EventBus via `intelligenceEventToPlatformEvent()` pattern.

**File:** `lib/aurora/events/registerAuroraSubscribers.ts` — stub in A-007 · handlers added in later missions.

## 5.5 NotificationEngine

| A-007 Status | **Stub** — ORION NotificationService bindings in A-018 |
|--------------|--------------------------------------------------------|

Placeholder interface at `lib/aurora/platform/services/NotificationBindingService.ts` with no-op methods.

## 5.6 RetryManager

**File:** `lib/aurora/infrastructure/RetryManager.ts`

```typescript
export interface RetryPolicy {
  readonly name: string;
  readonly maxRetries: number;
  readonly backoff: 'immediate' | 'fixed' | 'exponential';
  readonly baseDelayMs?: number;
  readonly maxDelayMs?: number;
}

export interface RetryManager {
  getPolicy(name: RetryPolicyName): RetryPolicy;
  execute<T>(policy: RetryPolicyName, fn: () => Promise<T>): Promise<T>;
}
```

| Policy Name | Max Retries | Backoff | A-007 Usage |
|-------------|:-----------:|---------|-------------|
| `platform.default` | 3 | exponential 1s·5s·30s | Infra connections |
| `schedule.dispatch` | 2 | fixed 10s | Scheduler |
| `event.handler` | 2 | fixed 10s | Event dispatch |
| `integration.sync` | 3 | exponential 30s·120s·600s | Reserved A-016 |

## 5.7 CircuitBreakerRegistry

**File:** `lib/aurora/infrastructure/CircuitBreakerRegistry.ts`

```typescript
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreaker {
  readonly name: string;
  readonly state: CircuitState;
  execute<T>(fn: () => Promise<T>): Promise<T>;
  reset(): void;
}

export interface CircuitBreakerRegistry {
  get(name: string): CircuitBreaker;
  register(name: string, config: CircuitBreakerConfig): CircuitBreaker;
  getAllStates(): Readonly<Record<string, CircuitState>>;
  healthCheck(): Promise<HealthStatus>;
}
```

| Breaker (A-007 pre-registered) | Threshold | Open Duration |
|-------------------------------|:---------:|:-------------:|
| `redis` | 3 / 10s | 15s |
| `postgresql` | 3 / 10s | 30s |
| `google` | 5 / 1min | 60s (inactive until A-016) |
| `meta` | 5 / 1min | 60s (inactive until A-016) |

Open state throws `AuroraError('AURORA_ERR_5030', 'Service unavailable', 503)`.

## 5.8 HealthStatusService

**File:** `lib/aurora/platform/services/AuroraHealthStatusService.ts`

```typescript
export interface AuroraHealthReport {
  readonly lifecycle: PlatformLifecycleState;
  readonly modules: Readonly<Record<string, HealthStatus>>;
  readonly infrastructure: Readonly<Record<string, HealthStatus>>;
  readonly queues: Readonly<Record<string, QueueHealthStatus>>;
  readonly uptime: number;
  readonly degradedReasons: readonly string[];
  readonly version: string;
}

export interface HealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly message?: string;
  readonly checkedAt: string;
  readonly latencyMs?: number;
}
```

**EnterpriseReadiness probe registration:**

```typescript
// In createAuroraWiring() step 20
EnterpriseReadinessService.registerProbe({
  name: 'aurora.platform',
  check: async () => {
    const report = await healthService.getPlatformHealth();
    return {
      status: report.lifecycle === 'ready' ? 'healthy'
            : report.lifecycle === 'degraded' ? 'degraded' : 'unhealthy',
      message: report.degradedReasons.join('; ') || 'Aurora platform operational',
    };
  },
});
```

## 5.9 MetricsCollector

**File:** `lib/aurora/platform/services/AuroraMetricsCollector.ts`

| Metric | Type | Labels |
|--------|------|--------|
| `aurora_platform_lifecycle` | Gauge | state |
| `aurora_module_health` | Gauge | module |
| `aurora_queue_depth` | Gauge | queue |
| `aurora_boot_duration_seconds` | Histogram | phase |
| `aurora_shutdown_duration_seconds` | Histogram | — |
| `aurora_api_requests_total` | Counter | route · status |
| `aurora_circuit_breaker_state` | Gauge | integration |

A-007 implements collector interface · emission hooks · test assertions. Full Prometheus export in A-020.

## 5.10 ConfigurationService

**File:** `lib/aurora/platform/services/ConfigurationService.ts`

```typescript
export interface ConfigurationService {
  getTenantConfig(ctx: AuroraRuntimeContext): Promise<TenantConfig>;
  getFeatureFlags(ctx: AuroraRuntimeContext): Promise<Readonly<Record<string, boolean>>>;
  getTierLimits(tier: CommercialTier): TierLimits;
  validateConfig(): ConfigValidationResult;
}
```

## 5.11 LoggingService

**File:** `lib/aurora/platform/services/AuroraLoggingService.ts`

| Field | Standard |
|-------|----------|
| Format | Structured JSON |
| Correlation | `requestId` · `correlationId` · `tenantId` |
| PII | Never logged · masked in debug |
| Agent logs | Reserved A-017 |

```typescript
export interface AuroraLogger {
  error(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  child(bindings: LogMeta): AuroraLogger;
}
```

## 5.12 TracingService

**File:** `lib/aurora/platform/services/AuroraTracingService.ts`

| Span (A-007) | Attributes |
|--------------|------------|
| `aurora.boot.phase` | phase · duration · outcome |
| `aurora.shutdown` | reason · drained · duration |
| `aurora.facade.operation` | operation · module · tenant |
| `aurora.health.check` | probe · status |

OpenTelemetry-compatible interface · no-op implementation in A-007 unless `AURORA_TRACING_ENABLED=true`.

---

# 6. Module Registration

## 6.1 Module Registration Framework

**File:** `lib/aurora/runtime/AuroraModuleRegistry.ts`

```typescript
export interface AuroraModuleRuntime {
  readonly moduleKey: string;
  readonly dependencies: readonly string[];
  initialize(ctx: ModuleInitContext): Promise<ModuleInitResult>;
  healthCheck(): Promise<HealthStatus>;
  shutdown(): Promise<void>;
}

export interface ModuleInitContext {
  readonly wiring: AuroraWiring;
  readonly config: AuroraRuntimeConfiguration;
  readonly logger: AuroraLogger;
}

export interface ModuleInitResult {
  readonly success: boolean;
  readonly degraded?: boolean;
  readonly reason?: string;
}

export class AuroraModuleRegistry {
  register(module: AuroraModuleRuntime): void;
  initializeAll(ctx: ModuleInitContext): Promise<readonly ModuleInitResult[]>;
  shutdownAll(): Promise<void>;
  healthCheckAll(): Promise<Readonly<Record<string, HealthStatus>>>;
  getModule(key: string): AuroraModuleRuntime | undefined;
}
```

## 6.2 A-007 Module Registration Order

| Tier | Module Key | Class | Dependencies |
|:----:|------------|-------|--------------|
| 0 | `admin` | `AdminModuleRuntime` | ORION Identity · PlatformStore |

**Future tiers (registered by later missions):**

| Tier | Module | Mission |
|:----:|--------|---------|
| 1 | `knowledge` · `memory` | A-008 |
| 2 | `content` · `seo` · `creative` | A-009 · A-010 · A-013 |
| 3 | `campaign` · `analytics` | A-011 · A-012 |
| 4 | `social` | A-014 |
| 5 | `automation` | A-015 |
| 6 | `executive` | A-018 |

## 6.3 AdminModuleRuntime

**File:** `lib/aurora/admin/AdminModuleRuntime.ts`

```typescript
export class AdminModuleRuntime implements AuroraModuleRuntime {
  readonly moduleKey = 'admin';
  readonly dependencies: readonly string[] = [];

  async initialize(ctx: ModuleInitContext): Promise<ModuleInitResult> {
    // Verify TenantService · BrandService wired
    // Verify repositories connected
    // Seed default tier config if empty
    return { success: true };
  }

  async healthCheck(): Promise<HealthStatus> {
    // Verify repository connectivity · tenant count query
  }

  async shutdown(): Promise<void> {
    // No resources to release in A-007
  }
}
```

## 6.4 Registration Contracts

| Contract | Rule |
|----------|------|
| **REG-1** | Module key unique · lowercase · matches A-005 registry |
| **REG-2** | Dependencies declared · validated before init |
| **REG-3** | `initialize()` idempotent |
| **REG-4** | Failed non-critical module → degraded · not abort |
| **REG-5** | Failed critical module (`admin`) → abort boot |
| **REG-6** | Later missions register via `moduleRegistry.register()` in wiring extension |

## 6.5 Initialization Contracts

```typescript
// Extension pattern for A-008+ missions
export function extendAuroraWiring(base: AuroraWiring, extension: WiringExtension): AuroraWiring {
  extension.moduleRegistry.register(new KnowledgeModuleRuntime());
  // Re-run module init for new module only if platform already ready
  return { ...base, ...extension.services };
}
```

**A-007:** Single `createAuroraWiring()` — no extension yet. Document extension pattern for future missions.

## 6.6 Dependency Rules

| Rule | Description |
|------|-------------|
| **DEP-1** | Modules init in tier order · parallel within tier allowed |
| **DEP-2** | Module may access services from lower tiers only |
| **DEP-3** | Module never imports another module's repository directly |
| **DEP-4** | Cross-module communication via events or facade |

## 6.7 Validation Rules

| Check | When | Failure |
|-------|------|---------|
| Dependency exists | Pre-init | Abort registration |
| Circular dependency | Registry build | Throw at wiring time |
| Service availability | Init | Degraded or abort |
| Repository connectivity | Health check | Unhealthy status |

## 6.8 Failure Handling

| Failure | Module Tier | Boot Result |
|---------|-------------|-------------|
| Admin init fail | 0 (critical) | `failed` |
| Knowledge init fail | 1 | `degraded` (A-008+) |
| Content init fail | 2 | `degraded` |
| Agent registry fail | 7 | `failed` (A-017+) |
| Queue worker fail | 8 | `degraded` |

---

# 7. Provider Architecture

## 7.1 Provider Contracts

All external integrations implement provider interfaces. No direct HTTP from services.

**Base connector interface:**

```typescript
export interface AuroraConnector {
  readonly providerId: string;
  readonly displayName: string;
  readonly phase: 1 | 2 | 3;
  connect(ctx: AuroraRuntimeContext, credentials: ConnectorCredentials): Promise<void>;
  disconnect(ctx: AuroraRuntimeContext): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
  getCapabilities(): readonly ConnectorCapability[];
}
```

## 7.2 ConnectorRegistry

**File:** `lib/aurora/integrations/registry/ConnectorRegistry.ts`

```typescript
export interface ConnectorRegistry {
  register(connector: AuroraConnector): void;
  get(providerId: string): AuroraConnector | undefined;
  list(): readonly AuroraConnector[];
  listConnected(ctx: AuroraRuntimeContext): Promise<readonly ConnectedConnector[]>;
  healthCheckAll(): Promise<Readonly<Record<string, HealthStatus>>>;
  shutdown(): Promise<void>;
}
```

**A-007:** Registry instantiated empty · `register()` · `get()` · `healthCheckAll()` tested with mock connector.

## 7.3 Provider Loading

| Phase | Loader | When |
|-------|--------|------|
| Boot Phase 5 | `ConnectorRegistry` instantiated | A-007 |
| Boot Phase 5 | Connectors registered | A-016+ per integration mission |
| Runtime | Lazy connect on first use | OAuth flow in A-016 |

## 7.4 Provider Validation

| Check | Rule |
|-------|------|
| Provider ID unique | `google.search_console` format |
| Credentials encrypted | Secrets vault · never in logs |
| OAuth token refresh | Connector responsibility |
| Capability declared | Before registration |

## 7.5 Provider Health

Each connector implements `healthCheck()` using its circuit breaker from `CircuitBreakerRegistry.get(providerId)`.

## 7.6 Provider Isolation

| Rule | Description |
|------|-------------|
| **ISO-1** | Connector failure does not crash platform |
| **ISO-2** | Circuit breaker per provider |
| **ISO-3** | Connector exception caught · logged · returns error to caller |
| **ISO-4** | No connector shares mutable state across tenants |

## 7.7 Future Extensibility

| Extension Point | Pattern |
|-----------------|---------|
| New connector | Implement `AuroraConnector` · `registry.register()` in mission wiring |
| New publisher | Implement channel publisher in A-015 |
| New agent | Register in AgentRegistry A-017 |
| New module | Implement `AuroraModuleRuntime` · register in wiring extension |

---

# 8. Configuration

## 8.1 Environment Variables

| Variable | Type | Required | Default | Description |
|----------|------|:--------:|---------|-------------|
| `AURORA_ENABLED` | boolean | Yes | `false` | Master enable switch |
| `AURORA_REDIS_URL` | string | Prod | — | Redis connection URL |
| `AURORA_STORAGE_BUCKET` | string | Prod | — | S3-compatible bucket |
| `AURORA_AI_PROVIDER` | string | No | ORION default | LLM provider id |
| `AURORA_MAX_AGENT_TOKENS` | number | No | `50000` | Daily token budget per tenant |
| `AURORA_LOG_LEVEL` | enum | No | `info` | Log verbosity |
| `AURORA_TRACING_ENABLED` | boolean | No | `false` | Enable tracing spans |
| `AURORA_BOOT_TIMEOUT_MS` | number | No | `12000` | Max total boot time |
| `AURORA_SHUTDOWN_DRAIN_MS` | number | No | `30000` | Queue drain timeout |

PostgreSQL uses ORION `DATABASE_URL` / PlatformStore configuration.

## 8.2 Secrets

**File:** `lib/aurora/platform/AuroraSecretsResolver.ts`

| Secret | Storage | Usage |
|--------|---------|-------|
| Integration OAuth tokens | Encrypted in PostgreSQL `aurora_connector_credentials` | A-016+ |
| API keys | Secrets vault | A-016+ |
| Encryption key | Environment / vault | Credential encryption |

**A-007:** Secrets resolver interface · dev fallback to env vars · no credentials stored yet.

## 8.3 Tenant Configuration

**Table:** `aurora_tenant_config`

| Field | Type | Description |
|-------|------|-------------|
| `tenant_id` | UUID | FK to tenant |
| `tier` | enum | starter · professional · agency · enterprise |
| `approval_policy` | JSONB | Tier 0–3 rules |
| `token_budget` | integer | Daily agent token limit |
| `feature_overrides` | JSONB | Per-tenant feature flags |
| `limits` | JSONB | Module · brand · storage limits |

Loaded by `ConfigurationService.getTenantConfig()`.

## 8.4 Feature Flags

| Flag | Default | Phase | Mission |
|------|---------|:-----:|---------|
| `aurora.agents.enabled` | `true` | 1 | A-017 |
| `aurora.publish.enabled` | `true` | 1 | A-015 |
| `aurora.ads.enabled` | `false` | 2 | A-021 |
| `aurora.email.enabled` | `false` | 2 | A-022 |
| `aurora.phase2_agents.enabled` | `false` | 2 | A-031 |
| `aurora.crm_bridge.enabled` | `false` | 2 | A-033 |

**Resolution order:** Environment → tenant config → compile-time default.

## 8.5 Runtime Policies

| Policy | Config Key | Default |
|--------|-----------|---------|
| Boot phase timeout | `bootPhaseTimeouts.{phase}` | Per A-005 §3.2 |
| Shutdown drain timeout | `shutdownDrainTimeouts.queue` | 30000ms |
| Retry policies | `RetryManager` policies | §5.6 |
| Circuit breaker thresholds | `CircuitBreakerRegistry` | §5.7 |
| Queue concurrency | `queueConcurrency.{queue}` | platform: 3 · schedule: 2 |

## 8.6 Defaults

**File:** `lib/aurora/constants.ts`

```typescript
export const AURORA_MODULE_KEY = 'aurora';
export const AURORA_IIL_SERVICE_ID = 'aurora.platform';
export const AURORA_API_PREFIX = '/api/aurora';
export const AURORA_UI_PREFIX = '/aurora';
export const AURORA_DEFAULT_LOCALE = 'en-US';
export const AURORA_DEFAULT_TIMEZONE = 'UTC';
export const AURORA_BOOT_TIMEOUT_MS = 12_000;
export const AURORA_MAX_BRANDS_STARTER = 1;
export const AURORA_MAX_BRANDS_PROFESSIONAL = 5;
```

## 8.7 Configuration Validation

```typescript
export function validateAuroraConfig(config: AuroraRuntimeConfiguration): ConfigValidationResult {
  const errors: string[] = [];
  if (config.enabled && !config.redisUrl && config.environment !== 'test') {
    errors.push('AURORA_REDIS_URL required when AURORA_ENABLED=true');
  }
  // ... additional validations
  return { valid: errors.length === 0, errors };
}
```

Called in Boot Phase 1 — validation failure aborts boot.

---

# 9. Testing Strategy

## 9.1 Unit Tests

**Location:** `tests/aurora/unit/`

| Test File | Coverage Target |
|-----------|:---------------:|
| `TenantService.test.ts` | 85% |
| `BrandService.test.ts` | 85% |
| `ConfigurationService.test.ts` | 80% |
| `SchedulerService.test.ts` | 80% |
| `QueueManager.test.ts` | 80% |
| `RetryManager.test.ts` | 90% |
| `CircuitBreakerRegistry.test.ts` | 90% |
| `AuroraEventPublisher.test.ts` | 85% |
| `ConnectorRegistry.test.ts` | 80% |
| `AuroraError.test.ts` | 100% |
| `AuroraRuntimeConfiguration.test.ts` | 90% |

**Pattern:** Mock dependencies via constructor injection · no Next.js · no Redis in unit tests (mock interfaces).

## 9.2 Composition Tests

**Location:** `tests/aurora/integration/wiring/`

| Test | Assertion |
|------|-----------|
| `createAuroraWiring.test.ts` | All services wired · no undefined deps |
| `createTestAuroraWiring.test.ts` | In-memory store · skip workers |
| `AuroraFacade.contract.test.ts` | Admin + health ops callable · stubs throw 501 |
| `AuroraModuleRegistry.test.ts` | Admin module registers · inits · health checks |
| `wiringDependencyOrder.test.ts` | Registration order matches §4.2 |

```typescript
describe('createAuroraWiring', () => {
  it('wires platform foundation against InMemoryPlatformStore', () => {
    const wiring = createTestAuroraWiring();
    expect(wiring.platformStore).toBeDefined();
    expect(wiring.backing).toBe(wiring.platformStore.getAuroraBacking());
    expect(wiring.tenantService).toBeDefined();
    expect(wiring.facade.admin).toBeDefined();
    expect(wiring.lifecycle).toBe('ready');
  });
});
```

## 9.3 Startup Tests

**Location:** `tests/aurora/integration/lifecycle/`

| Test | Scenario |
|------|----------|
| `AuroraBootstrap.test.ts` | Full 10-phase boot succeeds |
| `bootIdempotent.test.ts` | Second boot call is no-op when ready |
| `bootDisabled.test.ts` | `AURORA_ENABLED=false` skips init |
| `bootInfraFailure.test.ts` | Redis failure → retry → degraded/failed |
| `bootTiming.test.ts` | Total boot < 12s with test config |
| `bootPhaseLogging.test.ts` | Each phase logged with duration |

## 9.4 Shutdown Tests

| Test | Scenario |
|------|----------|
| `AuroraShutdown.test.ts` | Graceful shutdown completes |
| `shutdownIdempotent.test.ts` | Second shutdown is no-op |
| `shutdownDrainTimeout.test.ts` | Force-cancel after timeout · audit logged |
| `shutdownStateTransition.test.ts` | ready → draining → shutdown |

## 9.5 Failure Tests

| Test | Scenario |
|------|----------|
| `redisConnectionFailure.test.ts` | Circuit breaker opens · degraded boot |
| `postgresConnectionFailure.test.ts` | Boot fails after 3 retries |
| `adminModuleFailure.test.ts` | Admin init fail → boot failed |
| `configValidationFailure.test.ts` | Invalid config → boot failed Phase 1 |

## 9.6 Recovery Tests

| Test | Scenario |
|------|----------|
| `warmRestart.test.ts` | P-011.2 pattern · tenant persists after restart |
| `missedScheduleRecovery.test.ts` | Missed schedules re-queued on boot |
| `circuitBreakerRecovery.test.ts` | Half-open → closed after successful probe |

```typescript
describe('Warm Restart (P-011.2 pattern)', () => {
  it('preserves tenant data across shutdown and boot', async () => {
    const config = AuroraRuntimeConfiguration.forTest();
    const runtime = new AuroraRuntime(config);
    await runtime.boot();
    const tenant = await runtime.getWiring().facade.admin.createTenant(ctx, input);
    await runtime.shutdown({ reason: 'restart' });
    await runtime.boot();
    const restored = await runtime.getWiring().facade.admin.getTenant(ctx, tenant.id);
    expect(restored).toEqual(tenant);
  });
});
```

## 9.7 Health Tests

| Test | Scenario |
|------|----------|
| `healthEndpoint.test.ts` | `/api/aurora/health` returns AuroraHealthReport |
| `readinessProbe.test.ts` | EnterpriseReadinessService probe registered |
| `degradedHealth.test.ts` | Degraded state reflected in health report |
| `moduleHealth.test.ts` | Admin module health check passes |

## 9.8 Coverage Targets

| Layer | Minimum | Measured By |
|-------|:-------:|-------------|
| `lib/aurora/admin/` | 85% | vitest coverage |
| `lib/aurora/infrastructure/` | 80% | vitest coverage |
| `lib/aurora/runtime/` | 85% | vitest coverage |
| `lib/aurora/platform/` | 80% | vitest coverage |
| `lib/aurora/events/` | 80% | vitest coverage |
| `lib/aurora/persistence/` | 80% | vitest coverage |
| `createAuroraWiring.ts` | 90% | vitest coverage |
| **Overall A-007 scope** | **80%** | CI gate |

---

# 10. Engineering Standards

## 10.1 Folder Structure

See [Appendix A](#appendix-a--folder-layout). All A-007 code under `lib/aurora/` per A-002 Appendix A.

## 10.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Service | `{Domain}Service` | `TenantService` |
| Repository | `{Domain}Repository` | `TenantRepository` |
| Interface | `{Name}` | `SchedulerService` |
| Error code | `AURORA_ERR_{status}{seq}` | `AURORA_ERR_0403` |
| Event | `aurora.{domain}.{action}` | `aurora.tenant.created` |
| Queue | `aurora:{domain}:{type}` | `aurora:platform:tasks` |
| Table | `aurora_{snake_case}` | `aurora_tenant` |
| Test | `{Component}.test.ts` | `TenantService.test.ts` |

## 10.3 Interfaces

| Rule | Description |
|------|-------------|
| Public service contracts | `interface` in same file or `types/` |
| Repository interfaces | `lib/aurora/{domain}/repositories/{Domain}Repository.ts` |
| Readonly properties | All interface fields `readonly` |
| Explicit return types | All public methods |
| No `any` | Use `unknown` + type guards |

## 10.4 Dependency Rules

| Layer | May Import | Must Not Import |
|-------|-----------|-----------------|
| `lib/aurora/` (public) | ORION platform · types | `app/` · `components/` |
| Services | Repositories · other services · events | `app/` · agents directly |
| Repositories | Backing · types | Services · facade |
| Runtime | Wiring · all platform | Domain services (A-008+) |
| Tests | `@/lib/aurora` public exports | Internal repository paths (prefer wiring) |

## 10.5 Error Handling

**File:** `lib/aurora/errors/AuroraError.ts`

```typescript
export class AuroraError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode: number = 500,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AuroraError';
  }
}

// Standard codes (A-007)
export const AURORA_ERR_0403 = 'AURORA_ERR_0403'; // Forbidden
export const AURORA_ERR_0404 = 'AURORA_ERR_0404'; // Not found
export const AURORA_ERR_0501 = 'AURORA_ERR_0501'; // Not implemented
export const AURORA_ERR_0503 = 'AURORA_ERR_0503'; // Platform not ready
export const AURORA_ERR_0509 = 'AURORA_ERR_0509'; // Boot failed
export const AURORA_ERR_5030 = 'AURORA_ERR_5030'; // Circuit breaker open
```

Services throw `AuroraError` — never raw `Error`. API routes map to HTTP status.

## 10.6 Logging

| Event | Level | Fields |
|-------|-------|--------|
| Boot phase complete | info | phase · durationMs · outcome |
| Boot failure | error | phase · error · stack |
| Shutdown complete | info | durationMs · drainedJobs |
| Service mutation | info | tenantId · userId · operation |
| Circuit breaker open | warn | provider · failureCount |
| Config validation fail | error | errors |

## 10.7 Documentation

| Artifact | Required | Location |
|----------|:--------:|----------|
| This spec | ✅ | `docs/AURORA/Engineering/` |
| API route (health only) | ✅ | `app/api/aurora/health/route.ts` |
| Inline JSDoc on public exports | ✅ | `lib/aurora/index.ts` |
| ADR if architectural decision | If needed | `docs/AURORA/ADR/` |

## 10.8 Review Checklist

| # | Check |
|---|-------|
| 1 | All code under `lib/aurora/` · tests under `tests/aurora/` |
| 2 | No exports of repositories or internal services from `index.ts` |
| 3 | `createAuroraWiring()` is sole composition root |
| 4 | Every facade method accepts `AuroraRuntimeContext` first |
| 5 | No direct LLM calls |
| 6 | No direct external HTTP |
| 7 | `tenantId` on every repository operation |
| 8 | Tests pass · coverage ≥ 80% |
| 9 | Boot · shutdown · warm restart tests pass |
| 10 | EnterpriseReadiness probe registered |

---

# 11. Acceptance Criteria

## 11.1 Definition of Done (A-007)

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | `lib/aurora/` scaffold matches Appendix A | File tree review |
| 2 | `createAuroraWiring()` implements §4.2 registration order | Code review |
| 3 | `AuroraFacade` admin + health operations functional | Integration tests |
| 4 | Stub operation groups throw `AURORA_ERR_0501` | Contract tests |
| 5 | 10-phase boot completes in < 12s (test env) | Boot timing test |
| 6 | Graceful shutdown with drain | Shutdown tests |
| 7 | Warm restart preserves tenant data | P-011.2 test |
| 8 | TenantService · BrandService CRUD with RLS | Unit + integration tests |
| 9 | Scheduler · Queue · Retry · CircuitBreaker operational | Unit tests |
| 10 | AuroraEventPublisher publishes admin events | Integration test |
| 11 | `/api/aurora/health` returns AuroraHealthReport | API test |
| 12 | EnterpriseReadinessService probe registered | Integration test |
| 13 | Coverage ≥ 80% on A-007 scope | CI report |
| 14 | `typecheck` · `lint` · `test` · `build` pass | CI pipeline |
| 15 | Mission completion report submitted | Documentation |

## 11.2 Implementation Checklist

See [Appendix F](#appendix-f--implementation-checklist).

## 11.3 Required Tests

| Category | Minimum Count |
|----------|:-------------:|
| Unit tests | 40+ |
| Integration tests | 20+ |
| Lifecycle tests | 12+ |
| Health tests | 4+ |
| **Total** | **76+** |

## 11.4 Operational Readiness

| Check | Target |
|-------|--------|
| Boot time p95 | < 12s |
| Shutdown time p95 | < 45s |
| Health endpoint latency p95 | < 200ms |
| Warm restart RTO | < 15s |
| Zero cross-tenant data leakage | Verified by test |

## 11.5 Engineering Sign-Off

| Role | Sign-Off Criteria |
|------|-------------------|
| **A-007 Mission Lead** | All DoD criteria met |
| **Architecture Review Board** | EP/RP/ER rules enforced |
| **ORION Chief Enterprise Architect** | ORION integration patterns followed |
| **Security Lead** | RLS · tenant isolation verified |
| **QA** | All tests pass · coverage met |

---

# 12. Executive Recommendation

## 12.1 Implementation Readiness

| Dimension | Status |
|-----------|:------:|
| Architecture (A-005) | ✅ Ratified |
| Backlog (A-006) | ✅ Ratified |
| Engineering spec (ES-AURORA-005) | ✅ This document |
| ORION patterns (HCM · Procurement) | ✅ Proven |
| Dependencies tracked | ⚠️ Redis · Gate 7 PostgreSQL |
| Team authorization | ✅ A-007 authorized |

**ES-AURORA-005 is complete and ready for A-007 implementation.**

## 12.2 Approval

| Authorization | Status |
|---------------|:------:|
| ES-AURORA-005 Platform Foundation spec | **✅ RATIFIED** |
| A-007 implementation kickoff | **✅ AUTHORIZED** |
| `lib/aurora/` folder creation | **✅ AUTHORIZED** |
| Developer Preview v0.1.0-dp (on A-007 completion) | **✅ AUTHORIZED** |

## 12.3 Next Engineering Mission

| Field | Value |
|-------|-------|
| **Mission** | A-007 — Platform Foundation Implementation |
| **Spec** | ES-AURORA-005 (this document) |
| **Duration** | 8 weeks · 4 sprints |
| **First sprint** | Scaffold · persistence · admin repositories |
| **Second sprint** | Services · wiring · facade |
| **Third sprint** | Infrastructure · boot · shutdown |
| **Fourth sprint** | Tests · health · certification · DP release |
| **After A-007** | ES-AURORA-006 (A-008 Knowledge & Memory) |

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Folder Layout

```
lib/aurora/
├── index.ts                          # Public exports ONLY
├── constants.ts
├── types.ts
├── AuroraFacade.ts
├── createAuroraWiring.ts
├── admin/
│   ├── AdminModuleRuntime.ts
│   ├── repositories/
│   │   ├── TenantRepository.ts
│   │   ├── BrandRepository.ts
│   │   ├── InMemoryTenantRepository.ts
│   │   └── PostgresTenantRepository.ts
│   └── services/
│       ├── TenantService.ts
│       └── BrandService.ts
├── agents/                           # Stub A-007 · full A-017
│   ├── AgentRegistry.ts              # Stub
│   └── prompts/
│       └── PromptRegistry.ts         # Stub
├── errors/
│   └── AuroraError.ts
├── events/
│   ├── AuroraEventPublisher.ts
│   ├── aurora-event-catalog.ts
│   └── registerAuroraSubscribers.ts  # Stub
├── infrastructure/
│   ├── SchedulerService.ts
│   ├── QueueManager.ts
│   ├── RetryManager.ts
│   ├── CircuitBreakerRegistry.ts
│   ├── CircuitBreaker.ts
│   └── WorkflowEngine.ts             # Stub
├── integrations/
│   └── registry/
│       └── ConnectorRegistry.ts
├── persistence/
│   ├── AuroraPlatformBacking.ts
│   ├── createAuroraStore.ts
│   ├── createAuroraRepositories.ts
│   ├── PostgresAuroraRepository.ts
│   ├── InMemoryAuroraRepository.ts
│   └── migrations/
│       └── 001_aurora_admin_tables.sql
├── platform/
│   ├── AuroraSecretsResolver.ts
│   └── services/
│       ├── ConfigurationService.ts
│       ├── AuroraHealthStatusService.ts
│       ├── AuroraMetricsCollector.ts
│       ├── AuroraLoggingService.ts
│       ├── AuroraTracingService.ts
│       └── NotificationBindingService.ts  # Stub
├── runtime/
│   ├── AuroraRuntime.ts
│   ├── AuroraBootstrap.ts
│   ├── AuroraShutdown.ts
│   ├── AuroraRecovery.ts
│   ├── AuroraRuntimeContext.ts
│   ├── AuroraContextFactory.ts
│   ├── AuroraRuntimeConfiguration.ts
│   ├── PlatformLifecycleState.ts
│   ├── AuroraModuleRegistry.ts
│   ├── AuroraInitOrchestrator.ts
│   └── initializeAuroraModule.ts
└── wiring/
    ├── AuroraWiringConfig.ts
    ├── AuroraWiring.ts
    ├── createTestAuroraWiring.ts
    ├── createAuroraPersistenceWiring.ts
    └── createAuroraPlatformWiring.ts

app/api/aurora/
└── health/
    └── route.ts                      # A-007 only API route

tests/aurora/
├── unit/
│   ├── admin/
│   ├── infrastructure/
│   ├── platform/
│   └── runtime/
└── integration/
    ├── wiring/
    ├── lifecycle/
    └── health/

types/
├── aurora-admin.ts
└── aurora-platform.ts
```

## Appendix B — Dependency Graph

```
AuroraWiringConfig
    │
    ├── PlatformStore (ORION)
    │   └── AuroraPlatformBacking
    │       └── Repositories (tenant · brand · schedule)
    │
    ├── ConfigurationService
    ├── RetryManager
    ├── CircuitBreakerRegistry
    ├── AuroraEventPublisher ← EventBus (ORION)
    ├── ConnectorRegistry (empty)
    ├── QueueManager ← Redis · RetryManager
    ├── SchedulerService ← Redis · QueueManager · ScheduleRepository
    │
    ├── TenantService ← TenantRepository · EventPublisher · Audit
    ├── BrandService ← BrandRepository · TenantService · EventPublisher
    │
    ├── AuroraHealthStatusService ← Repositories · Redis · PlatformStore
    ├── AuroraMetricsCollector
    ├── AuroraLoggingService
    ├── AuroraTracingService
    │
    ├── AdminModuleRuntime ← TenantService · BrandService
    ├── AuroraModuleRegistry ← AdminModuleRuntime
    │
    └── AuroraFacade ← All above + stub operation groups
            │
            └── EnterpriseReadinessService probe
```

## Appendix C — Runtime Lifecycle

```
                    ┌──────────┐
                    │ created  │
                    └────┬─────┘
                         │ boot()
                         ▼
                  ┌─────────────┐
           ┌─────│ initializing │─────┐
           │     └─────────────┘     │
           │ fail (critical)    success
           ▼                         ▼
      ┌────────┐              ┌───────────┐
      │ failed │              │   ready   │◄──┐
      └────┬───┘              └─────┬─────┘   │ recover
           │ retry                  │         │
           └────────────────────────┤ degraded┘
                                    │ shutdown()
                                    ▼
                              ┌───────────┐
                              │ draining  │
                              └─────┬─────┘
                                    │
                                    ▼
                              ┌───────────┐
                              │ shutdown  │
                              └───────────┘
```

## Appendix D — Registration Matrix

| Order | Component | Registry | Boot Phase |
|:-----:|-----------|----------|:----------:|
| 1 | PlatformStore backing | Internal | 3 |
| 2 | Repositories | Internal | 3 |
| 3 | ConfigurationService | Wiring | 1 |
| 4 | RetryManager | Wiring | 5 |
| 5 | CircuitBreakerRegistry | Wiring | 5 |
| 6 | AuroraEventPublisher | Wiring | 5 |
| 7 | ConnectorRegistry | Wiring | 5 |
| 8 | QueueManager | Wiring | 8 |
| 9 | SchedulerService | Wiring | 8 |
| 10 | TenantService | Wiring | 6 |
| 11 | BrandService | Wiring | 6 |
| 12 | AdminModuleRuntime | ModuleRegistry | 6 |
| 13 | HealthStatusService | Wiring | 9 |
| 14 | AuroraFacade | Wiring | 9 |
| 15 | Readiness probe | ORION | 10 |

## Appendix E — Service Catalogue (A-007)

| # | Service | File | Dependencies | Tests |
|---|---------|------|-------------|:-----:|
| 1 | TenantService | admin/services/TenantService.ts | TenantRepo · Events · Audit | ✅ |
| 2 | BrandService | admin/services/BrandService.ts | BrandRepo · Tenant · Events | ✅ |
| 3 | ConfigurationService | platform/services/ConfigurationService.ts | Config tables | ✅ |
| 4 | SchedulerService | infrastructure/SchedulerService.ts | Redis · Queue · ScheduleRepo | ✅ |
| 5 | QueueManager | infrastructure/QueueManager.ts | Redis · RetryManager | ✅ |
| 6 | RetryManager | infrastructure/RetryManager.ts | — | ✅ |
| 7 | CircuitBreakerRegistry | infrastructure/CircuitBreakerRegistry.ts | — | ✅ |
| 8 | AuroraEventPublisher | events/AuroraEventPublisher.ts | EventBus | ✅ |
| 9 | ConnectorRegistry | integrations/registry/ConnectorRegistry.ts | — | ✅ |
| 10 | AuroraHealthStatusService | platform/services/AuroraHealthStatusService.ts | Repos · Redis · Store | ✅ |
| 11 | AuroraMetricsCollector | platform/services/AuroraMetricsCollector.ts | — | ✅ |
| 12 | AuroraLoggingService | platform/services/AuroraLoggingService.ts | Config | ✅ |
| 13 | AuroraTracingService | platform/services/AuroraTracingService.ts | Config | ✅ |
| 14 | AuroraRuntime | runtime/AuroraRuntime.ts | Bootstrap · Shutdown | ✅ |
| 15 | AuroraBootstrap | runtime/AuroraBootstrap.ts | All wiring | ✅ |
| 16 | AuroraShutdown | runtime/AuroraShutdown.ts | Wiring | ✅ |
| 17 | AuroraFacade | AuroraFacade.ts | All services | ✅ |

## Appendix F — Implementation Checklist

### Sprint 1 — Scaffold & Persistence

- [ ] Create `lib/aurora/` folder structure (Appendix A)
- [ ] `AuroraError` · constants · types
- [ ] `AuroraPlatformBacking` · `ensureAuroraPlatformBacking()`
- [ ] Admin migrations `001_aurora_admin_tables.sql`
- [ ] `TenantRepository` · `BrandRepository` (in-memory + Postgres)
- [ ] `createAuroraRepositories()`
- [ ] Unit tests for repositories

### Sprint 2 — Services & Wiring

- [ ] `TenantService` · `BrandService`
- [ ] `ConfigurationService`
- [ ] `AuroraEventPublisher` · event catalog
- [ ] `createAuroraWiring()` registration order §4.2
- [ ] `AuroraFacade` admin + health + stubs
- [ ] `lib/aurora/index.ts` public exports
- [ ] Unit tests for services · wiring tests

### Sprint 3 — Infrastructure & Lifecycle

- [ ] `SchedulerService` · `QueueManager`
- [ ] `RetryManager` · `CircuitBreakerRegistry`
- [ ] `ConnectorRegistry` (empty)
- [ ] `AuroraRuntime` · `AuroraBootstrap` · `AuroraShutdown`
- [ ] `AuroraRecovery.verifyWarmRestart()`
- [ ] `AdminModuleRuntime` · `AuroraModuleRegistry`
- [ ] `initializeAuroraModule()`
- [ ] Lifecycle integration tests

### Sprint 4 — Observability & Certification

- [ ] `AuroraHealthStatusService` · metrics · logging · tracing
- [ ] `GET /api/aurora/health` route
- [ ] EnterpriseReadinessService probe registration
- [ ] Warm restart certification test
- [ ] Coverage ≥ 80% verification
- [ ] Mission completion report
- [ ] Developer Preview v0.1.0-dp tag

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | ES-AURORA-005 — Platform Foundation Implementation Specification |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Classification** | Engineering Specification · Platform Foundation |
| **Implements** | A-005 Runtime Architecture |
| **Authorizes** | A-007 Platform Foundation Implementation |
| **Next Spec** | ES-AURORA-006 — Knowledge & Memory Layer |

---

### Project Aurora

*Specification Complete · Implementation Authorized · Powered by ORION*

**Let's build something remarkable.**

