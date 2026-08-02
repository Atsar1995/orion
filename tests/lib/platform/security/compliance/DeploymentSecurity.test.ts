import { describe, expect, it } from "vitest";
import { deploymentSecurityAudit } from "@/lib/platform/security/compliance";

describe("DeploymentSecurity", () => {
  it("audits deployment security controls", () => {
    const result = deploymentSecurityAudit.audit();

    expect(result.checks.some((check) => check.id === "DEP-001")).toBe(true);
    expect(result.checks.some((check) => check.id === "DEP-003")).toBe(true);
    expect(result.checks.some((check) => check.id === "STORE-001")).toBe(true);
  });

  it("documents release branch CI gap", () => {
    const result = deploymentSecurityAudit.audit();
    const releaseCi = result.checks.find((check) => check.id === "DEP-005");

    expect(releaseCi?.status).toBe("warn");
    expect(result.findings.some((finding) => finding.id === "DEP-F001")).toBe(true);
  });

  it("confirms operational runbooks exist", () => {
    const result = deploymentSecurityAudit.audit();
    const runbook = result.checks.find((check) => check.id === "DEP-001");

    expect(runbook?.status).toBe("pass");
  });
});
