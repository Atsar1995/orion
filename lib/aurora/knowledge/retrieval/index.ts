export {
  DefaultSemanticSearchEngine,
  SEMANTIC_SEARCH_CHUNK_FETCH_MULTIPLIER,
  collapseEmbeddingMatches,
  compareScoredEntities,
  passesEntityFilters,
  toVectorSearchOptions,
  type SemanticSearchEngine,
  type SemanticSearchResult,
} from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
export {
  DefaultKeywordSearchEngine,
  KeywordInvalidQueryError,
  mapKeywordMatchToScoredEntity,
  toKeywordSearchOptions,
  type KeywordSearchEngine,
} from "@/lib/aurora/knowledge/retrieval/KeywordSearchEngine";
export {
  DefaultGraphSearchEngine,
  buildWeightedAdjacency,
  computeGraphProximityScores,
  mapTraversalToScoredEntities,
  resolveGraphStartEntityId,
  resolveGraphValidatedOnly,
  type GraphSearchEngine,
} from "@/lib/aurora/knowledge/retrieval/GraphSearchEngine";
export {
  DefaultMemorySearchEngine,
  MEMORY_SEARCH_UNAVAILABLE_REASON,
  MemoryTierUnavailableError,
  createUnavailableMemorySearchResult,
  type MemorySearchEngine,
  type MemorySearchResult,
} from "@/lib/aurora/knowledge/retrieval/MemorySearchEngine";
export {
  DefaultHybridSearchEngine,
  type HybridSearchEngine,
  type HybridSearchOptions,
} from "@/lib/aurora/knowledge/retrieval/HybridSearchEngine";
export {
  DefaultContextAssembler,
  type ContextAssembler,
} from "@/lib/aurora/knowledge/retrieval/ContextAssembler";
export {
  DefaultConfidenceScorer,
  type ConfidenceScorer,
} from "@/lib/aurora/knowledge/retrieval/ConfidenceScorer";
export {
  CITATION_EXCERPT_MAX_TOKENS,
  DefaultCitationBuilder,
  type CitationBuildRequest,
  type CitationBuilder,
} from "@/lib/aurora/knowledge/retrieval/CitationBuilder";
export {
  CONFIDENCE_HIGH_MIN_AVERAGE_SCORE,
  CONFIDENCE_HIGH_MIN_VALIDATED,
  CONFIDENCE_LOW_MAX_COUNT,
  CONFIDENCE_LOW_MIN_AVERAGE_SCORE,
  CONFIDENCE_LOW_MIN_COUNT,
  CONFIDENCE_MEDIUM_MAX_COUNT,
  CONFIDENCE_MEDIUM_MIN_AVERAGE_SCORE,
  CONFIDENCE_MEDIUM_MIN_COUNT,
  computeConfidenceMetrics,
  filterRelevantScoredEntities,
  resolveRetrievalConfidence,
  scoreRetrievalConfidence,
  type ConfidenceMetrics,
} from "@/lib/aurora/knowledge/retrieval/confidenceScoring";
export {
  RETRIEVAL_TASK_DOMAIN_MAP,
  assignScoredEntitiesToLayers,
  buildLayerContent,
  compareScoredEntitiesForAssembly,
  deduplicateScoredEntities,
  estimateTokenCount,
  passesAssemblyEntityFilters,
  resolveContextLayer,
  serializeEntityForContext,
  truncateToTokenBudget,
} from "@/lib/aurora/knowledge/retrieval/contextAssembly";
export {
  HYBRID_SEARCH_WEIGHTS,
  PROVISIONAL_STATUS_MULTIPLIER,
  VALIDATED_STATUS_MULTIPLIER,
  buildHybridScoredEntities,
  compareHybridScoredEntities,
  computeHybridScore,
  mergeScoredEntityIntoAccumulator,
  normalizeSignalScores,
  resolveStatusMultiplier,
  type HybridEntityAccumulator,
  type HybridSignalAvailability,
} from "@/lib/aurora/knowledge/retrieval/hybridScoring";
