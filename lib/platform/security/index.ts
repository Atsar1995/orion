/**
 * ORION Platform Security — public API (Mission P-015.6 · ADR-008 · ADR-009).
 *
 * @see docs/Platform/Security/Enterprise-Identity-RBAC.md
 */

export type { PermissionCode, PermissionDefinition, PermissionScope } from "@/lib/platform/security/Permission";
export {
  buildPermissionCode,
  parsePermissionCode,
  permissionCodesMatch,
} from "@/lib/platform/security/Permission";

export {
  HcmRole,
  OrganizationRole,
  PlatformRole,
  resolveHcmRolesForPlatformRole,
  resolveOrganizationRole,
  resolvePlatformRole,
} from "@/lib/platform/security/Role";
export type { EnterpriseRole } from "@/lib/platform/security/Role";

export { PermissionRegistry, defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
export {
  HCM_PERMISSIONS,
  RoleRegistry,
  defaultRoleRegistry,
  resolveHcmRoles,
} from "@/lib/platform/security/RoleRegistry";
export type { RoleAssignment } from "@/lib/platform/security/RoleRegistry";

export { PermissionEvaluator, defaultPermissionEvaluator } from "@/lib/platform/security/PermissionEvaluator";
export type { PermissionEvaluationInput } from "@/lib/platform/security/PermissionEvaluator";

export type { AuthorizationDecision, AuthorizationResult } from "@/lib/platform/security/AuthorizationResult";
export {
  AuthorizationError,
  allowResult,
  denyResult,
  isAuthorizationError,
} from "@/lib/platform/security/AuthorizationResult";

export type { AuthorizationPolicyInput } from "@/lib/platform/security/AuthorizationPolicy";
export {
  DEFAULT_DENY_REASON,
  evaluateOrganizationBoundary,
  isMutatingHttpMethod,
} from "@/lib/platform/security/AuthorizationPolicy";

export type { IdentityContext } from "@/lib/platform/security/IdentityContext";
export {
  createIdentityContextFromServiceContext,
  createIdentityContextFromSession,
  toServiceContext,
} from "@/lib/platform/security/IdentityContext";

export type { AuthenticationContext, AuthenticationState } from "@/lib/platform/security/AuthenticationContext";
export {
  createAuthenticationContext,
  isFailClosedEnabled,
  requiresAuthenticatedSession,
} from "@/lib/platform/security/AuthenticationContext";

export type { IdentityProvider } from "@/lib/platform/security/IdentityProvider";
export { LocalIdentityProvider } from "@/lib/platform/security/IdentityProvider";

export type { AuthorizationAuditHook, AuthorizationOptions } from "@/lib/platform/security/AuthorizationService";
export {
  AuthorizationService,
  assertServiceContext,
  authorizeServiceContext,
  defaultAuthorizationService,
  serviceContextFromIdentity,
} from "@/lib/platform/security/AuthorizationService";

export type {
  AuthorizationMiddlewareOptions,
  AuthorizedRequestContext,
} from "@/lib/platform/security/AuthorizationMiddleware";
export {
  AuthorizationMiddleware,
  defaultAuthorizationMiddleware,
} from "@/lib/platform/security/AuthorizationMiddleware";

export type { SecurityHealthReport, SecurityHealthStatus } from "@/lib/platform/security/SecurityHealthService";
export {
  SecurityHealthService,
  securityHealthService,
  toObservabilitySecurityStatus,
} from "@/lib/platform/security/SecurityHealthService";

export type {
  FindingSeverity,
  ComplianceStatus,
  ComplianceCheck,
  SecurityFinding,
  CertificationVerdict,
  SecurityCertificationReport,
  SecurityScorecard,
  ComplianceDashboardSnapshot,
} from "@/lib/platform/security/compliance";
export {
  securityCertification,
  securityAssessment,
  securityCompliance,
  securityScorecardService,
  complianceDashboard,
  authorizationAudit,
  configurationAudit,
  secretsAudit,
  deploymentSecurityAudit,
} from "@/lib/platform/security/compliance";
