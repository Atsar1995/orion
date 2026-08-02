import { describe, expect, it } from "vitest";
import { secretsAudit } from "@/lib/platform/security/compliance";

describe("SecretsAudit", () => {
  it("audits secrets handling patterns", () => {
    const result = secretsAudit.audit();

    expect(result.checks.some((check) => check.id === "SEC-001")).toBe(true);
    expect(result.checks.some((check) => check.id === "SEC-002")).toBe(true);
    expect(result.checks.some((check) => check.id === "SEC-005")).toBe(true);
  });

  it("documents cloud secret manager as deferred", () => {
    const result = secretsAudit.audit();
    const cloudSecret = result.checks.find((check) => check.id === "SEC-004");

    expect(cloudSecret?.status).toBe("warn");
    expect(result.findings.some((finding) => finding.id === "SEC-F002")).toBe(true);
  });

  it("accepts development secret fallback finding", () => {
    const result = secretsAudit.audit();

    if (!process.env.ORION_SESSION_SECRET) {
      expect(result.findings.some((finding) => finding.id === "SEC-F001")).toBe(true);
    }
  });
});
