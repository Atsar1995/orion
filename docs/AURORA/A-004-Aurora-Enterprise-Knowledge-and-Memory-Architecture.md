# A-004 — Project Aurora Enterprise Knowledge & Memory Architecture

**Document ID:** A-004  
**Program:** Project Aurora — AI Marketing Platform  
**Mission:** A-004 — Aurora Enterprise Knowledge & Memory Architecture  
**Version:** 1.0  
**Status:** Ratified — Authoritative Intelligence Reference  
**Classification:** Knowledge Architecture · Memory Architecture · Enterprise Intelligence  
**Authority:** Founder & Chief Architect · Aurora Architecture Review Board  
**Parent:** [A-001 Aurora Constitution](./A-001-Aurora-Constitution.md) · [A-002 Enterprise Engineering Blueprint](./A-002-Aurora-Enterprise-Engineering-Blueprint.md) · [A-003 AI Workforce Architecture](./A-003-Aurora-AI-Workforce-Architecture.md)  
**Platform Parent:** [ORION Enterprise Platform v2.0](../00_FOUNDATION/ORION_CANON_v1.md)  
**Effective Date:** 7 August 2026  
**Supersedes:** A-003 §6 (Memory Architecture summary) · A-001 §5.14 (Knowledge Base module summary) for knowledge/memory detail  
**Subordinate To:** A-001 Aurora Constitution · ORION Canon v1.0 (platform-wide)

**Rule:** This document is the **authoritative reference for all Aurora intelligence missions**. Every knowledge store, memory tier, retrieval pipeline, learning loop, and agent context assembly must comply with this specification. No agent may retrieve, store, or mutate knowledge outside the boundaries defined herein.

**Scope:** Enterprise knowledge layer · knowledge graph · memory tiers · acquisition · retrieval · learning · governance · ORION integration · service contracts. **No implementation.** **No code.** **No UI.**

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Knowledge Architecture](#2-knowledge-architecture)
3. [Enterprise Knowledge Graph](#3-enterprise-knowledge-graph)
4. [Memory Architecture](#4-memory-architecture)
5. [Knowledge Acquisition](#5-knowledge-acquisition)
6. [Retrieval Architecture](#6-retrieval-architecture)
7. [Learning Architecture](#7-learning-architecture)
8. [Enterprise Governance](#8-enterprise-governance)
9. [ORION Integration](#9-orion-integration)
10. [Knowledge APIs](#10-knowledge-apis)
11. [Roadmap](#11-roadmap)
12. [Executive Closing Statement](#12-executive-closing-statement)

**Appendices:** [A — Knowledge Catalogue](#appendix-a--knowledge-catalogue) · [B — Memory Catalogue](#appendix-b--memory-catalogue) · [C — Knowledge Taxonomy](#appendix-c--knowledge-taxonomy) · [D — Entity Catalogue](#appendix-d--entity-catalogue) · [E — Knowledge Lifecycle](#appendix-e--knowledge-lifecycle) · [F — Mission Register](#appendix-f--mission-register)

---

# Preamble

Intelligence without memory is amnesia.

Memory without knowledge is noise.

Project Aurora must possess **institutional knowledge** — the accumulated understanding of a brand, its customers, its campaigns, its competitors, and its market — that grows continuously through execution, feedback, and executive decision-making.

This is not a document store. This is not a chat history. This is an **Enterprise Knowledge & Memory Architecture** that gives Aurora's AI Workforce the ability to remember, learn, reason, and improve — while remaining governed, auditable, and tenant-isolated.

Every agent in Aurora thinks with context drawn from this architecture. Every campaign enriches it. Every executive decision shapes it. Every customer interaction informs it.

---

# 1. Executive Overview

## 1.1 Purpose

| Field | Definition |
|-------|------------|
| **Document purpose** | Define how Aurora stores, retrieves, shares, protects, and evolves enterprise knowledge and memory |
| **Audience** | AI architects · data architects · engineering leads · Knowledge Manager agent owners · governance |
| **Binding authority** | All knowledge/memory implementations · agent context assembly · learning systems |
| **Deliverable type** | Architecture specification — no implementation |

This document answers:

- What knowledge does Aurora possess and how is it organized?
- How does the Enterprise Knowledge Graph relate entities across domains?
- What memory tiers exist and how do they lifecycle?
- How is knowledge acquired from campaigns, analytics, CRM, and human feedback?
- How do agents retrieve relevant context with confidence and freshness?
- How does Aurora learn continuously without compromising governance?
- How does knowledge integrate with ORION platform services?

## 1.2 Vision

**Aurora possesses institutional marketing intelligence — a living knowledge graph and layered memory system that makes every agent smarter with every campaign, every decision, and every customer interaction.**

| Horizon | Knowledge State |
|---------|----------------|
| **Phase 1** | Brand KB · campaign memory · semantic retrieval · basic learning feedback |
| **Phase 2** | Full knowledge graph · customer memory · cross-domain ORION sync · hybrid search |
| **Phase 3** | Enterprise knowledge federation · predictive knowledge · cross-tenant industry benchmarks (anonymized) |
| **Future** | Unified ORION-Aurora enterprise knowledge graph · cross-product intelligence |

## 1.3 Objectives

| # | Objective | Success Criteria |
|---|-----------|-----------------|
| 1 | **Enterprise Knowledge Layer** | 11 knowledge domains · governed lifecycle · brand-scoped graph |
| 2 | **Memory Architecture** | 10 memory tiers · consolidation · expiration policies |
| 3 | **Knowledge Acquisition** | 9 acquisition channels · validation pipeline |
| 4 | **Retrieval Architecture** | Semantic + hybrid search · confidence · citation |
| 5 | **Learning Architecture** | 9 learning domains · continuous improvement without drift |
| 6 | **Governance** | RBAC · classification · retention · audit · compliance |
| 7 | **ORION Integration** | PlatformStore · Event Bus · CRM · Finance · Executive Provider |
| 8 | **Service Contracts** | Internal API architecture for knowledge and memory services |

## 1.4 Relationship with A-001

| A-001 Element | A-004 Response |
|---------------|----------------|
| §3 Principle VIII — Transparency | Citation strategy · source attribution on all retrieved knowledge |
| §5 Module 12 — Knowledge Base | Expanded into full Enterprise Knowledge Graph (§3) |
| §6 Agent Architecture — context | Retrieval pipeline feeds AgentContextAssembler (§6) |
| §7 Brand memory · KB rules | Brand Memory tier + Brand Knowledge domain (§3 · §4) |
| Appendix A — Knowledge Base glossary | Extended in Appendix C taxonomy |

## 1.5 Relationship with A-002

| A-002 Element | A-004 Response |
|---------------|----------------|
| §3.7 Data Layer — vector store | Knowledge embeddings storage specification (§3) |
| §4.8 Knowledge domain | Expanded entity model · services · repositories |
| §6 AgentContextAssembler | Fed by Retrieval Architecture (§6) |
| §6 AgentMemoryStore | Implements Memory Architecture tiers (§4) |
| §7 Data — KnowledgeEntry entity | Extended in Entity Catalogue (Appendix D) |
| EP-7 — Knowledge informs agents | Enforced via mandatory retrieval pre-flight (§6) |

## 1.6 Relationship with A-003

| A-003 Element | A-004 Response |
|---------------|----------------|
| §6 Memory Architecture (7 tiers) | **Expanded to 10 tiers** · consolidation · expiration (§4) |
| Agent 12 — Knowledge Manager | Primary curator of Enterprise Knowledge Layer |
| §8 Learning System | Expanded into Learning Architecture (§7) |
| Brand memory learning | Detailed in §7.7 Brand Learning |
| Memory isolation rules | Extended in §8 governance |

### Document Hierarchy

```
A-001 Constitution (product supreme)
    ↓
A-003 AI Workforce Architecture (agent supreme)
    ↓
A-004 Knowledge & Memory Architecture (intelligence supreme) ← THIS DOCUMENT
    ↓
A-002 Engineering Blueprint (implementation patterns)
    ↓
ES-AURORA-0xx specifications
    ↓
Implementation
```

## 1.7 Knowledge Philosophy

Aurora knowledge is governed by six philosophical commitments:

| # | Commitment | Meaning |
|---|------------|---------|
| **KP-1** | **Knowledge is institutional** | Aurora remembers what the organization knows — not just conversation history |
| **KP-2** | **Knowledge is earned** | Facts enter the graph through validation — not unconstrained generation |
| **KP-3** | **Knowledge is scoped** | Brand · tenant · classification boundaries are absolute |
| **KP-4** | **Knowledge is fresh** | Stale knowledge is worse than no knowledge — freshness is tracked and enforced |
| **KP-5** | **Knowledge is cited** | Agents attribute sources — executives can verify any claim |
| **KP-6** | **Knowledge grows** | Every campaign · decision · interaction enriches the graph through governed acquisition |

### Knowledge vs. Memory

| Dimension | Knowledge | Memory |
|-----------|-----------|--------|
| **Nature** | Curated facts · relationships · institutional truth | Experiential · temporal · contextual |
| **Governance** | Human-approved · validated · versioned | System-captured · agent-generated · learning-derived |
| **Persistence** | Long-term · indefinite (with review) | Tiered · expiration policies |
| **Retrieval** | Semantic search · graph traversal | Session context · recent history |
| **Example** | "Product X costs $99/month" | "Last campaign for Product X achieved 3.2 ROAS" |
| **Managed by** | Knowledge Manager agent | Orchestrator · Learning System |

---

# 2. Knowledge Architecture

## 2.1 Enterprise Knowledge Layer

The Enterprise Knowledge Layer sits between Aurora's AI Workforce and raw data sources — transforming operational data into structured, retrievable, governed institutional knowledge.

```
┌─────────────────────────────────────────────────────────────┐
│                    Aurora AI Workforce (14 agents)           │
├─────────────────────────────────────────────────────────────┤
│                    Retrieval & Context Assembly (§6)           │
├─────────────────────────────────────────────────────────────┤
│              ENTERPRISE KNOWLEDGE LAYER (THIS SECTION)         │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────────┐   │
│  │ Brand   │ Product │Campaign │Customer │ Competitor  │   │
│  │Knowledge│Knowledge│Knowledge│Knowledge│  Knowledge  │   │
│  ├─────────┼─────────┼─────────┼─────────┼─────────────┤   │
│  │Industry │  SEO    │  Ads    │ Content │   Market    │   │
│  │Knowledge│Knowledge│Knowledge│Knowledge│ Intelligence│   │
│  ├─────────┴─────────┴─────────┴─────────┴─────────────┤   │
│  │              Executive Knowledge                        │   │
│  └───────────────────────────────────────────────────────┘   │
│                    Knowledge Graph (relationships)           │
├─────────────────────────────────────────────────────────────┤
│                    Memory Architecture (§4)                  │
├─────────────────────────────────────────────────────────────┤
│                    Knowledge Acquisition (§5)                │
│  Campaigns · Analytics · CRM · Events · Human · External     │
├─────────────────────────────────────────────────────────────┤
│                    ORION Platform + External Sources         │
└─────────────────────────────────────────────────────────────┘
```

## 2.2 Knowledge Domains

| # | Domain | Codename | Primary Owner | Phase |
|---|--------|----------|---------------|-------|
| 1 | Brand Knowledge | `knowledge.brand` | Knowledge Manager | 1 |
| 2 | Product Knowledge | `knowledge.product` | Knowledge Manager | 1 |
| 3 | Campaign Knowledge | `knowledge.campaign` | Campaign Manager | 1 |
| 4 | Customer Knowledge | `knowledge.customer` | CX Advisor | 2 |
| 5 | Competitor Knowledge | `knowledge.competitor` | Brand Intelligence Manager | 2 |
| 6 | Industry Knowledge | `knowledge.industry` | Brand Intelligence Manager | 2 |
| 7 | SEO Knowledge | `knowledge.seo` | SEO Specialist | 1 |
| 8 | Advertising Knowledge | `knowledge.ads` | Advertising Manager | 2 |
| 9 | Content Knowledge | `knowledge.content` | Content Strategist | 1 |
| 10 | Market Intelligence | `knowledge.market` | Brand Intelligence Manager | 2 |
| 11 | Executive Knowledge | `knowledge.executive` | Executive Advisor | 2 |

## 2.3 Knowledge Services

| Service | Location (planned) | Responsibility |
|---------|-------------------|----------------|
| **KnowledgeService** | `lib/aurora/knowledge/services/` | CRUD · lifecycle · validation |
| **KnowledgeGraphService** | `lib/aurora/knowledge/services/` | Entity relationships · traversal |
| **KnowledgeIngestionService** | `lib/aurora/knowledge/services/` | Acquisition pipeline · normalization |
| **KnowledgeRetrievalService** | `lib/aurora/knowledge/services/` | Search · ranking · context packages |
| **KnowledgeValidationService** | `lib/aurora/knowledge/services/` | Fact checking · staleness · conflict |
| **MemoryService** | `lib/aurora/knowledge/services/` | Memory tier read/write · consolidation |
| **LearningService** | `lib/aurora/knowledge/services/` | Feedback capture · learning loops |
| **EmbeddingService** | `lib/aurora/knowledge/services/` | Vector generation · index management |

### Service Interaction

```
KnowledgeIngestionService
    ↓ (normalize · validate)
KnowledgeValidationService
    ↓ (approve · store)
KnowledgeService + KnowledgeGraphService
    ↓ (embed)
EmbeddingService
    ↓ (index)
KnowledgeRetrievalService
    ↓ (serve)
AgentContextAssembler → Agents
```

## 2.4 Knowledge Ownership

| Domain | Curator Agent | Human Approver | Write Sources |
|--------|--------------|----------------|---------------|
| Brand | Knowledge Manager | Brand Manager | Human upload · Brand Manager edit |
| Product | Knowledge Manager | Brand Manager | Human upload · Shopify sync |
| Campaign | Campaign Manager | Marketing Director | System (post-campaign) · agents |
| Customer | CX Advisor | Marketing Director | CRM sync · agent analysis |
| Competitor | Brand Intelligence Manager | Brand Manager | Agent monitoring · human validation |
| Industry | Brand Intelligence Manager | CMO | External feeds · human curation |
| SEO | SEO Specialist | Channel Manager | Search Console sync · agent audits |
| Advertising | Advertising Manager | Marketing Director | Ad platform sync · agent analysis |
| Content | Content Strategist | Content Creator | Published content · performance data |
| Market | Brand Intelligence Manager | CMO | Agent intelligence · external data |
| Executive | Executive Advisor | CEO · CMO | Executive decisions · strategic directives |

### Ownership Rules

| Rule | Description |
|------|-------------|
| **KO-1** | Every knowledge entity has exactly one curator agent |
| **KO-2** | Human approval required before agent-consumed promotion to `validated` status |
| **KO-3** | System-generated knowledge starts as `provisional` — never directly `validated` |
| **KO-4** | Curator agent responsible for staleness review of owned domain |
| **KO-5** | Cross-domain relationships require both domain curators' consistency |

## 2.5 Knowledge Lifecycle

```
┌──────────┐    ┌─────────────┐    ┌──────────┐    ┌──────────┐
│ ACQUIRED │───→│ PROVISIONAL │───→│ VALIDATED│───→│ ARCHIVED │
└──────────┘    └─────────────┘    └────┬─────┘    └──────────┘
                         │               │               ↑
                         │          ┌────▼─────┐         │
                         └─────────→│ DEPRECATED│────────┘
                                    └──────────┘
                         ┌──────────┐
                         │ REJECTED │ (terminal)
                         └──────────┘
```

| State | Meaning | Agent Retrieval | Human Action Required |
|-------|---------|:-----------------:|:--------------------:|
| **acquired** | Raw ingestion · not processed | ❌ | Processing |
| **provisional** | Processed · awaiting validation | ⚠️ Low confidence only | Review |
| **validated** | Approved for agent consumption | ✅ | Periodic review |
| **deprecated** | Superseded · retained for history | ⚠️ Historical context only | Archive decision |
| **archived** | Inactive · retained per policy | ❌ | Restore or delete |
| **rejected** | Invalid · not stored in active graph | ❌ | None |

## 2.6 Knowledge Governance

| Governance Control | Implementation |
|--------------------|---------------|
| **Classification** | Public · internal · confidential · restricted (§8.4) |
| **Approval workflow** | Curator review → human approval for `validated` promotion |
| **Version control** | Full version history on all knowledge entities |
| **Staleness policy** | 90-day review cycle · auto-flag · curator notification |
| **Conflict resolution** | KnowledgeValidationService · human arbitration |
| **Audit trail** | Every state transition logged immutably |
| **Deletion policy** | Soft delete · 30-day recovery · hard delete requires admin |
| **Export** | GDPR-compliant export per tenant · brand |

---

# 3. Enterprise Knowledge Graph

The Enterprise Knowledge Graph (EKG) models entities and relationships across all eleven knowledge domains — enabling agents to reason about connections, not just retrieve isolated facts.

## 3.1 Graph Architecture

```
                    ┌──────────────┐
                    │    Brand     │
                    └──────┬───────┘
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Product  │   │ Campaign │   │ Customer │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         ↓              ↓              ↓
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Content  │   │   Ads    │   │   SEO    │
    └──────────┘   └──────────┘   └──────────┘
         │              │              │
         └──────────────┼──────────────┘
                        ↓
                 ┌──────────┐
                 │Competitor│
                 └──────────┘
```

### Graph Storage Model

| Component | Storage | Purpose |
|-----------|---------|---------|
| **Entities** | PostgreSQL `aurora_knowledge_entity` | Node properties |
| **Relationships** | PostgreSQL `aurora_knowledge_relationship` | Edge properties |
| **Embeddings** | pgvector `aurora_knowledge_embedding` | Semantic search |
| **Full-text index** | PostgreSQL tsvector | Keyword search |
| **Graph metadata** | JSONB on entities | Domain-specific attributes |

## 3.2 Brand Knowledge

**Domain:** `knowledge.brand` · **Curator:** Knowledge Manager

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `BrandProfile` | voice · tone · personality · values | → Product · Content · Campaign |
| `BrandGuideline` | rule type · content · effective date | → BrandProfile |
| `VisualIdentity` | colors · fonts · logo rules · imagery style | → BrandProfile |
| `MessagingPillar` | theme · key messages · prohibited topics | → BrandProfile |
| `ApprovalPolicy` | content types · chain · thresholds | → BrandProfile |

### Brand Knowledge Rules

1. Brand knowledge is the highest-priority context in retrieval ranking
2. Agent-generated content must score ≥ 80% brand alignment against BrandProfile
3. Brand guideline changes create new version — previous version deprecated, not deleted
4. Prohibited topics enforced at retrieval AND generation guardrails

## 3.3 Product Knowledge

**Domain:** `knowledge.product` · **Curator:** Knowledge Manager

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `Product` | name · description · pricing · USPs · category | → Brand · Content · Campaign |
| `ProductFeature` | feature · benefit · proof point | → Product |
| `ProductPricing` | tier · price · currency · billing cycle | → Product |
| `ProductAudience` | segment · use case · pain point | → Product · Customer |

### Product Knowledge Acquisition

| Source | Sync Frequency | Validation |
|--------|---------------|------------|
| Manual upload | On upload | Brand Manager approval |
| Shopify/WooCommerce | Daily | Auto-provisional · Brand Manager review |
| CRM product catalog | Weekly | Auto-provisional |
| Agent extraction from content | On publish | Knowledge Manager review |

## 3.4 Campaign Knowledge

**Domain:** `knowledge.campaign` · **Curator:** Campaign Manager

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `CampaignRecord` | objective · budget · channels · outcome · ROAS | → Brand · Product · Content · Ads |
| `CampaignLesson` | what worked · what failed · context · confidence | → CampaignRecord |
| `ChannelPerformance` | channel · metrics · period · benchmark | → CampaignRecord |
| `OptimizationRecord` | action · before · after · impact | → CampaignRecord |

### Campaign Knowledge Lifecycle

Campaign knowledge is **automatically acquired** post-campaign completion:

```
Campaign completed
    ↓
Campaign Manager generates CampaignRecord + CampaignLesson
    ↓
Status: provisional
    ↓
Analytics Manager validates metrics accuracy
    ↓
Knowledge Manager reviews for graph consistency
    ↓
Marketing Director approves promotion (or auto-approve if ROAS > goal)
    ↓
Status: validated → available for future campaign planning
```

## 3.5 Customer Knowledge

**Domain:** `knowledge.customer` · **Curator:** Customer Experience Advisor · **Phase:** 2

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `CustomerSegment` | name · criteria · size · CLV · characteristics | → Brand · Campaign |
| `CustomerPersona` | demographics · pain points · preferences · journey stage | → Brand · Product |
| `EngagementPattern` | channel · frequency · sentiment · trend | → CustomerSegment |
| `RetentionInsight` | trigger · action · outcome · period | → CustomerSegment · Campaign |

### Customer Knowledge Privacy

| Rule | Description |
|------|-------------|
| **CK-1** | No PII stored in knowledge graph — segments and personas only |
| **CK-2** | Individual customer data remains in CRM · referenced by ID only |
| **CK-3** | Aggregated patterns only · minimum segment size: 10 individuals |
| **CK-4** | GDPR right to deletion propagates to derived customer knowledge |
| **CK-5** | Customer knowledge classification: confidential minimum |

## 3.6 Competitor Knowledge

**Domain:** `knowledge.competitor` · **Curator:** Brand Intelligence Manager · **Phase:** 2

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `Competitor` | name · positioning · strengths · weaknesses · URL | → Brand · Industry |
| `CompetitorCampaign` | channel · messaging · estimated spend · period | → Competitor |
| `CompetitorContent` | type · topic · performance estimate · date | → Competitor |
| `CompetitiveGap` | area · our position · their position · opportunity | → Competitor · Brand |

## 3.7 Industry Knowledge

**Domain:** `knowledge.industry` · **Curator:** Brand Intelligence Manager · **Phase:** 2

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `IndustryTrend` | trend · evidence · impact · timeframe | → Industry · Brand |
| `Regulation` | jurisdiction · requirement · effective date · impact | → Industry |
| `SeasonalPattern` | event · period · marketing implication | → Industry · Campaign |
| `BenchmarkMetric` | metric · industry median · percentile · source | → Industry |

## 3.8 SEO Knowledge

**Domain:** `knowledge.seo` · **Curator:** SEO Specialist · **Phase:** 1

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `KeywordRecord` | term · volume · difficulty · current rank · trend | → Brand · Content · Product |
| `SeoAuditFinding` | url · issue · severity · recommendation · status | → Brand |
| `RankingHistory` | keyword · rank · date · url | → KeywordRecord |
| `ContentSeoScore` | contentId · score · factors · date | → Content · KeywordRecord |

## 3.9 Advertising Knowledge

**Domain:** `knowledge.ads` · **Curator:** Advertising Manager · **Phase:** 2

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `AudienceProfile` | platform · demographics · interests · performance | → Campaign · Brand |
| `AdCreativePattern` | format · attributes · performance · channel | → Campaign · Content |
| `BidStrategyRecord` | strategy · channel · outcome · context | → Campaign |
| `PlatformInsight` | platform · feature · recommendation · date | → Brand |

## 3.10 Content Knowledge

**Domain:** `knowledge.content` · **Curator:** Content Strategist · **Phase:** 1

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `ContentPattern` | type · attributes · engagement score · channel | → Brand · Campaign |
| `TopicCluster` | theme · keywords · content count · performance | → Brand · SEO |
| `ContentPillar` | pillar · subtopics · target audience | → Brand · ContentStrategist plan |
| `RepurposingMap` | source content · derived content · channels | → Content |

## 3.11 Market Intelligence

**Domain:** `knowledge.market` · **Curator:** Brand Intelligence Manager · **Phase:** 2

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `MarketSignal` | signal · source · confidence · date · impact | → Brand · Industry · Competitor |
| `MarketOpportunity` | opportunity · evidence · estimated impact · priority | → Brand |
| `ThreatAssessment` | threat · severity · mitigation · status | → Brand · Competitor |

## 3.12 Executive Knowledge

**Domain:** `knowledge.executive` · **Curator:** Executive Advisor · **Phase:** 2

| Entity Type | Key Attributes | Relationships |
|-------------|---------------|---------------|
| `StrategicDirective` | directive · author · date · scope · status | → Brand · Campaign |
| `ExecutiveDecision` | decision · rationale · outcome · date | → Brand · Campaign |
| `BudgetAllocation` | period · channel · amount · rationale | → Brand · Campaign |
| `PerformanceReview` | period · summary · actions · date | → Brand |

### Executive Knowledge Rules

1. Executive decisions are immutable once recorded
2. Strategic directives override conflicting agent recommendations
3. Executive knowledge classification: confidential minimum
4. Only Executive Advisor and human executives can write executive knowledge

## 3.13 Relationship Mapping

### Core Relationship Types

| Relationship | From → To | Cardinality | Example |
|-------------|-----------|-------------|---------|
| `belongs_to_brand` | Any entity → BrandProfile | N:1 | Product → Brand |
| `promotes_product` | Campaign → Product | N:M | Summer Sale → Product X |
| `targets_segment` | Campaign → CustomerSegment | N:M | Email campaign → VIP customers |
| `competes_with` | Brand → Competitor | N:M | Our brand → Competitor A |
| `ranks_for` | Content → KeywordRecord | N:M | Blog post → "AI marketing" |
| `derived_from` | Content → Content | N:1 | Social post → Blog post |
| `outperforms` | CampaignRecord → CampaignRecord | N:1 | Campaign B beat Campaign A |
| `informed_by` | Campaign → CampaignLesson | 1:N | Q3 campaign → 3 lessons |
| `responds_to` | Campaign → MarketSignal | N:M | Response campaign → competitor launch |
| `implements` | Campaign → StrategicDirective | N:1 | Campaign → CEO directive |

### Graph Traversal Rules

| Rule | Description |
|------|-------------|
| **GT-1** | Traversal scoped to brand_id — never cross-brand |
| **GT-2** | Maximum traversal depth: 3 hops from query entity |
| **GT-3** | Only `validated` entities included in agent retrieval |
| **GT-4** | Relationship weights decay with entity age (configurable half-life) |
| **GT-5** | Executive knowledge relationships take priority in conflict |

## 3.14 Knowledge Graph Query Patterns

| Query Pattern | Use Case | Example |
|---------------|----------|---------|
| **Brand-centric** | Any agent task | All knowledge for Brand X |
| **Campaign-centric** | Campaign planning/ review | Campaign → lessons → related content |
| **Product-centric** | Content · ads generation | Product → features → audience → content |
| **Competitor-centric** | Competitive response | Competitor → campaigns → gaps → opportunities |
| **Performance-centric** | Optimization | Top campaigns → lessons → patterns |
| **Temporal** | Seasonal planning | Historical memory → seasonal patterns → industry |
| **Cross-domain** | Executive briefing | Executive + campaign + market + customer |

## 3.15 Knowledge Quality Dimensions

| Dimension | Metric | Target | Measured By |
|-----------|--------|:------:|-------------|
| **Accuracy** | Validated entity rate | > 90% | Knowledge Manager |
| **Completeness** | Domain coverage score | > 80% | Gap analysis per brand |
| **Freshness** | Entities reviewed within 90d | > 85% | Staleness job |
| **Consistency** | Conflict rate | < 2% | Validation service |
| **Retrieval relevance** | Avg retrieval score | > 0.80 | Retrieval audit |
| **Usage effectiveness** | Knowledge used in approved outputs | > 70% | Learning system |
| **Graph connectivity** | Avg relationships per entity | > 3 | Graph analytics |

## 3.16 Knowledge Domain Maturity Model

| Level | Description | Phase 1 | Phase 2 | Phase 3 |
|-------|-------------|:-------:|:-------:|:-------:|
| **L0 — Absent** | No data in domain | — | — | — |
| **L1 — Seed** | Manual upload · basic entries | Brand · Product · SEO · Content | + Customer · Competitor | All domains |
| **L2 — Connected** | Integration sync · auto-acquisition | Campaign | + Ads · Industry · Market | Federation |
| **L3 — Intelligent** | Agent-curated · learning-enriched | Brand memory learning | Full learning loops | Predictive |
| **L4 — Predictive** | Proactive enrichment · forecasting | — | — | Cross-domain AI |

---

# 4. Memory Architecture

Memory is experiential and temporal — distinct from curated knowledge. Aurora operates ten memory tiers, each with defined scope, retention, and consolidation rules.

## 4.1 Memory Tier Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 1 — Working Memory          Redis · seconds-minutes    │
├─────────────────────────────────────────────────────────────┤
│  Tier 2 — Session Memory          Redis · 24 hours           │
├─────────────────────────────────────────────────────────────┤
│  Tier 3 — Campaign Memory         PostgreSQL · campaign +90d │
├─────────────────────────────────────────────────────────────┤
│  Tier 4 — Business Memory         PostgreSQL · tenant life   │
├─────────────────────────────────────────────────────────────┤
│  Tier 5 — Brand Memory            PostgreSQL · brand life    │
├─────────────────────────────────────────────────────────────┤
│  Tier 6 — Customer Memory         PostgreSQL · CRM-synced    │
├─────────────────────────────────────────────────────────────┤
│  Tier 7 — Executive Memory        PostgreSQL · indefinite    │
├─────────────────────────────────────────────────────────────┤
│  Tier 8 — Learning Memory         PostgreSQL · indefinite      │
├─────────────────────────────────────────────────────────────┤
│  Tier 9 — Historical Memory       PostgreSQL · 7 years         │
├─────────────────────────────────────────────────────────────┤
│  Tier 10 — Long-Term Memory       PostgreSQL · indefinite      │
└─────────────────────────────────────────────────────────────┘
         ↑ Consolidation flows upward periodically ↑
```

## 4.2 Tier 1 — Working Memory

| Field | Specification |
|-------|---------------|
| **Storage** | Redis · in-process cache |
| **Retention** | Task duration · max 30 minutes |
| **Scope** | Single agent task execution |
| **Contents** | Intermediate reasoning · partial outputs · temp calculations |
| **Max size** | 2,000 tokens |
| **Access** | Current agent task only |
| **Eviction** | On task completion or timeout |

## 4.3 Tier 2 — Session Memory

| Field | Specification |
|-------|---------------|
| **Storage** | Redis |
| **Retention** | 24 hours · or explicit session end |
| **Scope** | Agent session · correlation ID |
| **Contents** | Conversation turns · delegation chain · decisions made |
| **Max size** | 4,000 tokens per session |
| **Access** | All agents in same session |
| **Eviction** | TTL · session end · daily cleanup job |

### Session Memory Schema

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | UUID | Session correlation |
| `agent_codename` | string | Active agent |
| `turn_index` | integer | Conversation turn |
| `role` | enum | user · agent · system |
| `content_summary` | text | Turn summary (not full prompt) |
| `confidence` | decimal | Agent confidence if applicable |
| `timestamp` | timestamp | Turn time |

## 4.4 Tier 3 — Campaign Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_campaign` |
| **Retention** | Active campaign + 90 days post-completion |
| **Scope** | Per campaign · brand-scoped |
| **Contents** | Agent decisions · A/B results · optimization actions · KPI snapshots |
| **Access** | Campaign Manager · Analytics Manager · Marketing Director |
| **Consolidation** | Campaign lessons → Campaign Knowledge graph (§3.4) |

## 4.5 Tier 4 — Business Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_business` |
| **Retention** | Tenant/business entity lifetime |
| **Scope** | Per business entity |
| **Contents** | Strategic goals · quarterly plans · budget decisions · team directives |
| **Access** | Marketing Director · Executive Advisor |
| **Consolidation** | Strategic patterns → Long-Term Memory (annual) |

## 4.6 Tier 5 — Brand Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_brand` |
| **Retention** | Brand lifetime |
| **Scope** | Per brand · strictly isolated |
| **Contents** | Voice corrections · style preferences · approved/rejected patterns · human edit diffs |
| **Access** | All brand-scoped agents · Knowledge Manager |
| **Consolidation** | Stable preferences → Brand Knowledge graph (§3.2) |

### Brand Memory Learning Example

```
Event: Human edits Copywriter output
  "Replace 'cutting-edge' with 'trusted'"
    ↓
Brand Memory entry:
  { type: "voice_preference", avoid: ["cutting-edge"], prefer: ["trusted"],
    context: "brand_voice", confidence: 0.9, source: "human_correction" }
    ↓
Future retrieval: Brand Memory injected into Copywriter context
    ↓
After 5 consistent confirmations → Learning System proposes Brand Knowledge update
```

## 4.7 Tier 6 — Customer Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_customer` · CRM-synced |
| **Retention** | Per CRM retention policy · min 2 years |
| **Scope** | Per customer segment (not individual PII) |
| **Contents** | Engagement patterns · segment migration · response patterns · CLV trends |
| **Access** | CX Advisor · Sales Intelligence Advisor · Analytics Manager |
| **Consolidation** | Segment patterns → Customer Knowledge graph (§3.5) |

## 4.8 Tier 7 — Executive Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_executive` |
| **Retention** | Indefinite |
| **Scope** | Per tenant · per executive role |
| **Contents** | Decision history · preference patterns · briefing interactions · override reasons |
| **Access** | Executive Advisor · Marketing Director (summary only) |
| **Classification** | Confidential minimum |
| **Consolidation** | Decisions → Executive Knowledge graph (§3.12) |

## 4.9 Tier 8 — Learning Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_learning` |
| **Retention** | Indefinite |
| **Scope** | Per brand · per agent codename |
| **Contents** | Feedback signals · outcome correlations · preference weights · model adjustment history |
| **Access** | Learning System · Knowledge Manager |
| **Consolidation** | Validated patterns → Long-Term Memory · Knowledge graph |

### Learning Memory Signal Types

| Signal | Weight | Source |
|--------|--------|--------|
| Human approval | +1.0 | Approval Engine |
| Human rejection | -1.0 | Approval Engine |
| Human edit (minor) | +0.3 | Diff analysis |
| Human edit (major) | -0.5 | Diff analysis |
| Campaign KPI met | +0.8 | Analytics Manager |
| Campaign KPI missed | -0.6 | Analytics Manager |
| Executive acceptance | +1.0 | Executive Advisor |
| Executive override | -0.8 | Executive Memory |

## 4.10 Tier 9 — Historical Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_historical` · partitioned by year |
| **Retention** | 7 years (enterprise) · 3 years (professional) · 1 year (starter) |
| **Scope** | Per brand |
| **Contents** | Archived campaign memory · deprecated knowledge · past season patterns |
| **Access** | Analytics Manager · Executive Advisor (read-only) |
| **Purpose** | Year-over-year comparison · seasonal planning · compliance |

## 4.11 Tier 10 — Long-Term Memory

| Field | Specification |
|-------|---------------|
| **Storage** | PostgreSQL `aurora_memory_longterm` |
| **Retention** | Indefinite |
| **Scope** | Per brand · per domain |
| **Contents** | Proven strategies · validated patterns · seasonal baselines · industry-adjusted benchmarks |
| **Access** | Marketing Director · Executive Advisor · Analytics Manager |
| **Updated by** | Monthly consolidation job |

## 4.12 Memory Lifecycle

```
CREATE (event-triggered)
    ↓
ACTIVE (in use by agents)
    ↓
    ├── CONSOLIDATE (patterns extracted → knowledge/long-term)
    ├── REFRESH (updated with new data)
    └── DECAY (relevance weight decreases over time)
    ↓
EXPIRE (retention policy reached)
    ↓
ARCHIVE (historical memory) or PURGE (with audit)
```

## 4.13 Memory Expiration

| Tier | Default Retention | Configurable | Purge Policy |
|------|-------------------|:------------:|--------------|
| Working | 30 min | No | Immediate |
| Session | 24h | Yes (4h–7d) | TTL auto |
| Campaign | Campaign + 90d | Yes | Consolidate then purge |
| Business | Tenant lifetime | No | On tenant deletion |
| Brand | Brand lifetime | No | On brand deletion + 30d |
| Customer | CRM policy | Yes | GDPR-driven |
| Executive | Indefinite | No | Manual admin only |
| Learning | Indefinite | No | Manual reset available |
| Historical | 1–7 years | Yes (by tier) | Partition drop |
| Long-Term | Indefinite | No | Manual review |

## 4.14 Memory Consolidation

| Source Tier | Target | Trigger | Frequency |
|-------------|--------|---------|-----------|
| Session | — | — | Expires · not consolidated |
| Campaign | Campaign Knowledge + Long-Term | Campaign completed | Per campaign |
| Brand | Brand Knowledge | 5+ consistent signals | Weekly job |
| Customer | Customer Knowledge | Segment pattern stable | Monthly job |
| Executive | Executive Knowledge | Decision recorded | Immediate |
| Learning | Long-Term + Knowledge | Signal weight > threshold | Bi-weekly job |
| Historical | Long-Term (summaries) | Annual review | Yearly job |

### Consolidation Rules

| Rule | Description |
|------|-------------|
| **MC-1** | Consolidation never deletes source memory until retention expires |
| **MC-2** | Consolidated knowledge enters graph as `provisional` — requires validation |
| **MC-3** | Minimum sample size before consolidation: 3 signals (learning) · 1 campaign (campaign) |
| **MC-4** | Consolidation jobs are idempotent |
| **MC-5** | Failed consolidation retried 3× · alert on failure |

---

# 5. Knowledge Acquisition

## 5.1 Acquisition Architecture

```
External Sources ──┐
ORION Domains ─────┤
Campaign Execution ├──→ Acquisition Pipeline ──→ Validation ──→ Knowledge Graph
Human Input ───────┤                              ↑
Operational Events ┘                         Memory Tiers
```

## 5.2 Campaign Results

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Final KPIs · ROAS · CPA | Campaign Knowledge | `aurora.campaign.completed` |
| Channel breakdown | Campaign Knowledge + Campaign Memory | Campaign completion |
| A/B test outcomes | Campaign Knowledge + Learning Memory | Test conclusion |
| Budget utilization | Campaign Memory + Executive Knowledge | Campaign completion |
| Agent decisions during campaign | Campaign Memory | Continuous |

## 5.3 Website Analytics

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Traffic trends | SEO Knowledge + Content Knowledge | Daily sync |
| Conversion rates | Campaign Knowledge · Customer Memory | Daily sync |
| Landing page performance | Content Knowledge | Weekly aggregation |
| Bounce rate changes | SEO Knowledge | Anomaly detection |

## 5.4 SEO Performance

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Keyword rankings | SEO Knowledge | Weekly rank check |
| Search Console queries | SEO Knowledge | Daily sync |
| Audit findings | SEO Knowledge | Scheduled audit |
| Content SEO scores | Content Knowledge | On content publish |

## 5.5 Advertising Performance

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Audience performance | Advertising Knowledge | Hourly sync |
| Creative performance | Advertising Knowledge + Content Knowledge | Daily sync |
| Bid strategy outcomes | Advertising Knowledge + Learning Memory | Optimization event |
| Platform changes | Advertising Knowledge | Platform notification |

## 5.6 CRM Signals

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Lead source attribution | Campaign Knowledge | CRM event |
| Segment migration | Customer Memory | Weekly aggregation |
| Pipeline influence | Executive Knowledge | Weekly report |
| MQL-to-SQL conversion | Customer Knowledge + Learning Memory | Monthly analysis |

## 5.7 Executive Decisions

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Budget approvals | Executive Knowledge + Business Memory | Approval event |
| Strategy changes | Executive Knowledge + Business Memory | Human input |
| Override reasons | Executive Memory + Learning Memory | Override event |
| Directive issuance | Executive Knowledge | Human input |

## 5.8 Human Feedback

| Data Captured | Destination | Trigger |
|---------------|-------------|---------|
| Content edits | Brand Memory + Learning Memory | Edit event |
| Approval/rejection | Learning Memory | Approval event |
| KB corrections | Brand Knowledge (after validation) | Knowledge Manager review |
| Agent rating | Learning Memory | User feedback |

## 5.9 Operational Events

| Event | Knowledge Impact |
|-------|-----------------|
| `aurora.content.published` | Content Knowledge updated |
| `aurora.integration.connected` | Platform capability knowledge updated |
| `aurora.agent.recommendation` | Learning Memory signal (if acted upon) |
| `aurora.analytics.anomaly.detected` | Market Intelligence provisional entry |
| `aurora.budget.threshold.exceeded` | Executive Memory + Campaign Memory |

## 5.10 External Sources

| Source | Phase | Destination | Sync |
|--------|-------|-------------|------|
| Google Search Console | 1 | SEO Knowledge | Daily |
| Google Analytics | 1 | Content · SEO Knowledge | Daily |
| Google Ads | 2 | Advertising Knowledge | Hourly |
| Meta Ad Library | 2 | Competitor Knowledge | Weekly |
| Industry reports (upload) | 2 | Industry Knowledge | On upload |
| Shopify product catalog | 2 | Product Knowledge | Daily |
| ORION CRM | 2 | Customer Knowledge | Event-driven |
| ORION Finance | 3 | Executive Knowledge | Weekly |

## 5.11 Knowledge Validation

### Validation Pipeline

```
Acquired Data
    ↓
1. Schema validation (structure · required fields)
    ↓
2. Source trust scoring (human > system > agent > external)
    ↓
3. Consistency check (against existing graph · conflict detection)
    ↓
4. Freshness assessment (timestamp · source reliability)
    ↓
5. Classification assignment (public · internal · confidential)
    ↓
6. Curator agent review (automated pre-screen)
    ↓
7. Human approval (for validated promotion)
    ↓
Knowledge Graph (validated) or Rejected
```

### Source Trust Hierarchy

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

## 5.12 Acquisition Field Mapping — Campaign Completion

| Source Field | Target Entity | Target Attribute |
|-------------|---------------|------------------|
| `campaign.id` | CampaignRecord | `campaignId` |
| `campaign.objective` | CampaignRecord | `objective` |
| `campaign.budget_spent` | CampaignRecord | `totalSpend` |
| `campaign.revenue` | CampaignRecord | `revenue` |
| `campaign.roas` | CampaignRecord | `roas` |
| `analytics.by_channel` | ChannelPerformance | per-channel metrics |
| `agent.decisions[]` | Campaign Memory | decision log |
| `ab_tests[].winner` | CampaignLesson | `whatWorked` |
| `ab_tests[].loser` | CampaignLesson | `whatFailed` |
| `optimization.actions[]` | OptimizationRecord | action history |

## 5.13 Acquisition Field Mapping — CRM Sync

| CRM Field | Target Entity | Privacy Transform |
|-----------|---------------|-------------------|
| `lead.source` | CampaignRecord | Aggregate only |
| `lead.campaign_id` | Campaign Knowledge link | ID reference |
| `segment.name` | CustomerSegment | No PII |
| `segment.size` | CustomerSegment | Count only · min 10 |
| `segment.avg_clv` | CustomerSegment | Aggregated metric |
| `pipeline.stage_counts` | Executive Knowledge | Aggregated |
| `conversion.rate_by_source` | CampaignLesson | Statistical aggregate |

## 5.14 Acquisition Rate Limits

| Source | Max Ingestions/Hour/Tenant | Burst |
|--------|:--------------------------:|:-----:|
| Campaign completion | 50 | 10 |
| Analytics sync | 24 | 4 |
| CRM events | 1,000 | 100 |
| Human upload | 100 | 20 |
| Agent provisional | 500 | 50 |
| External feed | 60 | 10 |
| Embedding generation | 200 | 30 |

---

## 6.1 Retrieval Pipeline

Every agent invocation **must** pass through the retrieval pipeline before LLM inference (EP-7 from A-002).

```
Agent Task Received
    ↓
1. Parse task type · identify required knowledge domains
    ↓
2. Assemble retrieval query (task + brand + campaign context)
    ↓
3. Hybrid search (semantic + keyword + graph traversal)
    ↓
4. Rank and filter results (freshness · trust · relevance)
    ↓
5. Confidence scoring on retrieved set
    ↓
6. Conflict detection and resolution
    ↓
7. Build Context Package (max 3,000 tokens knowledge budget)
    ↓
8. Attach citations metadata
    ↓
9. Inject into agent prompt
    ↓
Agent LLM Inference
```

## 6.2 Context Assembly

### Context Package Structure

| Layer | Max Tokens | Priority | Source |
|-------|:----------:|:--------:|--------|
| Brand context | 600 | 1 (highest) | Brand Knowledge + Brand Memory |
| Task-specific knowledge | 800 | 2 | Domain knowledge per task type |
| Campaign context | 400 | 3 | Campaign Knowledge + Campaign Memory |
| Related graph entities | 500 | 4 | Graph traversal (max 3 hops) |
| Learning preferences | 300 | 5 | Brand Memory + Learning Memory |
| Session history | 400 | 6 | Session Memory |
| **Total budget** | **3,000** | | Hard limit |

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

## 6.3 Semantic Retrieval

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Embedding model** | Configurable (OpenAI · Cohere) | Vector generation |
| **Vector store** | pgvector | Similarity search |
| **Chunk size** | 512 tokens | Document splitting |
| **Top-K** | 10 (pre-rank) | Initial retrieval |
| **Similarity threshold** | 0.75 minimum | Relevance cutoff |

## 6.4 Hybrid Search

| Method | Weight | Use Case |
|--------|:------:|----------|
| **Semantic (vector)** | 50% | Conceptual similarity · paraphrase |
| **Keyword (tsvector)** | 25% | Exact terms · product names · keywords |
| **Graph traversal** | 15% | Related entities · relationship context |
| **Memory lookup** | 10% | Recent preferences · session context |

### Hybrid Search Formula

```
final_score = (0.50 × semantic_score)
            + (0.25 × keyword_score)
            + (0.15 × graph_proximity_score)
            + (0.10 × memory_relevance_score)
            × freshness_multiplier
            × trust_multiplier
```

## 6.5 Ranking

| Rank Factor | Weight | Description |
|-------------|:------:|-------------|
| Relevance score | 35% | Hybrid search composite |
| Freshness | 20% | Recency decay function |
| Source trust | 20% | Source trust hierarchy (§5.11) |
| Validation status | 15% | `validated` > `provisional` |
| Usage frequency | 10% | Retrieval count in successful outcomes |

### Freshness Decay

| Age | Multiplier |
|-----|:----------:|
| < 7 days | 1.00 |
| 7–30 days | 0.95 |
| 30–90 days | 0.85 |
| 90–180 days | 0.70 |
| 180–365 days | 0.50 |
| > 365 days | 0.30 (flag for review) |

## 6.6 Confidence Scoring

| Retrieved Set Quality | Confidence | Agent Action |
|----------------------|:----------:|--------------|
| ≥ 5 validated results · avg relevance > 0.85 | High | Proceed normally |
| 3–4 results · avg relevance > 0.75 | Medium | Proceed · note gaps |
| 1–2 results · relevance > 0.70 | Low | Proceed · flag uncertainty |
| 0 relevant results | Insufficient | Escalate · do not fabricate |

**Constitutional rule:** Agents must never invent facts when retrieval confidence is Insufficient. Response must state knowledge gap and recommend KB enrichment.

## 6.7 Knowledge Freshness

| Check | Action |
|-------|--------|
| Entity age > 90 days without review | Flag stale · reduce ranking · notify Knowledge Manager |
| Entity age > 180 days | Exclude from retrieval unless explicitly requested |
| Source integration offline > 48h | Mark dependent knowledge as potentially stale |
| Conflict between stale and fresh | Prefer fresh · flag conflict for review |

## 6.8 Conflict Resolution

| Conflict Type | Resolution |
|---------------|------------|
| Same entity · different values | Prefer higher trust source · prefer newer · flag for curator |
| Brand guideline vs. agent suggestion | Brand guideline wins always |
| Executive directive vs. agent recommendation | Executive directive wins always |
| Campaign lesson vs. current data | Current data wins · lesson marked contextual |
| Provisional vs. validated | Validated wins · provisional queued for review |

## 6.9 Citation Strategy

Every agent output that uses retrieved knowledge includes citation metadata:

```typescript
interface KnowledgeCitation {
  entityId: string;
  domain: string;
  entityType: string;
  title: string;
  trustScore: number;
  freshness: ISO8601;
  validationStatus: 'validated' | 'provisional';
  excerptHash: string;  // Not full content — audit reference
}
```

| Display Level | Audience | Citation Detail |
|---------------|----------|-----------------|
| **Internal** | Agents | Full citation metadata in context |
| **Operator** | Marketing team | Source list on agent output panel |
| **Executive** | C-suite | Summary attribution in briefings |
| **Audit** | Compliance | Full retrieval log with entity IDs |

## 6.10 Agent-Specific Retrieval Profiles

| Agent | Primary Retrieval Domains | Memory Tiers | Min Confidence | Special Rules |
|-------|--------------------------|--------------|:--------------:|---------------|
| Marketing Director | Campaign · Brand · Executive · Market | Campaign · Business · Session | Medium | Cross-domain aggregation |
| Executive Advisor | Executive · Campaign · Market · Customer | Executive · Long-Term | High | Confidential classification filter |
| Content Strategist | Content · Brand · SEO · Product | Brand · Session | Medium | Topic cluster priority |
| Copywriter | Brand · Product · Content · SEO | Brand · Learning · Session | High | Brand voice mandatory |
| Creative Director | Brand · Content · Advertising | Brand · Session | High | Visual identity mandatory |
| SEO Specialist | SEO · Content · Industry | Campaign · Long-Term | Medium | Ranking history depth: 90d |
| Advertising Manager | Advertising · Campaign · Customer · Competitor | Campaign · Learning | Medium | Audience profile priority |
| Campaign Manager | Campaign · Advertising · Analytics | Campaign · Business | High | Active campaign focus |
| Social Media Manager | Brand · Content · Customer | Brand · Session | Medium | Channel-specific content patterns |
| Analytics Manager | Campaign · Content · Advertising · Customer | All read tiers | High | Deterministic metrics only |
| Brand Intelligence Manager | Competitor · Market · Industry · Brand | Long-Term · Historical | Medium | External source trust weighting |
| Knowledge Manager | All domains (curator) | Learning · Brand | Any | Include provisional for review |
| CX Advisor | Customer · Campaign · Content | Customer · Learning | Medium | Segment aggregation only |
| Sales Intelligence Advisor | Customer · Campaign · Executive · Product | Customer · Executive | High | CRM attribution required |

## 6.11 Retrieval Performance Targets

| Metric | Target | Phase |
|--------|:------:|-------|
| Retrieval pipeline latency (p95) | < 500ms | 1 |
| Embedding search latency (p95) | < 200ms | 1 |
| Graph traversal (3 hops, p95) | < 300ms | 2 |
| Full context assembly (p95) | < 800ms | 1 |
| Concurrent retrievals per tenant | 100/s | 2 |
| Embedding index size per brand | < 100K vectors | 2 |
| Cache hit rate (repeated queries) | > 60% | 2 |

## 6.12 Retrieval Failure Handling

| Failure | Agent Behaviour | System Action |
|---------|----------------|---------------|
| Zero results | State knowledge gap · do not fabricate | Log gap · notify Knowledge Manager |
| Low confidence (< 0.50) | Proceed with uncertainty flag · recommend human review | Log low confidence event |
| Stale dominant results | Warn user · include freshness caveat | Trigger staleness review |
| Conflict unresolved | Present both sources · recommend human decision | Log conflict · curator queue |
| Retrieval timeout (> 2s) | Proceed with session memory only | Alert · degrade gracefully |
| Embedding service down | Fallback to keyword search only | Circuit breaker · alert |

---

## 7.1 Continuous Learning Model

```
Execution → Outcome → Signal Capture → Learning Memory
    ↓
Pattern Detection (minimum sample size)
    ↓
Curator Validation (Knowledge Manager)
    ↓
Knowledge Graph Update (provisional → validated)
    ↓
Retrieval Ranking Adjustment
    ↓
Agent Prompt Refinement (versioned)
    ↓
Improved Future Performance
```

## 7.2 Executive Feedback Learning

| Feedback Type | Learning Action | Target |
|---------------|----------------|--------|
| Accept recommendation | Positive weight +1.0 | Agent + topic pattern |
| Reject recommendation | Negative weight · store reason | Agent + topic pattern |
| Override decision | Store override context | Decision engine thresholds |
| Request format change | Update briefing template | Executive Advisor |
| Strategic pivot | New Executive Knowledge entry | Marketing Director |

## 7.3 Campaign Optimization Learning

| Outcome | Learning Capture | Future Application |
|---------|-----------------|-------------------|
| ROAS > target | Store channel mix · creative · audience pattern | Campaign Manager planning |
| ROAS < target | Store failure factors · context | Avoid pattern recommendation |
| A/B winner | Store winning attributes | Copywriter · Creative Director |
| Budget pacing deviation | Store pacing pattern | Campaign Manager alerts |

## 7.4 Content Optimization Learning

| Signal | Learning | Application |
|--------|----------|-------------|
| High engagement content | Extract attributes → Content Knowledge | Copywriter generation bias |
| Low engagement content | Extract attributes → negative pattern | Copywriter avoidance |
| Human edit patterns | Brand Memory → Brand Knowledge | Voice alignment |
| Channel-specific performance | Content Knowledge per channel | Content Strategist planning |

## 7.5 SEO Optimization Learning

| Signal | Learning | Application |
|--------|----------|-------------|
| Ranking improvement post-optimization | Store optimization pattern | SEO Specialist recommendations |
| Keyword performance correlation | Update KeywordRecord weights | Content Strategist topic selection |
| Content SEO score vs. organic traffic | Calibrate scoring model | SEO Specialist audits |

## 7.6 Advertising Optimization Learning

| Signal | Learning | Application |
|--------|----------|-------------|
| Audience segment performance | AudienceProfile update | Advertising Manager targeting |
| Creative format performance | AdCreativePattern update | Creative Director briefs |
| Bid strategy outcome | BidStrategyRecord | Campaign Manager Tier 3 rules |
| Platform algorithm change | PlatformInsight entry | Advertising Manager alerts |

## 7.7 Brand Learning

| Signal | Learning | Application |
|--------|----------|-------------|
| Consistent human voice corrections | Brand Memory → Brand Knowledge | All content agents |
| Approved content patterns | ContentPattern promotion | Copywriter · Creative Director |
| Rejected content patterns | Negative pattern storage | All content agents |
| Brand guideline updates | Brand Knowledge version | All agents · immediate retrieval priority |

## 7.8 Customer Behaviour Learning

| Signal | Learning | Application |
|--------|----------|-------------|
| Segment response to campaign type | EngagementPattern update | CX Advisor · Campaign Manager |
| CLV correlation with channel | Customer Knowledge update | Sales Intelligence Advisor |
| Churn indicators | RetentionInsight creation | CX Advisor campaigns |
| Personalization effectiveness | Learning Memory weight | Copywriter personalization |

## 7.9 Performance Learning

| Metric | Learning Trigger | Action |
|--------|-----------------|--------|
| Agent KPI decline 2 consecutive periods | Prompt review initiated | Knowledge Manager + engineering |
| Agent KPI improvement | Store successful configuration | Reinforce current prompt version |
| Cross-agent workflow failure | Store failure pattern | Orchestrator routing adjustment |
| Retrieval confidence consistently low | KB gap report | Knowledge Manager enrichment |

### Learning Governance (from A-003 §8.7)

| Rule | Description |
|------|-------------|
| **LG-1** | Minimum 3 signals before pattern promotion |
| **LG-2** | Prompt changes require Knowledge Manager validation |
| **LG-3** | Learning cannot override brand guidelines or executive directives |
| **LG-4** | All prompt versions retained for rollback |
| **LG-5** | Human can reset brand/learning memory per brand |
| **LG-6** | Cross-tenant learning prohibited |

## 7.10 Learning Metrics Dashboard

| Metric | Description | Review Frequency |
|--------|-------------|:----------------:|
| **Agent improvement rate** | KPI delta after learning cycle | Monthly |
| **Knowledge promotion rate** | Provisional → validated conversions | Weekly |
| **Brand memory → knowledge conversion** | Preferences promoted to graph | Monthly |
| **Retrieval effectiveness** | Approved outputs using retrieved knowledge | Weekly |
| **Learning signal volume** | Signals captured per brand per week | Daily |
| **False pattern rate** | Promoted patterns later rejected | Monthly |
| **Prompt version performance** | KPI by prompt version | Per deployment |
| **Knowledge gap closure rate** | Gaps identified → entries created | Monthly |

## 7.11 Anti-Drift Controls

| Control | Description |
|---------|-------------|
| **Brand anchor** | Brand Knowledge always takes precedence over learned patterns |
| **Executive anchor** | Executive directives immutable by learning |
| **Rollback** | Any prompt version revertible within 24h |
| **Sample minimum** | No learning action from < 3 signals |
| **Human veto** | Brand Manager can freeze learning for brand |
| **Drift detection** | Brand voice score monitored · alert if drops > 10% |
| **Drift detection** | Brand voice score monitored · alert if drops > 10% |
| **A/B prompt testing** | New prompt versions tested on 10% traffic before full rollout |

## 7.12 Learning Cycle Calendar

| Day | Activity | Actor |
|-----|----------|-------|
| **Daily** | Signal capture · retrieval gap logging | System |
| **Monday** | Learning signal aggregation · gap report | Learning System |
| **Tuesday** | Knowledge Manager review queue processing | Knowledge Manager |
| **Wednesday** | Prompt performance review (if KPI delta > 5%) | Engineering + Knowledge Manager |
| **Thursday** | Brand memory → knowledge promotion review | Knowledge Manager |
| **Friday** | Weekly learning report → Marketing Director | Learning System |
| **Monthly** | Long-term memory consolidation · quality audit | Learning System + curators |
| **Quarterly** | Full knowledge domain maturity assessment | Executive Advisor |

---

## 8.1 RBAC — Knowledge Access

| Role | Read Knowledge | Write Knowledge | Read Memory | Write Memory | Admin |
|------|:--------------:|:---------------:|:-----------:|:------------:|:-----:|
| Aurora Admin | All brands | All brands | All | All | ✅ |
| Brand Manager | Assigned brands | Assigned brands | Assigned | Brand tier | ❌ |
| Marketing Director | Assigned brands | Campaign · Executive | Assigned | Campaign tier | ❌ |
| Content Creator | Assigned brands | Content (provisional) | Brand · Session | Session | ❌ |
| Channel Manager | Assigned brands | SEO · Ads (provisional) | Campaign · Session | Session | ❌ |
| Analyst | Assigned brands | ❌ | All tiers (read) | ❌ | ❌ |
| Agent (service) | Brand-scoped retrieval | Provisional only | Brand-scoped | Learning · Session | ❌ |
| Viewer | Validated only | ❌ | ❌ | ❌ | ❌ |

## 8.2 Tenant Isolation

| Boundary | Enforcement |
|----------|-------------|
| Knowledge graph | `tenant_id` on all entities · RLS |
| Memory tiers | `tenant_id` on all memory tables · RLS |
| Embeddings | Tenant-scoped vector indexes |
| Retrieval | Query always includes tenant_id filter |
| Consolidation | Never cross-tenant |
| Learning | Per-tenant independent models |

## 8.3 Data Privacy

| Requirement | Implementation |
|-------------|---------------|
| **GDPR** | Right to access · deletion · portability per tenant |
| **PII exclusion** | No PII in knowledge graph — segments only |
| **Consent tracking** | Marketing consent status in Customer Knowledge |
| **Data minimization** | Store only marketing-relevant derived knowledge |
| **Deletion cascade** | Customer deletion removes derived customer knowledge |
| **Export** | Full knowledge export per brand on request |

## 8.4 Knowledge Classification

| Level | Description | Retrieval | Storage |
|-------|-------------|-----------|---------|
| **Public** | Publishable · external-facing facts | All agents | Standard |
| **Internal** | Marketing team knowledge | All agents | Standard |
| **Confidential** | Strategy · executive · competitive | Director + Advisor + relevant specialists | Encrypted fields |
| **Restricted** | Legal · regulatory · financial | Executive Advisor + human only | Encrypted · access logged |

## 8.5 Retention

| Data Type | Starter | Professional | Enterprise |
|-----------|---------|-------------|------------|
| Validated knowledge | Indefinite | Indefinite | Indefinite |
| Provisional knowledge | 90 days | 180 days | 365 days |
| Session memory | 24h | 48h | 7 days |
| Campaign memory | 90 days post | 180 days post | 365 days post |
| Learning memory | 1 year | 3 years | Indefinite |
| Historical memory | 1 year | 3 years | 7 years |
| Audit logs | 1 year | 3 years | 7 years |

## 8.6 Versioning

| Entity | Version Strategy |
|--------|-----------------|
| Knowledge entities | Full snapshot per version · diff available |
| Brand guidelines | Version with effective date · deprecation chain |
| Memory entries | Append-only · no version (immutable events) |
| Embeddings | Regenerated on entity update · old index retained 30 days |
| Prompt templates | Semantic versioning · git-tracked |

## 8.7 Audit

| Event | Logged Fields |
|-------|--------------|
| Knowledge created | Entity · source · actor · classification |
| Knowledge validated | Entity · approver · previous state |
| Knowledge retrieved | Entity IDs · agent · task · confidence (retrieval audit) |
| Memory written | Tier · scope · actor · size |
| Memory consolidated | Source tier · target · entities created |
| Memory purged | Tier · count · reason · approver |
| Learning signal captured | Signal type · weight · agent · outcome |
| Conflict detected | Entities · resolution · actor |

## 8.8 Compliance

| Regulation | Knowledge/Memory Control |
|------------|-------------------------|
| **GDPR Art. 17** | Right to erasure — cascade delete derived knowledge |
| **GDPR Art. 20** | Data portability — export API |
| **CCPA** | Opt-out honoured in customer knowledge |
| **CAN-SPAM** | Email knowledge includes consent status |
| **SOC 2** | Audit trail · encryption · access controls |
| **Industry packs** | Healthcare HIPAA · Finance FINRA configurable restrictions |

## 8.9 Backup

| Component | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| Knowledge graph (PostgreSQL) | Daily | 90 days | Point-in-time recovery |
| Vector embeddings | Daily | 30 days | Snapshot |
| Memory tiers | Daily | 90 days | PostgreSQL backup |
| Redis session/working | None | Ephemeral | Rebuilt on restart |

## 8.10 Disaster Recovery

| Scenario | RPO | RTO | Procedure |
|----------|-----|-----|-----------|
| Knowledge DB failure | 1 hour | 4 hours | Restore from PITR · reindex embeddings |
| Vector index corruption | 24 hours | 2 hours | Regenerate embeddings from source |
| Memory tier loss | 1 hour | 4 hours | Restore from backup · session/working rebuilt |
| Full tenant data loss | 1 hour | 8 hours | Full restore · validation run · curator review |

---

# 9. ORION Integration

## 9.1 PlatformStore

| Aurora Entity | PlatformStore Type | ORION Pattern |
|---------------|-------------------|---------------|
| `aurora_knowledge_entity` | Domain entity | ES-010 persistence |
| `aurora_knowledge_relationship` | Domain entity | ES-010 persistence |
| `aurora_knowledge_embedding` | Domain entity | ES-010 + pgvector |
| `aurora_memory_*` (8 tables) | Domain entities | ES-010 persistence |
| `aurora_learning_feedback` | Audit-adjacent | ES-038 audit pattern |

All knowledge and memory entities include `tenant_id` · `brand_id` (where applicable) · `created_at` · `updated_at` · `deleted_at`.

## 9.2 Identity

| Integration | Usage |
|-------------|-------|
| Human knowledge authorship | ORION user ID on all human-created knowledge |
| Agent service identity | Service account per agent type for system writes |
| RBAC enforcement | ORION roles map to knowledge access matrix (§8.1) |
| API access | Knowledge APIs require ORION session token |

## 9.3 Executive Provider

| Knowledge Contribution | Consumer |
|------------------------|----------|
| Marketing Health Score context | ORION Executive Brief |
| Campaign knowledge summaries | Executive Advisor → Brief card |
| Market intelligence alerts | ORION Intelligence workspace |
| Executive knowledge directives | Mission Control strategic context |

## 9.4 ORION Knowledge Graph

| Phase | Integration |
|-------|-------------|
| **Phase 1** | Aurora EKG operates independently within Aurora domain |
| **Phase 2** | Bidirectional sync: Aurora brand/product ↔ ORION master data |
| **Phase 3** | Unified enterprise knowledge graph across ORION products |
| **Future** | Cross-product agent context · shared industry benchmarks |

### Sync Boundaries (Phase 2)

| ORION Entity | Aurora Knowledge Domain | Direction |
|-------------|------------------------|-----------|
| CRM Account/Segment | Customer Knowledge | ORION → Aurora |
| CRM Contact (aggregated) | Customer Memory | ORION → Aurora |
| Finance Budget | Executive Knowledge | ORION → Aurora |
| Finance Revenue | Campaign Knowledge | ORION → Aurora |
| HCM Organization | Business Memory | ORION → Aurora (context only) |
| Procurement Vendor | Industry Knowledge | ORION → Aurora (if relevant) |
| Aurora Campaign ROI | Finance analytics | Aurora → ORION |

## 9.5 Event Bus

| Aurora Event | Knowledge/Memory Action |
|--------------|------------------------|
| `aurora.campaign.completed` | Campaign Knowledge acquisition |
| `aurora.content.published` | Content Knowledge update |
| `aurora.content.approved` | Learning signal capture |
| `aurora.analytics.snapshot` | Performance knowledge update |
| `aurora.agent.recommendation` | Learning signal (if acted upon) |
| `aurora.approval.granted` | Learning signal +1.0 |
| `aurora.approval.denied` | Learning signal -1.0 |
| `aurora.integration.sync.completed` | External knowledge ingestion |
| `aurora.learning.feedback.captured` | Learning Memory write |
| `aurora.knowledge.validated` | Embedding reindex trigger |

### ORION Domain Events Consumed

| ORION Event | Aurora Action |
|-------------|---------------|
| `crm.lead.created` | Customer Memory update |
| `crm.revenue.recognized` | Campaign Knowledge · Sales attribution |
| `finance.budget.updated` | Executive Knowledge · Business Memory |
| `hcm.organization.updated` | Business Memory context |

## 9.6 Analytics

| Direction | Data |
|-----------|------|
| Aurora → ORION Analytics | Knowledge retrieval metrics · learning effectiveness |
| ORION → Aurora | Platform usage analytics for executive context |

## 9.7 CRM Integration

| CRM Data | Knowledge Destination | Memory Destination |
|----------|----------------------|-------------------|
| Lead sources | Campaign Knowledge | Campaign Memory |
| Customer segments | Customer Knowledge | Customer Memory |
| Pipeline stages | Executive Knowledge | — |
| Conversion events | Campaign Knowledge | Learning Memory |
| Contact engagement | Customer Knowledge | Customer Memory |

## 9.8 Finance Integration

| Finance Data | Knowledge Destination |
|-------------|----------------------|
| Marketing spend | Campaign Knowledge · Executive Knowledge |
| Revenue attribution | Campaign Knowledge · Sales Intelligence |
| Budget vs. actual | Business Memory · Executive Knowledge |
| ROI calculations | Campaign Knowledge · Long-Term Memory |

## 9.9 HCM Integration

| HCM Data | Usage |
|----------|-------|
| Organization structure | Business Memory context (team capacity planning) |
| Workforce metrics | Not directly ingested — context for executive knowledge only |

## 9.10 Procurement Integration

| Procurement Data | Usage |
|-----------------|-------|
| Vendor/market data | Industry Knowledge (if marketing-relevant vendors) |
| Spend data | Not directly ingested in Phase 1–2 |

## 9.11 Executive Workspace

| Workspace | Knowledge Integration |
|-----------|----------------------|
| **Mission Control** | Executive Knowledge · Market Intelligence summaries |
| **ORION Intelligence** | Retrieval-powered Ask ORION with Aurora knowledge context |
| **Marketing Workspace (ES-026)** | Analytics Knowledge feeds visibility · Aurora executes |
| **Executive Brief** | Marketing Health · campaign knowledge · market signals |

---

# 10. Knowledge APIs

**Architecture contracts only — no implementation.**

## 10.1 Internal Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  AgentOrchestrator · Domain Services · AuroraFacade          │
├─────────────────────────────────────────────────────────────┤
│  KnowledgeRetrievalService    │  MemoryService               │
│  KnowledgeService             │  LearningService             │
│  KnowledgeGraphService        │  EmbeddingService            │
│  KnowledgeIngestionService    │  KnowledgeValidationService  │
├─────────────────────────────────────────────────────────────┤
│  KnowledgeRepository · MemoryRepository · EmbeddingRepository│
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL · pgvector · Redis                               │
└─────────────────────────────────────────────────────────────┘
```

## 10.2 Knowledge Contracts

### KnowledgeEntity Contract

```typescript
interface KnowledgeEntity {
  readonly id: string;
  readonly tenantId: string;
  readonly brandId: string;
  readonly domain: KnowledgeDomain;
  readonly entityType: string;
  readonly title: string;
  readonly content: Record<string, unknown>;
  readonly classification: KnowledgeClassification;
  readonly status: KnowledgeStatus;
  readonly sourceType: KnowledgeSourceType;
  readonly sourceTrust: number;
  readonly curatorAgent: string;
  readonly approvedBy?: string;
  readonly version: number;
  readonly freshness: ISO8601;
  readonly createdAt: ISO8601;
  readonly updatedAt: ISO8601;
}
```

### MemoryEntry Contract

```typescript
interface MemoryEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly brandId?: string;
  readonly tier: MemoryTier;
  readonly scope: MemoryScope;
  readonly content: Record<string, unknown>;
  readonly signalWeight?: number;
  readonly sourceAgent?: string;
  readonly correlationId?: string;
  readonly expiresAt?: ISO8601;
  readonly createdAt: ISO8601;
}
```

### RetrievalRequest Contract

```typescript
interface RetrievalRequest {
  readonly context: AuroraContext;
  readonly taskType: AgentTaskType;
  readonly query: string;
  readonly domains: readonly KnowledgeDomain[];
  readonly maxTokens: number;
  readonly minConfidence: ConfidenceLevel;
  readonly includeProvisional: boolean;
  readonly campaignId?: string;
}
```

### RetrievalResponse Contract

```typescript
interface RetrievalResponse {
  readonly entities: readonly RetrievedEntity[];
  readonly citations: readonly KnowledgeCitation[];
  readonly confidence: ConfidenceLevel;
  readonly gaps: readonly string[];
  readonly tokensUsed: number;
  readonly freshness: ISO8601;
}
```

## 10.3 Agent Interfaces

| Interface | Method | Purpose |
|-----------|--------|---------|
| `KnowledgeRetrievalPort` | `retrieve(request)` | Agent pre-flight context |
| `MemoryReadPort` | `read(tier, scope, query)` | Memory tier access |
| `LearningFeedbackPort` | `capture(signal)` | Post-action feedback |
| `KnowledgeWritePort` | `propose(entity)` | Agent provisional knowledge |

### Agent Access Rules

| Port | Agent Access | Write Permission |
|------|-------------|:----------------:|
| `KnowledgeRetrievalPort` | All agents | Read only |
| `MemoryReadPort` | All agents (scoped) | Read only |
| `LearningFeedbackPort` | All agents | Write signals |
| `KnowledgeWritePort` | Curator agents only | Provisional only |

## 10.4 Search Services

| Service | Method | Description |
|---------|--------|-------------|
| `KnowledgeRetrievalService` | `search(request)` | Full hybrid retrieval pipeline |
| `EmbeddingService` | `similarity(query, domain, k)` | Pure semantic search |
| `KnowledgeGraphService` | `traverse(entityId, depth, filters)` | Graph relationship query |
| `KnowledgeGraphService` | `related(entityId, relationshipType)` | Typed relationship lookup |

## 10.5 Memory Services

| Service | Method | Description |
|---------|--------|-------------|
| `MemoryService` | `write(tier, entry)` | Write to memory tier |
| `MemoryService` | `read(tier, scope, filters)` | Read from memory tier |
| `MemoryService` | `consolidate(tier, target)` | Trigger consolidation |
| `MemoryService` | `purge(tier, before)` | Expire old entries |
| `MemoryService` | `reset(brandId, tier?)` | Human-initiated memory reset |

## 10.6 Knowledge Publishing

| Operation | Actor | Result |
|-----------|-------|--------|
| `propose(entity)` | Agent · system | Status: provisional |
| `validate(entityId, approver)` | Human · curator agent | Status: validated |
| `deprecate(entityId, reason)` | Curator · human | Status: deprecated |
| `archive(entityId)` | Admin · curator | Status: archived |
| `reject(entityId, reason)` | Curator · human | Status: rejected |

## 10.7 Knowledge Subscription

Agents and services subscribe to knowledge change notifications:

| Subscription | Trigger | Subscriber Action |
|-------------|---------|-------------------|
| `knowledge.validated.{domain}` | Entity validated | Refresh retrieval cache |
| `knowledge.stale.{domain}` | Staleness detected | Curator agent review task |
| `memory.consolidated.{tier}` | Consolidation complete | Update retrieval rankings |
| `learning.pattern.detected` | Pattern threshold met | Knowledge Manager review |
| `brand.guideline.updated` | Brand knowledge version | Invalidate agent context cache |

---

# 11. Roadmap

## 11.1 Phase 1 — Foundation (Months 1–6)

| Deliverable | Domain | Mission |
|-------------|--------|---------|
| Brand Knowledge domain | `knowledge.brand` | A-005 |
| Product Knowledge domain | `knowledge.product` | A-005 |
| Content Knowledge domain | `knowledge.content` | A-005 |
| SEO Knowledge domain | `knowledge.seo` | A-005 |
| Campaign Knowledge (basic) | `knowledge.campaign` | A-005 |
| Working + Session memory | Tiers 1–2 | A-005 |
| Campaign + Brand memory | Tiers 3 · 5 | A-005 |
| Learning Memory (basic) | Tier 8 | A-005 |
| Semantic retrieval | pgvector | A-005 |
| Knowledge validation pipeline | Core validation | A-005 |
| Knowledge Manager agent integration | Curator workflows | A-014 |

**Phase 1 knowledge targets:** 5 domains · 5 memory tiers · semantic search · basic learning

## 11.2 Phase 2 — Enterprise (Months 7–12)

| Deliverable | Domain | Mission |
|-------------|--------|---------|
| Customer Knowledge | `knowledge.customer` | A-016 |
| Competitor Knowledge | `knowledge.competitor` | A-016 |
| Industry Knowledge | `knowledge.industry` | A-016 |
| Advertising Knowledge | `knowledge.ads` | A-016 |
| Market Intelligence | `knowledge.market` | A-016 |
| Executive Knowledge | `knowledge.executive` | A-016 |
| Customer + Executive memory | Tiers 6 · 7 | A-016 |
| Historical + Long-Term memory | Tiers 9 · 10 | A-016 |
| Hybrid search | Full pipeline | A-016 |
| ORION CRM/Finance sync | Cross-domain | A-017 |
| Memory consolidation jobs | All tiers | A-016 |
| Citation in agent outputs | UI + audit | A-016 |

**Phase 2 knowledge targets:** 11 domains · 10 memory tiers · hybrid search · ORION federation

## 11.3 Phase 3 — Intelligence (Months 13–24)

| Deliverable | Description |
|-------------|-------------|
| ORION Knowledge Graph federation | Unified enterprise graph |
| Predictive knowledge | Trend prediction · proactive KB enrichment |
| Cross-domain intelligence | CRM + Finance + Aurora unified context |
| Industry benchmark knowledge | Anonymized cross-tenant benchmarks (opt-in) |
| Autonomous KB enrichment | Agent-proposed validated knowledge at scale |
| Knowledge quality scoring | Automated quality metrics per domain |
| Advanced consolidation | ML-based pattern detection |

## 11.4 Enterprise Expansion

| Capability | Target |
|------------|--------|
| Multi-region knowledge residency | EU · US · APAC |
| Knowledge export/import | Tenant migration · backup |
| Custom knowledge domains | Enterprise-configurable domains |
| Knowledge API (public) | Partner · marketplace access |
| Compliance packs | Healthcare · finance · legal industry |

## 11.5 Future Workforce Knowledge

| Future Capability | Description |
|-------------------|-------------|
| Industry specialist knowledge packs | Pre-built KB for hospitality · SaaS · retail |
| Agent-specific fine-tuned retrieval | Per-agent retrieval ranking optimization |
| Multimodal knowledge | Image · video knowledge entities |
| Real-time knowledge streaming | Live event → knowledge graph (< 1 min) |
| Federated learning (privacy-preserving) | Cross-tenant pattern learning without data sharing |

## 11.6 Cross-Domain Intelligence

| ORION Domain | Aurora Knowledge Bridge | Phase |
|-------------|------------------------|-------|
| CRM | Customer · campaign attribution | 2 |
| Finance | ROI · budget · revenue | 2 |
| HCM | Organization context | 3 |
| Procurement | Vendor/industry context | 3 |
| Platform Intelligence | Executive cross-domain briefings | 3 |
| All domains | Unified ORION Knowledge Graph | 3 |

---

# 12. Executive Closing Statement

## 12.1 Strategic Importance

Knowledge and memory are Aurora's **compounding advantage**.

Every competitor can access the same LLM. What they cannot replicate is **institutional knowledge** — the accumulated understanding of a brand's voice, its customers' preferences, its campaigns' outcomes, its competitors' moves, and its executives' decisions.

Aurora's Enterprise Knowledge & Memory Architecture ensures that:

- **Day 1** Aurora knows the brand
- **Day 30** Aurora knows what content works
- **Day 90** Aurora knows which campaigns succeed and why
- **Day 365** Aurora knows the business better than any new hire

This is not a feature. This is the **foundation of enterprise marketing intelligence**.

## 12.2 Engineering Readiness

| Dimension | Assessment |
|-----------|:----------:|
| **Knowledge architecture completeness** | ✅ 11 domains · lifecycle · governance |
| **Memory architecture completeness** | ✅ 10 tiers · consolidation · expiration |
| **Acquisition pipeline** | ✅ 9 channels · validation |
| **Retrieval architecture** | ✅ Hybrid search · confidence · citation |
| **Learning architecture** | ✅ 9 domains · continuous improvement |
| **Governance** | ✅ RBAC · classification · retention · DR |
| **ORION integration** | ✅ 11 integration points |
| **Service contracts** | ✅ 7 contracts · 4 agent ports |
| **A-003 alignment** | ✅ Expands workforce memory model |
| **A-002 alignment** | ✅ Implements EP-7 knowledge informs agents |

### Verdict

### **APPROVED — KNOWLEDGE & MEMORY ARCHITECTURE RATIFIED**

This document is the authoritative reference for all Aurora intelligence missions. Platform Foundation (A-005) and Agent Orchestration (A-014) may proceed with knowledge/memory requirements defined herein.

## 12.3 Approval Matrix

| Role | Decision | Date |
|------|:--------:|------|
| **Founder & Chief Architect** | ✅ APPROVED | 7 August 2026 |
| **Aurora Architecture Review Board** | ✅ APPROVED | 7 August 2026 |
| **ORION Chief Enterprise Architect** | ✅ APPROVED | 7 August 2026 |
| **ORION AI Architect** | ✅ APPROVED | 7 August 2026 |
| **Data Governance Review** | ✅ APPROVED (design) | 7 August 2026 |

| Authorization | Status |
|---------------|:------:|
| A-005 Platform Foundation + Knowledge Layer | **AUTHORIZED** |
| ES-AURORA-005 Knowledge & Memory specification | **AUTHORIZED TO DRAFT** |
| pgvector embedding infrastructure | **AUTHORIZED** (A-005 scope) |
| Knowledge Manager agent knowledge ports | **AUTHORIZED** (A-014 scope) |

---

### Mohammad Shafi Goroo

Founder & Chief Architect

ORION Enterprise Platform · Project Aurora

7 August 2026

---

# Appendices

## Appendix A — Knowledge Catalogue

| # | Domain | Entity Types | Phase | Curator |
|---|--------|-------------|-------|---------|
| 1 | Brand | BrandProfile · BrandGuideline · VisualIdentity · MessagingPillar · ApprovalPolicy | 1 | Knowledge Manager |
| 2 | Product | Product · ProductFeature · ProductPricing · ProductAudience | 1 | Knowledge Manager |
| 3 | Campaign | CampaignRecord · CampaignLesson · ChannelPerformance · OptimizationRecord | 1 | Campaign Manager |
| 4 | Customer | CustomerSegment · CustomerPersona · EngagementPattern · RetentionInsight | 2 | CX Advisor |
| 5 | Competitor | Competitor · CompetitorCampaign · CompetitorContent · CompetitiveGap | 2 | Brand Intelligence Manager |
| 6 | Industry | IndustryTrend · Regulation · SeasonalPattern · BenchmarkMetric | 2 | Brand Intelligence Manager |
| 7 | SEO | KeywordRecord · SeoAuditFinding · RankingHistory · ContentSeoScore | 1 | SEO Specialist |
| 8 | Advertising | AudienceProfile · AdCreativePattern · BidStrategyRecord · PlatformInsight | 2 | Advertising Manager |
| 9 | Content | ContentPattern · TopicCluster · ContentPillar · RepurposingMap | 1 | Content Strategist |
| 10 | Market | MarketSignal · MarketOpportunity · ThreatAssessment | 2 | Brand Intelligence Manager |
| 11 | Executive | StrategicDirective · ExecutiveDecision · BudgetAllocation · PerformanceReview | 2 | Executive Advisor |

**Total entity types:** 45

## Appendix B — Memory Catalogue

| Tier | Name | Storage | Retention | Scope | Consolidation Target |
|:----:|------|---------|-----------|-------|---------------------|
| 1 | Working | Redis | 30 min | Task | None |
| 2 | Session | Redis | 24h | Session | None |
| 3 | Campaign | PostgreSQL | Campaign + 90d | Campaign | Campaign Knowledge |
| 4 | Business | PostgreSQL | Tenant life | Business | Long-Term Memory |
| 5 | Brand | PostgreSQL | Brand life | Brand | Brand Knowledge |
| 6 | Customer | PostgreSQL | CRM policy | Segment | Customer Knowledge |
| 7 | Executive | PostgreSQL | Indefinite | Executive | Executive Knowledge |
| 8 | Learning | PostgreSQL | Indefinite | Brand + Agent | Long-Term · Knowledge |
| 9 | Historical | PostgreSQL | 1–7 years | Brand | Long-Term Memory |
| 10 | Long-Term | PostgreSQL | Indefinite | Brand + Domain | — |

## Appendix C — Knowledge Taxonomy

```
knowledge
├── brand
│   ├── profile
│   ├── guideline
│   ├── visual_identity
│   ├── messaging_pillar
│   └── approval_policy
├── product
│   ├── product
│   ├── feature
│   ├── pricing
│   └── audience
├── campaign
│   ├── record
│   ├── lesson
│   ├── channel_performance
│   └── optimization
├── customer
│   ├── segment
│   ├── persona
│   ├── engagement_pattern
│   └── retention_insight
├── competitor
│   ├── competitor
│   ├── campaign
│   ├── content
│   └── gap
├── industry
│   ├── trend
│   ├── regulation
│   ├── seasonal_pattern
│   └── benchmark
├── seo
│   ├── keyword
│   ├── audit_finding
│   ├── ranking
│   └── content_score
├── advertising
│   ├── audience
│   ├── creative_pattern
│   ├── bid_strategy
│   └── platform_insight
├── content
│   ├── pattern
│   ├── topic_cluster
│   ├── pillar
│   └── repurposing_map
├── market
│   ├── signal
│   ├── opportunity
│   └── threat
└── executive
    ├── directive
    ├── decision
    ├── budget_allocation
    └── performance_review
```

## Appendix D — Entity Catalogue

| Table | Primary Key | Tenant | Brand | Embedding | Version |
|-------|-------------|:------:|:-----:|:---------:|:-------:|
| `aurora_knowledge_entity` | UUID | ✅ | ✅ | ✅ | ✅ |
| `aurora_knowledge_relationship` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_knowledge_embedding` | UUID | ✅ | ✅ | ✅ | ❌ |
| `aurora_memory_campaign` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_memory_business` | UUID | ✅ | ❌ | ❌ | ❌ |
| `aurora_memory_brand` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_memory_customer` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_memory_executive` | UUID | ✅ | ❌ | ❌ | ❌ |
| `aurora_memory_learning` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_memory_historical` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_memory_longterm` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_learning_feedback` | UUID | ✅ | ✅ | ❌ | ❌ |
| `aurora_retrieval_audit` | UUID | ✅ | ✅ | ❌ | ❌ |

## Appendix E — Knowledge Lifecycle

| Transition | Trigger | Actor | Validation Required |
|------------|---------|-------|:-------------------:|
| → acquired | Ingestion pipeline | System | Schema only |
| acquired → provisional | Processing complete | Ingestion service | Schema + trust |
| provisional → validated | Human approval | Brand Manager · curator | Full validation |
| provisional → rejected | Human rejection | Brand Manager · curator | Reason required |
| validated → deprecated | Superseded | Curator agent | New version exists |
| deprecated → archived | Retention policy | System job | None |
| archived → validated | Restore request | Aurora Admin | Re-validation |
| any → deleted | Admin request | Aurora Admin | Audit + 30d recovery |

## Appendix F — Mission Register

| Mission | Title | Phase | Status | Depends On |
|---------|-------|-------|--------|------------|
| **A-001** | Aurora Constitution | Foundation | ✅ Ratified | — |
| **A-002** | Enterprise Engineering Blueprint | Foundation | ✅ Ratified | A-001 |
| **A-003** | AI Workforce Architecture | Foundation | ✅ Ratified | A-001 · A-002 |
| **A-004** | Enterprise Knowledge & Memory Architecture | Foundation | ✅ Ratified | A-001 · A-002 · A-003 |
| **A-005** | Platform Foundation + Knowledge Layer | 1 | Authorized | A-002 · A-004 |
| **A-006** | Content Studio v1 | 1 | Planned | A-005 |
| **A-007** | Creative Studio v1 | 1 | Planned | A-005 |
| **A-008** | SEO Engine v1 | 1 | Planned | A-005 |
| **A-009** | Social Media Manager v1 | 1 | Planned | A-005 · A-006 |
| **A-010** | Analytics v1 | 1 | Planned | A-005 |
| **A-011** | Marketing Planner v1 | 1 | Planned | A-005 |
| **A-012** | Google Integrations | 1 | Planned | A-005 · A-008 |
| **A-013** | Meta Integrations | 1 | Planned | A-005 · A-009 |
| **A-014** | Agent Orchestration v1 | 1 | Planned | A-003 · A-004 · A-005 |
| **A-015** | ORION Platform Integration | 1 | Planned | A-005 · A-010 · A-014 |
| **A-016** | Enterprise Knowledge Phase 2 | 2 | Planned | A-005 |
| **A-017** | ORION Cross-Domain Knowledge Sync | 2 | Planned | A-015 · A-016 |
| **A-018–A-028** | Phase 2 module missions | 2 | Planned | Phase 1 |
| **A-029–A-038** | Phase 3 missions | 3 | Planned | Phase 2 |

**Note:** Mission numbering updated. A-004 is Knowledge & Memory Architecture. Platform Foundation shifts to A-005. All subsequent missions renumbered accordingly.

---

## Document Approval

| Field | Value |
|-------|-------|
| **Document** | A-004 — Aurora Enterprise Knowledge & Memory Architecture |
| **Version** | 1.0 |
| **Status** | Ratified |
| **Approved By** | Mohammad Shafi Goroo — Founder & Chief Architect |
| **Date** | 7 August 2026 |
| **Classification** | Knowledge Architecture · Authoritative Intelligence Reference |
| **Next Mission** | A-005 — Platform Foundation + Knowledge Layer |
| **Next Spec** | ES-AURORA-005 — Knowledge & Memory Implementation |

---

### Project Aurora

*Enterprise Knowledge · Institutional Memory · Continuous Intelligence · Powered by ORION*

**Let's build something remarkable.**
