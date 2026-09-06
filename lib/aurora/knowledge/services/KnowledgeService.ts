import type { EntityVersionRecord } from "@/lib/aurora/knowledge/domain/EntityVersionRecord";
import type { KnowledgeClassification } from "@/lib/aurora/knowledge/domain/KnowledgeClassification";
import { KNOWLEDGE_CLASSIFICATIONS } from "@/lib/aurora/knowledge/domain/KnowledgeClassification";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type { KnowledgeLifecycleStatus } from "@/lib/aurora/knowledge/domain/KnowledgeLifecycleStatus";
import { KNOWLEDGE_LIFECYCLE_STATUSES } from "@/lib/aurora/knowledge/domain/KnowledgeLifecycleStatus";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  knowledgeEntitySchemaRegistry,
  type PhaseOneEntityType,
} from "@/lib/aurora/knowledge/schemas/KnowledgeEntitySchemaRegistry";
import {
  knowledgeClassificationSchema,
  knowledgeEntityIdSchema,
  knowledgeLifecycleStatusSchema,
  sourceTrustSchema,
} from "@/lib/aurora/knowledge/schemas/knowledgeEntityEnvelope";
import type {
  KnowledgeEntityUpdateInput,
  KnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import type { RetrievalCache } from "@/lib/aurora/knowledge/cache/RetrievalCache";
import type { TaxonomyManager } from "@/lib/aurora/knowledge/services/TaxonomyManager";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export class KnowledgeUnsupportedEntityTypeError extends Error {
  readonly name = "KnowledgeUnsupportedEntityTypeError";

  constructor(entityType: string) {
    super(`Unsupported knowledge entity type: ${entityType}.`);
  }
}

export class KnowledgeInvalidEntityError extends Error {
  readonly name = "KnowledgeInvalidEntityError";

  constructor(message: string) {
    super(message);
  }
}

export class KnowledgeInvalidLifecycleTransitionError extends Error {
  readonly name = "KnowledgeInvalidLifecycleTransitionError";

  constructor(from: KnowledgeLifecycleStatus, to: KnowledgeLifecycleStatus) {
    super(`Invalid knowledge lifecycle transition: ${from} -> ${to}.`);
  }
}

export class KnowledgeInvalidTenantContextError extends Error {
  readonly name = "KnowledgeInvalidTenantContextError";

  constructor(message: string) {
    super(message);
  }
}

export type CreateKnowledgeEntityInput = {
  readonly entity: KnowledgeEntity;
};

export type UpdateKnowledgeEntityInput = KnowledgeEntityUpdateInput;

/**
 * Explicit lifecycle transitions from ES-AURORA-007 §2.10.
 * Status-unchanged updates are always permitted for content revisions.
 * §2.10 also permits any prior status -> rejected (admin/curator rejection).
 */
const EXPLICIT_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [KnowledgeLifecycleStatus, KnowledgeLifecycleStatus]
> = [
  ["acquired", "provisional"],
  ["provisional", "validated"],
  ["provisional", "rejected"],
  ["validated", "deprecated"],
  ["deprecated", "archived"],
] as const;

const IMMUTABLE_IDENTITY_FIELDS = ["id", "tenantId", "entityType", "domain"] as const;

export interface KnowledgeService {
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
  listEntities(ctx: AuroraRuntimeContext): Promise<readonly KnowledgeEntity[]>;
  getVersionHistory(
    ctx: AuroraRuntimeContext,
    entityId: string,
  ): Promise<readonly EntityVersionRecord[]>;
}

function isAllowedLifecycleTransition(
  from: KnowledgeLifecycleStatus,
  to: KnowledgeLifecycleStatus,
): boolean {
  if (from === to) {
    return true;
  }
  if (to === "rejected") {
    return true;
  }
  return EXPLICIT_LIFECYCLE_TRANSITIONS.some(([previous, next]) => previous === from && next === to);
}

function assertValidClassification(classification: KnowledgeClassification): void {
  if (!KNOWLEDGE_CLASSIFICATIONS.includes(classification)) {
    throw new KnowledgeInvalidEntityError(`Invalid knowledge classification: ${classification}.`);
  }
  const parsed = knowledgeClassificationSchema.safeParse(classification);
  if (!parsed.success) {
    throw new KnowledgeInvalidEntityError(parsed.error.message);
  }
}

function assertValidLifecycleStatus(status: KnowledgeLifecycleStatus): void {
  if (!KNOWLEDGE_LIFECYCLE_STATUSES.includes(status)) {
    throw new KnowledgeInvalidEntityError(`Invalid knowledge lifecycle status: ${status}.`);
  }
  const parsed = knowledgeLifecycleStatusSchema.safeParse(status);
  if (!parsed.success) {
    throw new KnowledgeInvalidEntityError(parsed.error.message);
  }
}

function validateRegisteredEntityType(entity: KnowledgeEntity): void {
  const definition = knowledgeEntityRegistry.get(entity.entityType);
  if (!definition) {
    throw new KnowledgeUnsupportedEntityTypeError(entity.entityType);
  }
  if (definition.domain && entity.domain !== definition.domain) {
    throw new KnowledgeInvalidEntityError(
      `Entity domain ${entity.domain} does not match registry domain ${definition.domain} for ${entity.entityType}.`,
    );
  }
}

function validateEnvelopeFields(entity: KnowledgeEntity): void {
  const idResult = knowledgeEntityIdSchema.safeParse(entity.id);
  if (!idResult.success) {
    throw new KnowledgeInvalidEntityError(idResult.error.message);
  }

  const trustResult = sourceTrustSchema.safeParse(entity.sourceTrust);
  if (!trustResult.success) {
    throw new KnowledgeInvalidEntityError(trustResult.error.message);
  }

  assertValidLifecycleStatus(entity.status);
  assertValidClassification(entity.classification);

  if (!entity.title.trim()) {
    throw new KnowledgeInvalidEntityError("title is required.");
  }
  if (!entity.curatorAgent.trim()) {
    throw new KnowledgeInvalidEntityError("curatorAgent is required.");
  }
  if (entity.version < 1) {
    throw new KnowledgeInvalidEntityError("version must be positive.");
  }
}

function validateKnowledgeEntity(entity: KnowledgeEntity): KnowledgeEntity {
  validateRegisteredEntityType(entity);
  validateEnvelopeFields(entity);

  if (knowledgeEntitySchemaRegistry.isPhaseOne(entity.entityType)) {
    return knowledgeEntitySchemaRegistry.parse(entity.entityType as PhaseOneEntityType, entity);
  }

  return entity;
}

function assertTenantOwnership(ctx: AuroraRuntimeContext, entity: KnowledgeEntity): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
  if (entity.tenantId !== ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError(
      `Entity tenant ${entity.tenantId} does not match runtime tenant ${ctx.tenantId}.`,
    );
  }
}

function assertImmutableIdentityFields(
  existing: KnowledgeEntity,
  next: KnowledgeEntity,
): void {
  for (const field of IMMUTABLE_IDENTITY_FIELDS) {
    if (existing[field] !== next[field]) {
      throw new KnowledgeInvalidEntityError(
        `Immutable identity field ${field} cannot change during update.`,
      );
    }
  }
}

export class DefaultKnowledgeService implements KnowledgeService {
  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly authorizationService: AuroraAuthorizationService,
    private readonly taxonomyManager: TaxonomyManager,
    private readonly retrievalCache?: RetrievalCache,
  ) {}

  private assertTaxonomyPlacement(entity: KnowledgeEntity): void {
    const result = this.taxonomyManager.validateEntityPlacement(entity);
    if (!result.valid) {
      throw new KnowledgeInvalidEntityError(result.errors.join("; "));
    }
  }

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledge",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledge",
      resource,
    });
  }

  private assertWriteAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "writeKnowledge",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.write", {
      operation: "writeKnowledge",
      resource,
    });
  }

  private async invalidateRetrievalCacheAfterWrite(
    ctx: AuroraRuntimeContext,
    entity: KnowledgeEntity,
  ): Promise<void> {
    if (!this.retrievalCache) {
      return;
    }

    await this.retrievalCache.invalidate({
      tenantId: ctx.tenantId,
      brandId: entity.brandId?.trim() ? entity.brandId : undefined,
    });
  }

  async createEntity(
    ctx: AuroraRuntimeContext,
    input: CreateKnowledgeEntityInput,
  ): Promise<KnowledgeEntity> {
    this.assertWriteAccess(ctx, input.entity.id);
    assertTenantOwnership(ctx, input.entity);

    if (input.entity.version !== 1) {
      throw new KnowledgeInvalidEntityError("New knowledge entities must start at version 1.");
    }

    const validated = validateKnowledgeEntity(input.entity);
    this.assertTaxonomyPlacement(validated);
    const created = await this.repository.create(ctx.tenantId, validated);
    await this.invalidateRetrievalCacheAfterWrite(ctx, created);
    return created;
  }

  async getEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<KnowledgeEntity | null> {
    this.assertReadAccess(ctx, entityId);
    return this.repository.getById(ctx.tenantId, entityId);
  }

  async updateEntity(
    ctx: AuroraRuntimeContext,
    entityId: string,
    input: UpdateKnowledgeEntityInput,
  ): Promise<KnowledgeEntity> {
    this.assertWriteAccess(ctx, entityId);
    assertTenantOwnership(ctx, input.entity);

    if (input.entity.id !== entityId) {
      throw new KnowledgeInvalidEntityError("Update entity id must match the requested entity id.");
    }

    const existing = await this.repository.getById(ctx.tenantId, entityId);
    const validated = validateKnowledgeEntity(input.entity);

    if (existing) {
      assertImmutableIdentityFields(existing, validated);

      if (!isAllowedLifecycleTransition(existing.status, validated.status)) {
        throw new KnowledgeInvalidLifecycleTransitionError(existing.status, validated.status);
      }
    }

    this.assertTaxonomyPlacement(validated);

    const updated = await this.repository.update(ctx.tenantId, entityId, {
      ...input,
      entity: validated,
    });
    await this.invalidateRetrievalCacheAfterWrite(ctx, updated);
    return updated;
  }

  async listEntities(ctx: AuroraRuntimeContext): Promise<readonly KnowledgeEntity[]> {
    this.assertReadAccess(ctx, ctx.tenantId);
    return this.repository.list(ctx.tenantId);
  }

  async getVersionHistory(
    ctx: AuroraRuntimeContext,
    entityId: string,
  ): Promise<readonly EntityVersionRecord[]> {
    this.assertReadAccess(ctx, entityId);
    return this.repository.getVersionHistory(ctx.tenantId, entityId);
  }
}
