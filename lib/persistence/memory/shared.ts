/**
 * ORION Persistence — shared in-memory repository utilities.
 */

import type { Organization, User, Workspace } from "@/types/auth";
import type {
  Entity,
  PaginatedResult,
  Pagination,
  RepositoryResult,
  TenantContext,
} from "@/types/persistence";
import { tenantMismatchError, validationError } from "@/lib/persistence/errors";
import { failure, success } from "@/lib/persistence/result";
import { validateTenantContext } from "@/lib/persistence/tenant-context";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

/** Extended in-memory repository capabilities for development and testing. */
export interface InMemoryRepositoryExtensions<T extends Entity> {
  findAll(context: TenantContext): Promise<RepositoryResult<T[]>>;
  exists(id: string, context: TenantContext): Promise<RepositoryResult<boolean>>;
  count(context: TenantContext): Promise<RepositoryResult<number>>;
  /** Removes all entities scoped to the active tenant. Development/testing only. */
  clear(context: TenantContext): Promise<RepositoryResult<void>>;
}

/** Validates tenant context before repository operations. */
export function guardTenantContext(
  context: TenantContext,
): RepositoryResult<TenantContext> {
  return validateTenantContext(context);
}

/** Returns true when a user belongs to the active tenant scope. */
export function matchesUserTenant(
  user: User,
  context: TenantContext,
): boolean {
  return (
    user.organizationId === context.organizationId &&
    user.workspaceId === context.workspaceId
  );
}

/** Returns true when a workspace belongs to the active tenant scope. */
export function matchesWorkspaceTenant(
  workspace: Workspace,
  context: TenantContext,
): boolean {
  return (
    workspace.organizationId === context.organizationId &&
    workspace.id === context.workspaceId
  );
}

/** Returns true when an organization id matches the active tenant scope. */
export function matchesOrganizationTenant(
  organizationId: string,
  context: TenantContext,
): boolean {
  return organizationId === context.organizationId;
}

/** Ensures an entity organization matches the tenant context. */
export function ensureOrganizationScope(
  organizationId: string,
  context: TenantContext,
): RepositoryResult<true> {
  if (!matchesOrganizationTenant(organizationId, context)) {
    return failure(
      tenantMismatchError({
        message: "Entity does not belong to the active organization.",
        details: {
          expectedOrganizationId: context.organizationId,
          actualOrganizationId: organizationId,
        },
      }),
    );
  }

  return success(true);
}

/** Ensures an entity workspace matches the tenant context. */
export function ensureWorkspaceScope(
  workspaceId: string,
  context: TenantContext,
): RepositoryResult<true> {
  if (workspaceId !== context.workspaceId) {
    return failure(
      tenantMismatchError({
        message: "Entity does not belong to the active workspace.",
        details: {
          expectedWorkspaceId: context.workspaceId,
          actualWorkspaceId: workspaceId,
        },
      }),
    );
  }

  return success(true);
}

/** Validates required entity fields before persistence. */
export function ensureEntityId(
  id: string | undefined,
  entityName: string,
): RepositoryResult<string> {
  if (typeof id !== "string" || id.trim().length === 0) {
    return failure(
      validationError({
        message: `${entityName}.id is required.`,
      }),
    );
  }

  return success(id.trim());
}

/** Applies pagination to an in-memory collection. */
export function paginateItems<T>(
  items: T[],
  pagination?: Pagination,
): PaginatedResult<T> {
  const page = pagination?.page ?? DEFAULT_PAGE;
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const start = (page - 1) * pageSize;
  const paginatedItems = items.slice(start, start + pageSize);

  return {
    items: paginatedItems,
    pagination: { page, pageSize },
    total: items.length,
  };
}

/** Filters users visible within the active tenant scope. */
export function filterUsersByTenant(
  users: Iterable<User>,
  context: TenantContext,
): User[] {
  return Array.from(users).filter((user) => matchesUserTenant(user, context));
}

/** Filters workspaces visible within the active tenant scope. */
export function filterWorkspacesByTenant(
  workspaces: Iterable<Workspace>,
  context: TenantContext,
): Workspace[] {
  return Array.from(workspaces).filter((workspace) =>
    matchesWorkspaceTenant(workspace, context),
  );
}

/** Returns the active organization when present in storage. */
export function findOrganizationInScope(
  store: ReadonlyMap<string, Organization>,
  context: TenantContext,
): Organization | null {
  const organization = store.get(context.organizationId);

  if (!organization || !matchesOrganizationTenant(organization.id, context)) {
    return null;
  }

  return organization;
}
