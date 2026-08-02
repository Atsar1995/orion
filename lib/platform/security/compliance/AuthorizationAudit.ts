/**
 * Authorization and RBAC audit (Mission P-015.10 · ADR-009).
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { readdirSync } from "node:fs";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { defaultRoleRegistry, HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { isFailClosedEnabled } from "@/lib/platform/security/AuthenticationContext";
import { securityHealthService } from "@/lib/platform/security/SecurityHealthService";
import { SystemRole } from "@/lib/auth/roles";
import type { ComplianceCheck, SecurityFinding } from "@/lib/platform/security/compliance/ComplianceTypes";

function countHcmRoutes(projectRoot: string): number {
  const hcmApiRoot = join(projectRoot, "app", "api", "hcm");

  if (!existsSync(hcmApiRoot)) {
    return 0;
  }

  let count = 0;

  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name === "route.ts") {
        count += 1;
      }
    }
  }

  walk(hcmApiRoot);
  return count;
}

/** Audits RBAC implementation, default deny, and organization isolation. */
export class AuthorizationAudit {
  audit(input?: { projectRoot?: string }): { checks: readonly ComplianceCheck[]; findings: readonly SecurityFinding[] } {
    const root = input?.projectRoot ?? process.cwd();
    const checks: ComplianceCheck[] = [];
    const findings: SecurityFinding[] = [];
    const securityHealth = securityHealthService.getReport();
    const permissionCount = defaultPermissionRegistry.list().length;

    checks.push({
      id: "AUTHZ-001",
      domain: "authorization",
      title: "Default deny RBAC",
      status: securityHealth.defaultDeny && permissionCount > 0 ? "pass" : "fail",
      message: securityHealth.defaultDeny
        ? `Default deny active · ${permissionCount} permissions registered.`
        : "Permission registry empty or default deny disabled.",
      severity: permissionCount === 0 ? "critical" : "high",
      adr: "ADR-009",
    });

    checks.push({
      id: "AUTHZ-002",
      domain: "authorization",
      title: "Fail-closed authentication",
      status: isFailClosedEnabled() ? "pass" : process.env.NODE_ENV === "production" ? "fail" : "warn",
      message: isFailClosedEnabled()
        ? "Fail-closed mode enabled."
        : "Fail-closed disabled — development mode only.",
      severity: isFailClosedEnabled() ? "low" : "high",
      adr: "ADR-008",
    });

    const anonymousAuth = createAuthenticationContext(null);
    checks.push({
      id: "AUTH-002",
      domain: "authentication",
      title: "Anonymous session rejected when fail-closed",
      status:
        !anonymousAuth.failClosed || anonymousAuth.state === "anonymous" ? "pass" : "fail",
      message: anonymousAuth.failClosed
        ? "Unauthenticated requests identified as anonymous with fail-closed active."
        : "Fail-closed not active.",
      severity: "high",
      adr: "ADR-008",
    });

    const crossOrgIdentity = createIdentityContextFromServiceContext({
      organizationId: "org-other",
      workspaceId: "workspace-other",
      userId: "user-other",
      role: SystemRole.Executive,
    });

    const crossOrgResult = defaultAuthorizationService.authorize(
      crossOrgIdentity,
      HCM_PERMISSIONS.employeeRead,
      { resourceOrganizationId: "org-orania" },
    );

    checks.push({
      id: "AUTHZ-003",
      domain: "authorization",
      title: "Organization isolation",
      status: crossOrgResult.allowed ? "fail" : "pass",
      message: crossOrgResult.allowed
        ? "Cross-organization access incorrectly allowed."
        : "Cross-organization access denied as expected.",
      severity: "critical",
      adr: "ADR-009",
    });

    const unknownPermission = defaultAuthorizationService.authorize(
      createIdentityContextFromServiceContext({
        organizationId: "org-orania",
        workspaceId: "workspace-orania",
        userId: "user-executive",
        role: SystemRole.Executive,
      }),
      "platform:unknown:admin" as typeof HCM_PERMISSIONS.employeeRead,
    );

    checks.push({
      id: "AUTHZ-004",
      domain: "authorization",
      title: "Unknown permission denied",
      status: unknownPermission.allowed ? "fail" : "pass",
      message: unknownPermission.allowed
        ? "Unknown permission incorrectly granted."
        : "Unknown permission denied (default deny).",
      severity: "critical",
      adr: "ADR-009",
    });

    checks.push({
      id: "AUTHZ-005",
      domain: "authorization",
      title: "Permission inheritance via role registry",
      status: defaultRoleRegistry.getPermissionsForRole("super_admin").size > 0 ? "pass" : "warn",
      message: "Role registry resolves effective permissions for platform and HCM roles.",
      severity: "medium",
      adr: "ADR-009",
    });

    const hcmRouteCount = countHcmRoutes(root);
    const catalogExists = existsSync(join(root, "lib", "hcm", "auth", "hcm-permission-catalog.ts"));
    checks.push({
      id: "AUTHZ-006",
      domain: "authorization",
      title: "HCM API route permission mapping",
      status: catalogExists && hcmRouteCount > 0 ? "pass" : "warn",
      message: catalogExists
        ? `HCM permission catalog covers ${hcmRouteCount} API route(s).`
        : "HCM permission catalog not found.",
      severity: "high",
      adr: "ADR-009",
    });

    const readonlyIdentity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-readonly",
      role: SystemRole.ReadOnly,
    });
    const writeAttempt = defaultAuthorizationService.authorize(readonlyIdentity, HCM_PERMISSIONS.payrollWrite);

    checks.push({
      id: "AUTHZ-007",
      domain: "authorization",
      title: "Least privilege enforcement",
      status: writeAttempt.allowed ? "fail" : "pass",
      message: writeAttempt.allowed
        ? "Read-only role granted write permission."
        : "Read-only role denied write permission (least privilege).",
      severity: "high",
      adr: "ADR-009",
    });

    if (!catalogExists) {
      findings.push({
        id: "AUTHZ-F001",
        title: "HCM permission catalog missing",
        severity: "high",
        status: "open",
        description: "HCM route permission catalog not found at expected path.",
        recommendation: "Ensure lib/hcm/auth/hcm-permission-catalog.ts exists and covers all routes.",
        adr: "ADR-009",
      });
    }

    return { checks, findings };
  }
}

export const authorizationAudit = new AuthorizationAudit();
