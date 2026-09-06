import {
  assignScoredEntitiesToLayers,
  buildLayerContent,
  deduplicateScoredEntities,
  passesAssemblyEntityFilters,
} from "@/lib/aurora/knowledge/retrieval/contextAssembly";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  CONTEXT_LAYER_KEYS,
  CONTEXT_LAYER_TOKEN_LIMITS,
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  type ContextAssemblyRequest,
  type ContextLayer,
  type ContextPackage,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export interface ContextAssembler {
  assemble(ctx: AuroraRuntimeContext, request: ContextAssemblyRequest): Promise<ContextPackage>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

function resolveGlobalTokenBudget(request: ContextAssemblyRequest): number {
  if (request.maxTokens === undefined) {
    return RETRIEVAL_MAX_CONTEXT_TOKENS;
  }

  return Math.min(request.maxTokens, RETRIEVAL_MAX_CONTEXT_TOKENS);
}

export class DefaultContextAssembler implements ContextAssembler {
  constructor(private readonly authorizationService: AuroraAuthorizationService) {}

  private assertReadAccess(ctx: AuroraRuntimeContext): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "assembleKnowledgeContext",
      resource: "context-package",
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "assembleKnowledgeContext",
      resource: "context-package",
    });
  }

  async assemble(ctx: AuroraRuntimeContext, request: ContextAssemblyRequest): Promise<ContextPackage> {
    assertTenantContext(ctx);
    this.assertReadAccess(ctx);

    const globalTokenBudget = resolveGlobalTokenBudget(request);
    const filtered = deduplicateScoredEntities(request.scoredEntities).filter((scored) =>
      passesAssemblyEntityFilters(scored, ctx, {
        validatedOnly: request.validatedOnly,
        includeProvisional: request.includeProvisional,
      }),
    );

    const grouped = assignScoredEntitiesToLayers(
      filtered,
      request.taskType,
      request.campaignId,
    );

    const layers: ContextLayer[] = [];
    const includedEntities = new Map<string, ContextPackage["entities"][number]>();
    let totalTokens = 0;

    for (const layerKey of CONTEXT_LAYER_KEYS) {
      const layerResult = buildLayerContent(
        grouped[layerKey],
        CONTEXT_LAYER_TOKEN_LIMITS[layerKey],
        globalTokenBudget - totalTokens,
      );

      layers.push({
        key: layerKey,
        content: layerResult.content,
        tokenCount: layerResult.tokenCount,
        maxTokens: CONTEXT_LAYER_TOKEN_LIMITS[layerKey],
      });

      for (const entity of layerResult.includedEntities) {
        includedEntities.set(entity.id, entity);
      }

      totalTokens += layerResult.tokenCount;
    }

    return {
      layers,
      totalTokens,
      maxTokens: globalTokenBudget,
      entities: [...includedEntities.values()].sort((left, right) => left.id.localeCompare(right.id)),
      assembledAt: new Date().toISOString(),
    };
  }
}
