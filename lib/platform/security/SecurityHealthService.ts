/**
 * Security health monitoring (Mission P-015.6 · ADR-009 · ADR-011).
 */

import { isFailClosedEnabled } from "@/lib/platform/security/AuthenticationContext";
import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { defaultRoleRegistry } from "@/lib/platform/security/RoleRegistry";

export type SecurityHealthStatus = "healthy" | "degraded" | "unhealthy";

export type SecurityHealthReport = {
  readonly status: SecurityHealthStatus;
  readonly message: string;
  readonly failClosed: boolean;
  readonly permissionCount: number;
  readonly roleAssignmentCount: number;
  readonly defaultDeny: boolean;
  readonly checkedAt: string;
};

/** Reports platform security subsystem readiness. */
export class SecurityHealthService {
  getReport(): SecurityHealthReport {
    const permissionCount = defaultPermissionRegistry.list().length;
    const roleAssignmentCount = defaultRoleRegistry.getPermissionsForRole("super_admin").size;
    const failClosed = isFailClosedEnabled();

    let status: SecurityHealthStatus = "healthy";
    let message = "Enterprise RBAC operational.";

    if (permissionCount === 0) {
      status = "unhealthy";
      message = "Permission registry is empty.";
    } else if (!failClosed && process.env.NODE_ENV === "production") {
      status = "degraded";
      message = "Fail-closed authentication disabled in production.";
    }

    return {
      status,
      message,
      failClosed,
      permissionCount,
      roleAssignmentCount,
      defaultDeny: true,
      checkedAt: new Date().toISOString(),
    };
  }
}

export const securityHealthService = new SecurityHealthService();

export function toObservabilitySecurityStatus(
  status: SecurityHealthStatus,
): "healthy" | "degraded" | "unhealthy" {
  return status;
}
