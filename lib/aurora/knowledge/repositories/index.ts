export {
  KnowledgeEntityAlreadyExistsError,
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidRelationshipError,
  KnowledgeKeywordSearchError,
  KnowledgeRelationshipAlreadyExistsError,
  KnowledgeTenantBoundaryError,
  KnowledgeVersionConflictError,
  type KnowledgeEntityUpdateInput,
  type KnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
export {
  compareScoredKeywordMatches,
  computeKeywordRank,
  KEYWORD_CONTENT_WEIGHT,
  KEYWORD_TITLE_WEIGHT,
  matchesKeywordQuery,
  passesKeywordEntityFilters,
  resolveKeywordSearchDefaults,
  searchEntitiesByKeyword,
  tokenizeKeywordQuery,
  type ScoredKeywordMatch,
} from "@/lib/aurora/knowledge/repositories/keywordSearch";
export {
  EMBEDDING_VECTOR_DIMENSION,
  KnowledgeEmbeddingAlreadyExistsError,
  KnowledgeEmbeddingNotFoundError,
  KnowledgeInvalidEmbeddingVectorError,
  validateEmbeddingVector,
  type CreateKnowledgeEmbeddingInput,
  type EmbeddingRepository,
  type KnowledgeEmbeddingRecord,
  type ScoredEmbeddingMatch,
} from "@/lib/aurora/knowledge/repositories/EmbeddingRepository";
export { InMemoryEmbeddingRepository } from "@/lib/aurora/knowledge/repositories/InMemoryEmbeddingRepository";
export { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories/InMemoryKnowledgeRepository";
export { PostgresEmbeddingRepository } from "@/lib/aurora/knowledge/repositories/PostgresEmbeddingRepository";
export { PostgresKnowledgeRepository } from "@/lib/aurora/knowledge/repositories/PostgresKnowledgeRepository";
