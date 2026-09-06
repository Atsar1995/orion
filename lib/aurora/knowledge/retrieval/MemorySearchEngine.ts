import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import type { RetrievalQuery, ScoredEntity } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

/** Sprint 3 memory-unavailable signal for ERR-3 (exclude memory score). */
export class MemoryTierUnavailableError extends Error {
  readonly name = "MemoryTierUnavailableError";
  readonly excludeMemoryScore = true as const;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** Memory search outcome for HybridSearchEngine consumption (ERR-3 compatible). */
export type MemorySearchResult = {
  readonly entities: readonly ScoredEntity[];
  readonly degraded: boolean;
  readonly excludeMemoryScore?: boolean;
  readonly degradationReason?: string;
};

export const MEMORY_SEARCH_UNAVAILABLE_REASON =
  "Memory tiers are not available until Sprint 4 memory infrastructure." as const;

export interface MemorySearchEngine {
  search(ctx: AuroraRuntimeContext, query: RetrievalQuery): Promise<MemorySearchResult>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

export class DefaultMemorySearchEngine implements MemorySearchEngine {
  constructor(private readonly authorizationService: AuroraAuthorizationService) {}

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledgeMemorySearch",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledgeMemorySearch",
      resource,
    });
  }

  async search(ctx: AuroraRuntimeContext, query: RetrievalQuery): Promise<MemorySearchResult> {
    assertTenantContext(ctx);
    this.assertReadAccess(ctx, query.brandId ?? query.query);

    return {
      entities: [],
      degraded: true,
      excludeMemoryScore: true,
      degradationReason: MEMORY_SEARCH_UNAVAILABLE_REASON,
    };
  }
}

/** Zero-score Sprint 3 stub — models ERR-3 without a memory backend. */
export function createUnavailableMemorySearchResult(): MemorySearchResult {
  return {
    entities: [],
    degraded: true,
    excludeMemoryScore: true,
    degradationReason: MEMORY_SEARCH_UNAVAILABLE_REASON,
  };
}
