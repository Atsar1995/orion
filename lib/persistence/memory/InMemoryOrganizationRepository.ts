/**
 * ORION Persistence — in-memory organization repository.
 */

import type { Organization } from "@/types/auth";
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
  findOrganizationInScope,
  guardTenantContext,
  matchesOrganizationTenant,
  paginateItems,
} from "@/lib/persistence/memory/shared";

export class InMemoryOrganizationRepository
  implements Repository<Organization>, InMemoryRepositoryExtensions<Organization>
{
  readonly entityName = "Organization";

  private readonly store = new Map<string, Organization>();

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
  ): Promise<RepositoryResult<Organization | null>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (!matchesOrganizationTenant(id, context)) {
      return success(null);
    }

    const organization = findOrganizationInScope(this.store, context);

    return success(organization);
  }

  async findMany(
    context: TenantContext,
    options?: RepositoryOptions,
  ): Promise<RepositoryResult<PaginatedResult<Organization>>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const organization = findOrganizationInScope(this.store, context);
    const items = organization ? [organization] : [];

    return success(paginateItems(items, options?.pagination));
  }

  async findAll(
    context: TenantContext,
  ): Promise<RepositoryResult<Organization[]>> {
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

    const organization = findOrganizationInScope(this.store, context);

    return success(organization ? 1 : 0);
  }

  async clear(context: TenantContext): Promise<RepositoryResult<void>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (this.store.has(context.organizationId)) {
      this.store.delete(context.organizationId);
    }

    return success(undefined);
  }

  async create(
    entity: Organization,
    context: TenantContext,
  ): Promise<RepositoryResult<Organization>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const idResult = ensureEntityId(entity.id, this.entityName);

    if (!idResult.success) {
      return idResult;
    }

    if (!entity.name.trim() || !entity.slug.trim()) {
      return failure(
        validationError({
          message: "Organization.name and Organization.slug are required.",
        }),
      );
    }

    const organizationResult = ensureOrganizationScope(entity.id, context);

    if (!organizationResult.success) {
      return organizationResult;
    }

    if (this.store.has(entity.id)) {
      return failure(
        conflictError({
          message: `Organization with id '${entity.id}' already exists.`,
        }),
      );
    }

    this.store.set(entity.id, entity);
    return success(entity);
  }

  async update(
    entity: Organization,
    context: TenantContext,
  ): Promise<RepositoryResult<Organization>> {
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
          message: `Organization with id '${entity.id}' was not found.`,
        }),
      );
    }

    const organizationResult = ensureOrganizationScope(entity.id, context);

    if (!organizationResult.success) {
      return organizationResult;
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

    if (!this.store.has(id)) {
      return failure(
        notFoundError({
          message: `Organization with id '${id}' was not found.`,
        }),
      );
    }

    const organizationResult = ensureOrganizationScope(id, context);

    if (!organizationResult.success) {
      return organizationResult;
    }

    this.store.delete(id);
    return success(undefined);
  }
}
