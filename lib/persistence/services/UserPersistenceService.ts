/**
 * ORION Persistence — user persistence service.
 */

import { SystemRole } from "@/lib/auth/roles";
import type { User } from "@/types/auth";
import { UserStatus } from "@/types/auth";
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
  validateEmailFormat,
  validateRequiredId,
} from "@/lib/persistence/services/shared";

const VALID_USER_STATUSES = new Set<string>(Object.values(UserStatus));
const VALID_ROLES = new Set<string>(Object.values(SystemRole));

export class UserPersistenceService extends BasePersistenceService<User> {
  protected readonly entityName = "User";

  constructor(
    repository: ExtendedRepository<User>,
    auditRepository: AuditRepository,
    transactionManager: TransactionManager,
  ) {
    super(repository, auditRepository, transactionManager);
  }

  async findById(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<User | null>> {
    return this.executeRead(context, async () => {
      const idResult = validateRequiredId(id, this.entityName);

      if (!idResult.success) {
        return idResult;
      }

      return this.repository.findById(idResult.data, context);
    });
  }

  async findAll(context: TenantContext): Promise<RepositoryResult<User[]>> {
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
    entity: User,
    context: TenantContext,
  ): Promise<RepositoryResult<User>> {
    const validationResult = this.validateUserForCreate(entity, context);

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
    entity: User,
    context: TenantContext,
  ): Promise<RepositoryResult<User>> {
    const validationResult = this.validateUserForUpdate(entity, context);

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

  private validateUserForCreate(
    entity: User,
    context: TenantContext,
  ): RepositoryResult<User> {
    const idResult = validateRequiredId(entity.id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    const emailResult = validateEmailFormat(entity.email);

    if (!emailResult.success) {
      return emailResult;
    }

    if (!entity.name.trim()) {
      return failure(
        validationError({
          message: "User.name is required.",
        }),
      );
    }

    if (!VALID_USER_STATUSES.has(entity.status)) {
      return failure(
        validationError({
          message: "User.status is invalid.",
        }),
      );
    }

    if (!VALID_ROLES.has(entity.role)) {
      return failure(
        validationError({
          message: "User.role is invalid.",
        }),
      );
    }

    if (entity.organizationId !== context.organizationId) {
      return failure(
        validationError({
          message: "User.organizationId must match the active organization.",
        }),
      );
    }

    if (entity.workspaceId !== context.workspaceId) {
      return failure(
        validationError({
          message: "User.workspaceId must match the active workspace.",
        }),
      );
    }

    return success(entity);
  }

  private validateUserForUpdate(
    entity: User,
    context: TenantContext,
  ): RepositoryResult<User> {
    const createValidation = this.validateUserForCreate(entity, context);

    if (!createValidation.success) {
      return createValidation;
    }

    return success(entity);
  }
}
