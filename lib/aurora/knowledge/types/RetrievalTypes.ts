import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type { KnowledgeSourceType } from "@/lib/aurora/knowledge/domain/KnowledgeSourceType";

/** Agent task types mapped to knowledge domains (ES-AURORA-007 Appendix D). */
export type RetrievalTaskType =
  | "content_generation"
  | "seo_analysis"
  | "ad_campaign"
  | "social_posting"
  | "analytics_report"
  | "executive_briefing"
  | "competitive_analysis"
  | "kb_curation";

export const RETRIEVAL_TASK_TYPES: readonly RetrievalTaskType[] = [
  "content_generation",
  "seo_analysis",
  "ad_campaign",
  "social_posting",
  "analytics_report",
  "executive_briefing",
  "competitive_analysis",
  "kb_curation",
] as const;

/** Confidence band returned by the retrieval pipeline (ES-AURORA-007 §4.5). */
export type RetrievalConfidence = "high" | "medium" | "low" | "insufficient";

export const RETRIEVAL_CONFIDENCE_LEVELS: readonly RetrievalConfidence[] = [
  "high",
  "medium",
  "low",
  "insufficient",
] as const;

/** Hard context token budget for agent pre-flight (ES-AURORA-007 §4.6). */
export const RETRIEVAL_MAX_CONTEXT_TOKENS = 3_000 as const;

/** Default top-K pre-rank for semantic and keyword search (ES-AURORA-007 §4.2 · §4.4). */
export const DEFAULT_RETRIEVAL_TOP_K = 10 as const;

/** Minimum cosine similarity for semantic matches (ES-AURORA-007 §4.4). */
export const MIN_EMBEDDING_SIMILARITY = 0.75 as const;

/** Context assembly layer identifiers (ES-AURORA-007 §4.6). */
export type ContextLayerKey =
  | "brand"
  | "taskKnowledge"
  | "campaign"
  | "graphEntities"
  | "learningPreferences"
  | "sessionHistory";

export const CONTEXT_LAYER_KEYS: readonly ContextLayerKey[] = [
  "brand",
  "taskKnowledge",
  "campaign",
  "graphEntities",
  "learningPreferences",
  "sessionHistory",
] as const;

/** Per-layer token ceilings — sum equals RETRIEVAL_MAX_CONTEXT_TOKENS (ES-AURORA-007 §4.6). */
export const CONTEXT_LAYER_TOKEN_LIMITS: Readonly<Record<ContextLayerKey, number>> = {
  brand: 600,
  taskKnowledge: 800,
  campaign: 400,
  graphEntities: 500,
  learningPreferences: 300,
  sessionHistory: 400,
} as const;

/** Hybrid search engine identifiers (ES-AURORA-007 §4.2 · Appendix D). */
export type HybridSearchEngineKind = "semantic" | "keyword" | "graph" | "memory";

export const HYBRID_SEARCH_ENGINE_KINDS: readonly HybridSearchEngineKind[] = [
  "semantic",
  "keyword",
  "graph",
  "memory",
] as const;

/** Mandatory agent pre-flight input (ES-AURORA-007 §4.1). */
export interface RetrievalRequest {
  readonly taskType: RetrievalTaskType;
  readonly query: string;
  readonly domains?: readonly KnowledgeDomain[];
  readonly maxTokens?: number;
  readonly minConfidence?: RetrievalConfidence;
  readonly includeProvisional?: boolean;
  readonly validatedOnly?: boolean;
  readonly campaignId?: string;
}

/** Hybrid search input without full context assembly (ES-AURORA-007 §4.1). */
export interface RetrievalQuery {
  readonly query: string;
  readonly domains?: readonly KnowledgeDomain[];
  readonly brandId?: string;
  readonly campaignId?: string;
  readonly entityType?: string;
  readonly validatedOnly?: boolean;
  readonly includeProvisional?: boolean;
  readonly topK?: number;
}

/** Entity match with hybrid relevance scoring (ES-AURORA-007 §4.2 · §4.3). */
export interface ScoredEntity {
  readonly entity: KnowledgeEntity;
  readonly score: number;
  readonly semanticScore?: number;
  readonly keywordScore?: number;
  readonly graphProximityScore?: number;
  readonly memoryRelevanceScore?: number;
  readonly freshnessMultiplier?: number;
  readonly trustMultiplier?: number;
  readonly statusMultiplier?: number;
}

/** Citation metadata attached to agent outputs (ES-AURORA-007 §4.7). */
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

/** One budgeted layer within an assembled context package (ES-AURORA-007 §4.6). */
export interface ContextLayer {
  readonly key: ContextLayerKey;
  readonly content: string;
  readonly tokenCount: number;
  readonly maxTokens: number;
}

/** Assembled agent context within the hard token budget (ES-AURORA-007 §4.6). */
export interface ContextPackage {
  readonly layers: readonly ContextLayer[];
  readonly totalTokens: number;
  readonly maxTokens: number;
  readonly entities: readonly KnowledgeEntity[];
  readonly assembledAt: string;
}

/** Input for explicit context assembly from ranked retrieval results. */
export interface ContextAssemblyRequest {
  readonly scoredEntities: readonly ScoredEntity[];
  readonly taskType?: RetrievalTaskType;
  readonly maxTokens?: number;
  readonly campaignId?: string;
  readonly validatedOnly?: boolean;
  readonly includeProvisional?: boolean;
}

/** Input for retrieval confidence scoring (ES-AURORA-007 §4.5). */
export interface ConfidenceScoringRequest {
  readonly scoredEntities: readonly ScoredEntity[];
  readonly semanticDegraded?: boolean;
  readonly memoryDegraded?: boolean;
  readonly requestedDomains?: readonly KnowledgeDomain[];
  readonly tenantId?: string;
}

/** Confidence scoring output consumed by retrieval pipeline stages. */
export interface ConfidenceScoreResult {
  readonly confidence: RetrievalConfidence;
  readonly averageScore: number;
  readonly resultCount: number;
  readonly validatedCount: number;
  readonly gaps: readonly string[];
}

/** Agent pre-flight pipeline output (ES-AURORA-007 §4.5). */
export interface RetrievalResult {
  readonly confidence: RetrievalConfidence;
  readonly contextPackage: ContextPackage;
  readonly citations: readonly KnowledgeCitation[];
  readonly gaps: readonly string[];
  readonly latencyMs: number;
}

/** Optional metadata supplied when generating embeddings (ES-AURORA-007 §4.4). */
export interface EmbeddingMetadata {
  readonly entityId?: string;
  readonly entityType?: string;
  readonly domain?: KnowledgeDomain;
  readonly chunkIndex?: number;
  readonly contentHash?: string;
}

/** Tenant-scoped vector similarity query options (ES-AURORA-007 §4.4). */
export interface VectorSearchOptions {
  readonly domains?: readonly KnowledgeDomain[];
  readonly brandId?: string;
  readonly topK?: number;
  readonly minSimilarity?: number;
  readonly validatedOnly?: boolean;
}

/** Keyword / full-text search options (ES-AURORA-007 §2.6 · §4.2). */
export interface KeywordSearchOptions {
  readonly domains?: readonly KnowledgeDomain[];
  readonly brandId?: string;
  readonly topK?: number;
  readonly validatedOnly?: boolean;
  readonly entityType?: string;
  readonly includeProvisional?: boolean;
}

/** Retrieval cache invalidation scope (ES-AURORA-007 §4.9). */
export interface CacheScope {
  readonly brandId?: string;
  readonly queryHash?: string;
}

/** Outcome summary for tenant embedding reindex operations (ES-AURORA-007 §4.4). */
export interface ReindexResult {
  readonly indexed: number;
  readonly removed: number;
  readonly failed: number;
  readonly errors?: readonly string[];
}

/** Optional diagnostic metadata for retrieval operations. */
export interface RetrievalMetadata {
  readonly queryHash?: string;
  readonly cacheHit?: boolean;
  readonly searchEngineCounts?: Readonly<Partial<Record<HybridSearchEngineKind, number>>>;
}
