/**
 * Security audit integration (Mission P-015.6 · ADR-009).
 */

import { enterpriseAuditService } from "@/lib/platform/compliance";
import type { AuthorizationAuditHook } from "@/lib/platform/security/AuthorizationService";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { toServiceContext } from "@/lib/platform/security/IdentityContext";

/** Records authorization denials and cross-organization access to enterprise audit. */
export const securityAuthorizationAuditHook: AuthorizationAuditHook = ({
  result,
  identity,
  resourceOrganizationId,
  crossOrganization,
}) => {
  try {
    enterpriseAuditService.record(
      {
        domainKey: "platform",
        entityType: "authorization",
        entityId: result.permission,
        action: result.allowed ? "permission_granted" : "custom",
        sourceService: "AuthorizationService",
        riskClassification: crossOrganization ? "high" : result.allowed ? "low" : "medium",
        currentState: JSON.stringify({
          permission: result.permission,
          reason: result.reason,
          resourceOrganizationId: resourceOrganizationId ?? identity.organizationId,
          crossOrganization,
          outcome: result.allowed ? "granted" : "denied",
        }),
      },
      toServiceContext(identity),
    );
  } catch {
    // Audit must not block authorization flow.
  }
};

/** Wires enterprise audit into the default authorization service. */
export function configureSecurityAuditIntegration(): void {
  defaultAuthorizationService.setAuditHook(securityAuthorizationAuditHook);
}

configureSecurityAuditIntegration();
