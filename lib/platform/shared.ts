/**
 * ORION Platform Services — shared platform helpers.
 */

import type { PlatformEvent, ServiceContext, ServiceResult } from "@/types/services";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";

/** Validates service context at the platform service boundary. */
export function validatePlatformServiceContext(
  context: ServiceContext,
): ServiceResult<ServiceContext> {
  if (!context.organizationId.trim()) {
    return failure(
      validationError({
        message: "ServiceContext.organizationId is required.",
      }),
    );
  }

  if (!context.workspaceId.trim()) {
    return failure(
      validationError({
        message: "ServiceContext.workspaceId is required.",
      }),
    );
  }

  if (!context.userId.trim()) {
    return failure(
      validationError({
        message: "ServiceContext.userId is required.",
      }),
    );
  }

  if (!context.role.trim()) {
    return failure(
      validationError({
        message: "ServiceContext.role is required.",
      }),
    );
  }

  return success(context);
}

/** Ensures an event tenant scope matches the active service context. */
export function ensureEventTenantAlignment(
  event: PlatformEvent,
  context: ServiceContext,
): ServiceResult<PlatformEvent> {
  if (
    event.tenantContext.organizationId !== context.organizationId ||
    event.tenantContext.workspaceId !== context.workspaceId
  ) {
    return failure(
      validationError({
        message: "PlatformEvent.tenantContext does not match the active service context.",
        details: {
          expectedOrganizationId: context.organizationId,
          expectedWorkspaceId: context.workspaceId,
          actualOrganizationId: event.tenantContext.organizationId,
          actualWorkspaceId: event.tenantContext.workspaceId,
        },
      }),
    );
  }

  return success(event);
}

/** Builds a deterministic subscriber identity from service context. */
export function createSubscriberIdentity(context: ServiceContext): string {
  return `${context.organizationId}:${context.workspaceId}:${context.userId}`;
}
