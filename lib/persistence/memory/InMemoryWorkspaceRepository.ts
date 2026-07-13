/**
 * ORION Persistence — in-memory workspace repository.
 */

import type { Workspace } from "@/types/auth";
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
  filterWorkspacesByTenant,
  guardTenantContext,
  matchesWorkspaceTenant,
  paginateItems,
} from "@/lib/persistence/memory/shared";

export class InMemoryWorkspaceRepository
  implements Repository<Workspace>, InMemoryRepositoryExtensions<Workspace>
{
  readonly entityName = "Workspace";

  private readonly store = new Map<string, Workspace>();

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
  ): Promise<RepositoryResult<Workspace | null>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const workspace = this.store.get(id);

    if (!workspace || !matchesWorkspaceTenant(workspace, context)) {
      return success(null);
    }

    return success(workspace);
  }

  async findMany(
    context: TenantContext,
    options?: RepositoryOptions,
  ): Promise<RepositoryResult<PaginatedResult<Workspace>>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const workspaces = filterWorkspacesByTenant(this.store.values(), context);

    return success(paginateItems(workspaces, options?.pagination));
  }

  async findAll(
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace[]>> {
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

    const total = filterWorkspacesByTenant(this.store.values(), context).length;

    return success(total);
  }

  async clear(context: TenantContext): Promise<RepositoryResult<void>> {
    const contextResult = guardTenantContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    for (const [id, workspace] of this.store) {
      if (matchesWorkspaceTenant(workspace, context)) {
        this.store.delete(id);
      }
    }

    return success(undefined);
  }

  async create(
    entity: Workspace,
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace>> {
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
          message: "Workspace.name and Workspace.slug are required.",
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

    const workspaceResult = ensureWorkspaceScope(entity.id, context);

    if (!workspaceResult.success) {
      return workspaceResult;
    }

    if (this.store.has(entity.id)) {
      return failure(
        conflictError({
          message: `Workspace with id '${entity.id}' already exists.`,
        }),
      );
    }

    this.store.set(entity.id, entity);
    return success(entity);
  }

  async update(
    entity: Workspace,
    context: TenantContext,
  ): Promise<RepositoryResult<Workspace>> {
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
          message: `Workspace with id '${entity.id}' was not found.`,
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

    const workspaceResult = ensureWorkspaceScope(entity.id, context);

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
          message: `Workspace with id '${id}' was not found.`,
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

    const workspaceResult = ensureWorkspaceScope(existing.id, context);

    if (!workspaceResult.success) {
      return workspaceResult;
    }

    this.store.delete(id);
    return success(undefined);
  }
}
