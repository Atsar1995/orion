/**
 * ORION Persistence — organization persistence service.
 */

import type { Organization } from "@/types/auth";
import { OrganizationStatus } from "@/types/auth";
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

const VALID_ORGANIZATION_STATUSES = new Set<string>(
  Object.values(OrganizationStatus),
);

export class OrganizationPersistenceService extends BasePersistenceService<Organization> {
  protected readonly entityName = "Organization";

  constructor(
    repository: ExtendedRepository<Organization>,
    auditRepository: AuditRepository,
    transactionManager: TransactionManager,
  ) {
    super(repository, auditRepository, transactionManager);
  }

  async findById(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<Organization | null>> {
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
  ): Promise<RepositoryResult<Organization[]>> {
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
    entity: Organization,
    context: TenantContext,
  ): Promise<RepositoryResult<Organization>> {
    const validationResult = this.validateOrganization(entity, context);

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
    entity: Organization,
    context: TenantContext,
  ): Promise<RepositoryResult<Organization>> {
    const validationResult = this.validateOrganization(entity, context);

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

  private validateOrganization(
    entity: Organization,
    context: TenantContext,
  ): RepositoryResult<Organization> {
    const idResult = validateRequiredId(entity.id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    if (!entity.name.trim()) {
      return failure(
        validationError({
          message: "Organization.name is required.",
        }),
      );
    }

    const slugResult = validateSlugFormat(entity.slug);

    if (!slugResult.success) {
      return slugResult;
    }

    if (!VALID_ORGANIZATION_STATUSES.has(entity.status)) {
      return failure(
        validationError({
          message: "Organization.status is invalid.",
        }),
      );
    }

    if (entity.id !== context.organizationId) {
      return failure(
        validationError({
          message: "Organization.id must match the active organization.",
        }),
      );
    }

    return success(entity);
  }
}
