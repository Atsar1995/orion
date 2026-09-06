import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type {
  KnowledgeRelationship,
  RelationshipDirection,
} from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import type { KnowledgeRepository } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import { KnowledgeEntityNotFoundError } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import type {
  CreateKnowledgeEntityInput,
  KnowledgeService,
  UpdateKnowledgeEntityInput,
} from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  applyRelationshipWeightDecay,
  RelationshipEngine,
  type CreateRelationshipInput,
} from "@/lib/aurora/knowledge/services/RelationshipEngine";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

/** Maximum traversal depth (ES-AURORA-007 KG-1 · Appendix B). */
export const MAX_GRAPH_TRAVERSAL_DEPTH = 3;

/** Maximum entities returned per traversal (Appendix B). */
export const MAX_GRAPH_TRAVERSAL_ENTITIES = 20;

export type EntityQuery = {
  readonly domain?: KnowledgeEntity["domain"];
  readonly brandId?: string;
  readonly status?: KnowledgeEntity["status"];
  readonly entityType?: string;
};

export type GraphSnapshot = {
  readonly entities: readonly KnowledgeEntity[];
  readonly relationships: readonly KnowledgeRelationship[];
};

export type TraversalOptions = {
  readonly maxDepth?: number;
  readonly validatedOnly?: boolean;
  readonly direction?: RelationshipDirection;
};

export type TraversalResult = {
  readonly entities: readonly KnowledgeEntity[];
  readonly relationships: readonly KnowledgeRelationship[];
  readonly depthReached: number;
};

export type CrossDomainQuery = {
  readonly domains: readonly KnowledgeDomain[];
  readonly brandId?: string;
  readonly validatedOnly?: boolean;
};

export interface KnowledgeGraphService {
  createEntity(
    ctx: AuroraRuntimeContext,
    input: CreateKnowledgeEntityInput,
  ): Promise<KnowledgeEntity>;
  getEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<KnowledgeEntity | null>;
  updateEntity(
    ctx: AuroraRuntimeContext,
    entityId: string,
    input: UpdateKnowledgeEntityInput,
  ): Promise<KnowledgeEntity>;
  deprecateEntity(
    ctx: AuroraRuntimeContext,
    entityId: string,
    reason: string,
  ): Promise<KnowledgeEntity>;
  listEntities(
    ctx: AuroraRuntimeContext,
    query?: EntityQuery,
  ): Promise<readonly KnowledgeEntity[]>;
  createRelationship(
    ctx: AuroraRuntimeContext,
    input: CreateRelationshipInput,
  ): Promise<KnowledgeRelationship>;
  getRelationships(
    ctx: AuroraRuntimeContext,
    entityId: string,
    direction?: RelationshipDirection,
  ): Promise<readonly KnowledgeRelationship[]>;
  traverse(
    ctx: AuroraRuntimeContext,
    startEntityId: string,
    options?: TraversalOptions,
  ): Promise<TraversalResult>;
  brandCentricQuery(ctx: AuroraRuntimeContext, brandId: string): Promise<GraphSnapshot>;
  campaignCentricQuery(ctx: AuroraRuntimeContext, campaignId: string): Promise<GraphSnapshot>;
  crossDomainQuery(ctx: AuroraRuntimeContext, query: CrossDomainQuery): Promise<GraphSnapshot>;
  getVersionHistory(
    ctx: AuroraRuntimeContext,
    entityId: string,
  ): ReturnType<KnowledgeService["getVersionHistory"]>;
}

type TraversalQueueItem = {
  readonly entityId: string;
  readonly depth: number;
  readonly path: readonly string[];
};

function matchesEntityQuery(entity: KnowledgeEntity, query?: EntityQuery): boolean {
  if (!query) {
    return true;
  }
  if (query.domain && entity.domain !== query.domain) {
    return false;
  }
  if (query.brandId && entity.brandId !== query.brandId) {
    return false;
  }
  if (query.status && entity.status !== query.status) {
    return false;
  }
  if (query.entityType && entity.entityType !== query.entityType) {
    return false;
  }
  return true;
}

function withDecayedWeight(
  relationship: KnowledgeRelationship,
  targetEntity: KnowledgeEntity,
  referenceTime: string,
): KnowledgeRelationship {
  return {
    ...relationship,
    weight: applyRelationshipWeightDecay(relationship.weight, targetEntity.updatedAt, referenceTime),
  };
}

export class DefaultKnowledgeGraphService implements KnowledgeGraphService {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly relationshipEngine: RelationshipEngine,
    private readonly repository: KnowledgeRepository,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledgeGraph",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledgeGraph",
      resource,
    });
  }

  private assertWriteAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "writeKnowledgeGraph",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.write", {
      operation: "writeKnowledgeGraph",
      resource,
    });
  }

  createEntity(ctx: AuroraRuntimeContext, input: CreateKnowledgeEntityInput): Promise<KnowledgeEntity> {
    return this.knowledgeService.createEntity(ctx, input);
  }

  getEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<KnowledgeEntity | null> {
    return this.knowledgeService.getEntity(ctx, entityId);
  }

  updateEntity(
    ctx: AuroraRuntimeContext,
    entityId: string,
    input: UpdateKnowledgeEntityInput,
  ): Promise<KnowledgeEntity> {
    return this.knowledgeService.updateEntity(ctx, entityId, input);
  }

  async deprecateEntity(
    ctx: AuroraRuntimeContext,
    entityId: string,
    reason: string,
  ): Promise<KnowledgeEntity> {
    const current = await this.knowledgeService.getEntity(ctx, entityId);
    if (!current) {
      throw new KnowledgeEntityNotFoundError(entityId, ctx.tenantId);
    }

    return this.knowledgeService.updateEntity(ctx, entityId, {
      entity: {
        ...current,
        status: "deprecated",
        version: current.version + 1,
        updatedAt: new Date().toISOString(),
      },
      changedBy: ctx.userId,
      changeReason: reason,
    });
  }

  async listEntities(
    ctx: AuroraRuntimeContext,
    query?: EntityQuery,
  ): Promise<readonly KnowledgeEntity[]> {
    const entities = await this.knowledgeService.listEntities(ctx);
    return entities.filter((entity) => matchesEntityQuery(entity, query));
  }

  async createRelationship(
    ctx: AuroraRuntimeContext,
    input: CreateRelationshipInput,
  ): Promise<KnowledgeRelationship> {
    this.assertWriteAccess(ctx, input.sourceEntityId);
    return this.relationshipEngine.createRelationship(ctx.tenantId, input);
  }

  async getRelationships(
    ctx: AuroraRuntimeContext,
    entityId: string,
    direction: RelationshipDirection = "both",
  ): Promise<readonly KnowledgeRelationship[]> {
    this.assertReadAccess(ctx, entityId);
    return this.repository.getRelationships(ctx.tenantId, entityId, direction);
  }

  async traverse(
    ctx: AuroraRuntimeContext,
    startEntityId: string,
    options: TraversalOptions = {},
  ): Promise<TraversalResult> {
    this.assertReadAccess(ctx, startEntityId);

    const maxDepth = Math.min(options.maxDepth ?? MAX_GRAPH_TRAVERSAL_DEPTH, MAX_GRAPH_TRAVERSAL_DEPTH);
    const direction = options.direction ?? "both";
    const validatedOnly = options.validatedOnly ?? false;
    const referenceTime = new Date().toISOString();

    const startEntity = await this.repository.getById(ctx.tenantId, startEntityId);
    if (!startEntity) {
      throw new KnowledgeEntityNotFoundError(startEntityId, ctx.tenantId);
    }

    const entities = new Map<string, KnowledgeEntity>();
    const relationships = new Map<string, KnowledgeRelationship>();
    const visitedGlobal = new Set<string>();

    if (!validatedOnly || startEntity.status === "validated") {
      entities.set(startEntity.id, startEntity);
    }
    visitedGlobal.add(startEntity.id);

    const queue: TraversalQueueItem[] = [{ entityId: startEntityId, depth: 0, path: [startEntityId] }];
    let depthReached = 0;

    while (queue.length > 0 && entities.size < MAX_GRAPH_TRAVERSAL_ENTITIES) {
      const current = queue.shift()!;
      depthReached = Math.max(depthReached, current.depth);
      if (current.depth >= maxDepth) {
        continue;
      }

      const edges = await this.repository.getRelationships(ctx.tenantId, current.entityId, direction);
      for (const edge of edges) {
        const nextEntityId =
          edge.sourceEntityId === current.entityId ? edge.targetEntityId : edge.sourceEntityId;

        if (current.path.includes(nextEntityId)) {
          continue;
        }

        const nextEntity = await this.repository.getById(ctx.tenantId, nextEntityId);
        if (!nextEntity) {
          continue;
        }

        if (validatedOnly && nextEntity.status !== "validated") {
          continue;
        }

        const decayedEdge = withDecayedWeight(
          edge,
          nextEntity,
          referenceTime,
        );
        relationships.set(decayedEdge.id, decayedEdge);

        if (!visitedGlobal.has(nextEntityId) && entities.size < MAX_GRAPH_TRAVERSAL_ENTITIES) {
          entities.set(nextEntityId, nextEntity);
          visitedGlobal.add(nextEntityId);
          queue.push({
            entityId: nextEntityId,
            depth: current.depth + 1,
            path: [...current.path, nextEntityId],
          });
        }
      }
    }

    return {
      entities: [...entities.values()],
      relationships: [...relationships.values()],
      depthReached,
    };
  }

  async brandCentricQuery(ctx: AuroraRuntimeContext, brandId: string): Promise<GraphSnapshot> {
    this.assertReadAccess(ctx, brandId);
    const entities = await this.listEntities(ctx, { brandId });
    return this.buildSnapshot(ctx, entities);
  }

  async campaignCentricQuery(ctx: AuroraRuntimeContext, campaignId: string): Promise<GraphSnapshot> {
    this.assertReadAccess(ctx, campaignId);
    const campaignEntity = await this.repository.getById(ctx.tenantId, campaignId);
    if (!campaignEntity) {
      throw new KnowledgeEntityNotFoundError(campaignId, ctx.tenantId);
    }

    const relatedIds = new Set<string>([campaignId]);
    const inbound = await this.repository.getRelationships(ctx.tenantId, campaignId, "in");
    for (const relationship of inbound) {
      if (relationship.relationshipType === "part_of_campaign") {
        relatedIds.add(relationship.sourceEntityId);
      }
    }

    const entities: KnowledgeEntity[] = [];
    for (const entityId of relatedIds) {
      const entity = await this.repository.getById(ctx.tenantId, entityId);
      if (entity) {
        entities.push(entity);
      }
    }

    return this.buildSnapshot(ctx, entities);
  }

  async crossDomainQuery(ctx: AuroraRuntimeContext, query: CrossDomainQuery): Promise<GraphSnapshot> {
    this.assertReadAccess(ctx, ctx.tenantId);
    const domainSet = new Set(query.domains);
    const entities = (await this.listEntities(ctx)).filter((entity) => {
      if (!domainSet.has(entity.domain)) {
        return false;
      }
      if (query.brandId && entity.brandId !== query.brandId) {
        return false;
      }
      if (query.validatedOnly && entity.status !== "validated") {
        return false;
      }
      return true;
    });

    return this.buildSnapshot(ctx, entities);
  }

  getVersionHistory(ctx: AuroraRuntimeContext, entityId: string) {
    return this.knowledgeService.getVersionHistory(ctx, entityId);
  }

  private async buildSnapshot(
    ctx: AuroraRuntimeContext,
    entities: readonly KnowledgeEntity[],
  ): Promise<GraphSnapshot> {
    const entityIds = new Set(entities.map((entity) => entity.id));
    const relationships: KnowledgeRelationship[] = [];

    for (const entity of entities) {
      const edges = await this.repository.getRelationships(ctx.tenantId, entity.id, "both");
      for (const edge of edges) {
        if (entityIds.has(edge.sourceEntityId) && entityIds.has(edge.targetEntityId)) {
          relationships.push(edge);
        }
      }
    }

    const uniqueRelationships = [...new Map(relationships.map((edge) => [edge.id, edge])).values()];
    return { entities, relationships: uniqueRelationships };
  }
}
