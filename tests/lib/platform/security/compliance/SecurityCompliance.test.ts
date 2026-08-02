import { describe, expect, it } from "vitest";
import { securityCertification, securityCompliance, securityAssessment } from "@/lib/platform/security/compliance";

describe("SecurityCompliance", () => {
  it("runs full security assessment", () => {
    const assessment = securityAssessment.assess();

    expect(assessment.checks.length).toBeGreaterThan(15);
    expect(assessment.securityHealth.permissionCount).toBeGreaterThan(0);
    expect(assessment.auditIntegration).toBe(true);
  });

  it("evaluates OWASP and enterprise principle alignment", () => {
    const assessment = securityAssessment.assess();
    const compliance = securityCompliance.evaluate(assessment.checks);

    expect(compliance.complianceScore).toBeGreaterThan(0);
    expect(compliance.principles.length).toBe(6);
    expect(compliance.owasp.length).toBe(10);
  });

  it("produces security certification with verdict", () => {
    const report = securityCertification.certify();

    expect(report.mission).toBe("P-015.10");
    expect(["GO", "CONDITIONAL GO", "NO-GO"]).toContain(report.verdict);
    expect(report.dashboard.scorecard.overallSecurityScore).toBeGreaterThan(0);
    expect(report.outOfScope).toContain("OAuth2 / OIDC");
    expect(report.outOfScope).toContain("MFA");
  });

  it("includes wave 4 exit criteria", () => {
    const report = securityCertification.certify();

    expect(report.wave4ExitCriteria.some((item) => item.id === "W4-E1")).toBe(true);
    expect(report.wave4ExitCriteria.some((item) => item.id === "W4-E4")).toBe(true);
  });
});
