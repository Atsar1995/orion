import type { KnowledgeRelationship } from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import {
  compareScoredEntities,
  passesEntityFilters,
} from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  MAX_GRAPH_TRAVERSAL_DEPTH,
  type KnowledgeGraphService,
  type TraversalResult,
} from "@/lib/aurora/knowledge/services/KnowledgeGraphService";
import {
  DEFAULT_RETRIEVAL_TOP_K,
  type RetrievalQuery,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import { KnowledgeEntityNotFoundError } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";

export interface GraphSearchEngine {
  search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    startEntityId?: string,
  ): Promise<readonly ScoredEntity[]>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

export function resolveGraphStartEntityId(
  startEntityId: string | undefined,
  query: RetrievalQuery,
): string | null {
  const explicit = startEntityId?.trim();
  if (explicit) {
    return explicit;
  }

  const campaignId = query.campaignId?.trim();
  if (campaignId) {
    return campaignId;
  }

  return null;
}

function resolveTopK(query: RetrievalQuery): number {
  return query.topK ?? DEFAULT_RETRIEVAL_TOP_K;
}

/** Agent preflight default (ES-AURORA-007 Sprint 3 · Discovery H8). */
export function resolveGraphValidatedOnly(query: RetrievalQuery): boolean {
  return query.validatedOnly ?? true;
}

export function buildWeightedAdjacency(
  relationships: readonly KnowledgeRelationship[],
): Map<string, Array<{ neighborId: string; weight: number }>> {
  const adjacency = new Map<string, Array<{ neighborId: string; weight: number }>>();

  for (const relationship of relationships) {
    const forward = adjacency.get(relationship.sourceEntityId) ?? [];
    forward.push({ neighborId: relationship.targetEntityId, weight: relationship.weight });
    adjacency.set(relationship.sourceEntityId, forward);

    const reverse = adjacency.get(relationship.targetEntityId) ?? [];
    reverse.push({ neighborId: relationship.sourceEntityId, weight: relationship.weight });
    adjacency.set(relationship.targetEntityId, reverse);
  }

  return adjacency;
}

/**
 * Graph proximity score from traversal output.
 * Start node = 1.0; neighbors score by decayed edge weight and hop distance.
 */
export function computeGraphProximityScores(
  startEntityId: string,
  traversal: TraversalResult,
): Map<string, number> {
  const scores = new Map<string, number>();
  scores.set(startEntityId, 1);

  const adjacency = buildWeightedAdjacency(traversal.relationships);
  const queue: Array<{ entityId: string; depth: number }> = [{ entityId: startEntityId, depth: 0 }];
  const visited = new Set<string>([startEntityId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= MAX_GRAPH_TRAVERSAL_DEPTH) {
      continue;
    }

    for (const edge of adjacency.get(current.entityId) ?? []) {
      const hopScore = edge.weight / (1 + current.depth + 1);
      const existing = scores.get(edge.neighborId) ?? 0;
      if (hopScore > existing) {
        scores.set(edge.neighborId, hopScore);
      }

      if (!visited.has(edge.neighborId)) {
        visited.add(edge.neighborId);
        queue.push({ entityId: edge.neighborId, depth: current.depth + 1 });
      }
    }
  }

  return scores;
}

export function mapTraversalToScoredEntities(
  traversal: TraversalResult,
  scores: ReadonlyMap<string, number>,
  query: RetrievalQuery,
  tenantId: string,
): readonly ScoredEntity[] {
  const entityIds = new Set<string>();

  return traversal.entities
    .filter((entity) => {
      if (entity.tenantId !== tenantId) {
        return false;
      }
      if (!passesEntityFilters(entity, query)) {
        return false;
      }
      if (entityIds.has(entity.id)) {
        return false;
      }
      entityIds.add(entity.id);
      return true;
    })
    .map((entity) => {
      const graphScore = scores.get(entity.id) ?? 0;
      return {
        entity,
        score: graphScore,
        graphProximityScore: graphScore,
      };
    })
    .sort(compareScoredEntities);
}

export class DefaultGraphSearchEngine implements GraphSearchEngine {
  constructor(
    private readonly graphService: KnowledgeGraphService,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledgeGraphSearch",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledgeGraphSearch",
      resource,
    });
  }

  async search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    startEntityId?: string,
  ): Promise<readonly ScoredEntity[]> {
    assertTenantContext(ctx);

    const resolvedStart = resolveGraphStartEntityId(startEntityId, query);
    if (!resolvedStart) {
      return [];
    }

    this.assertReadAccess(ctx, resolvedStart);

    let traversal: TraversalResult;
    try {
      traversal = await this.graphService.traverse(ctx, resolvedStart, {
        validatedOnly: resolveGraphValidatedOnly(query),
        maxDepth: MAX_GRAPH_TRAVERSAL_DEPTH,
      });
    } catch (error) {
      if (error instanceof KnowledgeEntityNotFoundError) {
        return [];
      }
      throw error;
    }

    const scores = computeGraphProximityScores(resolvedStart, traversal);
    const ranked = mapTraversalToScoredEntities(traversal, scores, query, ctx.tenantId);

    return ranked.slice(0, resolveTopK(query));
  }
}
