/**
 * ORION Persistence — tenant context helpers.
 */

import type { RoleSlug } from "@/types/auth";
import type { TenantContext } from "@/types/persistence";
import { validationError } from "@/lib/persistence/errors";
import { failure, success } from "@/lib/persistence/result";
import type { RepositoryResult } from "@/types/persistence";

/** Input for constructing a tenant context. */
export interface CreateTenantContextInput {
  organizationId: string;
  workspaceId: string;
  userId: string;
  role: RoleSlug;
}

const REQUIRED_FIELDS: Array<keyof CreateTenantContextInput> = [
  "organizationId",
  "workspaceId",
  "userId",
  "role",
];

/** Creates a validated tenant context object. */
export function createTenantContext(
  input: CreateTenantContextInput,
): RepositoryResult<TenantContext> {
  const validation = validateTenantContext(input);

  if (!validation.success) {
    return validation;
  }

  return success({
    organizationId: input.organizationId.trim(),
    workspaceId: input.workspaceId.trim(),
    userId: input.userId.trim(),
    role: input.role,
  });
}

/** Validates that a tenant context contains all required fields. */
export function validateTenantContext(
  context: Partial<TenantContext>,
): RepositoryResult<TenantContext> {
  for (const field of REQUIRED_FIELDS) {
    const value = context[field];

    if (typeof value !== "string" || value.trim().length === 0) {
      return failure(
        validationError({
          message: `TenantContext.${field} is required.`,
        }),
      );
    }
  }

  return success(context as TenantContext);
}

/** Returns true when two tenant contexts belong to the same organization. */
export function isSameOrganization(
  left: TenantContext,
  right: TenantContext,
): boolean {
  return left.organizationId === right.organizationId;
}

/** Returns true when two tenant contexts belong to the same workspace. */
export function isSameWorkspace(
  left: TenantContext,
  right: TenantContext,
): boolean {
  return (
    left.organizationId === right.organizationId &&
    left.workspaceId === right.workspaceId
  );
}
