import { describe, expect, it } from "vitest";
import {
  createAuthenticationContext,
  isFailClosedEnabled,
} from "@/lib/platform/security/AuthenticationContext";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { securityCertification } from "@/lib/platform/security/compliance";
import { SystemRole } from "@/lib/auth/roles";

describe("RegressionSecurity", () => {
  it("preserves fail-closed anonymous rejection", () => {
    const auth = createAuthenticationContext(null);

    if (isFailClosedEnabled()) {
      expect(auth.state).toBe("anonymous");
      expect(auth.identity).toBeNull();
    }
  });

  it("preserves cross-organization denial", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-other",
      workspaceId: "workspace-other",
      userId: "user-other",
      role: SystemRole.Executive,
    });

    const result = defaultAuthorizationService.authorize(
      identity,
      HCM_PERMISSIONS.employeeRead,
      { resourceOrganizationId: "org-orania" },
    );

    expect(result.allowed).toBe(false);
  });

  it("preserves executive authorization for same org", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: SystemRole.Executive,
    });

    const result = defaultAuthorizationService.authorize(identity, HCM_PERMISSIONS.employeeRead);
    expect(result.allowed).toBe(true);
  });

  it("certification does not regress security score below threshold", () => {
    const report = securityCertification.certify();

    expect(report.dashboard.scorecard.overallSecurityScore).toBeGreaterThanOrEqual(70);
    expect(report.dashboard.scorecard.authorizationScore).toBeGreaterThanOrEqual(80);
    expect(report.verdict).not.toBe("NO-GO");
  });

  it("does not certify post-GA identity features as in scope", () => {
    const report = securityCertification.certify();

    expect(report.outOfScope).toContain("SSO");
    expect(report.outOfScope).toContain("Cloud IAM integration");
  });
});
