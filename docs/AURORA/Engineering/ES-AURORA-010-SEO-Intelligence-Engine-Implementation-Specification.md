# ES-AURORA-010 — Aurora SEO Intelligence Engine Implementation Specification

**Document ID:** ES-AURORA-010  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-012 — SEO Intelligence Engine  
**Prior Missions:** A-007 (ES-AURORA-005) · A-008 (ES-AURORA-006) · A-009 (ES-AURORA-007) · A-010 (ES-AURORA-008) · A-011 (ES-AURORA-009)  
**Version:** 1.0  
**Status:** Ratified — Authoritative Engineering Specification  
**Classification:** Engineering Specification · SEO Intelligence · Keywords · Technical SEO · Competitor Analysis  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Architecture Source:** [A-001 Aurora Constitution](../A-001-Aurora-Constitution.md) · [A-002 Enterprise Engineering Blueprint](../A-002-Aurora-Enterprise-Engineering-Blueprint.md) · [A-004 Enterprise Knowledge & Memory](../A-004-Aurora-Enterprise-Knowledge-and-Memory-Architecture.md)  
**Platform Parent:** [ES-AURORA-005 Platform Foundation](./ES-AURORA-005-Platform-Foundation-Implementation-Specification.md) · [ES-AURORA-006 Identity/Tenant/Config](./ES-AURORA-006-Identity-Tenant-and-Configuration-Foundation.md) · [ES-AURORA-007 Knowledge & Memory](./ES-AURORA-007-Enterprise-Knowledge-Graph-and-Memory-Infrastructure.md) · [ES-AURORA-008 AI Workforce Runtime](./ES-AURORA-008-AI-Workforce-Runtime-Implementation-Specification.md) · [ES-AURORA-009 Content Studio](./ES-AURORA-009-Content-Studio-and-Asset-Management-Implementation-Specification.md)  
**Effective Date:** 7 August 2026  
**Subordinate To:** A-001 · A-002 · A-004 · A-005 · ES-AURORA-005 · ES-AURORA-006 · ES-AURORA-007 · ES-AURORA-008 · ES-AURORA-009

**Rule:** This document is the **authoritative engineering specification** for Aurora SEO Intelligence Engine (Mission A-012). All code in `lib/aurora/seo/` must comply. **No production implementation in this document.** **Specification only.**

**Scope:** Keyword intelligence · search intent · topic clustering · SERP intelligence · content optimization · technical SEO · competitor intelligence · AI optimization engine · GSC integration · ORION integration. **Excludes:** SEO UI (A-019) · site crawl infrastructure (Phase 2 partial) · local SEO GBP sync (Phase 2).

---

## Engineering Principles (Binding)

| # | Principle | Enforcement |
|---|-----------|-------------|
| **SP-1** | **SEO recommendations are evidence-based** | Data sources cited · no unsupported claims |
| **SP-2** | **Knowledge retrieval precedes optimization** | KnowledgeRetrievalService pre-flight before AI recommendations |
| **SP-3** | **Brand rules are mandatory** | BrandCompliance on all optimization output |
| **SP-4** | **Optimization is explainable** | Every recommendation includes rationale + evidence |
| **SP-5** | **All scoring is reproducible** | Deterministic algorithms · versioned score models |
| **SP-6** | **No automatic publication** | Recommendations only · Content Studio applies changes |
| **SP-7** | **Human approval required** | Tier 2+ recommendations require approver action |
| **SP-8** | **Every recommendation is auditable** | ORION AuditStore · recommendation ID trail |
| **SP-9** | **Tenant isolation is mandatory** | tenant_id · brand_id · RLS on all SEO data |
| **SP-10** | **Multi-language support is built in** | Locale-aware keywords · hreflang · localized scoring |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [SEO Intelligence Platform](#2-seo-intelligence-platform)
3. [Keyword Intelligence](#3-keyword-intelligence)
4. [Content Optimization](#4-content-optimization)
5. [Technical SEO](#5-technical-seo)
6. [Competitor Intelligence](#6-competitor-intelligence)
7. [AI Optimization Engine](#7-ai-optimization-engine)
8. [ORION Integration](#8-orion-integration)
9. [Testing Strategy](#9-testing-strategy)
10. [Engineering Standards](#10-engineering-standards)
11. [Acceptance Criteria](#11-acceptance-criteria)
12. [Executive Recommendation](#12-executive-recommendation)

**Appendices:** [A — SEO Taxonomy](#appendix-a--seo-taxonomy) · [B — Keyword Model](#appendix-b--keyword-model) · [C — Intent Classification](#appendix-c--intent-classification) · [D — Optimization Pipeline](#appendix-d--optimization-pipeline) · [E — Scoring Model](#appendix-e--scoring-model) · [F — Implementation Checklist](#appendix-f--implementation-checklist)

---

# Preamble

Organic visibility is earned, not guessed.

Aurora's SEO Intelligence Engine transforms search data, knowledge graph entities, and AI workforce capabilities into **evidence-based, brand-aligned, auditable optimization** — from keyword discovery through technical audit to competitor gap analysis.

Rankings follow discipline. Recommendations follow proof.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Implementation specification for Aurora SEO Intelligence Engine |
| **Audience** | SEO engineers · backend engineers · data engineers · AI architects |
| **Binding authority** | Mission A-012 · all `lib/aurora/seo/` code |
| **Deliverable type** | Engineering specification — no code |

## 1.2 Scope

### In Scope (A-012)

| Area | Coverage |
|------|----------|
| **SEO platform** | SeoEngine · workspace · keyword · intent · clustering · SERP |
| **Keyword intelligence** | Volume · difficulty · CPC · intent · topic groups · KG integration |
| **Content optimization** | Title · meta · URL · linking · schema · readability · scoring |
| **Technical SEO** | Site health · crawl · canonical · redirects · robots · sitemap · structured data |
| **Competitor intelligence** | Profiles · overlap · gap analysis · SERP comparison · opportunities |
| **AI optimization** | Workforce integration · brand-aware · fact validation · recommendations |
| **Integrations** | GSC connector · Content Studio · Knowledge Graph · Analytics |
| **Jobs** | Weekly rank check · monthly audit · daily GSC sync |

### Out of Scope

| Exclusion | Mission |
|-----------|---------|
| SEO UI pages | A-019 |
| Full site crawler (enterprise) | Phase 2 |
| Local SEO · GBP sync | Phase 2 |
| Backlink acquisition tools | Phase 3 |
| Auto-apply optimizations to live site | Never — recommendations only |

### Phase Delivery

| Phase | Capability |
|-------|------------|
| **A-012 Phase 1** | Keywords · rank tracking · on-page optimization · GSC sync · basic audit |
| **A-012 Phase 1 complete** | Topic clustering · competitor gap · AI recommendations |
| **Phase 2** | Full crawl · local SEO · advanced SERP features |

## 1.3 Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Keyword CRUD + grouping** | KeywordService operational |
| 2 | **Rank tracking** | Weekly snapshots · trend analysis |
| 3 | **SEO audit** | Actionable findings with impact scores |
| 4 | **ContentSeoScore** | Integrated with ES-AURORA-009 |
| 5 | **GSC daily sync** | Queries · impressions · clicks ingested |
| 6 | **AI recommendations** | SEO Specialist agent via workforce |
| 7 | **Competitor gap** | Phase 1: manual competitor · gap report |
| 8 | **Explainable scoring** | Reproducible · versioned models |
| 9 | **Tenant isolation** | Zero cross-tenant keyword leakage |
| 10 | **Marketing Health SEO dimension** | 15% weight contribution |

## 1.4 Relationship with Architecture Documents

| Document | ES-AURORA-010 Response |
|----------|------------------------|
| **A-001** | Module 4 SEO Engine · capabilities · agent integration |
| **A-002** | `lib/aurora/seo/` · Keyword · SeoAudit · RankSnapshot entities |
| **A-003** | SEO Specialist agent · optimization learning |
| **A-004** | SEO Knowledge domain · KeywordRecord · RankingHistory · ContentSeoScore |
| **A-005** | SEO module runtime · scheduled jobs |
| **A-006** | Mission A-012 · EP-SEO · F-110–F-117 |
| **A-007 / ES-AURORA-005** | Module registry · connector infrastructure |
| **A-008 / ES-AURORA-006** | Tenant/brand · locale · config |
| **A-009 / ES-AURORA-007** | KeywordRecord entities · retrieval pre-flight |
| **A-010 / ES-AURORA-008** | agent.seo task routing · workforce invoke |
| **A-011 / ES-AURORA-009** | ContentSeoService · shared scoring · content briefs |

---

# 2. SEO Intelligence Platform

## 2.1 SeoEngine

**File:** `lib/aurora/seo/SeoEngine.ts`

Central orchestrator for all SEO capabilities. Single entry point for SEO module operations.

```typescript
export interface SeoEngine {
  initialize(ctx: SeoInitContext): Promise<SeoEngineState>;
  shutdown(): Promise<void>;
  healthCheck(): Promise<SeoHealthStatus>;
  getWorkspace(ctx: AuroraRuntimeContext): Promise<SeoWorkspaceSnapshot>;
}
```

## 2.2 SeoModuleRuntime

**File:** `lib/aurora/seo/SeoModuleRuntime.ts`

```typescript
export class SeoModuleRuntime implements AuroraModuleRuntime {
  readonly moduleKey = 'seo';
  readonly displayName = 'SEO Intelligence Engine';
  readonly phase = 1 as const;
  readonly tier = 2;
  readonly dependencies = ['admin', 'knowledge', 'workforce', 'content'] as const;
}
```

## 2.3 Keyword Intelligence Layer

**File:** `lib/aurora/seo/intelligence/KeywordIntelligenceService.ts`

Aggregates keyword data from repository · GSC · knowledge graph · external APIs.

| Input Source | Data |
|--------------|------|
| Manual entry | Brand target keywords |
| GSC sync | Queries · impressions · clicks · position |
| Knowledge Graph | KeywordRecord entities |
| AI discovery | Opportunity keywords from agent |

## 2.4 Search Intent Engine

**File:** `lib/aurora/seo/intelligence/SearchIntentEngine.ts`

```typescript
export interface SearchIntentEngine {
  classify(keyword: string, locale: string): Promise<SearchIntentResult>;
  classifyBatch(keywords: readonly string[], locale: string): Promise<readonly SearchIntentResult[]>;
  refineFromSerp(serpFeatures: SerpSnapshot): SearchIntent;
}

export type SearchIntent =
  | 'informational'
  | 'navigational'
  | 'commercial'
  | 'transactional'
  | 'local';

export interface SearchIntentResult {
  readonly keyword: string;
  readonly primaryIntent: SearchIntent;
  readonly confidence: number;
  readonly signals: readonly IntentSignal[];
}
```

| Intent | Signals | Content Strategy |
|--------|---------|-----------------|
| Informational | how/what/why · blog SERP | Blog · guides |
| Navigational | brand terms | Brand pages |
| Commercial | best/review/compare | Comparison content |
| Transactional | buy/price/discount | Product · landing pages |
| Local | near me · city names | Local landing pages (Phase 2) |

## 2.5 Topic Clustering

**File:** `lib/aurora/seo/intelligence/TopicClusteringService.ts`

Groups keywords into pillar/cluster structure aligned with ES-AURORA-007 `TopicCluster` · `ContentPillar` entities.

```typescript
export interface TopicClusteringService {
  buildClusters(ctx: AuroraRuntimeContext, keywords: readonly Keyword[]): Promise<readonly TopicCluster>;
  suggestPillarContent(ctx: AuroraRuntimeContext, clusterId: string): Promise<PillarContentPlan>;
  mapToContentPillar(ctx: AuroraRuntimeContext, clusterId: string): Promise<string>;  // entity ID
}
```

| Rule | Description |
|------|-------------|
| **CLU-1** | Pillar keyword: highest volume + brand relevance |
| **CLU-2** | Cluster size: 5–30 keywords |
| **CLU-3** | Internal linking plan generated per cluster |

## 2.6 Opportunity Discovery

**File:** `lib/aurora/seo/intelligence/OpportunityDiscoveryService.ts`

| Opportunity Type | Detection Method | Score Weight |
|-----------------|------------------|:------------:|
| Low competition · high volume | Keyword metrics | 30% |
| Ranking 4–20 (striking distance) | Rank tracking | 25% |
| GSC high impressions · low CTR | GSC sync | 20% |
| Competitor gap | Gap analysis | 15% |
| Content gap (no matching content) | Content cross-ref | 10% |

```typescript
export interface SeoOpportunity {
  readonly opportunityId: string;
  readonly type: OpportunityType;
  readonly keyword: string;
  readonly score: number;
  readonly evidence: readonly EvidenceRecord[];
  readonly recommendedAction: string;
}
```

## 2.7 SERP Intelligence

**File:** `lib/aurora/seo/intelligence/SerpIntelligenceService.ts`

| Data Point | Source | Phase |
|------------|--------|:-----:|
| Organic results top 10 | Rank API / GSC | 1 |
| SERP features (snippet · PAA · video) | Rank API | 1 |
| Competitor URLs ranking | Rank tracking | 1 |
| Featured snippet content | SERP scrape (policy-compliant) | 2 |

```typescript
export interface SerpSnapshot {
  readonly keyword: string;
  readonly locale: string;
  readonly capturedAt: string;
  readonly organicResults: readonly SerpResult[];
  readonly features: readonly SerpFeature[];
  readonly ourPosition?: number;
  readonly ourUrl?: string;
}
```

## 2.8 Ranking Model

**File:** `lib/aurora/seo/ranking/RankingModelService.ts`

Tracks position over time · computes trends · feeds Marketing Health Score.

```typescript
export interface RankingModelService {
  recordSnapshot(ctx: AuroraRuntimeContext, snapshot: RankSnapshotInput): Promise<RankSnapshot>;
  getTrend(ctx: AuroraRuntimeContext, keywordId: string, period: TrendPeriod): Promise<RankingTrend>;
  getVisibilityScore(ctx: AuroraRuntimeContext): Promise<VisibilityScore>;
  getStrikingDistanceKeywords(ctx: AuroraRuntimeContext): Promise<readonly Keyword[]>;
}
```

| Metric | Calculation |
|--------|-------------|
| Visibility score | Weighted sum: position 1=100 · 2=85 · ... · 20=5 |
| Trend | 7-day · 30-day · 90-day delta |
| Striking distance | Position 4–20 with upward trend |

## 2.9 SEO Workspace

**File:** `lib/aurora/seo/workspace/SeoWorkspace.ts`

```typescript
export interface SeoWorkspace {
  getSnapshot(ctx: AuroraRuntimeContext): Promise<SeoWorkspaceSnapshot>;
}

export interface SeoWorkspaceSnapshot {
  readonly visibilityScore: number;
  readonly trackedKeywords: number;
  readonly avgPosition: number;
  readonly topOpportunities: readonly SeoOpportunity[];
  readonly recentRankChanges: readonly RankChangeSummary[];
  readonly openAuditIssues: number;
  readonly seoHealthContribution: number;   // Marketing Health 15%
  readonly lastGscSync?: string;
}
```

---

# 3. Keyword Intelligence

## 3.1 KeywordService

**File:** `lib/aurora/seo/services/KeywordService.ts`

```typescript
export interface KeywordService {
  create(ctx: AuroraRuntimeContext, input: CreateKeywordInput): Promise<Keyword>;
  update(ctx: AuroraRuntimeContext, id: string, input: UpdateKeywordInput): Promise<Keyword>;
  getById(ctx: AuroraRuntimeContext, id: string): Promise<Keyword | null>;
  list(ctx: AuroraRuntimeContext, filter: KeywordFilter): Promise<PaginatedResult<Keyword>>;
  delete(ctx: AuroraRuntimeContext, id: string): Promise<void>;
  importBatch(ctx: AuroraRuntimeContext, keywords: readonly CreateKeywordInput[]): Promise<ImportResult>;
  assignToGroup(ctx: AuroraRuntimeContext, keywordId: string, groupId: string): Promise<void>;
  syncToKnowledgeGraph(ctx: AuroraRuntimeContext, keywordId: string): Promise<void>;
}
```

## 3.2 KeywordRepository

**File:** `lib/aurora/seo/repositories/KeywordRepository.ts`

```typescript
export interface KeywordRepository {
  save(tenantId: string, keyword: KeywordRecord): Promise<void>;
  getById(tenantId: string, keywordId: string): Promise<KeywordRecord | null>;
  query(tenantId: string, filter: KeywordFilter): Promise<PaginatedResult<KeywordRecord>>;
  getByTerm(tenantId: string, brandId: string, term: string, locale: string): Promise<KeywordRecord | null>;
  saveGroup(tenantId: string, group: KeywordGroupRecord): Promise<void>;
}
```

**Tables:**
- `aurora_seo_keyword`
- `aurora_seo_keyword_group`
- `aurora_seo_keyword_group_member`
- `aurora_seo_rank_snapshot`

## 3.3 Canonical Keyword Entity

```typescript
export interface Keyword {
  readonly id: string;                    // kwd_{uuid}
  readonly tenantId: string;
  readonly brandId: string;
  readonly term: string;
  readonly locale: string;                // BCP 47 · SP-10
  readonly searchVolume?: number;
  readonly competition?: number;         // 0.0–1.0
  readonly difficulty?: number;           // 0–100
  readonly cpc?: number;
  readonly intent?: SearchIntent;
  readonly currentRank?: number;
  readonly currentUrl?: string;
  readonly targetUrl?: string;
  readonly topicGroupId?: string;
  readonly knowledgeEntityId?: string;      // KeywordRecord link
  readonly trackingEnabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

## 3.4 Search Volume

| Source | Priority | Refresh |
|--------|:--------:|:-------:|
| GSC (actual) | 1 | Daily |
| External API (connector) | 2 | Weekly |
| Estimated (AI) | 3 | On discovery · provisional |

**Rule VOL-1:** GSC impressions used as volume proxy when API unavailable.

## 3.5 Competition & Difficulty

**File:** `lib/aurora/seo/scoring/KeywordDifficultyScorer.ts`

| Factor | Weight | Source |
|--------|:------:|--------|
| SERP domain authority avg | 35% | SERP intelligence |
| Content depth of top 10 | 25% | SERP analysis |
| Backlink profile (Phase 2) | 20% | External API |
| Brand relevance boost | 10% | Knowledge graph |
| Current rank if tracked | 10% | Rank history |

Score 0–100 · reproducible formula · model version `kd-v1.0`.

## 3.6 CPC

Optional field from keyword API connector. Used for commercial intent prioritization · not paid ads module.

## 3.7 Intent Classification

See §2.4. Stored on keyword record · used for content brief generation.

## 3.8 Topic Groups

```typescript
export interface KeywordGroup {
  readonly id: string;
  readonly name: string;
  readonly type: 'topic_cluster' | 'campaign' | 'custom';
  readonly pillarKeywordId?: string;
  readonly keywordCount: number;
}
```

## 3.9 Entity Mapping

**File:** `lib/aurora/seo/integration/KnowledgeGraphKeywordBridge.ts`

| SEO Entity | Knowledge Entity | Sync Direction |
|------------|------------------|----------------|
| Keyword | KeywordRecord | SEO → Knowledge |
| RankSnapshot | RankingHistory | SEO → Knowledge |
| SeoAuditFinding | SeoAuditFinding | SEO → Knowledge |
| ContentSeoScore | ContentSeoScore | Bidirectional |
| TopicCluster | TopicCluster | SEO → Knowledge |

Sync on: keyword create · rank snapshot · audit complete · score update.

## 3.10 RankTrackingService

**File:** `lib/aurora/seo/services/RankTrackingService.ts`

```typescript
export interface RankTrackingService {
  trackKeyword(ctx: AuroraRuntimeContext, keywordId: string): Promise<void>;
  untrackKeyword(ctx: AuroraRuntimeContext, keywordId: string): Promise<void>;
  runWeeklyCheck(ctx: AuroraRuntimeContext): Promise<WeeklyRankReport>;
  getHistory(ctx: AuroraRuntimeContext, keywordId: string, limit?: number): Promise<readonly RankSnapshot[]>;
}
```

Requires OAuth · registered in ConnectorRegistry (ES-AURORA-005).

## 3.11 Keyword Database Schema

```sql
CREATE TABLE aurora_seo_keyword (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  term TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-US',
  search_volume INT,
  competition NUMERIC(4,3),
  difficulty NUMERIC(5,2),
  cpc NUMERIC(10,2),
  intent TEXT,
  current_rank INT,
  current_url TEXT,
  target_url TEXT,
  topic_group_id UUID,
  knowledge_entity_id UUID,
  tracking_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (tenant_id, brand_id, term, locale)
);

CREATE TABLE aurora_seo_rank_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  keyword_id UUID NOT NULL REFERENCES aurora_seo_keyword(id),
  rank INT,
  url TEXT,
  serp_features JSONB,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rank_snapshot_keyword ON aurora_seo_rank_snapshot(keyword_id, captured_at DESC);
```

## 3.12 Locale & Multi-Language Support

**SP-10:** Built-in from Phase 1.

| Feature | Implementation |
|---------|---------------|
| Keyword locale | BCP 47 on every keyword record |
| Separate rank tracking | Per locale · separate snapshots |
| Intent classification | Locale-aware rule sets |
| Content brief | Locale passed to Content Studio |
| Hreflang audit | Technical SEO check Phase 1 |
| Translation keywords | Import batch with locale tag |

Supported Phase 1 locales: `en-US` · `en-GB` · `en-AU` · `de-DE` · `fr-FR` · `es-ES` (configurable via tenant).

---

# 4. Content Optimization

## 4.1 ContentOptimizationService

**File:** `lib/aurora/seo/optimization/ContentOptimizationService.ts`

Shared implementation with ES-AURORA-009 `ContentSeoService` — SEO module owns scoring algorithms · Content module consumes via facade.

```typescript
export interface ContentOptimizationService {
  analyze(ctx: AuroraRuntimeContext, contentId: string): Promise<ContentOptimizationReport>;
  optimizeTitle(ctx: AuroraRuntimeContext, contentId: string): Promise<TitleOptimization>;
  optimizeMeta(ctx: AuroraRuntimeContext, contentId: string): Promise<MetaOptimization>;
  suggestInternalLinks(ctx: AuroraRuntimeContext, contentId: string): Promise<readonly InternalLinkSuggestion[]>;
  suggestSchema(ctx: AuroraRuntimeContext, contentId: string): Promise<SchemaRecommendation>;
  scoreReadability(ctx: AuroraRuntimeContext, body: ContentBody): Promise<ReadabilityScore>;
  computeContentSeoScore(ctx: AuroraRuntimeContext, contentId: string): Promise<ContentSeoScore>;
}
```

## 4.2 Title Optimization

| Check | Rule | Weight |
|-------|------|:------:|
| Length | 50–60 chars | 20% |
| Primary keyword placement | First 40 chars | 25% |
| Uniqueness | No duplicate per brand | 15% |
| Click-worthiness | Power words · no clickbait | 10% |
| Brand suffix | Configurable pattern | 10% |
| SERP preview | No truncation mid-word | 20% |

## 4.3 Headline Scoring

H1/H2 structure analysis for blog · landing page content types.

| Rule | Requirement |
|------|-------------|
| Single H1 | Exactly one per page content |
| Keyword in H1 | Primary keyword present |
| Logical hierarchy | No skipped levels (H1→H3) |
| Heading density | 1 H2 per 300 words minimum |

## 4.4 Meta Title & Description

Generated via `SeoMetadataGenerator` — same rules as ES-AURORA-009 §7.3–7.5.

AI enhancement via workforce `seo.optimize` task when manual edit requested.

## 4.5 URL Recommendations

```typescript
export interface UrlRecommendation {
  readonly currentSlug: string;
  readonly suggestedSlug: string;
  readonly reason: string;
  readonly keywordAlignment: number;
  readonly redirectRequired: boolean;
}
```

| Rule | Description |
|------|-------------|
| URL-1 | Lowercase · hyphen-separated |
| URL-2 | Primary keyword in slug |
| URL-3 | Max 75 characters |
| URL-4 | Slug change → 301 recommendation logged |

## 4.6 Internal Linking

**File:** `lib/aurora/seo/optimization/InternalLinkingEngine.ts`

| Strategy | Description |
|----------|-------------|
| Pillar → cluster | Hub pages link to supporting content |
| Cluster cross-link | Related keywords within cluster |
| Product links | Commercial intent → product pages |
| Freshness | Link to recently published approved content |

Max 8 suggestions per content item · relevance ≥ 0.75 · explainable anchor text.

## 4.7 External References

Recommend authoritative external citations for informational content (E-E-A-T). Never auto-insert — suggestion only.

## 4.8 Schema Recommendations

| Content Type | Schema | Required Fields |
|--------------|--------|-----------------|
| blog_post | BlogPosting · Article | headline · datePublished · author |
| product_description | Product | name · description · offers |
| landing_page | WebPage · FAQPage | name · mainEntity (FAQ) |
| local (Phase 2) | LocalBusiness | address · geo |

Output: JSON-LD block · validation against schema.org.

## 4.9 Readability

Flesch-Kincaid · Gunning Fog · avg sentence length — shared with ES-AURORA-009.

## 4.10 Content Quality Score

Composite of SEO score (60%) · readability (25%) · E-E-A-T signals (15%).

## 4.11 Content Brief Generation

**File:** `lib/aurora/seo/services/SeoContentBriefService.ts`

Feeds ES-AURORA-009 ContentBrief:

```typescript
export interface SeoContentBriefService {
  generateBrief(ctx: AuroraRuntimeContext, input: BriefRequestInput): Promise<ContentBrief>;
  generateFromKeyword(ctx: AuroraRuntimeContext, keywordId: string): Promise<ContentBrief>;
  generateFromCluster(ctx: AuroraRuntimeContext, clusterId: string): Promise<ContentBrief>;
}
```

Brief includes: topic · target keyword · secondary keywords · intent · suggested outline · competitor URLs · word count target.

---

# 5. Technical SEO

## 5.1 SeoAuditService

**File:** `lib/aurora/seo/services/SeoAuditService.ts`

```typescript
export interface SeoAuditService {
  runAudit(ctx: AuroraRuntimeContext, input: AuditRequest): Promise<SeoAudit>;
  getAudit(ctx: AuroraRuntimeContext, auditId: string): Promise<SeoAudit | null>;
  listAudits(ctx: AuroraRuntimeContext, filter: AuditFilter): Promise<PaginatedResult<SeoAudit>>;
  getOpenIssues(ctx: AuroraRuntimeContext): Promise<readonly SeoAuditFinding[]>;
}
```

## 5.2 Site Health Score

| Category | Weight | Checks |
|----------|:------:|--------|
| Crawlability | 25% | robots · sitemap · status codes |
| Indexability | 20% | canonical · noindex · duplicates |
| Performance | 20% | LCP · CLS · TTFB signals |
| Mobile | 15% | Viewport · tap targets |
| Structured data | 10% | Schema validity |
| Security | 10% | HTTPS · mixed content |

Score 0–100 · contributes to SEO workspace · Marketing Health dimension.

## 5.3 Crawl Diagnostics

Phase 1: URL list audit (sitemap + manual URLs). Phase 2: full crawler.

| Check | Severity |
|-------|:--------:|
| 4xx/5xx responses | Critical |
| Redirect chains > 2 | High |
| Missing canonical | High |
| Duplicate content | Medium |
| Thin content < 300 words | Medium |
| Missing meta description | Low |

## 5.4 Canonical Validation

Detect: missing · self-referencing · cross-domain · conflicting · pointing to noindex.

## 5.5 Redirect Analysis

Map redirect chains · flag loops · recommend direct 301.

## 5.6 Broken Links

Internal · external link check on audited URLs. Severity by link type.

## 5.7 Robots.txt Validation

Parse robots.txt · verify allow/disallow · sitemap reference · crawl-delay (informational).

## 5.8 Sitemap Validation

XML validity · URL count · lastmod freshness · orphan URLs · excluded noindex pages.

## 5.9 Page Performance Signals

Integrate Core Web Vitals from:
- Lighthouse API (Phase 1 limited)
- GSC Core Web Vitals report (Phase 1)
- RUM connector (Phase 2)

## 5.10 Structured Data Validation

**File:** `lib/aurora/seo/technical/StructuredDataValidator.ts`

Google Rich Results Test API or schema validator · report errors · warnings · eligible rich results.

## 5.11 Audit Finding Entity

```typescript
export interface SeoAuditFinding {
  readonly id: string;
  readonly auditId: string;
  readonly category: AuditCategory;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly description: string;
  readonly affectedUrl?: string;
  readonly recommendation: string;
  readonly evidence: readonly EvidenceRecord[];
  readonly status: 'open' | 'acknowledged' | 'resolved';
}
```

**Job:** `MonthlySeoAuditJob` — first of month · configurable per brand.

## 5.12 Database Schema

```sql
CREATE TABLE aurora_seo_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  site_url TEXT NOT NULL,
  health_score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  summary JSONB
);

CREATE TABLE aurora_seo_audit_finding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  audit_id UUID NOT NULL REFERENCES aurora_seo_audit(id),
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_url TEXT,
  recommendation TEXT NOT NULL,
  evidence JSONB,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 5.13 Audit API Routes

| Method | Route | Permission |
|--------|-------|------------|
| `POST` | `/api/aurora/seo/audit` | `aurora.seo.write` |
| `GET` | `/api/aurora/seo/audit/:id` | `aurora.seo.read` |
| `GET` | `/api/aurora/seo/audit` | `aurora.seo.read` |
| `GET` | `/api/aurora/seo/issues` | `aurora.seo.read` |
| `PATCH` | `/api/aurora/seo/issues/:id` | `aurora.seo.write` |

---

# 6. Competitor Intelligence

## 6.1 CompetitorIntelligenceService

**File:** `lib/aurora/seo/competitor/CompetitorIntelligenceService.ts`

Phase 1: Manual competitor domain registration. Phase 2: Meta Ad Library · automated discovery.

```typescript
export interface CompetitorIntelligenceService {
  addCompetitor(ctx: AuroraRuntimeContext, input: AddCompetitorInput): Promise<CompetitorProfile>;
  listCompetitors(ctx: AuroraRuntimeContext): Promise<readonly CompetitorProfile[]>;
  analyzeKeywordOverlap(ctx: AuroraRuntimeContext, competitorId: string): Promise<KeywordOverlapReport>;
  runContentGapAnalysis(ctx: AuroraRuntimeContext, competitorId: string): Promise<ContentGapReport>;
  compareSerp(ctx: AuroraRuntimeContext, keywordId: string, competitorId: string): Promise<SerpComparison>;
  getTrendAnalysis(ctx: AuroraRuntimeContext, competitorId: string): Promise<CompetitorTrendReport>;
}
```

## 6.2 Competitor Profiles

```typescript
export interface CompetitorProfile {
  readonly id: string;
  readonly domain: string;
  readonly displayName: string;
  readonly trackedKeywords: number;
  readonly avgVisibility?: number;
  readonly lastAnalyzedAt?: string;
}
```

Stored in SEO module · syncs to ES-AURORA-007 `Competitor` entity (Phase 2).

## 6.3 Keyword Overlap

| Metric | Description |
|--------|-------------|
| Shared keywords | Both rank in top 100 |
| We win | Our position better |
| They win | Competitor position better |
| Untapped | They rank · we don't |
| Defend | We rank · they don't (protect) |

## 6.4 Content Gap Analysis

Compare competitor ranking URLs vs. brand approved content:

| Gap Type | Action |
|----------|--------|
| Topic they cover · we don't | Content brief recommendation |
| We cover · they rank higher | Optimization recommendation |
| Neither ranks | Opportunity keyword |

## 6.5 SERP Comparison

Side-by-side SERP snapshot: our URL vs. competitor URLs for target keyword. Title · meta · schema · content length comparison.

## 6.6 Trend Analysis

30/90-day visibility trend vs. competitor. Alert on competitor visibility spike > 15%.

## 6.7 Recommendation Engine

**File:** `lib/aurora/seo/competitor/CompetitorRecommendationEngine.ts`

```typescript
export interface CompetitorRecommendation {
  readonly recommendationId: string;
  readonly type: 'content_gap' | 'optimization' | 'defensive' | 'keyword_target';
  readonly priority: 'high' | 'medium' | 'low';
  readonly title: string;
  readonly rationale: string;
  readonly evidence: readonly EvidenceRecord[];
  readonly suggestedAction: string;
  readonly estimatedImpact: number;
}
```

**SP-1 · SP-4:** Every recommendation cites evidence · includes rationale.

## 6.8 Opportunity Scoring

```
opportunity_score = (gap_size × 0.35)
                  + (search_volume_norm × 0.25)
                  + (difficulty_inverse × 0.20)
                  + (competitor_weakness × 0.10)
                  + (brand_relevance × 0.10)
```

Normalized 0–100 · threshold ≥ 60 for workspace display.

---

# 7. AI Optimization Engine

## 7.1 SeoOptimizationEngine

**File:** `lib/aurora/seo/ai/SeoOptimizationEngine.ts`

```typescript
export interface SeoOptimizationEngine {
  generateRecommendations(ctx: AuroraRuntimeContext, scope: OptimizationScope): Promise<readonly SeoRecommendation[]>;
  optimizeContent(ctx: AuroraRuntimeContext, contentId: string): Promise<ContentOptimizationResult>;
  validateFacts(ctx: AuroraRuntimeContext, recommendation: SeoRecommendation): Promise<FactValidationResult>;
  submitForApproval(ctx: AuroraRuntimeContext, recommendationId: string): Promise<ApprovalSubmission>;
}
```

## 7.2 Knowledge Retrieval

**SP-2:** Every AI optimization invokes workforce with knowledge pre-flight:

```
Optimization Request
    ↓
KnowledgeRetrievalService.preflight(domains: seo · content · brand · product)
    ↓
Insufficient confidence → escalate · no recommendation
    ↓
AuroraWorkforceRuntime.execute({ taskType: 'seo.optimize', ... })
    ↓
SEO Specialist agent
    ↓
Output validation · fact check · brand compliance
    ↓
SeoRecommendation (provisional)
```

## 7.3 Brand-Aware Optimization

| Constraint | Source |
|------------|--------|
| Voice · tone | BrandConfig · Brand Knowledge |
| Prohibited terms | BrandGuideline |
| Product naming | Product Knowledge |
| Competitor mention policy | Brand compliance rules |

**SP-3:** BrandComplianceValidator on all AI output.

## 7.4 Fact Validation

Claims in SEO recommendations validated against Knowledge Graph. Unsupported claims flagged · removed from final recommendation.

## 7.5 SEO Scoring

**SP-5:** Reproducible scoring — see Appendix E. Model version stored on every score record.

## 7.6 Content Suggestions

| Suggestion Type | Agent | Output |
|---------------|-------|--------|
| Title rewrite | SEO Specialist | 3 variants + scores |
| Meta rewrite | SEO Specialist | Title + description |
| Content expansion | SEO Specialist + Copywriter (WF-01) | Section outlines |
| New content | Strategist | Content brief |
| Technical fix | SEO Specialist | Audit finding resolution steps |

## 7.7 Localization

**SP-10:**

```typescript
export interface LocalizedSeoContext {
  readonly locale: string;                // BCP 47
  readonly hreflang?: readonly HreflangEntry[];
  readonly localizedKeywords?: readonly Keyword[];
  readonly regionalSearchVolume?: number;
}
```

Keyword tracking per locale · separate rank snapshots · hreflang validation in technical audit.

## 7.8 Confidence Scoring

| Level | Range | Action |
|-------|-------|--------|
| High | 0.80–1.00 | Present recommendation |
| Medium | 0.50–0.79 | Present with uncertainty flag |
| Low | 0.20–0.49 | Require human review before display |
| Insufficient | < 0.20 | Do not generate · escalate |

## 7.9 Human Approval

**SP-6 · SP-7:** Recommendations never auto-applied to content or live site.

| Recommendation Type | Approval Required |
|--------------------|:-----------------:|
| Informational (report) | No |
| Content edit suggestion | Yes · Content Creator |
| URL/slug change | Yes · Brand Manager |
| Technical fix (site-level) | Yes · Admin |
| New content brief | Optional · auto to draft |

Approval via ContentApprovalWorkflow (ES-AURORA-009) or SEO-specific approval queue.

## 7.10 Recommendation Entity

```typescript
export interface SeoRecommendation {
  readonly id: string;                    // seo_rec_{uuid}
  readonly tenantId: string;
  readonly brandId: string;
  readonly type: RecommendationType;
  readonly status: 'proposed' | 'approved' | 'applied' | 'rejected' | 'expired';
  readonly title: string;
  readonly description: string;
  readonly rationale: string;
  readonly evidence: readonly EvidenceRecord[];
  readonly confidence: number;
  readonly agentCodename: string;
  readonly citations: readonly KnowledgeCitation[];
  readonly targetContentId?: string;
  readonly targetKeywordId?: string;
  readonly createdAt: string;
  readonly expiresAt: string;             // 90 days default
}
```

**SP-8:** Every recommendation logged to `aurora_seo_recommendation_audit`.

---

# 8. ORION Integration

## 8.1 Knowledge Graph

| SEO Action | Knowledge Entity |
|------------|------------------|
| Keyword create/update | KeywordRecord |
| Rank snapshot | RankingHistory |
| Audit finding | SeoAuditFinding |
| Content score | ContentSeoScore |
| Topic cluster | TopicCluster |
| Competitor add | Competitor (Phase 2) |
| Recommendation applied | OptimizationRecord (campaign) |

## 8.2 Content Studio

| Integration | Direction |
|-------------|-----------|
| ContentSeoService | SEO module provides scoring engine |
| SeoContentBriefService | SEO → ContentBrief |
| Content optimization apply | Approved recommendation → ContentService.update |
| ContentSeoScore on publish | Content → Knowledge sync |

## 8.3 Analytics

| Metric | Source | Consumer |
|--------|--------|----------|
| Organic traffic | GSC · GA connector | Analytics module (A-013) |
| Keyword performance | Rank tracking | Marketing Health SEO dimension |
| Content SEO score vs traffic | Correlation job | Learning engine |

## 8.4 PlatformStore

| Entity | Table |
|--------|-------|
| Keyword | `aurora_seo_keyword` |
| Rank snapshot | `aurora_seo_rank_snapshot` |
| Audit | `aurora_seo_audit` |
| Audit finding | `aurora_seo_audit_finding` |
| Recommendation | `aurora_seo_recommendation` |
| Competitor | `aurora_seo_competitor` |
| GSC query cache | `aurora_seo_gsc_query` |

**Migration:** `migrations/aurora/010_seo.sql`

## 8.5 Identity

Permissions: `aurora.seo.read` · `aurora.seo.write` · `aurora.seo.admin` (extend ES-AURORA-006 catalog).

## 8.6 Event Bus

| Event | Payload |
|-------|---------|
| `aurora.seo.keyword.created` | keywordId · term |
| `aurora.seo.rank.changed` | keywordId · oldRank · newRank |
| `aurora.seo.audit.completed` | auditId · score · issueCount |
| `aurora.seo.recommendation.created` | recommendationId · type |
| `aurora.seo.recommendation.applied` | recommendationId · contentId |
| `aurora.seo.opportunity.detected` | opportunityId · score |
| `aurora.seo.gsc.sync.completed` | queryCount · date |

## 8.7 Executive Dashboards

SEO workspace data feeds:
- Marketing Health Score (15% SEO dimension)
- Executive Brief SEO summary card
- Visibility trend · top opportunities

## 8.8 Campaign Runtime

Keywords link to campaigns via optional `campaignId` on keyword groups. Campaign launch triggers SEO baseline audit.

## 8.9 GSC Connector

**File:** `lib/aurora/integrations/connectors/google/GoogleSearchConsoleConnector.ts`

| Sync | Data | Schedule |
|------|------|:--------:|
| Search analytics | queries · pages · impressions · clicks · position | Daily |
| Index coverage | indexed · excluded · error | Weekly |
| Core Web Vitals | URL-level CWV | Weekly |

Requires OAuth · registered in ConnectorRegistry (ES-AURORA-005).

## 8.10 Marketing Health Score Integration

**File:** `lib/aurora/seo/integration/MarketingHealthSeoContributor.ts`

| Sub-metric | Weight within SEO (15%) | Source |
|------------|:----------------------:|--------|
| Visibility trend | 40% | RankingModelService |
| Avg position delta | 25% | Rank snapshots 30d |
| Open critical audit issues | 20% | SeoAuditService |
| Content SEO score avg | 15% | ContentSeoScorer aggregate |

## 8.11 API Route Catalogue

| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| `GET` | `/api/aurora/seo/workspace` | `aurora.seo.read` | Workspace snapshot |
| `GET` | `/api/aurora/seo/keywords` | `aurora.seo.read` | List keywords |
| `POST` | `/api/aurora/seo/keywords` | `aurora.seo.write` | Create keyword |
| `POST` | `/api/aurora/seo/content/:id/analyze` | `aurora.seo.read` | Content optimization |
| `POST` | `/api/aurora/seo/brief` | `aurora.seo.write` | Generate content brief |
| `GET` | `/api/aurora/seo/recommendations` | `aurora.seo.read` | List recommendations |
| `GET` | `/api/aurora/seo/opportunities` | `aurora.seo.read` | Top opportunities |

## 8.12 Retention & Data Freshness

| Data Type | Retention | Refresh |
|-----------|-----------|---------|
| Rank snapshots | 2 years | Weekly |
| GSC query cache | 90 days | Daily |
| SERP snapshots | 30 days | On rank check |
| Audit history | 1 year | Monthly |
| Recommendations | 90 days active | Auto-expire job |

---

# 9. Testing Strategy

## 9.1 Test Structure

```
tests/aurora/
├── unit/seo/
│   ├── KeywordService.test.ts
│   ├── SearchIntentEngine.test.ts
│   ├── KeywordDifficultyScorer.test.ts
│   ├── ContentOptimizationService.test.ts
│   ├── SeoAuditService.test.ts
│   ├── RankingModelService.test.ts
│   ├── CompetitorIntelligenceService.test.ts
│   └── SeoOptimizationEngine.test.ts
├── integration/seo/
│   ├── rankTracking.test.ts
│   ├── gscSync.test.ts
│   ├── contentSeoIntegration.test.ts
│   ├── knowledgeGraphSync.test.ts
│   ├── recommendationWorkflow.test.ts
│   └── auditPipeline.test.ts
├── integration/security/
│   └── seoTenantIsolation.test.ts
└── performance/
    ├── keywordQueryLatency.test.ts
    └── auditRunLatency.test.ts
```

## 9.2 Keyword Engine Tests

| Test | Assertion |
|------|-----------|
| `keywordCrud.test.ts` | CRUD · locale · uniqueness |
| `intentClassification.test.ts` | Known keywords → expected intent |
| `difficultyReproducible.test.ts` | Same inputs → same score (SP-5) |
| `topicClustering.test.ts` | Cluster size rules enforced |
| `kgSync.test.ts` | KeywordRecord created on sync |

## 9.3 Optimization Engine Tests

| Test | Assertion |
|------|-----------|
| `titleScoring.test.ts` | Score matches rubric |
| `internalLinkSuggestions.test.ts` | Brand-scoped only |
| `contentBriefGeneration.test.ts` | Brief has keywords · outline |
| `noAutoApply.test.ts` | Recommendation does not modify content without approval |
| `explainability.test.ts` | Every recommendation has rationale + evidence |

## 9.4 Technical SEO Tests

| Test | Assertion |
|------|-----------|
| `auditFindingSeverity.test.ts` | Critical issues ranked first |
| `robotsValidation.test.ts` | Parse errors detected |
| `sitemapValidation.test.ts` | Invalid XML rejected |
| `structuredDataValidation.test.ts` | Schema errors reported |

## 9.5 Performance Tests

| Metric | Target |
|--------|:------:|
| Keyword list p95 | < 200ms |
| Content SEO score p95 | < 500ms |
| Audit (50 URLs) p95 | < 60s |
| Weekly rank check (100 keywords) | < 10 min |

## 9.6 Recommendation Quality Tests

| Test | Scenario |
|------|----------|
| Brand violation rejection | Prohibited term in recommendation rejected |
| Fact validation | Unsupported claim flagged |
| Confidence insufficient | No recommendation generated |
| Expiry | Recommendations expire after 90 days |

## 9.7 Tenant Isolation Tests

Cross-tenant keyword read/write blocked · RLS verified · 15+ tests.

## 9.8 Coverage Target

| Layer | Minimum |
|-------|:-------:|
| `lib/aurora/seo/services/` | 90% |
| `lib/aurora/seo/scoring/` | 90% |
| `lib/aurora/seo/optimization/` | 85% |
| `lib/aurora/seo/competitor/` | 80% |
| **A-012 scope overall** | **85%** |

## 9.9 Required Test Suites

| Suite | Minimum Tests |
|-------|:-------------:|
| Keyword unit | 35+ |
| Optimization unit | 30+ |
| Technical SEO unit | 25+ |
| Integration | 30+ |
| AI/workforce | 15+ |
| Security | 15+ |
| **Total** | **150+** |

---

# 10. Engineering Standards

## 10.1 Folder Layout

```
lib/aurora/seo/
├── SeoEngine.ts
├── SeoModuleRuntime.ts
├── index.ts
├── types/
│   ├── Keyword.ts
│   ├── SeoAudit.ts
│   ├── SeoRecommendation.ts
│   └── SeoScore.ts
├── services/
│   ├── KeywordService.ts
│   ├── RankTrackingService.ts
│   ├── SeoAuditService.ts
│   ├── SeoContentBriefService.ts
│   └── GscIngestionService.ts
├── intelligence/
│   ├── KeywordIntelligenceService.ts
│   ├── SearchIntentEngine.ts
│   ├── TopicClusteringService.ts
│   ├── OpportunityDiscoveryService.ts
│   └── SerpIntelligenceService.ts
├── optimization/
│   ├── ContentOptimizationService.ts
│   ├── InternalLinkingEngine.ts
│   ├── SeoMetadataGenerator.ts
│   └── ReadabilityAnalyzer.ts
├── technical/
│   ├── SiteHealthScorer.ts
│   ├── CrawlDiagnostics.ts
│   ├── RobotsValidator.ts
│   ├── SitemapValidator.ts
│   └── StructuredDataValidator.ts
├── competitor/
│   ├── CompetitorIntelligenceService.ts
│   └── CompetitorRecommendationEngine.ts
├── ranking/
│   └── RankingModelService.ts
├── scoring/
│   ├── KeywordDifficultyScorer.ts
│   ├── ContentSeoScorer.ts
│   └── VisibilityScorer.ts
├── ai/
│   └── SeoOptimizationEngine.ts
├── workspace/
│   └── SeoWorkspace.ts
├── jobs/
│   ├── WeeklyRankCheckJob.ts
│   ├── GscSyncJob.ts
│   ├── MonthlySeoAuditJob.ts
│   └── OpportunityScanJob.ts
├── integration/
│   ├── KnowledgeGraphKeywordBridge.ts
│   └── AuroraSeoWiring.ts
├── repositories/
│   ├── KeywordRepository.ts
│   ├── AuditRepository.ts
│   └── postgres/
│       ├── PostgresKeywordRepository.ts
│       └── PostgresAuditRepository.ts
├── persistence/
│   └── SeoEntityPersister.ts
└── facade/
    └── SeoFacadeOperations.ts
```

## 10.2 SeoFacadeOperations

```typescript
export interface SeoOperations {
  // Keywords
  createKeyword(ctx: AuroraRuntimeContext, input: CreateKeywordInput): Promise<Keyword>;
  listKeywords(ctx: AuroraRuntimeContext, filter: KeywordFilter): Promise<PaginatedResult<Keyword>>;
  trackKeyword(ctx: AuroraRuntimeContext, keywordId: string): Promise<void>;
  // Audits
  runAudit(ctx: AuroraRuntimeContext, input: AuditRequest): Promise<SeoAudit>;
  getOpenIssues(ctx: AuroraRuntimeContext): Promise<readonly SeoAuditFinding[]>;
  // Optimization
  analyzeContent(ctx: AuroraRuntimeContext, contentId: string): Promise<ContentOptimizationReport>;
  generateBrief(ctx: AuroraRuntimeContext, keywordId: string): Promise<ContentBrief>;
  getRecommendations(ctx: AuroraRuntimeContext): Promise<readonly SeoRecommendation[]>;
  // Workspace
  getWorkspace(ctx: AuroraRuntimeContext): Promise<SeoWorkspaceSnapshot>;
  getVisibilityScore(ctx: AuroraRuntimeContext): Promise<VisibilityScore>;
}
```

## 10.3 Error Handling

| Code | Name | HTTP |
|------|------|:----:|
| `AURORA_SEO_001` | KEYWORD_NOT_FOUND | 404 |
| `AURORA_SEO_002` | DUPLICATE_KEYWORD | 409 |
| `AURORA_SEO_003` | AUDIT_FAILED | 502 |
| `AURORA_SEO_004` | GSC_NOT_CONNECTED | 424 |
| `AURORA_SEO_005` | RECOMMENDATION_EXPIRED | 410 |
| `AURORA_SEO_006` | INSUFFICIENT_EVIDENCE | 422 |
| `AURORA_SEO_007` | SCORE_MODEL_ERROR | 500 |

## 10.4 Caching

| Cache | Key | TTL |
|-------|-----|-----|
| Keyword by ID | `aurora:seo:kwd:{tenant}:{id}` | 300s |
| Visibility score | `aurora:seo:vis:{tenant}:{brand}` | 3600s |
| GSC query data | `aurora:seo:gsc:{tenant}:{date}` | 86400s |
| SERP snapshot | `aurora:seo:serp:{tenant}:{keyword}:{date}` | 604800s |

## 10.5 Review Checklist

- [ ] AuroraRuntimeContext on all methods
- [ ] tenant_id · brand_id · RLS
- [ ] Scoring reproducible · model version logged
- [ ] Recommendations have rationale + evidence
- [ ] No auto-apply to content or live site
- [ ] Knowledge pre-flight before AI optimization
- [ ] GSC data tenant-scoped
- [ ] Events on keyword · audit · recommendation changes
- [ ] Coverage ≥ 85%

## 10.6 Permission Matrix

| Permission | admin | director | manager | editor | approver | viewer |
|------------|:-----:|:--------:|:-------:|:------:|:--------:|:------:|
| `aurora.seo.read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `aurora.seo.write` | ✅ | ✅ | ✅ | ✅ | — | — |
| `aurora.seo.admin` | ✅ | ✅ | — | — | — | — |
| Run audit | ✅ | ✅ | ✅ | — | — | — |
| Approve SEO recommendation | ✅ | ✅ | ✅ | — | ✅ | — |
| Manage competitors | ✅ | ✅ | ✅ | — | — | — |

## 10.7 Implementation Roadmap

| Sprint | Focus | Deliverables |
|:------:|-------|-------------|
| **S1** | Keywords · intent · difficulty | KeywordService · SearchIntentEngine · migrations |
| **S2** | Rank tracking · GSC | RankTrackingService · GscSyncJob · connector stub |
| **S3** | Content optimization | ContentOptimizationService · brief service · Content Studio integration |
| **S4** | Technical SEO | SeoAuditService · validators · monthly job |
| **S5** | Competitor · AI | CompetitorIntelligenceService · SeoOptimizationEngine |
| **S6** | Integration · certification | Wiring · events · workspace · tests · 85% coverage |

**Duration:** 6 weeks · depends on A-007–A-011 · GSC connector (A-016) for production GSC sync.

## 10.8 Critical Path & Risks

```
A-007 Platform → A-008 Identity → A-009 Knowledge → A-010 Workforce → A-011 Content → A-012 SEO
```

| Risk | Mitigation |
|------|------------|
| GSC OAuth unavailable | Manual keyword entry · stub connector |
| SERP API rate limits | Cache · weekly not daily rank checks |
| Scoring model drift | Versioned models · regression fixtures |
| Cross-module Content integration | Shared ContentSeoScorer interface · contract tests |

---

# 11. Acceptance Criteria

## 11.1 Definition of Done

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | KeywordService CRUD + grouping | Unit tests |
| 2 | Rank tracking weekly job | Integration test |
| 3 | GSC daily sync | Connector integration test |
| 4 | SeoAuditService actionable findings | Audit test suite |
| 5 | ContentSeoScore integrated with Content Studio | Cross-module test |
| 6 | Search intent classification | Intent test matrix |
| 7 | Topic clustering | Cluster rules test |
| 8 | Competitor gap analysis (manual competitor) | Integration test |
| 9 | AI recommendations via SEO Specialist | Workforce test |
| 10 | Explainable · evidence-based recommendations | Quality tests |
| 11 | No auto-publication | SP-6 verification |
| 12 | Multi-locale keyword support | Locale tests |
| 13 | Knowledge graph sync | KG integration test |
| 14 | Marketing Health SEO dimension | Analytics hook test |
| 15 | 150+ tests · 85% coverage | CI |

## 11.2 Operational Readiness

GSC connector OAuth · weekly/monthly jobs scheduled · workspace API · audit retention · recommendation expiry job.

## 11.3 SEO Certification

| ID | Criterion |
|----|-----------|
| SEO-C1 | SP-1–SP-10 verified |
| SEO-C2 | Scoring reproducibility test pass |
| SEO-C3 | Zero cross-tenant leakage |
| SEO-C4 | 100% recommendations auditable |
| SEO-C5 | No path from recommendation to live site without approval |

## 11.4 Engineering Sign-Off

A-012 Mission Lead · SEO Architecture Owner · Content module owner · Security Lead · Architecture Review Board.

---

# 12. Executive Recommendation

## 12.1 Implementation Readiness

| Dimension | Status |
|-----------|:------:|
| A-001 Module 4 SEO Engine | ✅ Ratified |
| ES-AURORA-005 through ES-AURORA-009 | ✅ Ratified |
| ES-AURORA-010 (A-012) | ✅ This document |
| GSC connector infrastructure | ⏳ A-016 integration mission |
| Dependency on A-007–A-011 code | ⏳ Implementation first |

**ES-AURORA-010 is complete. A-012 implementation authorized upon A-007–A-011 completion.**

## 12.2 Approval

| Authorization | Status |
|---------------|:------:|
| ES-AURORA-010 SEO Intelligence Engine spec | **✅ RATIFIED** |
| A-012 implementation | **✅ AUTHORIZED** (after A-007–A-011) |
| ES-AURORA-011 Campaign & Planner spec | **✅ AUTHORIZED TO DRAFT** |

## 12.3 Authorize ES-AURORA-011

| Field | Value |
|-------|-------|
| **Next Spec** | ES-AURORA-011 — Campaign & Planner Implementation |
| **Mission** | A-013 — Campaign & Planner Implementation |
| **Dependency** | A-007 · A-008 · A-009 · A-011 · A-012 |
| **Scope** | CampaignService · PlannerService · BudgetService · campaign lifecycle · editorial calendar |

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — SEO Taxonomy

| Category | Subcategories |
|----------|---------------|
| **Keyword** | branded · non-branded · long-tail · local |
| **Intent** | informational · navigational · commercial · transactional · local |
| **Audit** | crawlability · indexability · performance · mobile · structured_data · security |
| **Recommendation** | content · technical · competitive · keyword · linking |
| **SERP Feature** | featured_snippet · paa · video · local_pack · image |

## Appendix B — Keyword Model

```
Keyword
├── id · tenantId · brandId
├── term · locale
├── metrics
│   ├── searchVolume · competition · difficulty · cpc
│   └── intent
├── tracking
│   ├── currentRank · currentUrl · targetUrl
│   └── trackingEnabled
├── grouping
│   └── topicGroupId
├── knowledge
│   └── knowledgeEntityId (KeywordRecord)
└── timestamps
```

## Appendix C — Intent Classification

| Pattern | Intent | Example |
|---------|--------|---------|
| how · what · why · guide | informational | "how to improve SEO" |
| brand name · login | navigational | "acme marketing platform" |
| best · review · vs · compare | commercial | "best email marketing tools" |
| buy · price · discount · order | transactional | "buy marketing automation" |
| near me · [city] · local | local | "seo agency sydney" |

Classifier: rule-based Phase 1 · ML enhancement Phase 2. Confidence ≥ 0.75 for auto-classification.

## Appendix D — Optimization Pipeline

```
Request (content · keyword · audit finding)
    ↓
Gather evidence (GSC · rank · SERP · knowledge · content)
    ↓
KnowledgeRetrievalService.preflight()
    ↓
Compute deterministic scores (SP-5)
    ↓
[If AI needed] Workforce seo.optimize
    ↓
Brand compliance · fact validation
    ↓
Generate SeoRecommendation (rationale · evidence · citations)
    ↓
Human approval (if required)
    ↓
Apply to Content Studio (manual trigger) OR acknowledge technical fix
    ↓
Audit log · learning signal · knowledge sync
```

## Appendix E — Scoring Model

### Content SEO Score (v1.0)

| Dimension | Weight | Max |
|-----------|:------:|:---:|
| Title | 15 | 15 |
| Meta description | 10 | 10 |
| Keyword usage | 20 | 20 |
| Heading structure | 15 | 15 |
| Content length | 10 | 10 |
| Readability | 15 | 15 |
| Internal links | 10 | 10 |
| Image alt text | 5 | 5 |
| **Total** | **100** | **100** |

### Visibility Score (v1.0)

```
visibility = Σ (weight[position] × keyword_priority) / tracked_keywords
weight[1]=100, [2]=85, [3]=75, ... [10]=25, [11-20]=10, [21+]=0
```

### Site Health Score (v1.0)

See §5.2 category weights. Model ID: `site-health-v1.0`.

### Keyword Difficulty (v1.0)

Model ID: `kd-v1.0`. Inputs hashed · formula version stored · regression test fixture required on model change.

### Opportunity Score (v1.0)

Model ID: `opp-v1.0`. See §6.8 formula.

## Appendix F — Implementation Checklist

### Sprint 1 — Keyword Foundation
- [ ] Keyword entity · repository · migration · RLS
- [ ] KeywordService · KeywordGroup
- [ ] SearchIntentEngine
- [ ] KeywordDifficultyScorer
- [ ] Unit tests (35+)

### Sprint 2 — Rank Tracking & GSC
- [ ] RankTrackingService · RankSnapshot
- [ ] WeeklyRankCheckJob
- [ ] GscIngestionService · GscSyncJob
- [ ] GoogleSearchConsoleConnector stub
- [ ] RankingModelService · visibility score

### Sprint 3 — Content Optimization
- [ ] ContentOptimizationService · ContentSeoScorer
- [ ] InternalLinkingEngine · SeoMetadataGenerator
- [ ] SeoContentBriefService
- [ ] Content Studio integration tests

### Sprint 4 — Technical SEO
- [ ] SeoAuditService · audit finding entity
- [ ] SiteHealthScorer · validators (robots · sitemap · schema)
- [ ] MonthlySeoAuditJob
- [ ] Knowledge graph sync for findings

### Sprint 5 — Competitor & AI
- [ ] CompetitorIntelligenceService · gap analysis
- [ ] SeoOptimizationEngine · workforce integration
- [ ] Recommendation entity · approval workflow
- [ ] OpportunityDiscoveryService · OpportunityScanJob

### Sprint 6 — Integration & Certification
- [ ] SeoModuleRuntime · SeoFacadeOperations · wiring
- [ ] Event publishers · PlatformStore persisters
- [ ] SeoWorkspace · Marketing Health hook
- [ ] Tenant isolation · performance tests
- [ ] Coverage ≥ 85% · mission report

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | ES-AURORA-010 — Aurora SEO Intelligence Engine |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Mission** | A-012 — SEO Intelligence Engine |
| **Next Mission** | A-013 — Campaign & Planner (ES-AURORA-011) |

---

*End of ES-AURORA-010*



