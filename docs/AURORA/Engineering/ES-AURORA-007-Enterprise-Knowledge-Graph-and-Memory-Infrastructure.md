# ES-AURORA-007 — Aurora Enterprise Knowledge Graph & Memory Infrastructure

**Document ID:** ES-AURORA-007  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-009 — Enterprise Knowledge Graph & Memory Infrastructure  
**Prior Missions:** A-007 (ES-AURORA-005) · A-008 (ES-AURORA-006)  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Specification  
**Classification:** Engineering Specification · Knowledge Graph · Memory · Retrieval · Learning  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Architecture Source:** [A-004 Enterprise Knowledge & Memory Architecture](../A-004-Aurora-Enterprise-Knowledge-and-Memory-Architecture.md)  
**Platform Parent:** [ES-AURORA-005 Platform Foundation](./ES-AURORA-005-Platform-Foundation-Implementation-Specification.md) · [ES-AURORA-006 Identity/Tenant/Config](./ES-AURORA-006-Identity-Tenant-and-Configuration-Foundation.md)  
**Effective Date:** 7 August 2026  
**Subordinate To:** A-001 · A-004 · A-005 · ES-AURORA-005 · ES-AURORA-006

**Rule:** This document is the **authoritative engineering specification** for Aurora Enterprise Knowledge Graph & Memory Infrastructure (Mission A-009). All code in `lib/aurora/knowledge/` and memory subsystems must comply. **No production implementation in this document.** **Specification only.**

**Scope:** 11 knowledge domains · 45 entity types · Enterprise Knowledge Graph · 10 memory tiers · hybrid retrieval pipeline · acquisition · learning engine · ORION integration. **Excludes:** AgentOrchestrator implementation (A-018) · domain module knowledge consumers · UI.

---

## Engineering Principles (Binding)

| # | Principle | Enforcement |
|---|-----------|-------------|
| **KP-1** | **Knowledge is authoritative** | Validated knowledge only for high-confidence retrieval |
| **KP-2** | **Memory is experiential** | Memory tiers separate from curated knowledge graph |
| **KP-3** | **Every retrieval is tenant isolated** | tenant_id · brand_id on all queries · RLS |
| **KP-4** | **Hybrid retrieval is mandatory** | Semantic + keyword + graph + memory |
| **KP-5** | **Retrieval precedes reasoning** | Pre-flight before every agent LLM call |
| **KP-6** | **Agents never invent facts** | Insufficient confidence → escalate · no fabrication |
| **KP-7** | **Low-confidence triggers escalation** | Not silent degradation to hallucination |
| **KP-8** | **Knowledge changes are versioned** | Full version history · deprecate not delete |
| **KP-9** | **Learning is auditable** | Every learning signal logged |
| **KP-10** | **Every memory has lifecycle rules** | Retention · consolidation · expiration |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Enterprise Knowledge Graph](#2-enterprise-knowledge-graph)
3. [Memory Infrastructure](#3-memory-infrastructure)
4. [Retrieval Pipeline](#4-retrieval-pipeline)
5. [Knowledge Acquisition](#5-knowledge-acquisition)
6. [Learning Engine](#6-learning-engine)
7. [ORION Integration](#7-orion-integration)
8. [Testing Strategy](#8-testing-strategy)
9. [Engineering Standards](#9-engineering-standards)
10. [Acceptance Criteria](#10-acceptance-criteria)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Executive Recommendation](#12-executive-recommendation)

**Appendices:** [A — Knowledge Entity Catalogue](#appendix-a--knowledge-entity-catalogue) · [B — Relationship Catalogue](#appendix-b--relationship-catalogue) · [C — Memory Catalogue](#appendix-c--memory-catalogue) · [D — Retrieval Pipeline](#appendix-d--retrieval-pipeline) · [E — Learning Workflow](#appendix-e--learning-workflow) · [F — Implementation Checklist](#appendix-f--implementation-checklist)

---

# Preamble

Knowledge without structure is noise.

Memory without governance is liability.

A-004 defined Aurora's institutional intelligence — eleven knowledge domains, ten memory tiers, hybrid retrieval, and continuous learning. ES-AURORA-007 converts that architecture into **implementation-ready engineering guidance** — services, repositories, schemas, pipelines, and tests.

Every agent in Aurora will think with context assembled by the systems defined herein.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Implementation specification for Enterprise Knowledge Graph & Memory Infrastructure |
| **Audience** | AI architects · data engineers · backend engineers · Knowledge Manager owners |
| **Binding authority** | Mission A-009 · all `lib/aurora/knowledge/` code |
| **Deliverable type** | Engineering specification — no code |

## 1.2 Scope

### In Scope (A-009)

| Area | Coverage |
|------|----------|
| **Knowledge Graph** | 11 domains · 45 entity types · relationships · taxonomy |
| **Knowledge services** | 8 services (Knowledge · Graph · Ingestion · Retrieval · Validation · Embedding · Memory · Learning) |
| **Memory infrastructure** | 10 tiers · consolidation · expiration · archival |
| **Retrieval pipeline** | Hybrid search · ranking · confidence · citations · caching |
| **Acquisition** | 9 channels · validation · trust scoring |
| **Learning engine** | Signals · consolidation · drift detection |
| **ORION integration** | PlatformStore · Event Bus · CRM/Finance (Phase 2 hooks) |
| **Persistence** | PostgreSQL · pgvector · Redis |

### Out of Scope

| Exclusion | Mission |
|-----------|---------|
| AgentOrchestrator · pre-flight wiring | A-018 |
| Knowledge Manager agent prompts | A-018 |
| Content/SEO domain consumers | A-010+ |
| UI for knowledge management | A-020 |
| Phase 2 CRM/Finance sync implementation | A-034 (hooks stubbed) |

### Phase Delivery

| Phase | Domains | Memory Tiers | Retrieval |
|-------|---------|:------------:|-----------|
| **A-009 (Phase 1 core)** | Brand · Product · Campaign · SEO · Content | Tiers 1–5 · 8 | Full hybrid |
| **A-009 (Phase 1 complete)** | All 11 domains (6 stubbed read-only) | All 10 tiers | Full pipeline |
| **Phase 2 missions** | Customer · Competitor · Industry · Ads · Market · Executive active | Tier 6 CRM sync | CRM enrichment |

## 1.3 Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Enterprise Knowledge Graph** | Entity + relationship CRUD · graph traversal |
| 2 | **11 knowledge domains** | Phase 1: 5 active · 6 scaffolded |
| 3 | **10 memory tiers** | Read/write · lifecycle jobs |
| 4 | **Hybrid retrieval** | p95 < 500ms · confidence scoring |
| 5 | **Mandatory pre-flight** | RetrievalService interface for AgentOrchestrator |
| 6 | **Acquisition pipeline** | Event-driven ingestion · validation |
| 7 | **Learning engine** | Signal capture · consolidation proposals |
| 8 | **Tenant isolation** | Zero cross-tenant knowledge leakage |
| 9 | **Versioning** | All knowledge entities versioned |
| 10 | **pgvector index** | Embedding generation · semantic search |

## 1.4 Relationship with Architecture Documents

| Document | ES-AURORA-007 Response |
|----------|------------------------|
| **A-001** | Brand-scoped knowledge · transparency · citations |
| **A-002** | `lib/aurora/knowledge/` · EP-7 retrieval pre-flight |
| **A-003** | Knowledge Manager curator · memory tiers · learning signals |
| **A-004** | **Full implementation** of knowledge & memory architecture |
| **A-005** | Boot Phase 4 · knowledge module registration |
| **A-006** | Mission A-009 · EP-KNOWLEDGE epic |
| **A-007 / ES-AURORA-005** | Module registry extension · wiring extension |
| **A-008 / ES-AURORA-006** | Tenant/brand scoping · RLS · config for retention |

---

# 2. Enterprise Knowledge Graph

## 2.1 KnowledgeGraphService

**File:** `lib/aurora/knowledge/services/KnowledgeGraphService.ts`

```typescript
export interface KnowledgeGraphService {
  // Entities
  createEntity(ctx: AuroraRuntimeContext, input: CreateKnowledgeEntityInput): Promise<KnowledgeEntity>;
  getEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<KnowledgeEntity | null>;
  updateEntity(ctx: AuroraRuntimeContext, entityId: string, input: UpdateKnowledgeEntityInput): Promise<KnowledgeEntity>;
  deprecateEntity(ctx: AuroraRuntimeContext, entityId: string, reason: string): Promise<void>;
  listEntities(ctx: AuroraRuntimeContext, query: EntityQuery): Promise<readonly KnowledgeEntity[]>;

  // Relationships
  createRelationship(ctx: AuroraRuntimeContext, input: CreateRelationshipInput): Promise<KnowledgeRelationship>;
  getRelationships(ctx: AuroraRuntimeContext, entityId: string, direction?: 'in' | 'out' | 'both'): Promise<readonly KnowledgeRelationship[]>;
  traverse(ctx: AuroraRuntimeContext, startEntityId: string, options: TraversalOptions): Promise<TraversalResult>;

  // Graph queries
  brandCentricQuery(ctx: AuroraRuntimeContext, brandId: string): Promise<GraphSnapshot>;
  campaignCentricQuery(ctx: AuroraRuntimeContext, campaignId: string): Promise<GraphSnapshot>;
  crossDomainQuery(ctx: AuroraRuntimeContext, query: CrossDomainQuery): Promise<GraphSnapshot>;
}
```

| Rule | Description |
|------|-------------|
| **KG-1** | Max traversal depth: 3 hops |
| **KG-2** | Only `validated` entities in agent retrieval traversals |
| **KG-3** | All entities scoped to tenant_id + brand_id |
| **KG-4** | Relationship weights decay with entity age |

## 2.2 Entity Registry

**File:** `lib/aurora/knowledge/registry/KnowledgeEntityRegistry.ts`

Central registry of 45 entity types across 11 domains. Each type defines schema, curator, phase, relationships.

```typescript
export interface KnowledgeEntityTypeDefinition {
  readonly typeKey: string;             // e.g. 'brand.profile'
  readonly domain: KnowledgeDomain;
  readonly displayName: string;
  readonly schema: ZodSchema;
  readonly curatorAgent: AgentCodename;
  readonly phase: 1 | 2;
  readonly allowedRelationships: readonly RelationshipTypeDefinition[];
  readonly embeddingEligible: boolean;
}
```

### Phase 1 Active Entity Types (22)

| Domain | Types |
|--------|-------|
| **brand** | BrandProfile · BrandGuideline · VisualIdentity · MessagingPillar · ApprovalPolicy |
| **product** | Product · ProductFeature · ProductPricing · ProductAudience |
| **campaign** | CampaignRecord · CampaignLesson · ChannelPerformance · OptimizationRecord |
| **seo** | KeywordRecord · SeoAuditFinding · RankingHistory · ContentSeoScore |
| **content** | ContentPattern · TopicCluster · ContentPillar · RepurposingMap |

### Phase 2 Scaffolded (23)

Customer · Competitor · Industry · Advertising · Market · Executive entity types — repository stubs return empty · ingestion disabled until Phase 2 missions.

## 2.3 Relationship Engine

**File:** `lib/aurora/knowledge/services/RelationshipEngine.ts`

```typescript
export type RelationshipType =
  | 'belongs_to_brand'
  | 'part_of_campaign'
  | 'targets_audience'
  | 'references_product'
  | 'competes_with'
  | 'informed_by'
  | 'supersedes'
  | 'derived_from'
  | 'executive_directs'
  | 'optimizes';

export interface KnowledgeRelationship {
  readonly id: string;
  readonly tenantId: string;
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly relationshipType: RelationshipType;
  readonly weight: number;              // 0.0–1.0 · decays with age
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}
```

## 2.4 Taxonomy Manager

**File:** `lib/aurora/knowledge/services/TaxonomyManager.ts`

Manages hierarchical taxonomy per A-004 Appendix C. Validates entity placement · domain boundaries · cross-domain links.

```typescript
export interface TaxonomyManager {
  validateEntityPlacement(entity: KnowledgeEntity): ValidationResult;
  getDomainTaxonomy(domain: KnowledgeDomain): TaxonomyTree;
  suggestEntityType(content: string, domain: KnowledgeDomain): Promise<EntityTypeSuggestion[]>;
}
```

## 2.5 Knowledge Repository

**File:** `lib/aurora/knowledge/repositories/KnowledgeRepository.ts`

```typescript
export interface KnowledgeRepository {
  saveEntity(tenantId: string, entity: KnowledgeEntityRecord): Promise<void>;
  getEntity(tenantId: string, entityId: string): Promise<KnowledgeEntityRecord | null>;
  queryEntities(tenantId: string, filter: EntityFilter): Promise<readonly KnowledgeEntityRecord[]>;
  saveRelationship(tenantId: string, rel: RelationshipRecord): Promise<void>;
  getRelationships(tenantId: string, entityId: string): Promise<readonly RelationshipRecord[]>;
  saveVersion(tenantId: string, version: EntityVersionRecord): Promise<void>;
  getVersionHistory(tenantId: string, entityId: string): Promise<readonly EntityVersionRecord[]>;
}
```

**Tables:**
- `aurora_knowledge_entity`
- `aurora_knowledge_relationship`
- `aurora_knowledge_entity_version`
- `aurora_knowledge_embedding`
- `aurora_knowledge_entity_fts` (tsvector generated column)

## 2.6 KnowledgeService

**File:** `lib/aurora/knowledge/services/KnowledgeService.ts`

```typescript
export interface KnowledgeService {
  create(ctx: AuroraRuntimeContext, input: CreateKnowledgeInput): Promise<KnowledgeEntity>;
  update(ctx: AuroraRuntimeContext, entityId: string, input: UpdateKnowledgeInput): Promise<KnowledgeEntity>;
  promoteToValidated(ctx: AuroraRuntimeContext, entityId: string): Promise<KnowledgeEntity>;
  reject(ctx: AuroraRuntimeContext, entityId: string, reason: string): Promise<void>;
  archive(ctx: AuroraRuntimeContext, entityId: string): Promise<void>;
  getByDomain(ctx: AuroraRuntimeContext, domain: KnowledgeDomain): Promise<readonly KnowledgeEntity[]>;
  searchKeyword(ctx: AuroraRuntimeContext, query: string, options: KeywordSearchOptions): Promise<readonly ScoredEntity[]>;
}
```

## 2.7 Knowledge Versioning

Every entity mutation creates version record:

```typescript
export interface EntityVersionRecord {
  readonly entityId: string;
  readonly version: number;
  readonly snapshot: KnowledgeEntityRecord;
  readonly changedBy: string;           // userId or serviceId
  readonly changeReason?: string;
  readonly createdAt: string;
}
```

| Rule | Description |
|------|-------------|
| **VER-1** | Updates create new version · never overwrite |
| **VER-2** | Deprecation creates version with status change |
| **VER-3** | Rollback restores previous version (admin only) |
| **VER-4** | Version history retained indefinitely |

## 2.8 Knowledge Governance

**File:** `lib/aurora/knowledge/services/KnowledgeValidationService.ts`

| Control | Implementation |
|---------|---------------|
| Lifecycle states | acquired → provisional → validated → deprecated → archived |
| Classification | public · internal · confidential · restricted |
| Curator review | Knowledge Manager agent + human approval |
| Staleness | 90-day review cycle · daily job |
| Conflict detection | Graph consistency check on write |
| Audit | ORION AuditStore · every state transition |

## 2.9 Canonical Entity Definition

```typescript
export interface KnowledgeEntity {
  readonly id: string;                  // knw_{uuid}
  readonly tenantId: string;
  readonly brandId: string;
  readonly domain: KnowledgeDomain;
  readonly entityType: string;
  readonly status: KnowledgeLifecycleStatus;
  readonly classification: KnowledgeClassification;
  readonly title: string;
  readonly content: Record<string, unknown>;
  readonly sourceType: KnowledgeSourceType;
  readonly sourceTrust: number;
  readonly version: number;
  readonly curatorAgent: string;
  readonly validatedAt?: string;
  readonly validatedBy?: string;
  readonly staleAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type KnowledgeLifecycleStatus =
  | 'acquired' | 'provisional' | 'validated' | 'deprecated' | 'archived' | 'rejected';

export type KnowledgeDomain =
  | 'knowledge.brand' | 'knowledge.product' | 'knowledge.campaign'
  | 'knowledge.customer' | 'knowledge.competitor' | 'knowledge.industry'
  | 'knowledge.seo' | 'knowledge.ads' | 'knowledge.content'
  | 'knowledge.market' | 'knowledge.executive';
```

## 2.10 Knowledge Lifecycle Implementation

| Transition | Trigger | Authority |
|------------|---------|-----------|
| acquired → provisional | IngestionService processing complete | System |
| provisional → validated | Human approval | Brand Manager · curator |
| provisional → rejected | Validation failure | Curator |
| validated → deprecated | Superseded by new version | Curator |
| deprecated → archived | Retention policy | System job |
| any → rejected | Admin rejection | Aurora admin |

---

# 3. Memory Infrastructure

## 3.1 MemoryService

**File:** `lib/aurora/knowledge/services/MemoryService.ts`

```typescript
export interface MemoryService {
  write(ctx: AuroraRuntimeContext, tier: MemoryTier, entry: MemoryEntry): Promise<MemoryEntryId>;
  read(ctx: AuroraRuntimeContext, tier: MemoryTier, query: MemoryQuery): Promise<readonly MemoryEntry[]>;
  append(ctx: AuroraRuntimeContext, tier: MemoryTier, entry: MemoryEntry): Promise<void>;
  delete(ctx: AuroraRuntimeContext, tier: MemoryTier, entryId: MemoryEntryId): Promise<void>;
  consolidate(ctx: AuroraRuntimeContext, tier: MemoryTier, scope: MemoryScope): Promise<ConsolidationResult>;
  getTierStats(ctx: AuroraRuntimeContext): Promise<Readonly<Record<MemoryTier, TierStats>>>;
}
```

## 3.2 Memory Tier Implementation Matrix

| Tier | Name | Storage | Implementation File | Phase |
|:----:|------|---------|---------------------|:-----:|
| 1 | Working | Redis | `memory/tiers/WorkingMemoryStore.ts` | 1 |
| 2 | Session | Redis | `memory/tiers/SessionMemoryStore.ts` | 1 |
| 3 | Campaign | PostgreSQL | `memory/tiers/CampaignMemoryStore.ts` | 1 |
| 4 | Business | PostgreSQL | `memory/tiers/BusinessMemoryStore.ts` | 1 |
| 5 | Brand | PostgreSQL | `memory/tiers/BrandMemoryStore.ts` | 1 |
| 6 | Customer | PostgreSQL | `memory/tiers/CustomerMemoryStore.ts` | 2 stub |
| 7 | Executive | PostgreSQL | `memory/tiers/ExecutiveMemoryStore.ts` | 2 stub |
| 8 | Learning | PostgreSQL | `memory/tiers/LearningMemoryStore.ts` | 1 |
| 9 | Historical | PostgreSQL | `memory/tiers/HistoricalMemoryStore.ts` | 1 |
| 10 | Long-Term | PostgreSQL | `memory/tiers/LongTermMemoryStore.ts` | 1 |

## 3.3 Tier Specifications

### Tier 1 — Working Memory

| Field | Value |
|-------|-------|
| Redis key | `aurora:memory:working:{tenantId}:{taskId}` |
| TTL | 30 minutes |
| Max tokens | 2,000 |
| Eviction | Task completion · timeout |

### Tier 2 — Session Memory (Conversation)

| Field | Value |
|-------|-------|
| Redis key | `aurora:memory:session:{tenantId}:{sessionId}` |
| TTL | 24 hours (configurable 4h–7d) |
| Max tokens | 4,000 per session |
| Schema | session_id · agent · turn_index · role · summary · confidence |

### Tier 3 — Campaign Memory

| Field | Value |
|-------|-------|
| Table | `aurora_memory_campaign` |
| Retention | Campaign active + 90 days |
| Consolidation target | Campaign Knowledge (CampaignLesson entities) |

### Tier 4 — Business Memory

| Field | Value |
|-------|-------|
| Table | `aurora_memory_business` |
| Retention | Tenant/business lifetime |
| Contents | Strategic goals · quarterly plans · budget decisions |

### Tier 5 — Brand Memory

| Field | Value |
|-------|-------|
| Table | `aurora_memory_brand` |
| Retention | Brand lifetime |
| Consolidation target | Brand Knowledge graph |
| Learning trigger | Human edit diffs → voice preferences |

### Tier 6 — Customer Memory

Phase 2 stub. Table `aurora_memory_customer` · segment-level only · no PII.

### Tier 7 — Executive Memory

Phase 2 stub. Table `aurora_memory_executive` · confidential classification.

### Tier 8 — Learning Memory

| Field | Value |
|-------|-------|
| Table | `aurora_memory_learning` |
| Scope | Per brand · per agent codename |
| Signals | approval +1.0 · rejection -1.0 · edit minor +0.3 · KPI met +0.8 |

### Tier 9 — Historical Memory

| Field | Value |
|-------|-------|
| Table | `aurora_memory_historical` (partitioned by year) |
| Retention | 1y starter · 3y pro · 7y enterprise |

### Tier 10 — Long-Term Memory

| Field | Value |
|-------|-------|
| Table | `aurora_memory_longterm` |
| Updated by | Monthly consolidation job |
| Contents | Proven strategies · seasonal baselines |

## 3.4 Memory Consolidation

**File:** `lib/aurora/knowledge/jobs/MemoryConsolidationJob.ts`

| Source Tier | Target | Trigger | Job Schedule |
|-------------|--------|---------|:------------:|
| Campaign (expired) | Campaign Knowledge | Campaign + 90d | Daily |
| Brand (stable patterns) | Brand Knowledge | 5+ consistent signals | Bi-weekly |
| Learning (validated) | Long-Term + Knowledge | Confidence > 0.85 | Bi-weekly |
| Business (annual) | Long-Term Memory | Annual review | Monthly |
| Session (unused) | Purge | TTL expired | Hourly |

```typescript
export interface ConsolidationResult {
  readonly tier: MemoryTier;
  readonly entriesProcessed: number;
  readonly knowledgeEntitiesCreated: number;
  readonly longTermEntriesCreated: number;
  readonly purged: number;
}
```

## 3.5 Memory Expiration

**File:** `lib/aurora/knowledge/jobs/MemoryExpirationJob.ts`

| Schedule | Action |
|----------|--------|
| Hourly | Purge expired working · session memory |
| Daily 02:00 | Campaign memory past retention → consolidate then purge |
| Daily 03:00 | Flag stale knowledge entities |
| Bi-weekly Sun | Full consolidation run |
| Monthly 1st | Long-term memory rollup |

## 3.6 Memory Archival

Expired campaign memory with historical value → Tier 9 Historical before purge. Audit log on every purge operation.

---

# 4. Retrieval Pipeline

## 4.1 KnowledgeRetrievalService

**File:** `lib/aurora/knowledge/services/KnowledgeRetrievalService.ts`

```typescript
export interface KnowledgeRetrievalService {
  /** Mandatory pre-flight — called before every agent LLM invocation */
  preflight(ctx: AuroraRuntimeContext, request: RetrievalRequest): Promise<RetrievalResult>;

  /** Hybrid search without full context assembly */
  search(ctx: AuroraRuntimeContext, query: RetrievalQuery): Promise<readonly ScoredEntity[]>;

  /** Assemble full context package for agent */
  assembleContext(ctx: AuroraRuntimeContext, request: ContextAssemblyRequest): Promise<ContextPackage>;

  /** Invalidate retrieval cache for tenant/brand */
  invalidateCache(ctx: AuroraRuntimeContext, scope?: CacheScope): Promise<void>;
}
```

## 4.2 Pipeline Stages

```
1. Parse task type → identify domains (TaskDomainMapper)
2. Build retrieval query (task + brand + campaign context)
3. Parallel hybrid search:
   ├── SemanticSearch (pgvector · top-K 10)
   ├── KeywordSearch (tsvector · top-K 10)
   ├── GraphTraversal (max 3 hops)
   └── MemoryLookup (brand + session + learning tiers)
4. Merge scores (hybrid formula)
5. Rank (relevance · freshness · trust · status · usage)
6. Confidence scoring on result set
7. Conflict detection (ConflictResolver)
8. Build ContextPackage (3,000 token budget)
9. Attach KnowledgeCitation[] metadata
10. Return RetrievalResult
```

## 4.3 Hybrid Search Formula

```
final_score = (0.50 × semantic_score)
            + (0.25 × keyword_score)
            + (0.15 × graph_proximity_score)
            + (0.10 × memory_relevance_score)
            × freshness_multiplier
            × trust_multiplier
            × status_multiplier  // validated=1.0 · provisional=0.7
```

## 4.4 EmbeddingService

**File:** `lib/aurora/knowledge/services/EmbeddingService.ts`

```typescript
export interface EmbeddingService {
  embed(text: string, metadata?: EmbeddingMetadata): Promise<readonly number[]>;
  embedBatch(texts: readonly string[]): Promise<readonly (readonly number[])[]>;
  indexEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<void>;
  removeFromIndex(ctx: AuroraRuntimeContext, entityId: string): Promise<void>;
  semanticSearch(ctx: AuroraRuntimeContext, vector: readonly number[], options: VectorSearchOptions): Promise<readonly ScoredEntity[]>;
  reindexTenant(ctx: AuroraRuntimeContext): Promise<ReindexResult>;
}
```

| Field | Specification |
|-------|---------------|
| Vector store | pgvector · `aurora_knowledge_embedding` |
| Chunk size | 512 tokens |
| Similarity threshold | 0.75 minimum |
| Top-K pre-rank | 10 |
| Model | Configurable via ORION AI Provider |

## 4.5 Confidence Scoring

```typescript
export type RetrievalConfidence = 'high' | 'medium' | 'low' | 'insufficient';

export interface RetrievalResult {
  readonly confidence: RetrievalConfidence;
  readonly contextPackage: ContextPackage;
  readonly citations: readonly KnowledgeCitation[];
  readonly gaps: readonly string[];       // Missing domain coverage
  readonly latencyMs: number;
}
```

| Confidence | Criteria | Agent Action |
|------------|----------|--------------|
| **high** | ≥5 validated · avg score > 0.85 | Proceed |
| **medium** | 3–4 results · avg > 0.75 | Proceed · note gaps |
| **low** | 1–2 results · avg > 0.70 | Proceed · flag uncertainty |
| **insufficient** | 0 relevant results | **Escalate · do not fabricate** |

## 4.6 Context Assembly Token Budget

| Layer | Max Tokens | Source |
|-------|:----------:|--------|
| Brand context | 600 | Brand Knowledge + Brand Memory |
| Task knowledge | 800 | Domain-specific |
| Campaign context | 400 | Campaign Knowledge + Memory |
| Graph entities | 500 | Traversal (3 hops) |
| Learning preferences | 300 | Brand + Learning Memory |
| Session history | 400 | Session Memory |
| **Total** | **3,000** | Hard limit |

## 4.7 Citation Pipeline

```typescript
export interface KnowledgeCitation {
  readonly entityId: string;
  readonly domain: KnowledgeDomain;
  readonly entityType: string;
  readonly title: string;
  readonly excerpt: string;
  readonly confidence: number;
  readonly sourceType: KnowledgeSourceType;
  readonly retrievedAt: string;
}
```

Citations attached to every agent output using retrieved knowledge (A-004 §6.9).

## 4.8 Freshness Validation

| Age | Ranking Multiplier | Action |
|-----|:----------------:|--------|
| < 7 days | 1.00 | — |
| 7–30 days | 0.95 | — |
| 30–90 days | 0.85 | — |
| 90–180 days | 0.70 | Flag stale |
| > 180 days | 0.30 | Exclude unless explicit request |

## 4.9 Retrieval Caching

**File:** `lib/aurora/knowledge/cache/RetrievalCache.ts`

| Field | Value |
|-------|-------|
| Backend | Redis |
| Key | `aurora:retrieval:{tenantId}:{brandId}:{queryHash}` |
| TTL | 120 seconds (configurable) |
| Invalidation | On knowledge write · memory consolidation · brand config change |

---

# 5. Knowledge Acquisition

## 5.1 KnowledgeIngestionService

**File:** `lib/aurora/knowledge/services/KnowledgeIngestionService.ts`

```typescript
export interface KnowledgeIngestionService {
  /** Event-driven ingestion from ORION Event Bus */
  ingestFromEvent(ctx: AuroraRuntimeContext, event: PlatformEvent): Promise<IngestionResult>;

  /** External source sync (connectors) */
  ingestFromSource(ctx: AuroraRuntimeContext, source: ExternalSourceRef, payload: unknown): Promise<IngestionResult>;

  /** Human upload / API submission */
  ingestManual(ctx: AuroraRuntimeContext, input: ManualIngestionInput): Promise<IngestionResult>;

  /** Agent-proposed provisional knowledge */
  ingestProvisional(ctx: AuroraRuntimeContext, input: ProvisionalIngestionInput): Promise<IngestionResult>;

  /** Batch re-ingestion (migration · repair) */
  reingest(ctx: AuroraRuntimeContext, filter: ReingestFilter): Promise<BatchIngestionResult>;
}

export interface IngestionResult {
  readonly entityId?: string;
  readonly status: 'acquired' | 'provisional' | 'rejected';
  readonly validationErrors?: readonly ValidationError[];
  readonly trustScore: number;
  readonly ingestionId: string;
}
```

## 5.2 Acquisition Architecture

```
External Sources ──┐
ORION Domains ─────┤
Campaign Execution ├──→ IngestionService ──→ ValidationService ──→ Knowledge Graph
Human Input ───────┤                              ↑
Operational Events ┘                         Memory Tiers
```

**File:** `lib/aurora/knowledge/acquisition/AcquisitionPipeline.ts`

| Stage | Component | Output |
|-------|-----------|--------|
| 1 | EventRouter | Route event → channel handler |
| 2 | FieldMapper | Map source fields → entity schema |
| 3 | SchemaValidator | Zod validation |
| 4 | TrustScorer | Source trust score |
| 5 | ConflictDetector | Graph consistency check |
| 6 | EntityPersister | Save as acquired/provisional |
| 7 | EmbeddingIndexer | Queue embedding job |
| 8 | AuditLogger | ORION AuditStore entry |

## 5.3 Acquisition Channels

| # | Channel | Handler File | Phase | Trigger |
|---|---------|--------------|:-----:|---------|
| 1 | Campaign results | `handlers/CampaignAcquisitionHandler.ts` | 1 | `aurora.campaign.completed` |
| 2 | Website analytics | `handlers/AnalyticsAcquisitionHandler.ts` | 1 | Daily sync job |
| 3 | SEO performance | `handlers/SeoAcquisitionHandler.ts` | 1 | Weekly rank · daily GSC |
| 4 | Advertising performance | `handlers/AdsAcquisitionHandler.ts` | 2 | Hourly sync |
| 5 | CRM signals | `handlers/CrmAcquisitionHandler.ts` | 2 | ORION CRM events |
| 6 | Executive decisions | `handlers/ExecutiveAcquisitionHandler.ts` | 2 | Approval events |
| 7 | Human feedback | `handlers/FeedbackAcquisitionHandler.ts` | 1 | Edit · approval events |
| 8 | Operational events | `handlers/OperationalEventHandler.ts` | 1 | Aurora platform events |
| 9 | External sources | `handlers/ExternalSourceHandler.ts` | 1–2 | Connector sync |

## 5.4 Campaign Results Acquisition

| Data Captured | Target Entity | Target Memory | Trigger |
|---------------|---------------|---------------|---------|
| Final KPIs · ROAS · CPA | CampaignRecord | — | `aurora.campaign.completed` |
| Channel breakdown | ChannelPerformance | Campaign Memory | Campaign completion |
| A/B test outcomes | CampaignLesson | Learning Memory | Test conclusion |
| Budget utilization | CampaignRecord | Campaign Memory | Campaign completion |
| Agent decisions | — | Campaign Memory | Continuous |

### Field Mapping — Campaign Completion

| Source Field | Target Entity | Target Attribute |
|-------------|---------------|------------------|
| `campaign.id` | CampaignRecord | `campaignId` |
| `campaign.objective` | CampaignRecord | `objective` |
| `campaign.budget_spent` | CampaignRecord | `totalSpend` |
| `campaign.revenue` | CampaignRecord | `revenue` |
| `campaign.roas` | CampaignRecord | `roas` |
| `analytics.by_channel` | ChannelPerformance | per-channel metrics |
| `agent.decisions[]` | — | Campaign Memory decision log |
| `ab_tests[].winner` | CampaignLesson | `whatWorked` |
| `ab_tests[].loser` | CampaignLesson | `whatFailed` |
| `optimization.actions[]` | OptimizationRecord | action history |

## 5.5 ORION PlatformStore Integration

| ORION Entity | Aurora Handler | Knowledge Domain |
|-------------|----------------|-----------------|
| Platform analytics snapshot | AnalyticsAcquisitionHandler | SEO · Content |
| Integration sync payload | ExternalSourceHandler | Domain-specific |
| Audit-adjacent events | OperationalEventHandler | Learning Memory |

**Pattern:** Follow ES-010 PlatformStore persistence — `KnowledgeEntityPersister` implements `PlatformEntityPersister<KnowledgeEntityRecord>`.

**File:** `lib/aurora/knowledge/persistence/KnowledgeEntityPersister.ts`

```typescript
export class KnowledgeEntityPersister implements PlatformEntityPersister<KnowledgeEntityRecord> {
  readonly entityType = 'aurora.knowledge.entity';

  async persist(ctx: PersistenceContext, entity: KnowledgeEntityRecord): Promise<void> {
    await this.repository.saveEntity(ctx.tenantId, entity);
    await this.embeddingQueue.enqueue(ctx.tenantId, entity.id);
  }
}
```

## 5.6 CRM Acquisition (Phase 2 Stub)

**File:** `lib/aurora/knowledge/acquisition/handlers/CrmAcquisitionHandler.ts`

| CRM Field | Target Entity | Privacy Transform |
|-----------|---------------|-------------------|
| `lead.source` | CampaignRecord | Aggregate only |
| `lead.campaign_id` | Campaign Knowledge link | ID reference |
| `segment.name` | CustomerSegment | No PII |
| `segment.size` | CustomerSegment | Count only · min 10 |
| `segment.avg_clv` | CustomerSegment | Aggregated metric |
| `pipeline.stage_counts` | StrategicDirective | Aggregated |
| `conversion.rate_by_source` | CampaignLesson | Statistical aggregate |

Phase 2: Handler registered · returns `{ status: 'skipped', reason: 'phase2' }` until `aurora.crm_bridge.enabled`.

## 5.7 Finance Acquisition (Phase 2 Stub)

| Finance Data | Target | Handler |
|-------------|--------|---------|
| Marketing spend | CampaignRecord · BudgetAllocation | `FinanceAcquisitionHandler.ts` |
| Revenue attribution | CampaignRecord | Same |
| Budget vs. actual | Business Memory | Same |
| ROI calculations | CampaignRecord · Long-Term Memory | Same |

## 5.8 HCM Acquisition (Phase 3 Hook)

| HCM Data | Target | Usage |
|----------|--------|-------|
| Organization structure | Business Memory | Team capacity context only |
| Workforce metrics | — | Not ingested Phase 1–2 |

## 5.9 User Feedback Acquisition

**File:** `lib/aurora/knowledge/acquisition/handlers/FeedbackAcquisitionHandler.ts`

| Event | Memory Write | Knowledge Impact |
|-------|-------------|-----------------|
| `aurora.content.edited` | Brand Memory + Learning Memory | Voice preference signal |
| `aurora.approval.granted` | Learning Memory (+1.0) | Positive pattern |
| `aurora.approval.denied` | Learning Memory (-1.0) | Negative pattern + reason |
| `aurora.knowledge.correction` | — | KnowledgeValidationService queue |
| `aurora.agent.rated` | Learning Memory | Agent performance signal |

## 5.10 Campaign Feedback Acquisition

| Signal | Weight | Target |
|--------|:------:|--------|
| Campaign KPI met | +0.8 | Learning Memory → CampaignLesson |
| Campaign KPI missed | -0.5 | Learning Memory |
| Channel outperformed | +0.6 | ChannelPerformance update |
| Creative rejected | -0.7 | Learning Memory |

## 5.11 External Sources

| Source | Phase | Destination | Sync Schedule |
|--------|:-----:|-------------|:-------------:|
| Google Search Console | 1 | SEO Knowledge | Daily |
| Google Analytics | 1 | Content · SEO Knowledge | Daily |
| Google Ads | 2 | Advertising Knowledge | Hourly |
| Meta Ad Library | 2 | Competitor Knowledge | Weekly |
| Industry reports (upload) | 2 | Industry Knowledge | On upload |
| Shopify product catalog | 2 | Product Knowledge | Daily |
| ORION CRM | 2 | Customer Knowledge | Event-driven |
| ORION Finance | 3 | Executive Knowledge | Weekly |

## 5.12 Knowledge Validation Pipeline

**File:** `lib/aurora/knowledge/services/KnowledgeValidationService.ts`

```typescript
export interface KnowledgeValidationService {
  validateSchema(entity: KnowledgeEntityRecord): ValidationResult;
  scoreTrust(source: KnowledgeSourceType, metadata: TrustMetadata): number;
  checkConsistency(ctx: AuroraRuntimeContext, entity: KnowledgeEntityRecord): Promise<ConsistencyResult>;
  assessFreshness(entity: KnowledgeEntityRecord): FreshnessAssessment;
  assignClassification(entity: KnowledgeEntityRecord): KnowledgeClassification;
  submitForReview(ctx: AuroraRuntimeContext, entityId: string): Promise<void>;
  approve(ctx: AuroraRuntimeContext, entityId: string): Promise<KnowledgeEntity>;
  reject(ctx: AuroraRuntimeContext, entityId: string, reason: string): Promise<void>;
}
```

### Validation Pipeline Stages

```
Acquired Data
    ↓
1. Schema validation (Zod · required fields)
    ↓
2. Source trust scoring
    ↓
3. Consistency check (graph · conflict detection)
    ↓
4. Freshness assessment
    ↓
5. Classification assignment
    ↓
6. Curator agent pre-screen (Knowledge Manager)
    ↓
7. Human approval (validated promotion)
    ↓
Knowledge Graph (validated) or Rejected
```

## 5.13 Source Trust Hierarchy

| Source Type | Trust Score | Auto-Validate Eligible |
|-------------|:-----------:|:---------------------:|
| Human Brand Manager | 1.00 | Yes (with audit) |
| Human executive | 1.00 | Yes (with audit) |
| ORION CRM/Finance sync | 0.90 | Provisional only |
| Integration platform sync | 0.85 | Provisional only |
| Campaign completion (metrics) | 0.80 | Provisional · auto if KPI met |
| Agent analysis | 0.60 | Provisional only |
| External feed | 0.50 | Provisional · human review required |
| Agent generation | 0.40 | Never auto-validate |

## 5.14 Quality Scoring

**File:** `lib/aurora/knowledge/quality/KnowledgeQualityScorer.ts`

| Dimension | Weight | Measurement |
|-----------|:------:|-------------|
| Completeness | 25% | Required fields populated |
| Freshness | 20% | Age vs. domain staleness threshold |
| Trust | 25% | Source trust score |
| Consistency | 15% | Graph conflict count |
| Usage | 15% | Retrieval hit rate · citation count |

```typescript
export interface QualityScore {
  readonly overall: number;           // 0.0–1.0
  readonly dimensions: Readonly<Record<QualityDimension, number>>;
  readonly recommendation: 'promote' | 'review' | 'reject' | 'refresh';
}
```

## 5.15 Approval Workflow

**File:** `lib/aurora/knowledge/workflows/KnowledgeApprovalWorkflow.ts`

| Step | Actor | Action |
|------|-------|--------|
| 1 | System | Entity reaches provisional status |
| 2 | Knowledge Manager agent | Automated pre-screen · quality score |
| 3 | Curator queue | Human review task created |
| 4 | Brand Manager / curator | Approve · reject · request changes |
| 5 | System | Status transition · embedding reindex · event emit |

| Permission | Required For |
|------------|-------------|
| `aurora.knowledge.read` | View provisional entities |
| `aurora.knowledge.write` | Create provisional |
| `aurora.knowledge.validate` | Promote to validated |
| `aurora.knowledge.admin` | Reject · archive · rollback |

## 5.16 Acquisition Rate Limits

**File:** `lib/aurora/knowledge/acquisition/AcquisitionRateLimiter.ts`

| Source | Max/Hour/Tenant | Burst |
|--------|:---------------:|:-----:|
| Campaign completion | 50 | 10 |
| Analytics sync | 24 | 4 |
| CRM events | 1,000 | 100 |
| Human upload | 100 | 20 |
| Agent provisional | 500 | 50 |
| External feed | 60 | 10 |
| Embedding generation | 200 | 30 |

Exceeded limits → queue with backoff · audit log · no silent drop.

---

# 6. Learning Engine

## 6.1 LearningService

**File:** `lib/aurora/knowledge/services/LearningService.ts`

```typescript
export interface LearningService {
  captureSignal(ctx: AuroraRuntimeContext, signal: LearningSignal): Promise<void>;
  detectPatterns(ctx: AuroraRuntimeContext, scope: LearningScope): Promise<readonly DetectedPattern[]>;
  proposeKnowledgeUpdate(ctx: AuroraRuntimeContext, pattern: DetectedPattern): Promise<KnowledgeEntity>;
  getLearningMetrics(ctx: AuroraRuntimeContext, period: MetricsPeriod): Promise<LearningMetrics>;
  freezeLearning(ctx: AuroraRuntimeContext, brandId: string): Promise<void>;
  resetLearningMemory(ctx: AuroraRuntimeContext, brandId: string, tier?: MemoryTier): Promise<void>;
}

export interface LearningSignal {
  readonly signalType: LearningSignalType;
  readonly weight: number;              // -1.0 to +1.0
  readonly agentCodename?: string;
  readonly topicPattern?: string;
  readonly outcome?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}
```

## 6.2 Learning Scheduler

**File:** `lib/aurora/knowledge/jobs/LearningSchedulerJob.ts`

| Job | Schedule | File |
|-----|----------|------|
| Signal aggregation | Daily 01:00 | `jobs/LearningSignalAggregationJob.ts` |
| Pattern detection | Daily 02:00 | `jobs/PatternDetectionJob.ts` |
| Brand memory → knowledge | Bi-weekly Sun 04:00 | `jobs/BrandLearningPromotionJob.ts` |
| Drift detection | Daily 05:00 | `jobs/DriftDetectionJob.ts` |
| Quality metrics rollup | Weekly Mon 06:00 | `jobs/KnowledgeQualityMetricsJob.ts` |
| Gap report | Weekly Mon 07:00 | `jobs/KnowledgeGapReportJob.ts` |

```typescript
export interface LearningScheduler {
  registerJob(job: ScheduledLearningJob): void;
  runNow(ctx: AuroraRuntimeContext, jobId: string): Promise<JobResult>;
  getJobStatus(jobId: string): JobStatus;
}
```

## 6.3 Continuous Learning Model

```
Execution → Outcome → Signal Capture → Learning Memory
    ↓
Pattern Detection (minimum 3 signals · LG-1)
    ↓
Curator Validation (Knowledge Manager)
    ↓
Knowledge Graph Update (provisional → validated)
    ↓
Retrieval Ranking Adjustment
    ↓
Agent Prompt Refinement (versioned · LG-4)
    ↓
Improved Future Performance
```

## 6.4 Knowledge Updates from Learning

| Pattern Type | Minimum Signals | Target Entity | Curator |
|-------------|:---------------:|---------------|---------|
| Voice correction | 5 consistent | BrandGuideline | Knowledge Manager |
| Content pattern | 3 high-engagement | ContentPattern | Content Strategist |
| Campaign success | 3 ROAS > target | CampaignLesson | Campaign Manager |
| SEO optimization | 3 ranking gains | KeywordRecord weight | SEO Specialist |
| Ad audience | 3 segment wins | AudienceProfile | Advertising Manager |

## 6.5 Memory Consolidation (Learning Path)

See §3.4. Learning-specific consolidation:

| Source | Condition | Action |
|--------|-----------|--------|
| Learning Memory | Confidence > 0.85 · 3+ signals | Create provisional knowledge entity |
| Brand Memory | 5+ consistent voice signals | Propose BrandGuideline update |
| Campaign Memory | Campaign + 90d · KPI data | Create CampaignLesson |

## 6.6 Pattern Discovery

**File:** `lib/aurora/knowledge/learning/PatternDiscoveryEngine.ts`

```typescript
export interface PatternDiscoveryEngine {
  analyzeSignals(signals: readonly LearningSignal[], config: PatternConfig): DetectedPattern[];
  validatePattern(pattern: DetectedPattern): PatternValidation;
  rankPatterns(patterns: readonly DetectedPattern[]): readonly DetectedPattern[];
}

export interface DetectedPattern {
  readonly patternId: string;
  readonly patternType: string;
  readonly signalCount: number;
  readonly averageWeight: number;
  readonly confidence: number;
  readonly domain: KnowledgeDomain;
  readonly suggestedEntityType: string;
  readonly sampleSignals: readonly string[];  // signal IDs only
}
```

| Rule | Description |
|------|-------------|
| **LG-1** | Minimum 3 signals before pattern promotion |
| **LG-2** | Prompt changes require Knowledge Manager validation |
| **LG-3** | Learning cannot override brand guidelines or executive directives |
| **LG-4** | All prompt versions retained for rollback |
| **LG-5** | Human can reset brand/learning memory per brand |
| **LG-6** | Cross-tenant learning prohibited |

## 6.7 Brand Learning

| Signal | Learning Action | Application |
|--------|----------------|-------------|
| Consistent human voice corrections | Brand Memory → Brand Knowledge | All content agents |
| Approved content patterns | ContentPattern promotion | Copywriter · Creative Director |
| Rejected content patterns | Negative pattern storage | All content agents |
| Brand guideline updates | Brand Knowledge version | All agents · immediate retrieval priority |

## 6.8 SEO Learning

| Signal | Learning | Application |
|--------|----------|-------------|
| Ranking improvement post-optimization | Store optimization pattern | SEO Specialist recommendations |
| Keyword performance correlation | Update KeywordRecord weights | Content Strategist topic selection |
| Content SEO score vs. organic traffic | Calibrate scoring model | SEO Specialist audits |

## 6.9 Campaign Optimization Learning

| Outcome | Learning Capture | Future Application |
|---------|-----------------|-------------------|
| ROAS > target | Channel mix · creative · audience pattern | Campaign Manager planning |
| ROAS < target | Failure factors · context | Avoid pattern recommendation |
| A/B winner | Winning attributes | Copywriter · Creative Director |
| Budget pacing deviation | Pacing pattern | Campaign Manager alerts |

## 6.10 Drift Detection

**File:** `lib/aurora/knowledge/learning/DriftDetectionService.ts`

| Drift Type | Metric | Threshold | Action |
|------------|--------|-----------|--------|
| Brand voice drift | Voice alignment score | Drop > 10% | Alert Brand Manager · freeze learning option |
| Retrieval quality drift | Avg confidence | Drop > 15% over 7d | Knowledge gap report |
| Knowledge staleness drift | Stale entity ratio | > 20% in domain | Curator review queue |
| Learning false pattern | Promoted then rejected | > 2 in 30d | Increase sample minimum |

```typescript
export interface DriftAlert {
  readonly driftType: DriftType;
  readonly brandId: string;
  readonly currentValue: number;
  readonly baselineValue: number;
  readonly deltaPercent: number;
  readonly recommendedAction: string;
  readonly detectedAt: string;
}
```

## 6.11 Anti-Drift Controls

| Control | Implementation |
|---------|---------------|
| Brand anchor | Brand Knowledge precedence over learned patterns in ranking |
| Executive anchor | Executive directives immutable by learning (LG-3) |
| Rollback | Prompt version revert within 24h |
| Sample minimum | No learning action from < 3 signals |
| Human veto | Brand Manager freeze via `LearningService.freezeLearning()` |
| A/B prompt testing | 10% traffic before full rollout (A-018 integration) |

## 6.12 Knowledge Quality Metrics

| Metric | Description | Review |
|--------|-------------|:------:|
| Agent improvement rate | KPI delta after learning cycle | Monthly |
| Knowledge promotion rate | Provisional → validated conversions | Weekly |
| Brand memory → knowledge conversion | Preferences promoted to graph | Monthly |
| Retrieval effectiveness | Outputs using retrieved knowledge | Weekly |
| Learning signal volume | Signals per brand per week | Daily |
| False pattern rate | Promoted patterns later rejected | Monthly |
| Knowledge gap closure rate | Gaps identified → entries created | Monthly |

## 6.13 Learning Cycle Calendar

| Day | Activity | Actor |
|-----|----------|-------|
| Daily | Signal capture · gap logging · drift check | System |
| Monday | Signal aggregation · gap report | Learning System |
| Tuesday | Curator review queue processing | Knowledge Manager |
| Wednesday | Prompt performance review (KPI delta > 5%) | Engineering + KM |
| Thursday | Brand memory → knowledge promotion | Knowledge Manager |
| Friday | Weekly learning report → Marketing Director | Learning System |
| Monthly | Long-term consolidation · quality audit | Learning System + curators |

---

# 7. ORION Integration

## 7.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  ORION Platform                                                  │
│  PlatformStore · Event Bus · Identity · Analytics · CRM · Finance│
├─────────────────────────────────────────────────────────────────┤
│  Aurora Knowledge Integration Layer                              │
│  KnowledgeEntityPersister · EventSubscribers · FederationBridge  │
├─────────────────────────────────────────────────────────────────┤
│  lib/aurora/knowledge/                                           │
│  Services · Repositories · Jobs · Acquisition Handlers           │
└─────────────────────────────────────────────────────────────────┘
```

**File:** `lib/aurora/knowledge/integration/AuroraKnowledgeWiring.ts`

```typescript
export function extendKnowledgeWiring(base: AuroraWiring): AuroraWiring {
  const knowledgeModule = new KnowledgeModuleRuntime();
  base.moduleRegistry.register(knowledgeModule);
  registerKnowledgeEventSubscribers(base.eventBus);
  registerKnowledgePersisters(base.platformStore);
  return base;
}
```

## 7.2 PlatformStore

| Aurora Entity | PlatformStore Type | Pattern |
|---------------|-------------------|---------|
| `aurora_knowledge_entity` | Domain entity | ES-010 |
| `aurora_knowledge_relationship` | Domain entity | ES-010 |
| `aurora_knowledge_entity_version` | Domain entity | ES-010 |
| `aurora_knowledge_embedding` | Domain entity | ES-010 + pgvector |
| `aurora_memory_campaign` | Domain entity | ES-010 |
| `aurora_memory_business` | Domain entity | ES-010 |
| `aurora_memory_brand` | Domain entity | ES-010 |
| `aurora_memory_customer` | Domain entity | ES-010 (Phase 2) |
| `aurora_memory_executive` | Domain entity | ES-010 (Phase 2) |
| `aurora_memory_learning` | Domain entity | ES-010 |
| `aurora_memory_historical` | Domain entity | ES-010 |
| `aurora_memory_longterm` | Domain entity | ES-010 |
| `aurora_learning_feedback` | Audit-adjacent | ES-038 |
| `aurora_retrieval_audit` | Audit-adjacent | ES-038 |

All entities include: `tenant_id` · `brand_id` (where applicable) · `created_at` · `updated_at` · `deleted_at`.

**Migration files:** `migrations/aurora/007_knowledge_memory.sql`

## 7.3 Event Bus

### Aurora Events Published

| Event | Payload | Subscriber Action |
|-------|---------|-------------------|
| `aurora.knowledge.created` | entityId · domain · status | Cache invalidate |
| `aurora.knowledge.validated` | entityId · domain | Embedding reindex · cache invalidate |
| `aurora.knowledge.deprecated` | entityId · reason | Remove from retrieval index |
| `aurora.knowledge.stale` | entityId · domain | Curator queue |
| `aurora.memory.consolidated` | tier · entitiesCreated | Ranking update |
| `aurora.learning.pattern.detected` | patternId · domain | KM review task |
| `aurora.learning.feedback.captured` | signalType · weight | Metrics |
| `aurora.retrieval.gap.detected` | domains · taskType | Gap report |
| `aurora.retrieval.low_confidence` | confidence · agent | Alert |

### Aurora Events Consumed

| Event | Handler | Action |
|-------|---------|--------|
| `aurora.campaign.completed` | CampaignAcquisitionHandler | Campaign Knowledge |
| `aurora.content.published` | OperationalEventHandler | Content Knowledge |
| `aurora.content.approved` | FeedbackAcquisitionHandler | Learning signal +1.0 |
| `aurora.approval.granted` | FeedbackAcquisitionHandler | Learning signal +1.0 |
| `aurora.approval.denied` | FeedbackAcquisitionHandler | Learning signal -1.0 |
| `aurora.analytics.snapshot` | AnalyticsAcquisitionHandler | Performance knowledge |
| `aurora.agent.recommendation.acted` | FeedbackAcquisitionHandler | Learning signal |
| `aurora.integration.sync.completed` | ExternalSourceHandler | External ingestion |
| `aurora.budget.threshold.exceeded` | OperationalEventHandler | Executive + Campaign Memory |
| `aurora.config.updated` | ConfigChangeHandler | Cache invalidate · retention reload |

### ORION Domain Events Consumed (Phase 2+)

| ORION Event | Handler | Action |
|-------------|---------|--------|
| `crm.lead.created` | CrmAcquisitionHandler | Customer Memory |
| `crm.revenue.recognized` | CrmAcquisitionHandler | Campaign Knowledge |
| `finance.budget.updated` | FinanceAcquisitionHandler | Executive · Business Memory |
| `hcm.organization.updated` | HcmAcquisitionHandler | Business Memory context |

## 7.4 Identity Integration

Uses ES-AURORA-006 identity foundation:

| Integration Point | Usage |
|-------------------|-------|
| `AuroraRuntimeContext.tenantId` | All knowledge/memory queries |
| `AuroraRuntimeContext.brandId` | Brand-scoped retrieval |
| `AuroraAuthorizationService` | Knowledge RBAC (§7.10) |
| ORION user ID | Human knowledge authorship |
| Service identity | Agent provisional writes |

**File:** `lib/aurora/knowledge/security/KnowledgeAuthorizationGuard.ts`

```typescript
export function assertKnowledgeAccess(
  ctx: AuroraRuntimeContext,
  operation: KnowledgeOperation,
  domain?: KnowledgeDomain
): void {
  const permission = resolveKnowledgePermission(operation, domain);
  ctx.authorization.assert(permission);
}
```

## 7.5 Analytics Integration

| Direction | Data | Frequency |
|-----------|------|:---------:|
| Aurora → ORION Analytics | Retrieval latency · confidence distribution | Real-time |
| Aurora → ORION Analytics | Learning signal volume · promotion rate | Daily |
| Aurora → ORION Analytics | Knowledge gap count · stale entity ratio | Weekly |
| ORION → Aurora | Platform usage for executive context | Daily |

**File:** `lib/aurora/knowledge/integration/AnalyticsReporter.ts`

## 7.6 CRM Integration (Phase 2)

| CRM Data | Knowledge | Memory |
|----------|-----------|--------|
| Lead sources | Campaign Knowledge | Campaign Memory |
| Customer segments | Customer Knowledge | Customer Memory |
| Pipeline stages | Executive Knowledge | — |
| Conversion events | Campaign Knowledge | Learning Memory |

**Stub:** `CrmKnowledgeBridge.ts` — interface defined · implementation Phase 2 (A-034).

## 7.7 Finance Integration (Phase 2)

| Finance Data | Destination |
|-------------|-------------|
| Marketing spend | Campaign · Executive Knowledge |
| Revenue attribution | Campaign · Sales Intelligence |
| Budget vs. actual | Business Memory · Executive Knowledge |
| ROI calculations | Campaign Knowledge · Long-Term Memory |

## 7.8 Executive Provider Integration

| Knowledge Contribution | ORION Consumer |
|------------------------|---------------|
| Marketing Health Score context | Executive Brief |
| Campaign knowledge summaries | Executive Advisor → Brief card |
| Market intelligence alerts | ORION Intelligence workspace |
| Executive knowledge directives | Mission Control strategic context |

**File:** `lib/aurora/knowledge/integration/ExecutiveKnowledgeProvider.ts`

```typescript
export interface ExecutiveKnowledgeProvider {
  getMarketingHealthContext(ctx: AuroraRuntimeContext): Promise<ExecutiveContextBundle>;
  getCampaignSummaries(ctx: AuroraRuntimeContext, limit: number): Promise<readonly CampaignSummary[]>;
  getMarketAlerts(ctx: AuroraRuntimeContext): Promise<readonly MarketAlert[]>;
}
```

## 7.9 Knowledge Federation

| Phase | Integration |
|-------|-------------|
| **Phase 1 (A-009)** | Aurora EKG operates independently within Aurora domain |
| **Phase 2 (A-034)** | Bidirectional sync: Aurora brand/product ↔ ORION master data |
| **Phase 3** | Unified enterprise knowledge graph across ORION products |

### Sync Boundaries (Phase 2)

| ORION Entity | Aurora Domain | Direction |
|-------------|---------------|-----------|
| CRM Account/Segment | Customer Knowledge | ORION → Aurora |
| CRM Contact (aggregated) | Customer Memory | ORION → Aurora |
| Finance Budget | Executive Knowledge | ORION → Aurora |
| Finance Revenue | Campaign Knowledge | ORION → Aurora |
| HCM Organization | Business Memory | ORION → Aurora |
| Aurora Campaign ROI | Finance analytics | Aurora → ORION |

**File:** `lib/aurora/knowledge/federation/KnowledgeFederationBridge.ts` (Phase 2 stub)

## 7.10 Knowledge RBAC

| Role | Read | Write | Validate | Memory Write | Admin |
|------|:----:|:-----:|:--------:|:------------:|:-----:|
| Aurora Admin | All | All | All | All | ✅ |
| Brand Manager | Assigned | Assigned | Assigned | Brand tier | ❌ |
| Marketing Director | Assigned | Campaign · Executive | — | Campaign tier | ❌ |
| Content Creator | Assigned | Content (provisional) | — | Session | ❌ |
| Channel Manager | Assigned | SEO · Ads (provisional) | — | Session | ❌ |
| Analyst | Validated only | ❌ | ❌ | ❌ | ❌ |
| Agent (service) | Brand-scoped | Provisional only | ❌ | Learning · Session | ❌ |
| Viewer | Validated only | ❌ | ❌ | ❌ | ❌ |

## 7.11 Data Privacy & Compliance

| Requirement | Implementation |
|-------------|---------------|
| GDPR Art. 17 | Cascade delete derived knowledge on erasure request |
| GDPR Art. 20 | Knowledge export API per brand |
| PII exclusion | Segments only · no contact-level data in graph |
| Classification | public · internal · confidential · restricted |
| Audit | All mutations · retrievals (sampled) · consolidations logged |

## 7.12 KnowledgeModuleRuntime

**File:** `lib/aurora/knowledge/KnowledgeModuleRuntime.ts`

```typescript
export class KnowledgeModuleRuntime implements AuroraModuleRuntime {
  readonly moduleKey = 'knowledge';
  readonly displayName = 'Knowledge & Memory';
  readonly phase = 1 as const;
  readonly tier = 1;
  readonly dependencies = ['admin'] as const;

  async initialize(ctx: ModuleInitContext): Promise<ModuleHealth> {
    await this.runMigrations(ctx);
    await this.warmEmbeddingIndex(ctx);
    await this.registerJobs(ctx);
    await this.registerEventSubscribers(ctx);
    return { status: 'healthy', moduleKey: this.moduleKey };
  }

  async healthCheck(): Promise<HealthStatus> {
    return checkKnowledgeHealth();  // DB · Redis · pgvector · embedding provider
  }

  async shutdown(): Promise<void> {
    await this.jobScheduler.stop();
  }
}
```

Boot Phase 4 (A-005): Knowledge module transitions from stub to full init.

---

# 8. Testing Strategy

## 8.1 Test Structure

```
tests/aurora/
├── unit/knowledge/
│   ├── KnowledgeService.test.ts
│   ├── KnowledgeGraphService.test.ts
│   ├── KnowledgeRetrievalService.test.ts
│   ├── EmbeddingService.test.ts
│   ├── MemoryService.test.ts
│   ├── LearningService.test.ts
│   ├── KnowledgeValidationService.test.ts
│   ├── hybridScoring.test.ts
│   ├── confidenceScoring.test.ts
│   └── entityRegistry.test.ts
├── integration/knowledge/
│   ├── retrievalPipeline.test.ts
│   ├── acquisitionPipeline.test.ts
│   ├── memoryConsolidation.test.ts
│   ├── embeddingIndex.test.ts
│   └── knowledgeVersioning.test.ts
├── integration/security/
│   ├── knowledgeTenantIsolation.test.ts
│   ├── memoryTenantIsolation.test.ts
│   └── knowledgeRbac.test.ts
├── performance/
│   ├── retrievalLatency.test.ts
│   └── embeddingBatch.test.ts
└── recovery/
    ├── embeddingReindex.test.ts
    └── memoryRecovery.test.ts
```

## 8.2 Knowledge Integrity Tests

| Test | Assertion |
|------|-----------|
| `entityCrud.test.ts` | Create · read · update · deprecate lifecycle |
| `versionHistory.test.ts` | Every update creates version snapshot |
| `relationshipIntegrity.test.ts` | Orphan relationships rejected |
| `taxonomyValidation.test.ts` | Invalid domain/type placement rejected |
| `schemaValidation.test.ts` | All 45 entity types validate against Zod schemas |
| `conflictDetection.test.ts` | Contradictory entities flagged |
| `lifecycleTransitions.test.ts` | Invalid state transitions rejected |

```typescript
describe('Knowledge Integrity', () => {
  it('creates version on every entity update', async () => {
    const entity = await knowledgeService.create(ctx, validBrandProfileInput);
    await knowledgeService.update(ctx, entity.id, { title: 'Updated' });
    const history = await graphService.getVersionHistory(ctx, entity.id);
    expect(history).toHaveLength(2);
    expect(history[0].version).toBe(1);
    expect(history[1].version).toBe(2);
  });
});
```

## 8.3 Memory Lifecycle Tests

| Test | Assertion |
|------|-----------|
| `workingMemoryTtl.test.ts` | Working memory expires after 30 min |
| `sessionMemoryTtl.test.ts` | Session memory respects configurable TTL |
| `campaignMemoryRetention.test.ts` | Campaign memory retained campaign + 90d |
| `consolidationJob.test.ts` | Expired campaign → CampaignLesson entity |
| `brandMemoryPromotion.test.ts` | 5+ signals → provisional BrandGuideline |
| `learningMemorySignals.test.ts` | Approval +1.0 · rejection -1.0 |
| `memoryPurgeAudit.test.ts` | Every purge logged to audit |
| `historicalArchival.test.ts` | Valuable expired memory → Tier 9 |

## 8.4 Retrieval Accuracy Tests

| Test | Scenario | Pass Criteria |
|------|----------|---------------|
| `hybridSearchRelevance.test.ts` | Brand voice query | Top-3 include BrandGuideline |
| `semanticParaphrase.test.ts` | Paraphrased product query | Product entity in top-5 |
| `keywordExactMatch.test.ts` | Exact keyword "ROAS" | Campaign entities ranked |
| `graphTraversal.test.ts` | Campaign → products | Related entities within 3 hops |
| `memoryContext.test.ts` | Recent session preference | Session memory in context package |
| `confidenceHigh.test.ts` | Rich brand KB | Confidence = high |
| `confidenceInsufficient.test.ts` | Empty domain | Confidence = insufficient · gaps populated |
| `tokenBudget.test.ts` | Large result set | Context package ≤ 3,000 tokens |
| `citationAttachment.test.ts` | Any retrieval | Citations match entity IDs |
| `provisionalDownrank.test.ts` | Mixed validated/provisional | Validated ranked higher |

## 8.5 Tenant Isolation Tests

| Test | Assertion |
|------|-----------|
| `crossTenantKnowledgeRead.test.ts` | Tenant A cannot read Tenant B entities |
| `crossTenantMemoryRead.test.ts` | Tenant A cannot read Tenant B memory |
| `crossTenantEmbeddingSearch.test.ts` | Vector search tenant-scoped |
| `rlsKnowledgePolicy.test.ts` | PostgreSQL RLS blocks cross-tenant |
| `redisKeyIsolation.test.ts` | Memory keys tenant-prefixed |
| `consolidationIsolation.test.ts` | Consolidation never cross-tenant |
| `learningIsolation.test.ts` | Learning signals tenant-scoped (LG-6) |

```typescript
describe('Knowledge Tenant Isolation', () => {
  it('rejects cross-tenant entity read', async () => {
    const tenantA = await createTestTenant('A');
    const tenantB = await createTestTenant('B');
    const entityB = await createTestKnowledgeEntity(tenantB);
    const ctxA = createContextForTenant(tenantA);
    await expect(
      knowledgeService.getEntity(ctxA, entityB.id)
    ).rejects.toMatchObject({ code: 'AURORA_ERR_0403' });
  });
});
```

## 8.6 Performance Tests

| Metric | Target | Test |
|--------|:------:|------|
| Hybrid retrieval p95 | < 500ms | `retrievalLatency.test.ts` |
| Context assembly p95 | < 200ms | `contextAssemblyLatency.test.ts` |
| Embedding single | < 100ms | `embeddingLatency.test.ts` |
| Embedding batch (10) | < 500ms | `embeddingBatch.test.ts` |
| Graph traversal (3 hops) | < 150ms | `graphTraversalLatency.test.ts` |
| Memory read (Redis) | < 10ms p95 | `memoryReadLatency.test.ts` |
| Concurrent retrievals (50) | No degradation > 2× | `retrievalLoad.test.ts` |

## 8.7 Load Tests

| Scenario | Load | Duration | Pass |
|----------|------|----------|------|
| Sustained retrieval | 100 req/s per tenant | 10 min | p95 < 500ms · 0 errors |
| Ingestion burst | 50 events/min | 5 min | Queue processes · no drops |
| Embedding batch | 200 entities | Single run | < 60s |
| Consolidation job | 10K memory entries | Single run | < 5 min |
| Cache hit rate | 80% repeated queries | 5 min | Cache reduces latency 3× |

## 8.8 Recovery Tests

| Scenario | Procedure | Pass Criteria |
|----------|-----------|---------------|
| Embedding index corruption | Regenerate from entities | All entities searchable |
| Redis session loss | Restart Redis | Working/session rebuilt on next request |
| Partial ingestion failure | Rollback transaction | No orphan entities |
| Stale cache after write | Write → read | Fresh data within TTL |
| Knowledge DB restore | PITR restore | Integrity validation passes |

## 8.9 Coverage Targets

| Layer | Minimum |
|-------|:-------:|
| `lib/aurora/knowledge/services/` | 90% |
| `lib/aurora/knowledge/repositories/` | 85% |
| `lib/aurora/knowledge/acquisition/` | 80% |
| `lib/aurora/knowledge/learning/` | 85% |
| `lib/aurora/knowledge/jobs/` | 75% |
| **A-009 scope overall** | **85%** |

## 8.10 Required Test Suites

| Suite | Minimum Tests |
|-------|:-------------:|
| Knowledge service unit | 40+ |
| Graph + relationship unit | 25+ |
| Retrieval pipeline unit + integration | 35+ |
| Memory lifecycle unit + integration | 30+ |
| Acquisition + validation unit | 25+ |
| Learning engine unit | 20+ |
| Tenant isolation integration | 15+ |
| Performance benchmarks | 10+ |
| **Total** | **200+** |

---

# 9. Engineering Standards

## 9.1 Folder Layout

```
lib/aurora/knowledge/
├── KnowledgeModuleRuntime.ts
├── index.ts
├── types/
│   ├── KnowledgeEntity.ts
│   ├── KnowledgeRelationship.ts
│   ├── MemoryEntry.ts
│   ├── RetrievalTypes.ts
│   ├── LearningTypes.ts
│   └── KnowledgeDomain.ts
├── registry/
│   ├── KnowledgeEntityRegistry.ts
│   ├── entityTypeDefinitions/
│   │   ├── brandEntities.ts
│   │   ├── productEntities.ts
│   │   ├── campaignEntities.ts
│   │   ├── seoEntities.ts
│   │   ├── contentEntities.ts
│   │   └── phase2Entities.ts          # stub definitions
│   └── relationshipTypeDefinitions.ts
├── services/
│   ├── KnowledgeService.ts
│   ├── KnowledgeGraphService.ts
│   ├── KnowledgeIngestionService.ts
│   ├── KnowledgeRetrievalService.ts
│   ├── KnowledgeValidationService.ts
│   ├── EmbeddingService.ts
│   ├── MemoryService.ts
│   ├── LearningService.ts
│   ├── RelationshipEngine.ts
│   └── TaxonomyManager.ts
├── repositories/
│   ├── KnowledgeRepository.ts
│   ├── MemoryRepository.ts
│   ├── EmbeddingRepository.ts
│   └── postgres/
│       ├── PostgresKnowledgeRepository.ts
│       ├── PostgresMemoryRepository.ts
│       └── PostgresEmbeddingRepository.ts
├── memory/
│   ├── tiers/
│   │   ├── WorkingMemoryStore.ts
│   │   ├── SessionMemoryStore.ts
│   │   ├── CampaignMemoryStore.ts
│   │   ├── BusinessMemoryStore.ts
│   │   ├── BrandMemoryStore.ts
│   │   ├── CustomerMemoryStore.ts     # Phase 2 stub
│   │   ├── ExecutiveMemoryStore.ts    # Phase 2 stub
│   │   ├── LearningMemoryStore.ts
│   │   ├── HistoricalMemoryStore.ts
│   │   └── LongTermMemoryStore.ts
│   └── MemoryTierRouter.ts
├── retrieval/
│   ├── HybridSearchEngine.ts
│   ├── SemanticSearchEngine.ts
│   ├── KeywordSearchEngine.ts
│   ├── GraphSearchEngine.ts
│   ├── MemorySearchEngine.ts
│   ├── ContextAssembler.ts
│   ├── ConfidenceScorer.ts
│   ├── ConflictResolver.ts
│   ├── TaskDomainMapper.ts
│   └── CitationBuilder.ts
├── acquisition/
│   ├── AcquisitionPipeline.ts
│   ├── AcquisitionRateLimiter.ts
│   ├── FieldMapper.ts
│   └── handlers/
│       ├── CampaignAcquisitionHandler.ts
│       ├── AnalyticsAcquisitionHandler.ts
│       ├── SeoAcquisitionHandler.ts
│       ├── AdsAcquisitionHandler.ts
│       ├── CrmAcquisitionHandler.ts
│       ├── FinanceAcquisitionHandler.ts
│       ├── ExecutiveAcquisitionHandler.ts
│       ├── FeedbackAcquisitionHandler.ts
│       ├── OperationalEventHandler.ts
│       └── ExternalSourceHandler.ts
├── learning/
│   ├── PatternDiscoveryEngine.ts
│   ├── DriftDetectionService.ts
│   └── KnowledgeQualityScorer.ts
├── jobs/
│   ├── MemoryConsolidationJob.ts
│   ├── MemoryExpirationJob.ts
│   ├── KnowledgeStalenessJob.ts
│   ├── LearningSchedulerJob.ts
│   ├── EmbeddingReindexJob.ts
│   └── KnowledgeGapReportJob.ts
├── cache/
│   └── RetrievalCache.ts
├── persistence/
│   └── KnowledgeEntityPersister.ts
├── integration/
│   ├── AuroraKnowledgeWiring.ts
│   ├── AnalyticsReporter.ts
│   ├── ExecutiveKnowledgeProvider.ts
│   └── federation/
│       └── KnowledgeFederationBridge.ts
├── security/
│   └── KnowledgeAuthorizationGuard.ts
├── workflows/
│   └── KnowledgeApprovalWorkflow.ts
└── facade/
    └── KnowledgeFacadeOperations.ts
```

## 9.2 Service Interfaces

All services follow ES-AURORA-005 patterns:

| Rule | Description |
|------|-------------|
| **SVC-1** | Every public method accepts `AuroraRuntimeContext` as first parameter |
| **SVC-2** | Services depend on repositories · never direct SQL |
| **SVC-3** | Cross-service calls via facade or events · not direct repository access |
| **SVC-4** | All writes emit domain events after commit |
| **SVC-5** | Service methods return typed results · never raw DB rows |

### KnowledgeFacadeOperations

**File:** `lib/aurora/knowledge/facade/KnowledgeFacadeOperations.ts`

Extends `AuroraFacade` with knowledge operations for domain modules:

```typescript
export interface KnowledgeOperations {
  retrieve(ctx: AuroraRuntimeContext, request: RetrievalRequest): Promise<RetrievalResult>;
  search(ctx: AuroraRuntimeContext, query: RetrievalQuery): Promise<readonly ScoredEntity[]>;
  getBrandKnowledge(ctx: AuroraRuntimeContext): Promise<BrandKnowledgeBundle>;
  writeMemory(ctx: AuroraRuntimeContext, tier: MemoryTier, entry: MemoryEntry): Promise<void>;
  captureLearningSignal(ctx: AuroraRuntimeContext, signal: LearningSignal): Promise<void>;
}
```

## 9.3 Repository Contracts

```typescript
export interface RepositoryBase {
  /** All queries include tenant_id filter — enforced at repository level */
  withTenant(tenantId: string): this;
}

export interface KnowledgeRepository extends RepositoryBase {
  saveEntity(tenantId: string, entity: KnowledgeEntityRecord): Promise<void>;
  getEntity(tenantId: string, entityId: string): Promise<KnowledgeEntityRecord | null>;
  queryEntities(tenantId: string, filter: EntityFilter): Promise<readonly KnowledgeEntityRecord[]>;
  saveRelationship(tenantId: string, rel: RelationshipRecord): Promise<void>;
  getRelationships(tenantId: string, entityId: string, direction?: RelationshipDirection): Promise<readonly RelationshipRecord[]>;
  saveVersion(tenantId: string, version: EntityVersionRecord): Promise<void>;
  getVersionHistory(tenantId: string, entityId: string): Promise<readonly EntityVersionRecord[]>;
  softDelete(tenantId: string, entityId: string): Promise<void>;
}

export interface MemoryRepository extends RepositoryBase {
  save(tenantId: string, tier: MemoryTier, entry: MemoryRecord): Promise<void>;
  query(tenantId: string, tier: MemoryTier, filter: MemoryFilter): Promise<readonly MemoryRecord[]>;
  delete(tenantId: string, tier: MemoryTier, entryId: string): Promise<void>;
  purgeBefore(tenantId: string, tier: MemoryTier, before: string): Promise<number>;
}
```

| Rule | Description |
|------|-------------|
| **REP-1** | `tenant_id` filter on every query — no exceptions |
| **REP-2** | Brand-scoped entities also filter `brand_id` |
| **REP-3** | Soft delete via `deleted_at` — hard delete admin only |
| **REP-4** | Transactions for entity + relationship + version writes |
| **REP-5** | In-memory repositories for unit tests only |

## 9.4 Caching Strategy

| Cache | Backend | Key Pattern | TTL | Invalidation |
|-------|---------|-------------|-----|-------------|
| Retrieval results | Redis | `aurora:retrieval:{tenant}:{brand}:{hash}` | 120s | Knowledge write · consolidation |
| Entity by ID | Redis | `aurora:knw:entity:{tenant}:{id}` | 300s | Entity update |
| Brand knowledge bundle | Redis | `aurora:knw:brand:{tenant}:{brand}` | 600s | Brand knowledge change |
| Embedding query | Redis | `aurora:emb:{tenant}:{hash}` | 300s | Entity reindex |
| Taxonomy tree | In-process | Module-scoped | Boot | Registry reload |

**Rule CACHE-1:** Cache keys always include `tenantId`. Never cache cross-tenant.

## 9.5 Persistence Standards

### PostgreSQL Tables

| Table | Indexes | RLS |
|-------|---------|:---:|
| `aurora_knowledge_entity` | `(tenant_id, brand_id, domain)` · `(tenant_id, status)` · GIN on `content` | ✅ |
| `aurora_knowledge_relationship` | `(tenant_id, source_entity_id)` · `(tenant_id, target_entity_id)` | ✅ |
| `aurora_knowledge_entity_version` | `(tenant_id, entity_id, version)` | ✅ |
| `aurora_knowledge_embedding` | `(tenant_id, entity_id)` · IVFFlat/HNSW vector index | ✅ |
| `aurora_memory_*` (8 tables) | `(tenant_id, brand_id)` · `(expires_at)` where applicable | ✅ |
| `aurora_learning_feedback` | `(tenant_id, brand_id, created_at)` | ✅ |
| `aurora_retrieval_audit` | `(tenant_id, created_at)` | ✅ |

### pgvector Configuration

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE aurora_knowledge_embedding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  entity_id UUID NOT NULL REFERENCES aurora_knowledge_entity(id),
  chunk_index INT NOT NULL DEFAULT 0,
  embedding vector(1536) NOT NULL,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_embedding_vector ON aurora_knowledge_embedding
  USING hnsw (embedding vector_cosine_ops);
```

### Redis Key Conventions

| Tier | Pattern |
|------|---------|
| Working | `aurora:memory:working:{tenantId}:{taskId}` |
| Session | `aurora:memory:session:{tenantId}:{sessionId}` |
| Retrieval cache | `aurora:retrieval:{tenantId}:{brandId}:{queryHash}` |

## 9.6 Error Handling

**File:** `lib/aurora/knowledge/errors/KnowledgeErrors.ts`

| Code | Name | HTTP | When |
|------|------|:----:|------|
| `AURORA_KNW_001` | ENTITY_NOT_FOUND | 404 | Entity ID not found in tenant |
| `AURORA_KNW_002` | INVALID_LIFECYCLE_TRANSITION | 400 | Invalid status change |
| `AURORA_KNW_003` | VALIDATION_FAILED | 422 | Schema/trust validation failure |
| `AURORA_KNW_004` | RETRIEVAL_INSUFFICIENT | 200 | Zero results · escalation required |
| `AURORA_KNW_005` | RETRIEVAL_TIMEOUT | 504 | Pipeline exceeded 2s |
| `AURORA_KNW_006` | EMBEDDING_SERVICE_UNAVAILABLE | 503 | Circuit breaker open |
| `AURORA_KNW_007` | MEMORY_TIER_UNAVAILABLE | 503 | Redis/PostgreSQL tier down |
| `AURORA_KNW_008` | CONFLICT_UNRESOLVED | 409 | Graph conflict · human required |
| `AURORA_KNW_009` | RATE_LIMIT_EXCEEDED | 429 | Acquisition rate limit |
| `AURORA_KNW_010` | CROSS_TENANT_VIOLATION | 403 | Tenant isolation breach attempt |

| Rule | Description |
|------|-------------|
| **ERR-1** | Insufficient retrieval returns 200 with `confidence: insufficient` — not an error to caller |
| **ERR-2** | Embedding failure degrades to keyword-only search |
| **ERR-3** | Memory tier failure degrades retrieval (exclude memory score) |
| **ERR-4** | All errors logged with tenantId · correlationId |
| **ERR-5** | Never expose internal entity IDs from other tenants in error messages |

## 9.7 Logging & Observability

| Event | Level | Fields |
|-------|:-----:|--------|
| Retrieval completed | INFO | tenantId · brandId · confidence · latencyMs · entityCount |
| Retrieval insufficient | WARN | tenantId · domains · gaps |
| Knowledge created | INFO | entityId · domain · source · trustScore |
| Knowledge validated | INFO | entityId · approver |
| Memory consolidated | INFO | tier · entriesProcessed · entitiesCreated |
| Learning signal | DEBUG | signalType · weight · agent |
| Drift detected | WARN | driftType · brandId · delta |
| Rate limit hit | WARN | source · tenantId · queueDepth |

**Metrics (ORION Analytics):**
- `aurora.knowledge.retrieval.latency_ms` (histogram)
- `aurora.knowledge.retrieval.confidence` (gauge by level)
- `aurora.knowledge.entities.count` (gauge by domain · status)
- `aurora.memory.tier.size` (gauge by tier)
- `aurora.learning.signals.count` (counter by type)

## 9.8 Review Checklist

Before merging any A-009 knowledge code:

- [ ] `AuroraRuntimeContext` passed to all service methods
- [ ] `tenant_id` filter on every repository query
- [ ] RLS policy on new tables
- [ ] Entity type registered in `KnowledgeEntityRegistry`
- [ ] Zod schema for entity type
- [ ] Version created on entity update
- [ ] Event emitted after write
- [ ] Audit log entry for mutations
- [ ] Retrieval cache invalidated on write
- [ ] Unit tests for service · integration test for tenant isolation
- [ ] No PII in knowledge entities
- [ ] Phase 2 stubs return explicit skip · not silent failure
- [ ] Error codes from `KnowledgeErrors` catalogue
- [ ] Coverage meets layer minimum (§8.9)

---

# 10. Acceptance Criteria

## 10.1 Definition of Done

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | All 8 knowledge services implemented | Interface compliance tests |
| 2 | 11 knowledge domains · 45 entity types registered | Registry completeness test |
| 3 | Phase 1 domains (5) fully operational | CRUD + retrieval per domain |
| 4 | Phase 2 domains (6) scaffolded read-only | Stub returns empty · no crash |
| 5 | 10 memory tiers accessible via MemoryService | Tier read/write tests |
| 6 | Hybrid retrieval pipeline operational | Integration test suite |
| 7 | Mandatory pre-flight interface ready for AgentOrchestrator | Contract test |
| 8 | pgvector embedding index operational | Semantic search test |
| 9 | Acquisition handlers for Phase 1 channels | Event ingestion tests |
| 10 | Validation pipeline with approval workflow | Lifecycle integration test |
| 11 | Learning signal capture + pattern detection | Learning unit tests |
| 12 | Memory consolidation + expiration jobs | Job integration tests |
| 13 | Tenant isolation verified | Security test suite (15+ tests) |
| 14 | Knowledge audit trail | Audit log verification |
| 15 | Coverage ≥ 85% on A-009 scope | CI coverage gate |
| 16 | Performance targets met | Benchmark suite |
| 17 | KnowledgeModuleRuntime boot Phase 4 | Boot integration test |
| 18 | ORION PlatformStore persisters registered | Wiring test |

## 10.2 Knowledge Completeness

| Domain | Phase 1 Requirement |
|--------|-------------------|
| Brand | BrandProfile · BrandGuideline · VisualIdentity · MessagingPillar · ApprovalPolicy CRUD + retrieval |
| Product | Product · ProductFeature · ProductPricing · ProductAudience CRUD + retrieval |
| Campaign | CampaignRecord · CampaignLesson · ChannelPerformance · OptimizationRecord CRUD + retrieval |
| SEO | KeywordRecord · SeoAuditFinding · RankingHistory · ContentSeoScore CRUD + retrieval |
| Content | ContentPattern · TopicCluster · ContentPillar · RepurposingMap CRUD + retrieval |
| Customer · Competitor · Industry · Ads · Market · Executive | Registry entry · repository stub · ingestion disabled |

| Metric | Target |
|--------|:------:|
| Entity types with Zod schema | 45/45 |
| Entity types with curator assignment | 45/45 |
| Relationship types defined | 10+ |
| Taxonomy tree complete | 11 domains |

## 10.3 Memory Correctness

| Tier | Requirement |
|------|-------------|
| Working (1) | Redis TTL 30 min · task-scoped |
| Session (2) | Redis TTL configurable · conversation append |
| Campaign (3) | PostgreSQL · campaign + 90d retention |
| Business (4) | PostgreSQL · tenant lifetime |
| Brand (5) | PostgreSQL · brand lifetime · consolidation to Brand Knowledge |
| Customer (6) | Stub · no PII |
| Executive (7) | Stub · confidential classification ready |
| Learning (8) | PostgreSQL · signal weights · pattern detection |
| Historical (9) | PostgreSQL · tier-based retention |
| Long-Term (10) | PostgreSQL · monthly consolidation |

| Job | Requirement |
|-----|-------------|
| MemoryExpirationJob | Hourly working/session · daily campaign |
| MemoryConsolidationJob | Bi-weekly full run |
| KnowledgeStalenessJob | Daily flag · 90-day cycle |

## 10.4 Operational Readiness

| Capability | Requirement |
|------------|-------------|
| Health check | DB · Redis · pgvector · embedding provider |
| Graceful degradation | Embedding down → keyword only · memory down → exclude memory score |
| Circuit breaker | Embedding service · external acquisition sources |
| Monitoring | Retrieval latency · confidence · entity counts · tier sizes |
| Backup | Daily PostgreSQL · knowledge + memory tables |
| Disaster recovery | Embedding reindex from entities · RPO 1h · RTO 4h |
| Rate limiting | Acquisition per §5.16 |
| Documentation | API contracts · runbook for reindex · consolidation |

## 10.5 Performance Targets

| Metric | Target |
|--------|:------:|
| Hybrid retrieval p95 | < 500ms |
| Context assembly p95 | < 200ms |
| Embedding single p95 | < 100ms |
| Memory read (Redis) p95 | < 10ms |
| Consolidation job (10K entries) | < 5 min |
| Concurrent retrievals (50) | No error · p95 < 1s |

## 10.6 Required Test Suites

See §8.10 — **200+ tests minimum**.

## 10.7 Engineering Sign-Off

| Role | Criteria |
|------|----------|
| A-009 Mission Lead | All DoD criteria met |
| Knowledge Architecture Owner | A-004 alignment verified |
| Security Lead | Tenant isolation · RBAC · no PII verified |
| ORION Platform Owner | PlatformStore · Event Bus integration verified |
| Architecture Review Board | KP-1–KP-10 enforced |

---

# 11. Implementation Roadmap

## 11.1 Sprint Sequencing

| Sprint | Focus | Deliverables |
|:------:|-------|-------------|
| **S1** | Knowledge foundation | Entity registry · KnowledgeRepository · KnowledgeService · migrations · RLS |
| **S2** | Knowledge graph | KnowledgeGraphService · RelationshipEngine · TaxonomyManager · versioning |
| **S3** | Embedding + retrieval | EmbeddingService · pgvector · HybridSearchEngine · KnowledgeRetrievalService |
| **S4** | Memory tiers 1–5 | Working · Session · Campaign · Business · Brand stores · MemoryService |
| **S5** | Memory tiers 8–10 + jobs | Learning · Historical · Long-Term · consolidation · expiration jobs |
| **S6** | Acquisition + validation | IngestionService · 5 Phase 1 handlers · ValidationService · approval workflow |
| **S7** | Learning engine | LearningService · pattern detection · drift detection · quality metrics |
| **S8** | Integration + certification | ORION wiring · event subscribers · facade · tests · performance benchmarks |

**Duration:** 8 weeks · 4 two-week sprints (S1–S2 · S3–S4 · S5–S6 · S7–S8) — or 8 one-week sprints for parallel teams.

## 11.2 Critical Path

```
A-007 Platform Foundation (ES-AURORA-005)
    ↓
A-008 Identity/Tenant/Config (ES-AURORA-006)
    ↓
A-009 Knowledge & Memory (ES-AURORA-007) ← THIS SPEC
    ↓
A-010 Content Studio (ES-AURORA-008)
    ↓
A-011 SEO Engine (ES-AURORA-009)
    ↓
A-018 Agent Orchestration (retrieval pre-flight consumer)
```

**A-009 blocks:** All domain modules requiring knowledge context · AgentOrchestrator pre-flight · Content Studio · SEO Engine · Campaign modules.

## 11.3 Dependencies

| Dependency | Owner | Required For |
|------------|-------|-------------|
| ES-AURORA-005 (A-007) complete | Aurora | Module registry · wiring · boot |
| ES-AURORA-006 (A-008) complete | Aurora | Tenant/brand scoping · RLS · config |
| ORION PlatformStore | ORION | Entity persistence |
| ORION Event Bus | ORION | Acquisition event subscribers |
| ORION AI Provider | ORION | Embedding generation |
| PostgreSQL + pgvector | Infrastructure | Knowledge + embeddings |
| Redis | Infrastructure | Working · session memory · cache |

## 11.4 Parallel Workstreams

| Workstream | Sprints | Can Parallel With |
|------------|:-------:|-------------------|
| WS-K1 Knowledge graph + services | S1–S2 | — |
| WS-K2 Retrieval + embedding | S3 | WS-K3 (after S1) |
| WS-K3 Memory infrastructure | S4–S5 | WS-K2 (after S1) |
| WS-K4 Acquisition + learning | S6–S7 | WS-K2 · WS-K3 |
| WS-K5 Integration + tests | S8 | All |

## 11.5 Risks

| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R-1 | pgvector performance at scale | Slow retrieval | HNSW index · tenant-scoped partitions · top-K limit |
| R-2 | Embedding provider latency | Retrieval timeout | Circuit breaker · keyword fallback · batch pre-index |
| R-3 | Memory consolidation data loss | Lost learnings | Archive to Historical before purge · audit trail |
| R-4 | Cross-tenant leakage | Security breach | RLS · repository enforcement · 15+ isolation tests |
| R-5 | Knowledge graph complexity | Implementation delay | Phase 1: 5 domains only · Phase 2 stubs |
| R-6 | Retrieval token budget overflow | Agent context truncation | Hard 3,000 token limit · priority-based assembly |
| R-7 | Stale knowledge in retrieval | Incorrect agent output | Freshness multiplier · staleness jobs |
| R-8 | Learning false patterns | Brand voice drift | LG-1 minimum signals · drift detection · human veto |

## 11.6 Future Expansion

| Horizon | Enhancement | Mission |
|---------|-------------|---------|
| Phase 2 | Customer · Competitor · Industry · Ads · Market · Executive domains active | A-034 |
| Phase 2 | ORION CRM/Finance sync | A-034 |
| Phase 2 | Customer + Executive memory tiers | A-034 |
| Phase 3 | ORION Knowledge Graph federation | A-044 |
| Phase 3 | Predictive knowledge · proactive enrichment | A-044 |
| Phase 3 | ML-based pattern detection | A-044 |
| Phase 3 | Multimodal knowledge entities | A-046 |
| Phase 3 | Cross-tenant benchmarks (opt-in) | A-047 |

---

# 12. Executive Recommendation

## 12.1 Implementation Readiness

| Dimension | Status |
|-----------|:------:|
| A-004 Knowledge & Memory Architecture | ✅ Ratified |
| ES-AURORA-005 (A-007) Platform Foundation | ✅ Ratified |
| ES-AURORA-006 (A-008) Identity/Tenant/Config | ✅ Ratified |
| ES-AURORA-007 (A-009) specification | ✅ This document |
| ORION PlatformStore patterns | ✅ ES-010 |
| pgvector infrastructure | ⏳ Provision required |
| Dependency on A-007 · A-008 code | ⏳ Implementation first |

**ES-AURORA-007 is complete. A-009 implementation authorized upon A-007 and A-008 completion.**

## 12.2 Approval

| Authorization | Status |
|---------------|:------:|
| ES-AURORA-007 Enterprise Knowledge Graph & Memory Infrastructure spec | **✅ RATIFIED** |
| A-009 implementation | **✅ AUTHORIZED** (after A-007 · A-008) |
| ES-AURORA-008 Content Studio spec | **✅ AUTHORIZED TO DRAFT** |

## 12.3 Authorize ES-AURORA-008

| Field | Value |
|-------|-------|
| **Next Spec** | ES-AURORA-008 — Content Studio Implementation |
| **Mission** | A-010 — Content Studio Implementation |
| **Dependency** | A-007 · A-008 · A-009 complete |
| **Scope** | ContentService · generation · approval · brand knowledge integration |

Content Studio is the first domain module that consumes the knowledge retrieval pipeline defined herein. Every content generation request will invoke `KnowledgeRetrievalService.preflight()` before LLM inference.

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Knowledge Entity Catalogue

| # | Domain | Entity Type | Type Key | Phase | Curator |
|---|--------|-------------|----------|:-----:|---------|
| 1 | Brand | BrandProfile | `brand.profile` | 1 | Knowledge Manager |
| 2 | Brand | BrandGuideline | `brand.guideline` | 1 | Knowledge Manager |
| 3 | Brand | VisualIdentity | `brand.visual_identity` | 1 | Knowledge Manager |
| 4 | Brand | MessagingPillar | `brand.messaging_pillar` | 1 | Knowledge Manager |
| 5 | Brand | ApprovalPolicy | `brand.approval_policy` | 1 | Knowledge Manager |
| 6 | Product | Product | `product.product` | 1 | Knowledge Manager |
| 7 | Product | ProductFeature | `product.feature` | 1 | Knowledge Manager |
| 8 | Product | ProductPricing | `product.pricing` | 1 | Knowledge Manager |
| 9 | Product | ProductAudience | `product.audience` | 1 | Knowledge Manager |
| 10 | Campaign | CampaignRecord | `campaign.record` | 1 | Campaign Manager |
| 11 | Campaign | CampaignLesson | `campaign.lesson` | 1 | Campaign Manager |
| 12 | Campaign | ChannelPerformance | `campaign.channel_performance` | 1 | Campaign Manager |
| 13 | Campaign | OptimizationRecord | `campaign.optimization` | 1 | Campaign Manager |
| 14 | Customer | CustomerSegment | `customer.segment` | 2 | CX Advisor |
| 15 | Customer | CustomerPersona | `customer.persona` | 2 | CX Advisor |
| 16 | Customer | EngagementPattern | `customer.engagement_pattern` | 2 | CX Advisor |
| 17 | Customer | RetentionInsight | `customer.retention_insight` | 2 | CX Advisor |
| 18 | Competitor | Competitor | `competitor.competitor` | 2 | Brand Intelligence Manager |
| 19 | Competitor | CompetitorCampaign | `competitor.campaign` | 2 | Brand Intelligence Manager |
| 20 | Competitor | CompetitorContent | `competitor.content` | 2 | Brand Intelligence Manager |
| 21 | Competitor | CompetitiveGap | `competitor.gap` | 2 | Brand Intelligence Manager |
| 22 | Industry | IndustryTrend | `industry.trend` | 2 | Brand Intelligence Manager |
| 23 | Industry | Regulation | `industry.regulation` | 2 | Brand Intelligence Manager |
| 24 | Industry | SeasonalPattern | `industry.seasonal_pattern` | 2 | Brand Intelligence Manager |
| 25 | Industry | BenchmarkMetric | `industry.benchmark` | 2 | Brand Intelligence Manager |
| 26 | SEO | KeywordRecord | `seo.keyword` | 1 | SEO Specialist |
| 27 | SEO | SeoAuditFinding | `seo.audit_finding` | 1 | SEO Specialist |
| 28 | SEO | RankingHistory | `seo.ranking` | 1 | SEO Specialist |
| 29 | SEO | ContentSeoScore | `seo.content_score` | 1 | SEO Specialist |
| 30 | Advertising | AudienceProfile | `ads.audience` | 2 | Advertising Manager |
| 31 | Advertising | AdCreativePattern | `ads.creative_pattern` | 2 | Advertising Manager |
| 32 | Advertising | BidStrategyRecord | `ads.bid_strategy` | 2 | Advertising Manager |
| 33 | Advertising | PlatformInsight | `ads.platform_insight` | 2 | Advertising Manager |
| 34 | Content | ContentPattern | `content.pattern` | 1 | Content Strategist |
| 35 | Content | TopicCluster | `content.topic_cluster` | 1 | Content Strategist |
| 36 | Content | ContentPillar | `content.pillar` | 1 | Content Strategist |
| 37 | Content | RepurposingMap | `content.repurposing_map` | 1 | Content Strategist |
| 38 | Market | MarketSignal | `market.signal` | 2 | Brand Intelligence Manager |
| 39 | Market | MarketOpportunity | `market.opportunity` | 2 | Brand Intelligence Manager |
| 40 | Market | ThreatAssessment | `market.threat` | 2 | Brand Intelligence Manager |
| 41 | Executive | StrategicDirective | `executive.directive` | 2 | Executive Advisor |
| 42 | Executive | ExecutiveDecision | `executive.decision` | 2 | Executive Advisor |
| 43 | Executive | BudgetAllocation | `executive.budget_allocation` | 2 | Executive Advisor |
| 44 | Executive | PerformanceReview | `executive.performance_review` | 2 | Executive Advisor |

**Total:** 44 named + 1 reserved (`knowledge.meta.schema_version`) = **45 entity types**

## Appendix B — Relationship Catalogue

| Relationship Type | Source Domain | Target Domain | Cardinality | Weight Default |
|-------------------|---------------|---------------|:-----------:|:--------------:|
| `belongs_to_brand` | Any | Brand | N:1 | 1.0 |
| `part_of_campaign` | Campaign · Content · Ads | Campaign | N:1 | 0.9 |
| `targets_audience` | Campaign · Content · Ads | Product · Customer | N:M | 0.8 |
| `references_product` | Campaign · Content · SEO | Product | N:M | 0.85 |
| `competes_with` | Competitor | Product · Brand | N:M | 0.7 |
| `informed_by` | Any | Any | N:M | 0.75 |
| `supersedes` | Any (same type) | Any (same type) | 1:1 | 1.0 |
| `derived_from` | Any | Any | N:1 | 0.6 |
| `executive_directs` | Executive | Campaign · Brand | 1:N | 1.0 |
| `optimizes` | OptimizationRecord | Campaign · ChannelPerformance | N:1 | 0.8 |

### Graph Traversal Rules

| Rule | Value |
|------|-------|
| Max depth | 3 hops |
| Max entities per traversal | 20 |
| Validated only (agent retrieval) | Yes |
| Weight decay | 5% per 30 days since entity update |
| Cycle detection | Required · max 1 revisit per path |

## Appendix C — Memory Catalogue

| Tier | Name | Storage | Key/Table | Retention | Scope | Consolidation Target |
|:----:|------|---------|-----------|-----------|-------|---------------------|
| 1 | Working | Redis | `aurora:memory:working:{t}:{task}` | 30 min | Task | None |
| 2 | Session | Redis | `aurora:memory:session:{t}:{session}` | 24h (4h–7d cfg) | Session | None |
| 3 | Campaign | PostgreSQL | `aurora_memory_campaign` | Campaign + 90d | Campaign | Campaign Knowledge |
| 4 | Business | PostgreSQL | `aurora_memory_business` | Tenant lifetime | Business | Long-Term Memory |
| 5 | Brand | PostgreSQL | `aurora_memory_brand` | Brand lifetime | Brand | Brand Knowledge |
| 6 | Customer | PostgreSQL | `aurora_memory_customer` | CRM policy | Segment | Customer Knowledge |
| 7 | Executive | PostgreSQL | `aurora_memory_executive` | Indefinite | Executive | Executive Knowledge |
| 8 | Learning | PostgreSQL | `aurora_memory_learning` | Tier-based | Brand + Agent | Long-Term · Knowledge |
| 9 | Historical | PostgreSQL | `aurora_memory_historical` | 1–7 years | Brand | Long-Term Memory |
| 10 | Long-Term | PostgreSQL | `aurora_memory_longterm` | Indefinite | Brand + Domain | — |

### Retention by Tier Plan

| Tier | Starter | Professional | Enterprise |
|------|---------|-------------|------------|
| Session (2) | 24h | 48h | 7 days |
| Campaign (3) | 90d post | 180d post | 365d post |
| Learning (8) | 1 year | 3 years | Indefinite |
| Historical (9) | 1 year | 3 years | 7 years |

Configured via ES-AURORA-006 `ConfigurationService` — `knowledge.retention.*` keys.

## Appendix D — Retrieval Pipeline

### Full Pipeline Diagram

```
Agent Task Received (AgentOrchestrator)
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  KnowledgeRetrievalService.preflight()                   │
├─────────────────────────────────────────────────────────┤
│  1. TaskDomainMapper → identify domains                  │
│  2. Build RetrievalQuery (task + brand + campaign)     │
│  3. Check RetrievalCache (Redis · 120s TTL)             │
│  4. Parallel Hybrid Search:                              │
│     ├── SemanticSearchEngine (pgvector · 50%)           │
│     ├── KeywordSearchEngine (tsvector · 25%)             │
│     ├── GraphSearchEngine (traversal · 15%)             │
│     └── MemorySearchEngine (tiers 2,5,8 · 10%)          │
│  5. HybridSearchEngine.mergeScores()                    │
│  6. Rank (relevance · freshness · trust · status)      │
│  7. ConfidenceScorer → high|medium|low|insufficient      │
│  8. ConflictResolver (if conflicts detected)             │
│  9. ContextAssembler (3,000 token budget)               │
│  10. CitationBuilder → KnowledgeCitation[]               │
│  11. Cache result · audit log                           │
└─────────────────────────────────────────────────────────┘
    │
    ▼
RetrievalResult → AgentOrchestrator → Agent LLM Inference
    │
    ├── confidence: insufficient → ESCALATE (no fabrication)
    ├── confidence: low → proceed with uncertainty flag
    └── confidence: high/medium → proceed normally
```

### Task-to-Domain Mapping

| Task Type | Primary Domains | Secondary Domains |
|-----------|----------------|-------------------|
| Content generation | Brand · Product · Content | SEO · Campaign |
| SEO analysis | SEO · Content | Brand · Industry |
| Ad campaign | Advertising · Campaign · Customer | Brand · Competitor |
| Social posting | Brand · Content · Customer | Campaign · SEO |
| Analytics report | Campaign · Content · Advertising | Customer · Executive |
| Executive briefing | Executive · Campaign · Market | Brand · Customer |
| Competitive analysis | Competitor · Market · Industry | Brand · Campaign |
| KB curation | Brand · Product · all domains | Learning · Brand Memory |

### Failure Handling Matrix

| Failure | Agent Behaviour | System Action |
|---------|----------------|---------------|
| Zero results | State knowledge gap · do not fabricate | Log gap · notify Knowledge Manager |
| Low confidence (< 0.50) | Proceed with uncertainty · recommend review | Log low confidence event |
| Stale dominant results | Warn · include freshness caveat | Trigger staleness review |
| Conflict unresolved | Present both sources | Log conflict · curator queue |
| Retrieval timeout (> 2s) | Proceed with session memory only | Alert · degrade gracefully |
| Embedding service down | Fallback to keyword search only | Circuit breaker · alert |

## Appendix E — Learning Workflow

### Signal Capture Flow

```
Agent Action / Human Feedback / Campaign Outcome
    │
    ▼
LearningService.captureSignal()
    │
    ├── Write to Learning Memory (Tier 8)
    ├── Emit aurora.learning.feedback.captured
    └── Update running metrics
    │
    ▼ (Daily PatternDetectionJob)
PatternDiscoveryEngine.analyzeSignals()
    │
    ├── Signal count ≥ 3 (LG-1)?
    │   ├── No → wait for more signals
    │   └── Yes → DetectedPattern created
    │
    ▼
Knowledge Manager Review Queue
    │
    ├── Approve → LearningService.proposeKnowledgeUpdate()
    │   └── Entity created (provisional) → Validation pipeline
    │
    └── Reject → signal weight adjusted · pattern discarded
    │
    ▼ (Bi-weekly BrandLearningPromotionJob)
Brand Memory → Brand Knowledge promotion
    │
    └── 5+ consistent voice signals → BrandGuideline update proposed
```

### Learning Governance Rules

| Rule | ID | Description |
|------|-----|-------------|
| Minimum signals | LG-1 | 3 signals before pattern promotion |
| Prompt validation | LG-2 | Knowledge Manager validates prompt changes |
| Guideline precedence | LG-3 | Learning cannot override brand guidelines |
| Version retention | LG-4 | All prompt versions retained |
| Human reset | LG-5 | Brand Manager can reset learning memory |
| Tenant isolation | LG-6 | No cross-tenant learning |

## Appendix F — Implementation Checklist

### Sprint 1 — Knowledge Foundation

- [ ] `KnowledgeEntityRegistry` with 45 entity type definitions
- [ ] Zod schemas for Phase 1 entity types (22)
- [ ] `PostgresKnowledgeRepository` + in-memory test repo
- [ ] `KnowledgeService` CRUD + lifecycle transitions
- [ ] Migration `007_knowledge_memory.sql` — entity + relationship + version tables
- [ ] RLS policies on all knowledge tables
- [ ] Unit tests (40+)

### Sprint 2 — Knowledge Graph

- [ ] `KnowledgeGraphService` entity + relationship CRUD
- [ ] `RelationshipEngine` with 10 relationship types
- [ ] `TaxonomyManager` domain validation
- [ ] Entity versioning on every update
- [ ] Graph traversal (max 3 hops)
- [ ] Integration tests for graph queries

### Sprint 3 — Embedding + Retrieval

- [ ] `EmbeddingService` with ORION AI Provider
- [ ] pgvector table + HNSW index
- [ ] `HybridSearchEngine` with 4 search engines
- [ ] `KnowledgeRetrievalService.preflight()` full pipeline
- [ ] `ConfidenceScorer` + `ContextAssembler` (3,000 token budget)
- [ ] `CitationBuilder` + `RetrievalCache`
- [ ] Performance benchmarks (p95 < 500ms)

### Sprint 4 — Memory Tiers 1–5

- [ ] `WorkingMemoryStore` (Redis)
- [ ] `SessionMemoryStore` (Redis)
- [ ] `CampaignMemoryStore` (PostgreSQL)
- [ ] `BusinessMemoryStore` (PostgreSQL)
- [ ] `BrandMemoryStore` (PostgreSQL)
- [ ] `MemoryService` + `MemoryTierRouter`
- [ ] Memory lifecycle tests

### Sprint 5 — Memory Tiers 8–10 + Jobs

- [ ] `LearningMemoryStore` · `HistoricalMemoryStore` · `LongTermMemoryStore`
- [ ] Phase 2 stubs: Customer · Executive memory stores
- [ ] `MemoryConsolidationJob` · `MemoryExpirationJob`
- [ ] `KnowledgeStalenessJob`
- [ ] Job integration tests

### Sprint 6 — Acquisition + Validation

- [ ] `KnowledgeIngestionService` + `AcquisitionPipeline`
- [ ] Phase 1 handlers (campaign · analytics · SEO · feedback · operational · external)
- [ ] `KnowledgeValidationService` full pipeline
- [ ] `KnowledgeApprovalWorkflow`
- [ ] Phase 2 stubs (CRM · finance · ads handlers)
- [ ] Acquisition rate limiter

### Sprint 7 — Learning Engine

- [ ] `LearningService` signal capture
- [ ] `PatternDiscoveryEngine`
- [ ] `DriftDetectionService`
- [ ] `KnowledgeQualityScorer`
- [ ] Learning scheduler jobs
- [ ] Learning unit tests (20+)

### Sprint 8 — Integration + Certification

- [ ] `KnowledgeModuleRuntime` boot Phase 4
- [ ] `AuroraKnowledgeWiring` · event subscribers
- [ ] `KnowledgeEntityPersister` PlatformStore registration
- [ ] `KnowledgeFacadeOperations` on AuroraFacade
- [ ] `ExecutiveKnowledgeProvider` stub
- [ ] Tenant isolation test suite (15+)
- [ ] Coverage ≥ 85% verification
- [ ] Mission A-009 completion report

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | ES-AURORA-007 — Enterprise Knowledge Graph & Memory Infrastructure |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Mission** | A-009 — Enterprise Knowledge Graph & Memory Infrastructure |
| **Next Mission** | A-010 — Content Studio (ES-AURORA-008) |

---

*End of ES-AURORA-007*
