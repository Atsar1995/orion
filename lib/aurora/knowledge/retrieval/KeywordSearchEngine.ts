import {
  KnowledgeKeywordSearchError,
  type KnowledgeRepository,
  type ScoredKeywordMatch,
} from "@/lib/aurora/knowledge/repositories";
import { compareScoredEntities } from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  DEFAULT_RETRIEVAL_TOP_K,
  type KeywordSearchOptions,
  type RetrievalQuery,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export class KeywordInvalidQueryError extends Error {
  readonly name = "KeywordInvalidQueryError";

  constructor(message: string) {
    super(message);
  }
}

export interface KeywordSearchEngine {
  search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    searchTerms: string,
  ): Promise<readonly ScoredEntity[]>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

function assertNonEmptySearchTerms(searchTerms: string): void {
  if (!searchTerms.trim()) {
    throw new KeywordInvalidQueryError("Keyword search terms must not be empty.");
  }
}

export function toKeywordSearchOptions(query: RetrievalQuery): KeywordSearchOptions {
  return {
    brandId: query.brandId,
    domains: query.domains,
    entityType: query.entityType,
    validatedOnly: query.validatedOnly,
    includeProvisional: query.includeProvisional,
    topK: query.topK ?? DEFAULT_RETRIEVAL_TOP_K,
  };
}

export function mapKeywordMatchToScoredEntity(match: ScoredKeywordMatch): ScoredEntity {
  return {
    entity: match.entity,
    score: match.rank,
    keywordScore: match.rank,
  };
}

export class DefaultKeywordSearchEngine implements KeywordSearchEngine {
  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledgeKeyword",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledgeKeyword",
      resource,
    });
  }

  async search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    searchTerms: string,
  ): Promise<readonly ScoredEntity[]> {
    assertTenantContext(ctx);
    assertNonEmptySearchTerms(searchTerms);
    this.assertReadAccess(ctx, query.brandId ?? query.query);

    const options = toKeywordSearchOptions(query);

    let matches: readonly ScoredKeywordMatch[];
    try {
      matches = await this.knowledgeRepository.searchKeyword(ctx.tenantId, searchTerms, options);
    } catch (error) {
      if (error instanceof KnowledgeKeywordSearchError) {
        throw error;
      }
      throw new KnowledgeKeywordSearchError(
        error instanceof Error ? error.message : "Keyword search failed.",
        { cause: error },
      );
    }

    return matches
      .filter((match) => match.entity.tenantId === ctx.tenantId)
      .map(mapKeywordMatchToScoredEntity)
      .sort(compareScoredEntities);
  }
}
