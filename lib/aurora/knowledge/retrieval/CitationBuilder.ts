import {
  truncateToTokenBudget,
} from "@/lib/aurora/knowledge/retrieval/contextAssembly";
import { compareHybridScoredEntities } from "@/lib/aurora/knowledge/retrieval/hybridScoring";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { extractEntityEmbeddingText } from "@/lib/aurora/knowledge/services/embeddingIndexing";
import type {
  ContextPackage,
  KnowledgeCitation,
  ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";

export type CitationBuildRequest = {
  readonly scoredEntities: readonly ScoredEntity[];
  readonly contextPackage: ContextPackage;
};

export interface CitationBuilder {
  build(request: CitationBuildRequest): readonly KnowledgeCitation[];
}

/** ENGINEERING ASSUMPTION: canon silent on excerpt size; bounded excerpt for citation metadata. */
export const CITATION_EXCERPT_MAX_TOKENS = 64 as const;

function buildScoreByEntityId(scoredEntities: readonly ScoredEntity[]): Map<string, number> {
  const scores = new Map<string, number>();

  for (const scored of scoredEntities) {
    const existing = scores.get(scored.entity.id);
    if (existing === undefined || scored.score > existing) {
      scores.set(scored.entity.id, scored.score);
    }
  }

  return scores;
}

function buildCitationExcerpt(entity: KnowledgeEntity): string {
  return truncateToTokenBudget(extractEntityEmbeddingText(entity), CITATION_EXCERPT_MAX_TOKENS);
}

function toKnowledgeCitation(
  entity: KnowledgeEntity,
  confidence: number,
  retrievedAt: string,
): KnowledgeCitation {
  return {
    entityId: entity.id,
    domain: entity.domain,
    entityType: entity.entityType,
    title: entity.title,
    excerpt: buildCitationExcerpt(entity),
    confidence,
    sourceType: entity.sourceType,
    retrievedAt,
  };
}

export class DefaultCitationBuilder implements CitationBuilder {
  build(request: CitationBuildRequest): readonly KnowledgeCitation[] {
    const { contextPackage, scoredEntities } = request;

    if (contextPackage.entities.length === 0) {
      return [];
    }

    const scoreByEntityId = buildScoreByEntityId(scoredEntities);
    const retrievedAt = contextPackage.assembledAt;

    const ordered = [...contextPackage.entities]
      .map((entity) => ({
        entity,
        score: scoreByEntityId.get(entity.id) ?? 0,
      }))
      .sort((left, right) =>
        compareHybridScoredEntities(
          { entity: left.entity, score: left.score },
          { entity: right.entity, score: right.score },
        ),
      );

    return ordered.map(({ entity, score }) => toKnowledgeCitation(entity, score, retrievedAt));
  }
}
