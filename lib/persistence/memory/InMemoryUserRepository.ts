/**
 * ORION Persistence — in-memory user repository.
 */

import type { User } from "@/types/auth";
import type {
  PaginatedResult,
  RepositoryOptions,
  RepositoryResult,
  TenantContext,
} from "@/types/persistence";
import type { Repository } from "@/lib/persistence/repository";
import {
  conflictError,
  notFoundError,
  validationError,
} from "@/lib/persistence/errors";
import { failure, success } from "@/lib/persistence/result";
import type { InMemoryRepositoryExtensions } from "@/lib/persistence/memory/shared";
import {
  ensureEntityId,
  ensureOrganizationScope,
  ensureWorkspaceScope,
  filterUsersByTenant,
  guardTenantContext,
  matchesUserTenant,
  paginateItems,
} from "@/lib/persistence/memory/shared";

export class InMemoryUserRepository
  implements Repository<User>, InMemoryRepositoryExtensions<User>
{
  readonly entityName = "User";

  private readonly store = new Map<string, User>();

  supportsTenant(context: TenantContext): RepositoryResult<true> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return failure(contextResult.error);
    }

    return success(true);
  }

  async findById(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<User | null>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const user = this.store.get(id);

    if (!user || !matchesUserTenant(user, context)) {
      return success(null);
    }

    return success(user);
  }

  async findMany(
    context: TenantContext,
    options?: RepositoryOptions,
  ): Promise<RepositoryResult<PaginatedResult<User>>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const users = filterUsersByTenant(this.store.values(), context);

    return success(paginateItems(users, options?.pagination));
  }

  async findAll(
    context: TenantContext,
  ): Promise<RepositoryResult<User[]>> {
    const result = await this.findMany(context);

    if (!result.success) {
      return result;
    }

    return success(result.data.items);
  }

  async exists(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<boolean>> {
    const result = await this.findById(id, context);

    if (!result.success) {
      return result;
    }

    return success(result.data !== null);
  }

  async count(context: TenantContext): Promise<RepositoryResult<number>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const total = filterUsersByTenant(this.store.values(), context).length;

    return success(total);
  }

  async clear(context: TenantContext): Promise<RepositoryResult<void>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    for (const [id, user] of this.store) {
      if (matchesUserTenant(user, context)) {
        this.store.delete(id);
      }
    }

    return success(undefined);
  }

  async create(
    entity: User,
    context: TenantContext,
  ): Promise<RepositoryResult<User>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const idResult = ensureEntityId(entity.id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    if (!entity.email.trim()) {
      return failure(
        validationError({
          message: "User.email is required.",
        }),
      );
    }

    const organizationResult = ensureOrganizationScope(
      entity.organizationId,
      context,
    );

    if (!organizationResult.success) {
      return organizationResult;
    }

    const workspaceResult = ensureWorkspaceScope(entity.workspaceId, context);

    if (!workspaceResult.success) {
      return workspaceResult;
    }

    if (this.store.has(entity.id)) {
      return failure(
        conflictError({
          message: `User with id '${entity.id}' already exists.`,
        }),
      );
    }

    this.store.set(entity.id, entity);
    return success(entity);
  }

  async update(
    entity: User,
    context: TenantContext,
  ): Promise<RepositoryResult<User>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const idResult = ensureEntityId(entity.id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    if (!this.store.has(entity.id)) {
      return failure(
        notFoundError({
          message: `User with id '${entity.id}' was not found.`,
        }),
      );
    }

    const organizationResult = ensureOrganizationScope(
      entity.organizationId,
      context,
    );

    if (!organizationResult.success) {
      return organizationResult;
    }

    const workspaceResult = ensureWorkspaceScope(entity.workspaceId, context);

    if (!workspaceResult.success) {
      return workspaceResult;
    }

    this.store.set(entity.id, entity);
    return success(entity);
  }

  async delete(
    id: string,
    context: TenantContext,
  ): Promise<RepositoryResult<void>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const existing = this.store.get(id);

    if (!existing) {
      return failure(
        notFoundError({
          message: `User with id '${id}' was not found.`,
        }),
      );
    }

    const organizationResult = ensureOrganizationScope(
      existing.organizationId,
      context,
    );

    if (!organizationResult.success) {
      return organizationResult;
    }

    const workspaceResult = ensureWorkspaceScope(
      existing.workspaceId,
      context,
    );

    if (!workspaceResult.success) {
      return workspaceResult;
    }

    this.store.delete(id);
    return success(undefined);
  }
}
