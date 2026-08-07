# ES-AURORA-008 — Aurora AI Workforce Runtime Implementation Specification

**Document ID:** ES-AURORA-008  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-010 — AI Workforce Runtime  
**Prior Missions:** A-007 (ES-AURORA-005) · A-008 (ES-AURORA-006) · A-009 (ES-AURORA-007)  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Specification  
**Classification:** Engineering Specification · AI Workforce · Agent Runtime · Orchestration · Collaboration  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Architecture Source:** [A-003 AI Workforce Architecture](../A-003-Aurora-AI-Workforce-Architecture.md)  
**Platform Parent:** [ES-AURORA-005 Platform Foundation](./ES-AURORA-005-Platform-Foundation-Implementation-Specification.md) · [ES-AURORA-006 Identity/Tenant/Config](./ES-AURORA-006-Identity-Tenant-and-Configuration-Foundation.md) · [ES-AURORA-007 Knowledge & Memory](./ES-AURORA-007-Enterprise-Knowledge-Graph-and-Memory-Infrastructure.md)  
**Effective Date:** 7 August 2026  
**Subordinate To:** A-001 · A-003 · A-005 · ES-AURORA-005 · ES-AURORA-006 · ES-AURORA-007

**Rule:** This document is the **authoritative engineering specification** for Aurora AI Workforce Runtime (Mission A-010). All code in `lib/aurora/workforce/` and agent runtime subsystems must comply. **No production implementation in this document.** **Specification only.**

**Scope:** AuroraWorkforceRuntime · AgentRegistry · AgentFactory · task orchestration · collaboration engine · execution context · decision routing · operational intelligence · 14-agent catalogue · ORION integration. **Excludes:** Individual agent prompt content · domain module services · UI agent panels · Phase 2 agent full implementations (stubbed).

---

## Engineering Principles (Binding)

| # | Principle | Enforcement |
|---|-----------|-------------|
| **WR-1** | **AuroraWorkforceRuntime is the sole runtime host** | All agent execution flows through runtime · no bypass |
| **WR-2** | **Every agent registered through AgentRegistry** | No ad-hoc agent instantiation |
| **WR-3** | **Agents communicate only through approved runtime contracts** | CollaborationEngine · TaskRouter · event bus |
| **WR-4** | **No direct inter-agent dependencies** | Agents never import other agents |
| **WR-5** | **Every task carries complete context** | tenant · brand · business · security · knowledge · memory |
| **WR-6** | **Knowledge retrieval precedes execution** | KnowledgeRetrievalService.preflight() before LLM |
| **WR-7** | **Human approval where thresholds require it** | DecisionEngine · ApprovalGate integration |
| **WR-8** | **Agent execution is fully auditable** | Every invocation logged · attributed · traceable |
| **WR-9** | **Agent failures are isolated** | Circuit breaker · no cascade to runtime |
| **WR-10** | **Runtime supports horizontal scaling** | Stateless workers · queue-backed tasks · Redis coordination |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [AI Workforce Runtime](#2-ai-workforce-runtime)
3. [Agent Registry](#3-agent-registry)
4. [Agent Lifecycle](#4-agent-lifecycle)
5. [Task Orchestration](#5-task-orchestration)
6. [Collaboration Engine](#6-collaboration-engine)
7. [Execution Context](#7-execution-context)
8. [Operational Intelligence](#8-operational-intelligence)
9. [Testing Strategy](#9-testing-strategy)
10. [Engineering Standards](#10-engineering-standards)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Executive Recommendation](#12-executive-recommendation)

**Appendices:** [A — Agent Catalogue](#appendix-a--agent-catalogue) · [B — Lifecycle Diagrams](#appendix-b--lifecycle-diagrams) · [C — Task Flow Diagrams](#appendix-c--task-flow-diagrams) · [D — Context Model](#appendix-d--context-model) · [E — Runtime Metrics](#appendix-e--runtime-metrics) · [F — Implementation Checklist](#appendix-f--implementation-checklist)

---

# Preamble

Fourteen agents. One runtime. Zero chaos.

A-003 defined Aurora's AI marketing workforce — organizational hierarchy, delegation protocols, decision authority, and collaboration patterns. ES-AURORA-008 converts that architecture into **implementation-ready engineering guidance** — the runtime that hosts, routes, collaborates, and governs every agent invocation.

Without this runtime, agents are prompts without discipline. With it, Aurora delivers enterprise-grade AI marketing execution.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Implementation specification for Aurora AI Workforce Runtime |
| **Audience** | AI architects · backend engineers · agent engineers · platform operators |
| **Binding authority** | Mission A-010 · all `lib/aurora/workforce/` code |
| **Deliverable type** | Engineering specification — no code |

## 1.2 Scope

### In Scope (A-010)

| Area | Coverage |
|------|----------|
| **Workforce runtime** | AuroraWorkforceRuntime · lifecycle · state model · recovery |
| **Agent registry** | Registration · discovery · metadata · health · versioning |
| **Agent lifecycle** | Init · activate · suspend · retire · failure recovery |
| **Task orchestration** | Routing · queue · priority · delegation · parallel · retry |
| **Collaboration** | Inter-agent communication · consensus · escalation · approval |
| **Execution context** | 8-layer context assembly · runtime policies |
| **Decision integration** | Confidence · risk · authority tiers · approval gates |
| **Operational intelligence** | Metrics · tracing · KPIs · alerts · audit |
| **Agent catalogue** | 14 agents · Phase 1: 10 active · Phase 2: 4 stubbed |
| **ORION integration** | Identity · AI Provider · Event Bus · Audit |

### Out of Scope

| Exclusion | Mission |
|-----------|---------|
| Individual agent prompt authoring | A-017+ per agent |
| Domain module services (Content · SEO · Campaign) | A-011+ |
| Approval Engine full implementation | A-015 |
| UI agent interaction panel | A-019 |
| Phase 2 agent business logic | A-031 |

### Phase Delivery

| Phase | Agents | Runtime Capability |
|-------|:------:|-------------------|
| **A-010 (Phase 1 core)** | Registry + runtime + 0 agents (infrastructure) | Full runtime · stub agents |
| **A-010 (Phase 1 complete)** | 10 Phase 1 agents registered | Invoke · delegate · collaborate |
| **Phase 2 (A-031)** | 4 Phase 2 agents active | Full 14-agent workforce |

## 1.3 Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Sole runtime host** | All agent execution via AuroraWorkforceRuntime |
| 2 | **AgentRegistry** | 14 agents registered · discoverable · health-checked |
| 3 | **Task orchestration** | Route · queue · delegate · parallel · retry |
| 4 | **Collaboration engine** | Multi-agent workflows · consensus · escalation |
| 5 | **Execution context** | 8-layer immutable context per task |
| 6 | **Knowledge pre-flight** | Mandatory before every LLM invocation |
| 7 | **Decision routing** | Tier 0–4 · confidence · approval gates |
| 8 | **Failure isolation** | Agent failure does not crash runtime |
| 9 | **Full audit trail** | Every invocation logged with correlation ID |
| 10 | **Horizontal scaling** | Queue-backed workers · stateless execution |

## 1.4 Relationship with Architecture Documents

| Document | ES-AURORA-008 Response |
|----------|------------------------|
| **A-001** | Human oversight · approval gates · transparency · agent accountability |
| **A-002** | `lib/aurora/workforce/` · AgentOrchestrator patterns · EP-7 pre-flight |
| **A-003** | **Full runtime implementation** of workforce architecture |
| **A-004** | KnowledgeRetrievalService integration · memory tier access |
| **A-005** | Boot Phase 7 · workforce module registration |
| **A-006** | Mission A-010 · EP-AI epic · workforce runtime before agent missions |
| **A-007 / ES-AURORA-005** | Module registry · wiring extension · queue infrastructure |
| **A-008 / ES-AURORA-006** | AuroraRuntimeContext · RBAC · config · token budgets |
| **A-009 / ES-AURORA-007** | KnowledgeRetrievalService · MemoryService · LearningService ports |

---

# 2. AI Workforce Runtime

## 2.1 AuroraWorkforceRuntime

**File:** `lib/aurora/workforce/AuroraWorkforceRuntime.ts`

The **sole runtime host** for all Aurora AI agent execution. No service, module, or API may invoke an agent except through this runtime.

```typescript
export interface AuroraWorkforceRuntime {
  /** Boot-time initialization — register agents · wire dependencies */
  initialize(ctx: WorkforceInitContext): Promise<WorkforceRuntimeState>;

  /** Graceful shutdown — drain queue · suspend agents · release resources */
  shutdown(options?: ShutdownOptions): Promise<void>;

  /** Warm restart — reload registry · preserve queue state */
  warmRestart(): Promise<WorkforceRuntimeState>;

  /** Recovery after failure — rebuild state from persistence */
  recover(fromCheckpoint?: RuntimeCheckpoint): Promise<WorkforceRuntimeState>;

  /** Primary execution entry — invoke single agent task */
  execute(ctx: AuroraRuntimeContext, request: AgentExecutionRequest): Promise<AgentExecutionResult>;

  /** Multi-agent workflow execution */
  executeWorkflow(ctx: AuroraRuntimeContext, workflow: AgentWorkflowDefinition): Promise<WorkflowExecutionResult>;

  /** Runtime health and state */
  getState(): WorkforceRuntimeState;
  healthCheck(): Promise<WorkforceHealthStatus>;
}
```

| Rule | Description |
|------|-------------|
| **RT-1** | Single instance per Aurora process · horizontal scale via worker replicas |
| **RT-2** | Runtime state persisted to Redis + PostgreSQL for recovery |
| **RT-3** | All public methods require `AuroraRuntimeContext` |
| **RT-4** | Runtime never calls LLM directly — delegates to agent via AgentExecutor |
| **RT-5** | Runtime coordinates KnowledgeRetrievalService pre-flight before agent LLM |

## 2.2 Runtime Lifecycle

```
Platform Boot Phase 7
    ↓
WorkforceModuleRuntime.initialize()
    ↓
AuroraWorkforceRuntime.initialize()
    ├── Load AgentRegistry definitions
    ├── Register Phase 1 agents via AgentFactory
    ├── Wire KnowledgeRetrievalService · MemoryService · DecisionEngine
    ├── Start TaskQueue workers
    ├── Register event subscribers
    └── Health check all agents
    ↓
State: READY
    ↓
Accept tasks (execute · executeWorkflow)
    ↓
Shutdown signal
    ├── Stop accepting new tasks
    ├── Drain in-flight tasks (timeout 60s)
    ├── Suspend all agents
    ├── Persist runtime checkpoint
    └── Release Redis locks
    ↓
State: STOPPED
```

## 2.3 Startup Sequence

**File:** `lib/aurora/workforce/lifecycle/WorkforceStartupSequence.ts`

| Step | Action | Failure Mode |
|:----:|--------|--------------|
| 1 | Validate dependencies (knowledge · identity · config · AI provider) | Abort boot if critical |
| 2 | Run workforce migrations | Abort |
| 3 | Initialize AgentRegistry from definitions | Abort |
| 4 | AgentFactory.create() for each Phase 1 agent | Degraded if non-critical agent fails |
| 5 | Register TaskQueue · CollaborationEngine | Abort |
| 6 | Warm PromptRegistry cache | Degraded |
| 7 | Verify KnowledgeRetrievalService connectivity | Degraded (keyword-only fallback) |
| 8 | Start background workers (N = config) | Abort if zero workers |
| 9 | Emit `aurora.workforce.ready` | — |
| 10 | Set state → READY | — |

**Boot integration (A-005 Phase 7):**

```
Phase 7 — Workforce Runtime
    ├── WorkforceModuleRuntime.initialize()
    ├── AuroraWorkforceRuntime.initialize()
    ├── Register 10 Phase 1 agents
    └── Verify workforce health
```

## 2.4 Shutdown Sequence

| Step | Action | Timeout |
|:----:|--------|:-------:|
| 1 | Set state → DRAINING | — |
| 2 | Stop TaskQueue enqueue | Immediate |
| 3 | Wait for in-flight tasks | 60s |
| 4 | Suspend all active agents | 10s |
| 5 | Persist RuntimeCheckpoint | 5s |
| 6 | Stop workers · release locks | 5s |
| 7 | Set state → STOPPED | — |

## 2.5 Warm Restart

Used for configuration reload · agent registry update · prompt version deploy without full platform restart.

```
1. Set state → RESTARTING
2. Drain current tasks (no new enqueue)
3. Reload AgentRegistry definitions
4. AgentFactory.refresh() — recreate changed agents only
5. Invalidate PromptRegistry cache
6. Reload runtime policies from ConfigurationService
7. Resume TaskQueue workers
8. Set state → READY
9. Emit aurora.workforce.restarted
```

**Target downtime:** < 5 seconds for in-flight task drain overlap.

## 2.6 Recovery

**File:** `lib/aurora/workforce/lifecycle/WorkforceRecoveryService.ts`

| Scenario | Recovery Procedure | RPO | RTO |
|----------|---------------------|-----|-----|
| Worker crash | Remaining workers claim orphaned tasks from queue | 0 | < 30s |
| Redis loss | Rebuild working state · session memory rebuilt on demand | Session data | < 2 min |
| Runtime checkpoint restore | Load checkpoint · replay incomplete workflows | 1 min | < 4 min |
| Full process restart | Boot Phase 7 · recover from PostgreSQL task state | 1 min | < 5 min |
| Agent failure loop | Circuit breaker opens · agent suspended · alert | 0 | Immediate |

```typescript
export interface RuntimeCheckpoint {
  readonly checkpointId: string;
  readonly state: WorkforceRuntimeState;
  readonly activeWorkflows: readonly WorkflowCheckpoint[];
  readonly queueDepth: number;
  readonly createdAt: string;
}
```

## 2.7 Runtime State Model

```typescript
export type WorkforceRuntimeState =
  | 'initializing'
  | 'ready'
  | 'draining'
  | 'restarting'
  | 'degraded'
  | 'stopped'
  | 'failed';

export interface WorkforceStateSnapshot {
  readonly state: WorkforceRuntimeState;
  readonly registeredAgents: number;
  readonly activeAgents: number;
  readonly suspendedAgents: readonly string[];
  readonly queueDepth: number;
  readonly inFlightTasks: number;
  readonly workersActive: number;
  readonly lastHealthCheck: string;
  readonly degradedReasons: readonly string[];
}
```

| State | Accepts Tasks | Description |
|-------|:-------------:|-------------|
| `initializing` | ❌ | Boot in progress |
| `ready` | ✅ | Normal operation |
| `draining` | ❌ | Shutdown in progress |
| `restarting` | ❌ | Warm restart |
| `degraded` | ✅ (limited) | Non-critical agent or service unavailable |
| `stopped` | ❌ | Clean shutdown |
| `failed` | ❌ | Unrecoverable · manual intervention |

## 2.8 WorkforceModuleRuntime

**File:** `lib/aurora/workforce/WorkforceModuleRuntime.ts`

```typescript
export class WorkforceModuleRuntime implements AuroraModuleRuntime {
  readonly moduleKey = 'workforce';
  readonly displayName = 'AI Workforce Runtime';
  readonly phase = 1 as const;
  readonly tier = 7;                    // Agent tier per A-005 registry
  readonly dependencies = ['admin', 'knowledge', 'config'] as const;

  async initialize(ctx: ModuleInitContext): Promise<ModuleHealth> {
    await this.runtime.initialize(ctx.toWorkforceInitContext());
    return { status: 'healthy', moduleKey: this.moduleKey };
  }

  async healthCheck(): Promise<HealthStatus> {
    return this.runtime.healthCheck();
  }

  async shutdown(): Promise<void> {
    await this.runtime.shutdown();
  }
}
```

---

# 3. Agent Registry

## 3.1 AgentRegistry

**File:** `lib/aurora/workforce/registry/AgentRegistry.ts`

Central catalogue of all 14 Aurora agents. **WR-2:** No agent exists outside the registry.

```typescript
export interface AgentRegistry {
  /** Register agent definition at boot */
  register(definition: AgentDefinition): void;

  /** Resolve agent by codename */
  resolve(codename: AgentCodename): AgentDefinition | undefined;

  /** List agents matching capability query */
  discover(query: AgentDiscoveryQuery): readonly AgentDefinition[];

  /** List all registered agents */
  list(filter?: AgentListFilter): readonly AgentDefinition[];

  /** Check agent availability */
  isAvailable(codename: AgentCodename): boolean;

  /** Get agent health status */
  getHealth(codename: AgentCodename): AgentHealthStatus;

  /** Get all agent health statuses */
  healthCheckAll(): Promise<Readonly<Record<AgentCodename, AgentHealthStatus>>>;

  /** Suspend agent (circuit breaker · manual) */
  suspend(codename: AgentCodename, reason: string): void;

  /** Resume suspended agent */
  resume(codename: AgentCodename): void;
}
```

## 3.2 AgentFactory

**File:** `lib/aurora/workforce/registry/AgentFactory.ts`

Creates agent instances from registry definitions. Agents are **stateless** — factory produces new instance or returns pooled instance.

```typescript
export interface AgentFactory {
  create(codename: AgentCodename, deps: AgentDependencies): AuroraAgent;
  refresh(codename: AgentCodename): AuroraAgent;
  destroy(codename: AgentCodename): void;
  createAll(definitions: readonly AgentDefinition[]): ReadonlyMap<AgentCodename, AuroraAgent>;
}

export interface AgentDependencies {
  readonly retrievalService: KnowledgeRetrievalService;
  readonly memoryService: MemoryService;
  readonly learningService: LearningService;
  readonly promptRegistry: PromptRegistry;
  readonly guardrails: AgentGuardrails;
  readonly aiProvider: OrionAiProvider;
  readonly decisionEngine: DecisionEngine;
}
```

## 3.3 AgentMetadata

```typescript
export interface AgentDefinition {
  readonly codename: AgentCodename;
  readonly displayName: string;
  readonly department: AgentDepartment;
  readonly organizationalLevel: 1 | 2 | 3 | 4;
  readonly phase: 1 | 2;
  readonly capabilities: readonly AgentCapability[];
  readonly taskTypes: readonly AgentTaskType[];
  readonly authorityTier: AgentAuthorityTier;
  readonly maxConcurrentTasks: number;
  readonly defaultTimeoutMs: number;
  readonly escalationTarget: AgentCodename | 'human';
  readonly reportsTo: AgentCodename | null;
  readonly delegatesTo: readonly AgentCodename[];
  readonly knowledgeDomains: readonly KnowledgeDomain[];
  readonly memoryTiers: readonly MemoryTier[];
  readonly promptVersion: string;
  readonly kpiDefinitions: readonly AgentKpiDefinition[];
}
```

## 3.4 Capabilities

```typescript
export type AgentCapability =
  | 'task.decompose'
  | 'task.delegate'
  | 'content.generate'
  | 'content.plan'
  | 'seo.analyze'
  | 'seo.optimize'
  | 'creative.direct'
  | 'campaign.manage'
  | 'campaign.optimize'
  | 'ads.manage'
  | 'social.schedule'
  | 'analytics.report'
  | 'analytics.health_score'
  | 'executive.brief'
  | 'knowledge.curate'
  | 'brand.intelligence'
  | 'customer.experience'
  | 'sales.intelligence'
  | 'conflict.arbitrate';
```

### Capability-to-Agent Mapping

| Capability | Primary Agent | Fallback |
|------------|---------------|----------|
| `task.decompose` | `agent.director` | — |
| `task.delegate` | `agent.director` | — |
| `content.generate` | `agent.copywriter` | `agent.strategist` |
| `content.plan` | `agent.strategist` | `agent.director` |
| `seo.analyze` | `agent.seo` | — |
| `seo.optimize` | `agent.seo` | — |
| `creative.direct` | `agent.creative` | — |
| `campaign.manage` | `agent.campaign` | `agent.director` |
| `campaign.optimize` | `agent.campaign` | — |
| `ads.manage` | `agent.ads` | `agent.campaign` |
| `social.schedule` | `agent.social` | — |
| `analytics.report` | `agent.analytics` | — |
| `executive.brief` | `agent.advisor` | — |
| `knowledge.curate` | `agent.knowledge` | — |
| `conflict.arbitrate` | `agent.director` | human |

## 3.5 Availability

| State | Meaning | Task Routing |
|-------|---------|--------------|
| **available** | Healthy · accepting tasks | Normal |
| **busy** | At max concurrent tasks | Queue |
| **suspended** | Circuit breaker or manual suspend | Route to fallback or escalate |
| **phase2_stub** | Phase 2 agent not yet implemented | Return explicit unavailable |
| **unhealthy** | Health check failed 3 consecutive | Suspend · alert |

**File:** `lib/aurora/workforce/registry/AgentAvailabilityTracker.ts`

## 3.6 Discovery

```typescript
export interface AgentDiscoveryQuery {
  readonly capabilities?: readonly AgentCapability[];
  readonly taskType?: AgentTaskType;
  readonly department?: AgentDepartment;
  readonly phase?: 1 | 2;
  readonly availableOnly?: boolean;
}

// TaskRouter uses discovery to select agent:
const candidates = registry.discover({
  capabilities: ['content.generate'],
  taskType: 'content.draft',
  availableOnly: true,
});
```

## 3.7 Registration

| Rule | Description |
|------|-------------|
| **REG-A1** | Agent codename unique · matches A-003 registry |
| **REG-A2** | Phase 2 agents register as stubs · return `phase2_stub` availability |
| **REG-A3** | Registration at boot only · warm restart for updates |
| **REG-A4** | Each agent has PromptRegistry entry before registration |
| **REG-A5** | Service identity per agent type for audit attribution |

### Registration Sequence

```
1. Load agent definition from AgentDefinitionCatalog
2. Validate Zod schema for metadata
3. Verify prompt template exists in PromptRegistry
4. AgentFactory.create(codename, deps)
5. registry.register(definition)
6. Health check agent.canHandle(testTask)
7. Emit aurora.agent.registered
```

## 3.8 Health

**File:** `lib/aurora/workforce/registry/AgentHealthMonitor.ts`

| Check | Frequency | Failure Threshold |
|-------|:---------:|:-----------------:|
| Agent responds to ping | 60s | 3 consecutive → suspend |
| Error rate (rolling 5 min) | Continuous | > 10% → suspend |
| Avg latency p95 | 5 min | > 2× baseline → degraded |
| Token budget exhaustion | Per invocation | Queue · not suspend |
| LLM provider connectivity | 60s | Inherited from platform circuit breaker |

```typescript
export interface AgentHealthStatus {
  readonly codename: AgentCodename;
  readonly status: 'healthy' | 'degraded' | 'unhealthy' | 'suspended';
  readonly errorRate: number;
  readonly avgLatencyMs: number;
  readonly activeTasks: number;
  readonly lastCheckAt: string;
  readonly lastError?: string;
}
```

## 3.9 Versioning

| Artifact | Version Strategy |
|----------|-----------------|
| Agent definition | Semantic version in metadata · git-tracked |
| Prompt templates | PromptRegistry version · independent of agent |
| Agent implementation | Module version · tied to deployment |
| Capability set | Immutable per agent version · new version = new registration |

**File:** `lib/aurora/workforce/registry/PromptRegistry.ts`

```typescript
export interface PromptRegistry {
  get(codename: AgentCodename, version?: string): Promise<PromptTemplate>;
  register(template: PromptTemplate): void;
  listVersions(codename: AgentCodename): readonly string[];
  getActiveVersion(codename: AgentCodename): string;
  rollback(codename: AgentCodename, version: string): void;
}
```

---

# 4. Agent Lifecycle

## 4.1 AuroraAgent Contract

**File:** `lib/aurora/workforce/agents/AuroraAgent.ts`

```typescript
export interface AuroraAgent {
  readonly codename: AgentCodename;
  readonly definition: AgentDefinition;

  /** Pre-execution validation */
  canHandle(task: AgentTask): boolean;

  /** Primary execution — runtime calls after context assembly + pre-flight */
  execute(input: AgentExecutionInput): Promise<AgentExecutionOutput>;

  /** Health ping */
  ping(): Promise<boolean>;

  /** Lifecycle hooks */
  onActivate(): Promise<void>;
  onSuspend(reason: string): Promise<void>;
  onRetire(): Promise<void>;
}
```

## 4.2 Lifecycle States

```
REGISTERED (boot)
    ↓
ACTIVATING (onActivate hook)
    ↓
IDLE (waiting for task)
    ↓
CONTEXT_ASSEMBLY (runtime prepares input)
    ↓
PREFLIGHT (KnowledgeRetrievalService)
    ↓
EXECUTING (LLM inference + guardrails)
    ↓
VALIDATING (output validation)
    ↓
DECISION (DecisionEngine routing)
    ↓
    ├── APPROVAL_PENDING → wait for human
    ├── HANDOFF → route to next agent
    └── COMPLETE → return result
    ↓
MEMORY_UPDATE (session · learning signals)
    ↓
AUDIT (log invocation)
    ↓
IDLE
```

| State | Transitions To |
|-------|---------------|
| `registered` | `activating` |
| `activating` | `idle` · `failed` |
| `idle` | `context_assembly` · `suspended` · `retired` |
| `executing` | `validating` · `failed` |
| `suspended` | `idle` · `retired` |
| `failed` | `idle` (after recovery) · `retired` |
| `retired` | Terminal |

## 4.3 Initialization

At boot, AgentFactory creates each agent and calls `onActivate()`:

| Step | Action |
|------|--------|
| 1 | Load agent class from `agents/{codename}/` |
| 2 | Inject dependencies (retrieval · memory · AI provider) |
| 3 | Validate prompt template loaded |
| 4 | Call `onActivate()` |
| 5 | Register in AgentRegistry |
| 6 | Run smoke test task |

## 4.4 Activation

Agent transitions to active (idle) state. Available for task routing.

## 4.5 Suspend

Triggers: circuit breaker · manual admin · health check failure · dependency unavailable.

```typescript
await agent.onSuspend('circuit_breaker: error rate 12%');
registry.suspend(codename, 'circuit_breaker');
// In-flight tasks complete · no new tasks routed
```

## 4.6 Resume

After suspend reason resolved:

```typescript
registry.resume(codename);
await agent.onActivate();
// Health check before accepting tasks
```

## 4.7 Retire

Permanent removal (agent version deprecated):

```typescript
await agent.onRetire();
registry.unregister(codename);  // admin only
AgentFactory.destroy(codename);
```

## 4.8 Health Monitoring

Continuous monitoring per §3.8. Integrated with Operational Intelligence (§8).

## 4.9 Failure Recovery

**File:** `lib/aurora/workforce/lifecycle/AgentFailureRecovery.ts`

| Failure Type | Recovery Action |
|--------------|----------------|
| LLM timeout | Retry once · then escalate |
| LLM rate limit | Queue with backoff |
| Guardrail rejection | Return error to caller · no retry |
| Retrieval insufficient | Escalate per WR-6 · no LLM call |
| Agent exception | Log · circuit breaker increment · isolate |
| 3 consecutive failures | Suspend agent · alert · route to fallback |

**WR-9:** Agent failure never crashes AuroraWorkforceRuntime.

## 4.10 Replacement

When agent suspended, TaskRouter applies fallback chain:

```
Primary agent unavailable
    ↓
Check fallback agent (from capability mapping)
    ↓
Fallback available → route
    ↓
No fallback → escalate to reportsTo agent
    ↓
Director unavailable → escalate to human
```

---

# 5. Task Orchestration

## 5.1 TaskRouter

**File:** `lib/aurora/workforce/orchestration/TaskRouter.ts`

```typescript
export interface TaskRouter {
  /** Route single task to best agent */
  route(ctx: AuroraRuntimeContext, task: AgentTask): Promise<RoutingDecision>;

  /** Route with explicit delegation from director */
  delegate(ctx: AuroraRuntimeContext, from: AgentCodename, to: AgentCodename, task: AgentTask): Promise<RoutingDecision>;

  /** Resolve routing for workflow step */
  routeWorkflowStep(ctx: AuroraRuntimeContext, step: WorkflowStep): Promise<RoutingDecision>;
}

export interface RoutingDecision {
  readonly targetAgent: AgentCodename;
  readonly routingReason: string;
  readonly fallbackAgent?: AgentCodename;
  readonly estimatedLatencyMs: number;
  readonly priority: TaskPriority;
}
```

### Routing Rules (A-003 TD-1–TD-6)

| Rule | Description |
|------|-------------|
| **TD-1** | Marketing Director is sole entry for cross-department tasks |
| **TD-2** | Department heads delegate within department only |
| **TD-3** | Specialists do not delegate — produce deliverables |
| **TD-4** | Cross-department requests route through Director |
| **TD-5** | Each delegation includes task · context · deadline · success criteria |
| **TD-6** | All delegations logged with correlation ID |

### Task-to-Agent Routing Table

| Task Type | Primary Agent | Fallback |
|-----------|---------------|----------|
| `strategy.plan` | `agent.director` | — |
| `content.topic` | `agent.strategist` | `agent.director` |
| `content.draft` | `agent.copywriter` | `agent.strategist` |
| `content.plan` | `agent.strategist` | — |
| `seo.audit` | `agent.seo` | — |
| `seo.optimize` | `agent.seo` | — |
| `creative.brief` | `agent.creative` | — |
| `creative.review` | `agent.creative` | — |
| `campaign.plan` | `agent.campaign` | `agent.director` |
| `campaign.optimize` | `agent.campaign` | — |
| `ads.strategy` | `agent.ads` | `agent.campaign` |
| `social.schedule` | `agent.social` | — |
| `analytics.report` | `agent.analytics` | — |
| `analytics.health` | `agent.analytics` | — |
| `executive.brief` | `agent.advisor` | — |
| `knowledge.curate` | `agent.knowledge` | — |
| `conflict.resolve` | `agent.director` | human |

## 5.2 TaskQueue

**File:** `lib/aurora/workforce/orchestration/TaskQueue.ts`

```typescript
export interface TaskQueue {
  enqueue(ctx: AuroraRuntimeContext, task: QueuedAgentTask): Promise<TaskId>;
  dequeue(workerId: string): Promise<QueuedAgentTask | null>;
  acknowledge(taskId: TaskId, workerId: string): Promise<void>;
  nack(taskId: TaskId, reason: string, requeue?: boolean): Promise<void>;
  getDepth(priority?: TaskPriority): Promise<number>;
  purge(ctx: AuroraRuntimeContext, filter: TaskPurgeFilter): Promise<number>;
}
```

| Field | Value |
|-------|-------|
| Backend | Redis (Phase 1) · PostgreSQL task state for recovery |
| Key prefix | `aurora:workforce:queue:{tenantId}:{priority}` |
| Visibility timeout | 120s (configurable) |
| Max queue depth per tenant | Tier-based (Starter: 100 · Pro: 500 · Enterprise: 2000) |

## 5.3 Priority Engine

**File:** `lib/aurora/workforce/orchestration/PriorityEngine.ts`

| Priority | Value | Use Case |
|----------|:-----:|----------|
| **critical** | 0 | Executive alerts · brand safety · system recovery |
| **high** | 1 | Campaign launch · approval deadlines |
| **normal** | 2 | Standard agent tasks |
| **low** | 3 | Background learning · scheduled reports |
| **batch** | 4 | Bulk ingestion · consolidation |

```typescript
export interface PriorityEngine {
  computePriority(task: AgentTask, ctx: AuroraRuntimeContext): TaskPriority;
  canPreempt(incoming: TaskPriority, current: TaskPriority): boolean;
}
```

Priority factors: task type · campaign urgency · human-initiated vs scheduled · tenant tier · SLA deadline.

## 5.4 Delegation

**File:** `lib/aurora/workforce/orchestration/DelegationService.ts`

```typescript
export interface DelegationService {
  delegate(ctx: AuroraRuntimeContext, request: DelegationRequest): Promise<DelegationResult>;
  getDelegationChain(correlationId: string): Promise<readonly DelegationRecord[]>;
}

export interface DelegationRequest {
  readonly fromAgent: AgentCodename;
  readonly toAgent: AgentCodename;
  readonly task: AgentTask;
  readonly context: AgentExecutionContext;
  readonly deadline?: string;
  readonly successCriteria?: string;
  readonly correlationId: string;
}
```

Director delegation flow validates organizational hierarchy before routing.

## 5.5 Scheduling

**File:** `lib/aurora/workforce/orchestration/AgentScheduler.ts`

| Schedule Type | Example | Handler |
|---------------|---------|---------|
| Cron | Daily marketing briefing · 08:00 | `AgentSchedulerJob` |
| Event-triggered | Campaign completed → analytics report | Event subscriber |
| Delayed | Retry after 5 min | TaskQueue delayed queue |
| Recurring | Weekly executive brief · Friday 17:00 | Cron + workflow template |

```typescript
export interface AgentScheduler {
  schedule(definition: ScheduledAgentTask): Promise<ScheduleId>;
  cancel(scheduleId: ScheduleId): Promise<void>;
  list(ctx: AuroraRuntimeContext): Promise<readonly ScheduledAgentTask[]>;
}
```

## 5.6 Parallel Execution

**File:** `lib/aurora/workforce/orchestration/ParallelExecutionCoordinator.ts`

Multi-agent workflow steps marked `parallel: true` execute concurrently:

```typescript
export interface ParallelExecutionCoordinator {
  executeParallel(
    ctx: AuroraRuntimeContext,
    steps: readonly WorkflowStep[],
    context: AgentExecutionContext
  ): Promise<readonly StepResult[]>;
}
```

| Rule | Description |
|------|-------------|
| **PAR-1** | Max parallel agents per workflow: 5 |
| **PAR-2** | Shared context immutable · each agent receives copy |
| **PAR-3** | Partial failure → collect successes · retry failures once |
| **PAR-4** | Token budget shared across parallel agents · enforced pre-dispatch |

## 5.7 Retry Policies

**File:** `lib/aurora/workforce/orchestration/RetryPolicy.ts`

| Error Class | Retries | Backoff | Escalate After |
|-------------|:-------:|---------|:--------------:|
| LLM timeout | 2 | Exponential 1s · 4s | 3rd failure |
| LLM rate limit | 5 | Exponential 2s · 32s | Queue full |
| Transient network | 3 | Linear 2s | 4th failure |
| Guardrail rejection | 0 | — | Immediate |
| Retrieval insufficient | 0 | — | Immediate escalation |
| Agent exception | 1 | 5s | 2nd failure → suspend |

```typescript
export interface RetryPolicy {
  shouldRetry(error: AgentExecutionError, attempt: number): boolean;
  getDelayMs(attempt: number): number;
  maxAttempts: number;
}
```

## 5.8 Timeout Handling

| Scope | Default Timeout | Config Key |
|-------|:---------------:|------------|
| Single agent execution | 60s | `workforce.agent.timeout_ms` |
| Workflow total | 300s | `workforce.workflow.timeout_ms` |
| Delegation chain | 120s | `workforce.delegation.timeout_ms` |
| LLM inference | 45s | `workforce.llm.timeout_ms` |
| Retrieval pre-flight | 2s | `workforce.retrieval.timeout_ms` |

On timeout: cancel LLM request · nack task · retry per policy · audit log.

---

# 6. Collaboration Engine

## 6.1 CollaborationEngine

**File:** `lib/aurora/workforce/collaboration/CollaborationEngine.ts`

**WR-3:** All inter-agent communication flows through this engine. Agents never call each other directly.

```typescript
export interface CollaborationEngine {
  /** Send message between agents in same workflow */
  sendMessage(ctx: AuroraRuntimeContext, message: AgentMessage): Promise<void>;

  /** Broadcast to multiple agents in workflow */
  broadcast(ctx: AuroraRuntimeContext, workflowId: string, message: AgentMessage): Promise<void>;

  /** Request consensus from agent group */
  requestConsensus(ctx: AuroraRuntimeContext, request: ConsensusRequest): Promise<ConsensusResult>;

  /** Escalate to hierarchy target */
  escalate(ctx: AuroraRuntimeContext, escalation: EscalationRequest): Promise<EscalationResult>;

  /** Submit for human approval */
  submitForApproval(ctx: AuroraRuntimeContext, submission: ApprovalSubmission): Promise<ApprovalRequestId>;
}
```

## 6.2 Inter-Agent Communication

**File:** `lib/aurora/workforce/collaboration/AgentMessageBus.ts`

| Message Type | Purpose | Persisted |
|--------------|---------|:---------:|
| `delegation` | Task handoff with context | ✅ |
| `result` | Step output for aggregation | ✅ |
| `query` | Agent requests info from another | ✅ |
| `consensus_vote` | Vote in consensus workflow | ✅ |
| `escalation` | Escalate to superior agent | ✅ |
| `status` | Progress update in workflow | Optional |

```typescript
export interface AgentMessage {
  readonly messageId: string;
  readonly workflowId: string;
  readonly correlationId: string;
  readonly fromAgent: AgentCodename;
  readonly toAgent: AgentCodename;
  readonly messageType: AgentMessageType;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
}
```

**Rule MSG-1:** Messages scoped to workflow · tenant · brand. No cross-workflow messaging.

## 6.3 Context Propagation

Context flows through workflow via immutable `AgentExecutionContext`:

```
Workflow Start
    ↓
ExecutionContextBuilder.build() → full 8-layer context
    ↓
Step 1 Agent receives context snapshot (immutable)
    ↓
Step 1 output appended to workflow context (new version)
    ↓
Step 2 Agent receives updated context snapshot
    ↓
... until workflow complete
```

**File:** `lib/aurora/workforce/context/ContextPropagator.ts`

| Rule | Description |
|------|-------------|
| **CP-1** | Context snapshots immutable per step |
| **CP-2** | Step outputs append-only to workflow context |
| **CP-3** | Agents receive only layers relevant to role |
| **CP-4** | Knowledge context from ES-AURORA-007 pre-flight |
| **CP-5** | Max 3,000 tokens knowledge per agent invocation |

## 6.4 Shared Memory Access

Agents access memory only through runtime-provided ports:

```typescript
export interface AgentMemoryPort {
  readWorking(taskId: string): Promise<readonly MemoryEntry[]>;
  readSession(sessionId: string): Promise<readonly MemoryEntry[]>;
  writeLearning(signal: LearningSignal): Promise<void>;
  appendSession(entry: MemoryEntry): Promise<void>;
}
```

| Agent | Memory Tiers (Read) | Memory Tiers (Write) |
|-------|--------------------|--------------------|
| All agents | Working · Session | Session |
| All agents | Brand · Learning (read) | Learning (signals) |
| Campaign Manager | Campaign · Business | Campaign |
| Director · Advisor | Business · Long-Term | — |
| Knowledge Manager | All tiers | Learning · Brand |
| CX · Sales Intel (Phase 2) | Customer | Customer (segment only) |

## 6.5 Consensus Workflow

**File:** `lib/aurora/workforce/collaboration/ConsensusEngine.ts`

| Scenario | Participants | Threshold |
|----------|-------------|-----------|
| Content plan | Strategist · SEO · Copywriter | Majority |
| Campaign launch | Campaign · Ads · Analytics | Unanimous |
| Budget reallocation | Analytics · Ads · Campaign → Director | Director synthesis |
| Brand positioning | Brand Intel · Knowledge · Advisor | Majority |
| Creative direction | Creative · Copywriter · Brand Intel | Creative leads |

```typescript
export interface ConsensusRequest {
  readonly workflowId: string;
  readonly topic: string;
  readonly participants: readonly AgentCodename[];
  readonly proposals: readonly AgentProposal[];
  readonly threshold: 'unanimous' | 'majority' | 'director_arbitration';
  readonly timeoutMs: number;
}

export interface ConsensusResult {
  readonly reached: boolean;
  readonly outcome?: AgentProposal;
  readonly dissenting?: readonly AgentProposal[];
  readonly escalated: boolean;
}
```

| Agreement | Action |
|-----------|--------|
| Unanimous | Proceed to approval gate if required |
| Majority | Director reviews dissent · decides |
| Split | Director arbitrates · human if unresolved |
| Risk flagged | Pause · escalate regardless of votes |

## 6.6 Conflict Resolution

**File:** `lib/aurora/workforce/collaboration/ConflictResolver.ts`

| Conflict Type | Protocol |
|---------------|----------|
| Strategy disagreement | Director arbitrates · cites business objectives |
| Budget disagreement | Analytics data · Director decides · human if above threshold |
| Brand voice disagreement | Knowledge Manager guidelines · Creative/Copywriter align |
| Channel priority | Analytics performance data breaks tie |
| Timeline | Campaign Manager feasibility · Director decides |
| Unresolved | Escalate to human with full context package |

## 6.7 Escalation

```typescript
export interface EscalationRequest {
  readonly fromAgent: AgentCodename;
  readonly reason: EscalationReason;
  readonly context: AgentExecutionContext;
  readonly confidence: number;
  readonly suggestedAction?: string;
}

export type EscalationReason =
  | 'insufficient_knowledge'
  | 'low_confidence'
  | 'conflict_unresolved'
  | 'budget_threshold'
  | 'brand_safety'
  | 'agent_failure'
  | 'approval_required'
  | 'policy_violation';
```

| Condition | Escalate To |
|-----------|------------|
| Retrieval insufficient | Human · Knowledge Manager queue |
| Confidence < 0.20 | Department head → Director → human |
| Budget > tenant threshold | Human CMO · Executive Advisor |
| Brand safety violation | Halt task · Brand Manager |
| Agent failure in critical path | Director → human · system alert |

## 6.8 Human Approval

**File:** `lib/aurora/workforce/collaboration/ApprovalGateBridge.ts`

Integrates with Approval Engine (A-015). Runtime submits · waits · resumes workflow.

| Output Type | Approver | Auto Condition |
|-------------|----------|----------------|
| Content draft | Brand Manager | Never |
| Content publish | Brand Manager · Approver | Tenant rules |
| Creative asset | Brand Manager | Never external |
| Campaign launch | Marketing Director · CMO | Never |
| Ad spend > threshold | CMO · Finance | Never |
| SEO recommendation | None | Informational |
| Analytics report | None | Informational |

**WR-7:** When DecisionEngine returns Tier 2+ or risk Medium+, runtime blocks until approval or timeout escalation.

## 6.9 Decision Hierarchy

```
Level 0 — Founder & CEO (Human)
    ↓
Level 1 — Executive Advisor (agent.advisor) — advise only
    ↓
Level 2 — Marketing Director (agent.director) — orchestrate · arbitrate
    ↓
Level 3 — Department Heads (Strategist · Creative · Analytics)
    ↓
Level 4 — Specialists (Copywriter · SEO · Campaign · etc.)
    ↓
Level 5 — Execution Services (not agents)
```

| Rule | Description |
|------|-------------|
| **DH-1** | Lower levels cannot override higher |
| **DH-2** | Executive Advisor advises · never executes |
| **DH-3** | Director is sole cross-department delegator |
| **DH-4** | Human always supersedes agent decisions |

## 6.10 Multi-Agent Workflow Patterns

**File:** `lib/aurora/workforce/collaboration/WorkflowTemplates.ts`

| Pattern | ID | Agents | Max Duration |
|---------|:--:|--------|:------------:|
| Content Production | WF-01 | 7 | 60s |
| Campaign Launch | WF-02 | 10 | 120s |
| Executive Intelligence | WF-03 | 6 | 45s |
| Competitive Response | WF-04 | 8 | 90s |
| New Product Launch | WF-05 | 10 | 120s |
| Weekly Review | WF-06 | 5 | 60s |

Pre-defined workflow templates registered at boot. Domain modules invoke via `executeWorkflow()`.

---

# 7. Execution Context

## 7.1 ExecutionContextBuilder

**File:** `lib/aurora/workforce/context/ExecutionContextBuilder.ts`

**WR-5:** Every task receives complete context before execution.

```typescript
export interface ExecutionContextBuilder {
  build(ctx: AuroraRuntimeContext, request: ContextBuildRequest): Promise<AgentExecutionContext>;
}

export interface AgentExecutionContext {
  readonly contextId: string;
  readonly correlationId: string;
  readonly tenant: TenantContext;
  readonly business: BusinessContext;
  readonly brand: BrandContext;
  readonly campaign?: CampaignContext;
  readonly security: SecurityContext;
  readonly knowledge: KnowledgeContext;
  readonly memory: MemoryContext;
  readonly task: TaskContext;
  readonly policies: RuntimePolicies;
  readonly assembledAt: string;
}
```

## 7.2 Tenant Context

| Field | Source |
|-------|--------|
| `tenantId` | AuroraRuntimeContext |
| `tier` | ConfigurationService |
| `locale` | Tenant config |
| `timezone` | Tenant config |
| `tokenBudgetRemaining` | TokenBudgetService |
| `featureFlags` | FeatureFlagService |
| `limits` | TierLimitService |

## 7.3 Business Context

| Field | Source |
|-------|--------|
| `businessId` | AuroraRuntimeContext |
| `businessName` | BusinessEntityService |
| `strategicGoals` | Business Memory · Executive Knowledge |
| `fiscalPeriod` | Finance integration (Phase 2) |

## 7.4 Brand Context

| Field | Source |
|-------|--------|
| `brandId` | AuroraRuntimeContext |
| `brandName` | BrandService |
| `voiceProfile` | BrandConfig · Brand Knowledge |
| `visualIdentity` | Brand Knowledge |
| `approvalPolicy` | BrandConfig · ConfigurationService |
| `channelConfig` | BrandConfig |

## 7.5 Campaign Context

Optional — present when task is campaign-scoped.

| Field | Source |
|-------|--------|
| `campaignId` | Task parameter |
| `objective` | Campaign Knowledge |
| `budget` | Campaign Memory · CampaignService |
| `timeline` | Campaign Knowledge |
| `kpis` | Campaign Knowledge |
| `status` | CampaignService |

## 7.6 Security Context

| Field | Source |
|-------|--------|
| `userId` | AuroraRuntimeContext (human initiator) |
| `serviceIdentity` | Agent service account |
| `roles` | AuroraAuthorizationService |
| `permissions` | Permission catalog |
| `maxAuthorityTier` | RBAC mapping (A-003 §9.2) |
| `attributedUserId` | Service identity attribution |

## 7.7 Knowledge Context

**WR-6:** Built by `KnowledgeRetrievalService.preflight()` — mandatory before LLM.

| Field | Source |
|-------|--------|
| `retrievalResult` | KnowledgeRetrievalService |
| `contextPackage` | ContextAssembler (3,000 token budget) |
| `citations` | CitationBuilder |
| `confidence` | ConfidenceScorer |
| `gaps` | Retrieval gap detection |
| `domains` | TaskDomainMapper |

```typescript
// Pre-flight integration (ES-AURORA-007)
const retrieval = await retrievalService.preflight(ctx, {
  taskType: task.type,
  query: task.query,
  domains: taskDomainMapper.resolve(task.type),
  maxTokens: 3000,
  minConfidence: 'medium',
  includeProvisional: false,
  campaignId: task.campaignId,
});

if (retrieval.confidence === 'insufficient') {
  return escalationService.escalate(ctx, {
    reason: 'insufficient_knowledge',
    gaps: retrieval.gaps,
  });
}
```

## 7.8 Memory Context

| Field | Source |
|-------|--------|
| `sessionHistory` | Session Memory (Tier 2) |
| `workingContext` | Working Memory (Tier 1) |
| `brandPreferences` | Brand Memory (Tier 5) |
| `learningSignals` | Learning Memory (Tier 8) |
| `recentDecisions` | Campaign Memory (Tier 3) |

## 7.9 Runtime Policies

**File:** `lib/aurora/workforce/context/RuntimePolicyResolver.ts`

| Policy | Source | Default |
|--------|--------|---------|
| `maxTokensPerInvocation` | Tenant config | 4,000 |
| `maxWorkflowDurationMs` | Tenant config | 300,000 |
| `retrievalMinConfidence` | Tenant config | `medium` |
| `autoApproveTier0` | Automation config | true |
| `tier3Enabled` | Feature flag | false |
| `parallelMaxAgents` | Global default | 5 |
| `agentTimeoutMs` | Brand config override | 60,000 |

## 7.10 DecisionEngine Integration

**File:** `lib/aurora/workforce/decision/DecisionEngine.ts`

Post-execution decision routing (A-003 §7):

```typescript
export interface DecisionEngine {
  evaluate(ctx: AuroraRuntimeContext, output: AgentExecutionOutput, context: AgentExecutionContext): Promise<DecisionResult>;
}

export interface DecisionResult {
  readonly authorityTier: 0 | 1 | 2 | 3 | 4;
  readonly riskLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  readonly confidence: number;
  readonly action: 'deliver' | 'deliver_flagged' | 'approval_required' | 'execute_guarded' | 'block';
  readonly policyViolations: readonly PolicyViolation[];
}
```

### Decision Flow

```
Agent Output
    ↓
Confidence Scoring (30% data · 25% KB · 20% history · 15% complexity · 10% consensus)
    ↓
Risk Classification
    ↓
Business Policy Validation (voice · budget · PII · regulatory)
    ↓
Authority Tier Check (human max tier from RBAC)
    ↓
    ├── Tier 0 → Deliver immediately
    ├── Tier 1 → Deliver with recommendation flag
    ├── Tier 2 → ApprovalGateBridge.submit()
    ├── Tier 3 → Guardrail check → execute or escalate
    └── Tier 4 → Block → human only
    ↓
Audit · Memory Update · Learning Signal
```

### Confidence Levels

| Level | Range | Action |
|-------|-------|--------|
| High | 0.80–1.00 | Proceed per authority tier |
| Medium | 0.50–0.79 | Proceed · flag uncertainty |
| Low | 0.20–0.49 | Escalate to department head |
| Insufficient | 0.00–0.19 | Escalate to human · do not act |

---

# 8. Operational Intelligence

## 8.1 WorkforceMetrics

**File:** `lib/aurora/workforce/intelligence/WorkforceMetrics.ts`

| Metric | Type | Description |
|--------|------|-------------|
| `aurora.workforce.tasks.total` | Counter | Tasks enqueued |
| `aurora.workforce.tasks.completed` | Counter | Tasks completed |
| `aurora.workforce.tasks.failed` | Counter | Tasks failed |
| `aurora.workforce.task.latency_ms` | Histogram | End-to-end task latency |
| `aurora.workforce.agent.invocations` | Counter | Per agent codename |
| `aurora.workforce.agent.errors` | Counter | Per agent codename |
| `aurora.workforce.agent.latency_ms` | Histogram | Per agent execution |
| `aurora.workforce.queue.depth` | Gauge | Queue depth by priority |
| `aurora.workforce.workflows.active` | Gauge | Active workflows |
| `aurora.workforce.tokens.consumed` | Counter | LLM tokens by tenant · agent |
| `aurora.workforce.escalations` | Counter | By reason |
| `aurora.workforce.approvals.pending` | Gauge | Pending human approvals |

## 8.2 Health Monitoring

**File:** `lib/aurora/workforce/intelligence/WorkforceHealthService.ts`

| Component | Check | Interval |
|-----------|-------|:--------:|
| AuroraWorkforceRuntime | State = ready or degraded | 30s |
| TaskQueue | Depth < max · workers active | 30s |
| AgentRegistry | All Phase 1 agents healthy | 60s |
| KnowledgeRetrievalService | p95 < 500ms | 60s |
| ORION AI Provider | Circuit breaker closed | 30s |
| Redis coordination | Lock heartbeat | 15s |

## 8.3 Observability

| Signal | Implementation |
|--------|---------------|
| Structured logs | JSON · correlationId · tenantId · agentCodename |
| Distributed tracing | OpenTelemetry spans per task · workflow · agent step |
| Event stream | ORION Event Bus · workforce events |
| Dashboard data | Metrics API for A-019 UI |

### Trace Span Hierarchy

```
workforce.execute
    ├── context.build
    ├── retrieval.preflight
    ├── agent.execute
    │   ├── llm.inference
    │   └── guardrails.validate
    ├── decision.evaluate
    └── audit.record
```

## 8.4 Agent KPIs

Per-agent KPIs from A-003 tracked by `AgentKpiTracker`:

| Agent | KPI | Target |
|-------|-----|:------:|
| Director | Task routing accuracy | > 95% |
| Director | Conflict resolution rate | > 90% |
| Copywriter | Brand voice alignment score | > 85% |
| SEO | Recommendation acceptance | > 70% |
| Campaign | Optimization success rate | > 75% |
| Analytics | Report accuracy | > 95% |
| Advisor | Executive acceptance rate | > 60% |
| All | Error rate | < 5% |
| All | p95 latency vs SLA | Within target |

## 8.5 Runtime Dashboard

Data contract for A-019 Experience Layer:

```typescript
export interface WorkforceDashboardSnapshot {
  readonly runtimeState: WorkforceRuntimeState;
  readonly queueDepth: number;
  readonly inFlightTasks: number;
  readonly agentStatuses: Readonly<Record<AgentCodename, AgentHealthStatus>>;
  readonly recentEscalations: readonly EscalationSummary[];
  readonly tokenBudgetUsage: TokenBudgetUsage;
  readonly kpis: Readonly<Record<AgentCodename, AgentKpiSnapshot>>;
  readonly generatedAt: string;
}
```

## 8.6 Alerts

| Alert | Condition | Severity |
|-------|-----------|:--------:|
| Agent suspended | Circuit breaker open | High |
| Queue depth critical | > 80% max depth | High |
| Runtime degraded | State = degraded > 5 min | Medium |
| Escalation spike | > 10/hour per tenant | Medium |
| Token budget 90% | Daily budget nearly exhausted | Medium |
| Retrieval failures | > 5% insufficient confidence | Low |
| Workflow timeout | Workflow exceeds max duration | High |

## 8.7 Audit

**File:** `lib/aurora/workforce/intelligence/WorkforceAuditLogger.ts`

Every agent invocation produces immutable audit entry (A-003 §9.3):

| Field | Captured |
|-------|----------|
| `agentCodename` | Which agent acted |
| `sessionId` | Agent session correlation |
| `workflowId` | Workflow if part of multi-agent |
| `correlationId` | End-to-end trace |
| `humanInitiator` | User or `system` |
| `taskType` | Task classification |
| `contextHash` | SHA-256 of context (not full prompt) |
| `outputSummary` | Result type · confidence |
| `decisionResult` | Tier · risk · action |
| `tokensConsumed` | LLM token count |
| `latencyMs` | Execution time |
| `retrievalConfidence` | Knowledge pre-flight confidence |
| `timestamp` | Immutable creation time |

**Storage:** `aurora_workforce_audit` · ORION AuditStore pattern (ES-038).

---

# 9. Testing Strategy

## 9.1 Test Structure

```
tests/aurora/
├── unit/workforce/
│   ├── AuroraWorkforceRuntime.test.ts
│   ├── AgentRegistry.test.ts
│   ├── AgentFactory.test.ts
│   ├── TaskRouter.test.ts
│   ├── TaskQueue.test.ts
│   ├── PriorityEngine.test.ts
│   ├── CollaborationEngine.test.ts
│   ├── ConsensusEngine.test.ts
│   ├── ExecutionContextBuilder.test.ts
│   ├── DecisionEngine.test.ts
│   └── RetryPolicy.test.ts
├── integration/workforce/
│   ├── agentLifecycle.test.ts
│   ├── taskOrchestration.test.ts
│   ├── workflowExecution.test.ts
│   ├── collaborationWorkflow.test.ts
│   ├── contextPropagation.test.ts
│   ├── retrievalPreflight.test.ts
│   ├── approvalGate.test.ts
│   └── runtimeRecovery.test.ts
├── integration/security/
│   ├── workforceTenantIsolation.test.ts
│   ├── agentRbac.test.ts
│   └── tokenBudgetEnforcement.test.ts
├── performance/
│   ├── taskRoutingLatency.test.ts
│   ├── workflowParallel.test.ts
│   └── queueThroughput.test.ts
└── stress/
    ├── concurrentTasks.test.ts
    └── queueSaturation.test.ts
```

## 9.2 Agent Lifecycle Tests

| Test | Assertion |
|------|-----------|
| `agentRegistration.test.ts` | All 14 agents register · Phase 2 stubs marked |
| `agentActivation.test.ts` | onActivate transitions to idle |
| `agentSuspend.test.ts` | Suspended agent rejects new tasks |
| `agentResume.test.ts` | Resumed agent accepts tasks after health check |
| `agentRetire.test.ts` | Retired agent removed from registry |
| `agentFailureIsolation.test.ts` | Agent exception does not crash runtime |
| `circuitBreaker.test.ts` | 3 failures → suspend · alert emitted |
| `agentReplacement.test.ts` | Fallback agent used when primary suspended |

## 9.3 Collaboration Tests

| Test | Assertion |
|------|-----------|
| `delegationHierarchy.test.ts` | TD-1–TD-4 enforced |
| `consensusUnanimous.test.ts` | Unanimous vote proceeds |
| `consensusSplit.test.ts` | Split vote escalates to Director |
| `conflictResolution.test.ts` | Brand voice conflict uses Knowledge guidelines |
| `messageBusIsolation.test.ts` | Messages scoped to workflow · tenant |
| `workflowTemplate.test.ts` | WF-01 content pipeline completes |
| `parallelExecution.test.ts` | 3 parallel agents · shared context immutable |

## 9.4 Delegation Tests

| Test | Assertion |
|------|-----------|
| `directorDelegation.test.ts` | Director delegates to specialist |
| `specialistNoDelegate.test.ts` | Specialist cannot delegate (TD-3) |
| `crossDepartmentRouting.test.ts` | Cross-dept routes through Director |
| `delegationChain.test.ts` | Correlation ID traces full chain |
| `delegationTimeout.test.ts` | Timeout triggers escalation |

## 9.5 Context Propagation Tests

| Test | Assertion |
|------|-----------|
| `fullContextBuild.test.ts` | All 8 layers populated |
| `knowledgePreflightMandatory.test.ts` | No LLM call without preflight |
| `insufficientKnowledgeEscalation.test.ts` | Insufficient → escalate · no fabrication |
| `contextImmutability.test.ts` | Step snapshot unchanged by later steps |
| `tokenBudgetInContext.test.ts` | Remaining budget reflected |
| `roleBasedContextLayers.test.ts` | Specialist receives subset of layers |

## 9.6 Recovery Tests

| Test | Scenario | Pass Criteria |
|------|----------|---------------|
| `workerCrashRecovery.test.ts` | Kill worker mid-task | Task requeued · completes |
| `warmRestart.test.ts` | Restart during idle | State ready < 5s |
| `checkpointRestore.test.ts` | Restore from checkpoint | Workflows resume |
| `redisFailureRecovery.test.ts` | Redis unavailable | Degraded · queue pauses |
| `agentSuspendRecovery.test.ts` | Suspend · resume cycle | Agent healthy after resume |

## 9.7 Performance Tests

| Metric | Target | Test |
|--------|:------:|------|
| Task routing p95 | < 50ms | `taskRoutingLatency.test.ts` |
| Context build p95 | < 100ms | `contextBuildLatency.test.ts` |
| Single agent execution p95 | < 15s | `agentExecutionLatency.test.ts` |
| Workflow WF-01 p95 | < 60s | `workflowContentPipeline.test.ts` |
| Queue throughput | 50 tasks/s per tenant | `queueThroughput.test.ts` |
| Parallel 3-agent step | < 20s | `workflowParallel.test.ts` |

## 9.8 Stress Tests

| Scenario | Load | Duration | Pass |
|----------|------|----------|------|
| Concurrent tasks | 100 simultaneous per tenant | 10 min | 0 runtime crashes |
| Queue saturation | Fill to 90% max depth | 5 min | Graceful backpressure |
| Multi-tenant | 20 tenants · 10 tasks each | 5 min | Tenant isolation maintained |
| Workflow burst | 50 workflows/min | 5 min | p95 within 2× baseline |
| Token budget exhaustion | Consume full daily budget | — | Tasks queued · not crashed |

## 9.9 Coverage Targets

| Layer | Minimum |
|-------|:-------:|
| `lib/aurora/workforce/` (runtime · registry) | 90% |
| `lib/aurora/workforce/orchestration/` | 85% |
| `lib/aurora/workforce/collaboration/` | 85% |
| `lib/aurora/workforce/context/` | 90% |
| `lib/aurora/workforce/decision/` | 85% |
| `lib/aurora/workforce/agents/` (stubs) | 70% |
| **A-010 scope overall** | **85%** |

## 9.10 Required Test Suites

| Suite | Minimum Tests |
|-------|:-------------:|
| Runtime lifecycle unit | 30+ |
| Agent registry unit | 25+ |
| Task orchestration unit + integration | 40+ |
| Collaboration integration | 30+ |
| Context + decision unit | 25+ |
| Recovery integration | 15+ |
| Security/isolation | 15+ |
| Performance benchmarks | 10+ |
| **Total** | **190+** |

---

# 10. Engineering Standards

## 10.1 Folder Layout

```
lib/aurora/workforce/
├── AuroraWorkforceRuntime.ts
├── WorkforceModuleRuntime.ts
├── index.ts
├── types/
│   ├── AgentTypes.ts
│   ├── TaskTypes.ts
│   ├── WorkflowTypes.ts
│   ├── ContextTypes.ts
│   └── DecisionTypes.ts
├── registry/
│   ├── AgentRegistry.ts
│   ├── AgentFactory.ts
│   ├── AgentDefinitionCatalog.ts
│   ├── AgentAvailabilityTracker.ts
│   ├── AgentHealthMonitor.ts
│   └── PromptRegistry.ts
├── lifecycle/
│   ├── WorkforceStartupSequence.ts
│   ├── WorkforceRecoveryService.ts
│   └── AgentFailureRecovery.ts
├── orchestration/
│   ├── TaskRouter.ts
│   ├── TaskQueue.ts
│   ├── PriorityEngine.ts
│   ├── DelegationService.ts
│   ├── AgentScheduler.ts
│   ├── ParallelExecutionCoordinator.ts
│   ├── RetryPolicy.ts
│   └── WorkflowExecutor.ts
├── collaboration/
│   ├── CollaborationEngine.ts
│   ├── AgentMessageBus.ts
│   ├── ConsensusEngine.ts
│   ├── ConflictResolver.ts
│   ├── ApprovalGateBridge.ts
│   └── WorkflowTemplates.ts
├── context/
│   ├── ExecutionContextBuilder.ts
│   ├── ContextPropagator.ts
│   └── RuntimePolicyResolver.ts
├── decision/
│   ├── DecisionEngine.ts
│   ├── ConfidenceScorer.ts
│   ├── RiskClassifier.ts
│   └── PolicyValidator.ts
├── intelligence/
│   ├── WorkforceMetrics.ts
│   ├── WorkforceHealthService.ts
│   ├── AgentKpiTracker.ts
│   └── WorkforceAuditLogger.ts
├── agents/
│   ├── AuroraAgent.ts
│   ├── BaseAgent.ts
│   ├── agent.director/
│   ├── agent.advisor/
│   ├── agent.strategist/
│   ├── agent.copywriter/
│   ├── agent.seo/
│   ├── agent.creative/
│   ├── agent.analytics/
│   ├── agent.ads/
│   ├── agent.campaign/
│   ├── agent.social/
│   ├── agent.knowledge/          # Phase 2 stub
│   ├── agent.brand_intel/        # Phase 2 stub
│   ├── agent.cx/                 # Phase 2 stub
│   └── agent.sales_intel/        # Phase 2 stub
├── guardrails/
│   └── AgentGuardrails.ts
├── persistence/
│   ├── WorkforceTaskRepository.ts
│   ├── WorkforceAuditRepository.ts
│   └── WorkforceCheckpointRepository.ts
├── integration/
│   └── AuroraWorkforceWiring.ts
└── facade/
    └── WorkforceFacadeOperations.ts
```

## 10.2 Runtime Contracts

### WorkforceFacadeOperations

**File:** `lib/aurora/workforce/facade/WorkforceFacadeOperations.ts`

```typescript
export interface WorkforceOperations {
  invokeAgent(ctx: AuroraRuntimeContext, request: AgentExecutionRequest): Promise<AgentExecutionResult>;
  executeWorkflow(ctx: AuroraRuntimeContext, workflowId: string, input: WorkflowInput): Promise<WorkflowExecutionResult>;
  getAgentHealth(ctx: AuroraRuntimeContext, codename?: AgentCodename): Promise<AgentHealthStatus | Readonly<Record<AgentCodename, AgentHealthStatus>>>;
  getDashboard(ctx: AuroraRuntimeContext): Promise<WorkforceDashboardSnapshot>;
  suspendAgent(ctx: AuroraRuntimeContext, codename: AgentCodename, reason: string): Promise<void>;
  resumeAgent(ctx: AuroraRuntimeContext, codename: AgentCodename): Promise<void>;
}
```

### Agent Execution Contract

```typescript
export interface AgentExecutionRequest {
  readonly taskType: AgentTaskType;
  readonly query: string;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly campaignId?: string;
  readonly workflowId?: string;
  readonly correlationId?: string;
  readonly priority?: TaskPriority;
  readonly timeoutMs?: number;
}

export interface AgentExecutionResult {
  readonly result: unknown;
  readonly agentCodename: AgentCodename;
  readonly confidence: number;
  readonly rationale: string;
  readonly citations?: readonly KnowledgeCitation[];
  readonly requiresApproval: boolean;
  readonly approvalRequestId?: string;
  readonly handoffTo?: AgentCodename;
  readonly tokensUsed: number;
  readonly latencyMs: number;
  readonly correlationId: string;
}
```

## 10.3 Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Agent codename | `agent.{role}` | `agent.director` |
| Agent class | `{Role}Agent` | `MarketingDirectorAgent` |
| Agent directory | `agent.{codename}/` | `agent.director/` |
| Task type | `{domain}.{action}` | `content.draft` |
| Workflow ID | `WF-{nn}` | `WF-01` |
| Event | `aurora.workforce.{action}` | `aurora.workforce.task.completed` |
| Error code | `AURORA_WF_{nnn}` | `AURORA_WF_001` |
| Audit table | `aurora_workforce_*` | `aurora_workforce_audit` |

## 10.4 Dependency Rules

| Rule | Description |
|------|-------------|
| **DEP-W1** | Workforce depends on admin · knowledge · config modules |
| **DEP-W2** | Workforce never imports domain modules (content · seo · campaign) |
| **DEP-W3** | Domain modules invoke workforce via AuroraFacade.workforce |
| **DEP-W4** | Agents depend on ports only · not repositories |
| **DEP-W5** | No agent imports another agent |
| **DEP-W6** | LLM access only through OrionAiProvider · never direct |

## 10.5 Error Handling

**File:** `lib/aurora/workforce/errors/WorkforceErrors.ts`

| Code | Name | HTTP | When |
|------|------|:----:|------|
| `AURORA_WF_001` | RUNTIME_NOT_READY | 503 | Runtime not in ready state |
| `AURORA_WF_002` | AGENT_NOT_FOUND | 404 | Unknown codename |
| `AURORA_WF_003` | AGENT_UNAVAILABLE | 503 | Suspended · phase2 stub |
| `AURORA_WF_004` | TASK_ROUTING_FAILED | 422 | No capable agent |
| `AURORA_WF_005` | QUEUE_FULL | 429 | Tenant queue at max depth |
| `AURORA_WF_006` | WORKFLOW_TIMEOUT | 504 | Workflow exceeded max duration |
| `AURORA_WF_007` | DELEGATION_DENIED | 403 | Hierarchy violation |
| `AURORA_WF_008` | TOKEN_BUDGET_EXCEEDED | 429 | Daily token limit reached |
| `AURORA_WF_009` | APPROVAL_REQUIRED | 202 | Tier 2+ · pending approval |
| `AURORA_WF_010` | KNOWLEDGE_INSUFFICIENT | 422 | Pre-flight failed · escalated |

## 10.6 Horizontal Scaling

| Component | Scaling Strategy |
|-----------|-----------------|
| AuroraWorkforceRuntime | N stateless worker processes |
| TaskQueue | Redis-backed · competing consumers |
| Agent instances | Pooled per worker · stateless |
| Workflow state | PostgreSQL · Redis lock coordination |
| Audit writes | Async batch to PostgreSQL |

**WR-10:** Workers coordinate via Redis distributed locks. No single-worker assumption.

## 10.7 Review Checklist

Before merging any A-010 workforce code:

- [ ] Execution flows through AuroraWorkforceRuntime
- [ ] Agent registered in AgentRegistry
- [ ] KnowledgeRetrievalService.preflight() before LLM
- [ ] AuroraRuntimeContext on all public methods
- [ ] Tenant isolation on queue · audit · context
- [ ] Agent failure isolated · circuit breaker tested
- [ ] Audit log entry for every invocation
- [ ] No direct agent-to-agent imports
- [ ] No direct LLM calls outside agent execute()
- [ ] DecisionEngine evaluated post-execution
- [ ] Correlation ID propagated end-to-end
- [ ] Coverage meets layer minimum (§9.9)

---

# 11. Acceptance Criteria

## 11.1 Definition of Done

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | AuroraWorkforceRuntime operational | Boot Phase 7 integration test |
| 2 | AgentRegistry with 14 agent definitions | Registry completeness test |
| 3 | 10 Phase 1 agents registered · invocable | Agent smoke tests |
| 4 | 4 Phase 2 agents stubbed | Return explicit unavailable |
| 5 | TaskRouter routes all task types | Routing table test |
| 6 | TaskQueue with priority · retry | Queue integration test |
| 7 | CollaborationEngine · consensus · escalation | Workflow integration tests |
| 8 | ExecutionContextBuilder · 8 layers | Context build test |
| 9 | Knowledge pre-flight mandatory | No-LLM-without-preflight test |
| 10 | DecisionEngine Tier 0–4 routing | Decision unit tests |
| 11 | ApprovalGateBridge integration stub | Tier 2 blocks correctly |
| 12 | Workforce audit trail | Audit log verification |
| 13 | Agent failure isolation | Circuit breaker test |
| 14 | Warm restart < 5s | Recovery test |
| 15 | Horizontal scaling · 2+ workers | Worker coordination test |
| 16 | Coverage ≥ 85% | CI gate |
| 17 | 190+ tests passing | Test suite |
| 18 | WorkforceModuleRuntime health check | Health integration test |

## 11.2 Operational Readiness

| Capability | Requirement |
|------------|-------------|
| Runtime states | initializing · ready · draining · degraded · stopped |
| Health endpoint | Runtime + per-agent health |
| Graceful shutdown | 60s task drain |
| Recovery | Checkpoint restore · worker failover |
| Monitoring | Metrics · traces · alerts per §8 |
| Token budget | Per-tenant enforcement |
| Queue backpressure | Reject at max depth · 429 |
| Degraded mode | Continue with available agents |

## 11.3 Runtime Certification

| Certification | Criteria |
|---------------|----------|
| **WR-C1** | All WR-1–WR-10 principles verified in test suite |
| **WR-C2** | Zero cross-tenant task leakage |
| **WR-C3** | No agent invocation bypasses runtime |
| **WR-C4** | 100% invocations have audit entries |
| **WR-C5** | Pre-flight enforced on 100% of LLM calls |
| **WR-C6** | Agent suspend/resume cycle verified for all Phase 1 agents |
| **WR-C7** | Workflow WF-01 · WF-02 · WF-03 complete in SLA |

## 11.4 Required Tests

See §9.10 — **190+ tests minimum**.

## 11.5 Engineering Approval

| Role | Criteria |
|------|----------|
| A-010 Mission Lead | All DoD met |
| AI Architecture Owner | A-003 alignment verified |
| Security Lead | Isolation · RBAC · audit verified |
| Knowledge Owner | Pre-flight integration verified |
| ORION AI Architect | AI Provider · guardrails integration |
| Architecture Review Board | WR-1–WR-10 enforced |

---

# 12. Executive Recommendation

## 12.1 Implementation Readiness

| Dimension | Status |
|-----------|:------:|
| A-003 AI Workforce Architecture | ✅ Ratified |
| ES-AURORA-005 (A-007) Platform Foundation | ✅ Ratified |
| ES-AURORA-006 (A-008) Identity/Tenant/Config | ✅ Ratified |
| ES-AURORA-007 (A-009) Knowledge & Memory | ✅ Ratified |
| ES-AURORA-008 (A-010) specification | ✅ This document |
| ORION AI Provider | ✅ Architecture defined |
| Dependency on A-007 · A-008 · A-009 code | ⏳ Implementation first |

**ES-AURORA-008 is complete. A-010 implementation authorized upon A-007 · A-008 · A-009 completion.**

## 12.2 Approval

| Authorization | Status |
|---------------|:------:|
| ES-AURORA-008 AI Workforce Runtime spec | **✅ RATIFIED** |
| A-010 implementation | **✅ AUTHORIZED** (after A-007 · A-008 · A-009) |
| ES-AURORA-009 Content Studio spec | **✅ AUTHORIZED TO DRAFT** |

## 12.3 Authorize ES-AURORA-009

| Field | Value |
|-------|-------|
| **Next Spec** | ES-AURORA-009 — Content Studio Implementation |
| **Mission** | A-011 — Content Studio Implementation |
| **Dependency** | A-007 · A-008 · A-009 · A-010 (workforce for content agents) |
| **Scope** | ContentService · generation · approval · brand knowledge · Copywriter agent integration |

Content Studio is the first domain module that consumes the workforce runtime. Every content generation request invokes `AuroraWorkforceRuntime.execute()` with `taskType: content.draft`.

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Agent Catalogue

| # | Agent | Codename | Dept | Level | Phase | Authority | Reports To |
|---|-------|----------|------|:-----:|:-----:|:---------:|------------|
| 1 | Marketing Director | `agent.director` | Leadership | L2 | 1 | Tier 0–2 | Human |
| 2 | Executive Advisor | `agent.advisor` | Leadership | L1 | 1 | Advise only | Human |
| 3 | Content Strategist | `agent.strategist` | Strategy & Content | L3 | 1 | Tier 0–2 | Director |
| 4 | Copywriter | `agent.copywriter` | Strategy & Content | L4 | 1 | Tier 0–2 | Strategist |
| 5 | SEO Specialist | `agent.seo` | Strategy & Content | L4 | 1 | Tier 0–2 | Strategist |
| 6 | Knowledge Manager | `agent.knowledge` | Strategy & Content | L4 | 2 | Tier 0–1 | Strategist |
| 7 | Creative Director | `agent.creative` | Creative & Brand | L3 | 1 | Tier 0–2 | Director |
| 8 | Brand Intelligence Manager | `agent.brand_intel` | Creative & Brand | L4 | 2 | Tier 0–1 | Creative |
| 9 | Analytics Manager | `agent.analytics` | Performance & Growth | L3 | 1 | Tier 0–1 | Director |
| 10 | Advertising Manager | `agent.ads` | Performance & Growth | L4 | 1 | Tier 0–2 | Director |
| 11 | Campaign Manager | `agent.campaign` | Performance & Growth | L4 | 1 | Tier 0–3 | Director |
| 12 | Social Media Manager | `agent.social` | Performance & Growth | L4 | 1 | Tier 0–2 | Director |
| 13 | Customer Experience Advisor | `agent.cx` | Performance & Growth | L4 | 2 | Tier 0–1 | Director |
| 14 | Sales Intelligence Advisor | `agent.sales_intel` | Performance & Growth | L4 | 2 | Tier 0–1 | Director |

**Phase 1 active:** 10 agents (rows 1–5 · 7 · 9–12)  
**Phase 2 stub:** 4 agents (rows 6 · 8 · 13 · 14)

## Appendix B — Lifecycle Diagrams

### Runtime Lifecycle

```
[STOPPED] ──boot──► [INITIALIZING] ──success──► [READY]
                         │                         │
                         │ fail                    ├──task──► [DRAINING] ──► [STOPPED]
                         ▼                         │
                    [FAILED]                       ├──degraded──► [DEGRADED] ──recover──► [READY]
                                                   │
                                                   └──restart──► [RESTARTING] ──► [READY]
```

### Agent Lifecycle

```
[REGISTERED] ──► [ACTIVATING] ──► [IDLE] ◄──────────────────┐
                    │               │                          │
                    │               ├──execute──► [EXECUTING] ──┤
                    │               │                │         │
                    │               │                ▼         │
                    │               │           [VALIDATING] ───┤
                    │               │                          │
                    │               ├──suspend──► [SUSPENDED] ─┘
                    │               │                   │
                    │               └──retire──► [RETIRED]
                    ▼
               [FAILED] ──recover──► [IDLE]
```

## Appendix C — Task Flow Diagrams

### Single Agent Task Flow

```
API / Event / Schedule
    ↓
AuroraFacade.workforce.invokeAgent()
    ↓
AuroraWorkforceRuntime.execute()
    ├── Validate runtime state
    ├── TaskRouter.route()
    ├── ExecutionContextBuilder.build()
    ├── KnowledgeRetrievalService.preflight()  ← mandatory
    ├── AgentFactory.create() · agent.execute()
    ├── AgentGuardrails.validate()
    ├── DecisionEngine.evaluate()
    ├── ApprovalGateBridge (if required)
    ├── MemoryService · LearningService updates
    ├── WorkforceAuditLogger.record()
    └── Return AgentExecutionResult
```

### Multi-Agent Workflow Flow

```
executeWorkflow(WF-01)
    ↓
WorkflowExecutor.start()
    ├── Build shared context
    ├── For each step (sequential or parallel):
    │   ├── TaskRouter.routeWorkflowStep()
    │   ├── ContextPropagator.propagate()
    │   ├── agent.execute()
    │   ├── Append step output to workflow context
    │   └── ConsensusEngine (if multi-agent step)
    ├── ConflictResolver (if conflicts)
    ├── ApprovalGateBridge (if workflow requires)
    └── Return WorkflowExecutionResult
```

## Appendix D — Context Model

```
AgentExecutionContext
├── tenant: TenantContext
│   ├── tenantId · tier · locale · timezone
│   ├── tokenBudgetRemaining · featureFlags · limits
├── business: BusinessContext
│   ├── businessId · strategicGoals · fiscalPeriod
├── brand: BrandContext
│   ├── brandId · voiceProfile · visualIdentity
│   ├── approvalPolicy · channelConfig
├── campaign?: CampaignContext
│   ├── campaignId · objective · budget · kpis · status
├── security: SecurityContext
│   ├── userId · serviceIdentity · roles · permissions
│   ├── maxAuthorityTier · attributedUserId
├── knowledge: KnowledgeContext
│   ├── retrievalResult · contextPackage · citations
│   ├── confidence · gaps · domains
├── memory: MemoryContext
│   ├── sessionHistory · workingContext
│   ├── brandPreferences · learningSignals
├── task: TaskContext
│   ├── taskType · query · parameters · deadline
├── policies: RuntimePolicies
│   ├── maxTokens · timeouts · tier3Enabled · parallelMax
└── metadata
    ├── contextId · correlationId · assembledAt
```

### Context Layer Access by Role

| Layer | Director | Specialist | Advisor |
|-------|:--------:|:----------:|:-------:|
| Tenant | ✅ | ✅ | ✅ |
| Business | ✅ | Partial | ✅ |
| Brand | ✅ | ✅ | ✅ |
| Campaign | ✅ | If scoped | ✅ |
| Security | ✅ | ✅ | ✅ |
| Knowledge | ✅ | ✅ | ✅ |
| Memory | ✅ | ✅ | Partial |
| Task | ✅ | ✅ | ✅ |
| Policies | ✅ | ✅ | ✅ |

## Appendix E — Runtime Metrics

### SLA Targets

| Interaction | Target Latency | Max Chain Depth |
|-------------|:--------------:|:---------------:|
| Director → Specialist delegation | < 2s | 1 hop |
| Specialist deliverable | < 10s | — |
| Multi-agent consensus (3 agents) | < 30s | 3 hops |
| Content pipeline (WF-01) | < 60s | 7 hops |
| Campaign launch (WF-02) | < 120s | 10 hops |
| Executive briefing (WF-03) | < 45s | 6 hops |
| Escalation to human | < 5s | Immediate |

### Workforce Metrics Dashboard

| Panel | Metrics |
|-------|---------|
| Runtime Status | State · queue depth · in-flight · workers |
| Agent Health | Per-agent status · error rate · latency |
| Task Throughput | Completed · failed · queued per hour |
| Token Usage | Daily budget · consumed · remaining |
| Escalations | Count by reason · pending approvals |
| KPIs | Per-agent KPI vs target |

## Appendix F — Implementation Checklist

### Sprint 1 — Runtime Foundation

- [ ] `AuroraWorkforceRuntime` · state model · lifecycle
- [ ] `WorkforceModuleRuntime` · Boot Phase 7
- [ ] `AgentRegistry` · `AgentDefinitionCatalog` (14 definitions)
- [ ] `AgentFactory` · dependency injection
- [ ] Workforce migrations · RLS
- [ ] Unit tests (30+)

### Sprint 2 — Task Orchestration

- [ ] `TaskRouter` · routing table · delegation rules
- [ ] `TaskQueue` Redis backend · priority queues
- [ ] `PriorityEngine` · `RetryPolicy`
- [ ] `DelegationService` · correlation tracking
- [ ] `AgentScheduler` cron jobs
- [ ] Integration tests (25+)

### Sprint 3 — Context & Decision

- [ ] `ExecutionContextBuilder` · 8 layers
- [ ] KnowledgeRetrievalService pre-flight integration
- [ ] `DecisionEngine` · confidence · risk · tiers
- [ ] `PolicyValidator` · business policy checks
- [ ] `AgentGuardrails` · PII · brand safety
- [ ] Context + decision tests (25+)

### Sprint 4 — Collaboration

- [ ] `CollaborationEngine` · `AgentMessageBus`
- [ ] `ConsensusEngine` · `ConflictResolver`
- [ ] `WorkflowExecutor` · 6 workflow templates
- [ ] `ParallelExecutionCoordinator`
- [ ] `ApprovalGateBridge` stub
- [ ] Workflow integration tests (30+)

### Sprint 5 — Phase 1 Agents

- [ ] 10 Phase 1 agent implementations (BaseAgent + prompts)
- [ ] `PromptRegistry` · version management
- [ ] Agent smoke tests per codename
- [ ] Phase 2 stubs (4 agents)
- [ ] Agent KPI tracker

### Sprint 6 — Intelligence & Scaling

- [ ] `WorkforceMetrics` · tracing · alerts
- [ ] `WorkforceAuditLogger` · ORION Audit integration
- [ ] `WorkforceRecoveryService` · warm restart
- [ ] Multi-worker coordination
- [ ] Performance · stress tests
- [ ] Coverage ≥ 85% · mission completion report

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | ES-AURORA-008 — Aurora AI Workforce Runtime Implementation Specification |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Mission** | A-010 — AI Workforce Runtime |
| **Next Mission** | A-011 — Content Studio (ES-AURORA-009) |

---

*End of ES-AURORA-008*



