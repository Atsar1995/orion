import { randomUUID } from "crypto";
import type {
  MasterEntityRecord,
  MasterEntityStatus,
  RegisterMasterEntityInput,
  UpdateMasterEntityInput,
} from "@/types/enterprise-data";
import type { MasterEntityRepository } from "@/lib/platform/data/repositories/MasterEntityRepository";
import type { InMemoryMasterEntityRepository } from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import {
  createGlobalId,
  createMasterEntityId,
} from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import type { ServiceContext } from "@/types/services";
import { dataRulesEngine } from "@/lib/platform/data/DataRulesEngine";
import { publishMasterDataEvent } from "@/lib/platform/data/data-platform-events";

function nowIso(): string {
  return new Date().toISOString();
}

/** Master entity registration and lifecycle (Mission P-011.1). */
export class MasterDataRegistryService {
  constructor(private readonly repository: MasterEntityRepository) {}

  register(input: RegisterMasterEntityInput, context: ServiceContext): MasterEntityRecord {
    const errors = dataRulesEngine.validateRegistration(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const typeError = dataRulesEngine.validateEntityTypeRegistered(
      input.entityType,
      this.repository.findEntityType(input.entityType) !== null,
    );
    if (typeError) throw new Error(typeError.code);

    const existing = this.repository.findByBusinessKey(
      context.organizationId,
      input.entityType,
      input.businessKey,
    );
    if (existing) throw new Error("DUPLICATE_BUSINESS_KEY");

    const fingerprint = dataRulesEngine.buildFingerprint(
      context.organizationId,
      input.entityType,
      input.businessKey,
    );
    const duplicate = this.repository.findDuplicateFingerprint(context.organizationId, fingerprint);
    if (duplicate) throw new Error("DUPLICATE_ENTITY");

    const entity: MasterEntityRecord = {
      id: createMasterEntityId(),
      globalId: createGlobalId(context.organizationId, input.entityType, input.businessKey),
      organizationId: context.organizationId,
      entityType: input.entityType,
      businessKey: input.businessKey,
      displayName: input.displayName,
      domainKey: input.domainKey,
      status: "draft",
      version: 1,
      ownerId: input.ownerId,
      metadata: input.metadata,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      createdBy: context.userId ?? "system",
      updatedBy: context.userId ?? "system",
    };

    this.repository.create(entity);
    (this.repository as InMemoryMasterEntityRepository).setFingerprint?.(
      context.organizationId,
      fingerprint,
      entity.id,
    );

    publishMasterDataEvent(
      {
        eventType: "MasterEntityRegistered",
        entityType: entity.entityType,
        entityId: entity.id,
        correlationId: `corr-${randomUUID()}`,
        payload: { businessKey: entity.businessKey, globalId: entity.globalId },
      },
      context,
    );

    return entity;
  }

  update(input: UpdateMasterEntityInput, context: ServiceContext): MasterEntityRecord {
    const errors = dataRulesEngine.validateUpdate(input);
    if (errors.length > 0) throw new Error(errors[0].code);

    const existing = this.repository.findById(context.organizationId, input.entityId);
    if (!existing) throw new Error("ENTITY_NOT_FOUND");

    const accessError = dataRulesEngine.validateOrganizationAccess(existing, context);
    if (accessError) throw new Error(accessError.code);

    const updated: MasterEntityRecord = {
      ...existing,
      displayName: input.displayName ?? existing.displayName,
      ownerId: input.ownerId ?? existing.ownerId,
      metadata: input.metadata ?? existing.metadata,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    this.repository.update(updated);

    publishMasterDataEvent(
      {
        eventType: "MasterEntityUpdated",
        entityType: updated.entityType,
        entityId: updated.id,
        payload: { version: String(updated.version) },
      },
      context,
    );

    return updated;
  }

  activate(entityId: string, context: ServiceContext): MasterEntityRecord {
    return this.transition(entityId, "active", "MasterEntityActivated", context);
  }

  deactivate(entityId: string, context: ServiceContext): MasterEntityRecord {
    return this.transition(entityId, "inactive", "MasterEntityDeactivated", context);
  }

  archive(entityId: string, context: ServiceContext): MasterEntityRecord {
    return this.transition(entityId, "archived", "MasterEntityArchived", context);
  }

  softDelete(entityId: string, context: ServiceContext): MasterEntityRecord {
    return this.transition(entityId, "deleted", "MasterEntityArchived", context);
  }

  private transition(
    entityId: string,
    to: MasterEntityStatus,
    eventType: "MasterEntityActivated" | "MasterEntityDeactivated" | "MasterEntityArchived",
    context: ServiceContext,
  ): MasterEntityRecord {
    const existing = this.repository.findById(context.organizationId, entityId);
    if (!existing) throw new Error("ENTITY_NOT_FOUND");

    const lifecycleError = dataRulesEngine.validateLifecycleTransition(existing.status, to);
    if (lifecycleError) throw new Error(lifecycleError.code);

    const updated: MasterEntityRecord = {
      ...existing,
      status: to,
      version: existing.version + 1,
      updatedAt: nowIso(),
      updatedBy: context.userId ?? "system",
    };

    this.repository.update(updated);

    publishMasterDataEvent(
      { eventType, entityType: updated.entityType, entityId: updated.id, payload: { status: to } },
      context,
    );

    return updated;
  }
}
