export {
  DefaultKnowledgeService,
  KnowledgeInvalidEntityError,
  KnowledgeInvalidLifecycleTransitionError,
  KnowledgeInvalidTenantContextError,
  KnowledgeUnsupportedEntityTypeError,
  type CreateKnowledgeEntityInput,
  type KnowledgeService,
  type UpdateKnowledgeEntityInput,
} from "@/lib/aurora/knowledge/services/KnowledgeService";
export {
  DefaultKnowledgeGraphService,
  MAX_GRAPH_TRAVERSAL_DEPTH,
  MAX_GRAPH_TRAVERSAL_ENTITIES,
  type CrossDomainQuery,
  type EntityQuery,
  type GraphSnapshot,
  type KnowledgeGraphService,
  type TraversalOptions,
  type TraversalResult,
} from "@/lib/aurora/knowledge/services/KnowledgeGraphService";
export {
  RelationshipEngine,
  applyRelationshipWeightDecay,
  type CreateRelationshipInput,
} from "@/lib/aurora/knowledge/services/RelationshipEngine";
export {
  DefaultTaxonomyManager,
  type EntityTypeSuggestion,
  type TaxonomyManager,
  type TaxonomyNode,
  type TaxonomyTree,
  type ValidationResult,
} from "@/lib/aurora/knowledge/services/TaxonomyManager";
export {
  DefaultEmbeddingService,
  DeterministicEmbeddingProvider,
  EmbeddingInvalidInputError,
  type EmbeddingService,
  type IndexEntityResult,
} from "@/lib/aurora/knowledge/services/EmbeddingService";
export {
  EmbeddingProviderUnavailableError,
  UnavailableEmbeddingProvider,
  type EmbeddingProvider,
} from "@/lib/aurora/knowledge/services/EmbeddingProvider";
export {
  EMBEDDING_CHUNK_WORD_LIMIT,
  chunkEmbeddingText,
  extractEntityEmbeddingText,
  hashEmbeddingChunkContent,
} from "@/lib/aurora/knowledge/services/embeddingIndexing";
export {
  DefaultKnowledgeRetrievalService,
  type KnowledgeRetrievalService,
} from "@/lib/aurora/knowledge/services/KnowledgeRetrievalService";
export {
  RetrievalInvalidRequestError,
  RetrievalUnsupportedTaskError,
  SPRINT3_MEMORY_RETRIEVAL_DEGRADED,
  VALIDATED_ONLY_RETRIEVAL_ROLES,
  assertSupportedRetrievalTask,
  buildRetrievalQueryFromRequest,
  requiresValidatedOnlyRetrieval,
  resolveRetrievalDomains,
  resolveRetrievalQueryFilters,
  validateRetrievalRequest,
  type QueryVectorResolution,
} from "@/lib/aurora/knowledge/services/retrievalOrchestration";
