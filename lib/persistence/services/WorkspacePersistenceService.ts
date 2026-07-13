/**
 * ORION Persistence — workspace persistence service.
 */

import type { Workspace } from "@/types/auth";
import type { RepositoryResult, TenantContext } from "@/types/persistence";
import { validationError } from "@/lib/persistence/errors";
import { failure, success } from "@/lib/persistence/result";
import type {
  AuditRepository,
  ExtendedRepository,
  TransactionManager,
} from "@/lib/persistence/services/shared";
import {
  BasePersistenceService,
  validateRequiredId,
  validateSlugFormat,
} from "@/lib/persistence/services/shared";

export class WorkspacePersistenceService extends BasePersistenceService<Workspace> {
  protected readonly entityName = "Workspace";

  constructor(
    repository: ExtendedRepository<Workspace>,
    auditRepository: AuditRepository,
    transactionManager: TransactionManager,
  ) {
    super(repository, auditRepository, transactionManager);
  }

  async findById(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace | null>> {
    return this.executeRead(context, async () => {
      const idResult = validateRequiredId(id, this.entityName);

      if (!idResult.success) {
        return idResult;
      }

      return this.repository.findById(idResult.data, context);
    });
  }

  async findAll(
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace[]>> {
    return this.executeRead(context, () => this.repository.findAll(context));
  }

  async exists(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<boolean>> {
    return this.executeRead(context, async () => {
      const idResult = validateRequiredId(id, this.entityName);

      if (!idResult.success) {
        return idResult;
      }

      return this.repository.exists(idResult.data, context);
    });
  }

  async count(context: TenantContext): Promise<RepositoryResult<number>> {
    return this.executeRead(context, () => this.repository.count(context));
  }

  async create(
    entity: Workspace,
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace>> {
    const validationResult = this.validateWorkspace(entity, context);

    if (!validationResult.success) {
      return validationResult;
    }

    return this.executeWrite(
      context,
      () => this.repository.create(entity, context),
      {
        action: "create",
        entityId: entity.id,
      },
    );
  }

  async update(
    entity: Workspace,
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace>> {
    const validationResult = this.validateWorkspace(entity, context);

    if (!validationResult.success) {
      return validationResult;
    }

    return this.executeWrite(
      context,
      () => this.repository.update(entity, context),
      {
        action: "update",
        entityId: entity.id,
      },
    );
  }

  async delete(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<void>> {
    const idResult = validateRequiredId(id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    return this.executeWrite(
      context,
      () => this.repository.delete(idResult.data, context),
      {
        action: "delete",
        entityId: idResult.data,
      },
    );
  }

  private validateWorkspace(
    entity: Workspace,
    context: TenantContext,
  ): RepositoryResult<Workspace> {
    const idResult = validateRequiredId(entity.id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    if (!entity.name.trim()) {
      return failure(
        validationError({
          message: "Workspace.name is required.",
        }),
      );
    }

    const slugResult = validateSlugFormat(entity.slug);

    if (!slugResult.success) {
      return slugResult;
    }

    if (!Array.isArray(entity.modules)) {
      return failure(
        validationError({
          message: "Workspace.modules must be an array.",
        }),
      );
    }

    if (entity.organizationId !== context.organizationId) {
      return failure(
        validationError({
          message: "Workspace.organizationId must match the active organization.",
        }),
      );
    }

    if (entity.id !== context.workspaceId) {
      return failure(
        validationError({
          message: "Workspace.id must match the active workspace.",
        }),
      );
    }

    return success(entity);
  }
}
