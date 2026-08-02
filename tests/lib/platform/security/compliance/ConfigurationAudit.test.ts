import { describe, expect, it } from "vitest";
import { configurationAudit } from "@/lib/platform/security/compliance";

describe("ConfigurationAudit", () => {
  it("audits environment configuration", () => {
    const checks = configurationAudit.audit();

    expect(checks.some((check) => check.id === "CFG-001")).toBe(true);
    expect(checks.some((check) => check.id === "CFG-002")).toBe(true);
  });

  it("validates fail-closed configuration", () => {
    const checks = configurationAudit.audit();
    const failClosed = checks.find((check) => check.id === "CFG-005");

    expect(failClosed).toBeDefined();
    expect(["pass", "warn"]).toContain(failClosed?.status);
  });

  it("confirms Next.js config exists", () => {
    const checks = configurationAudit.audit();
    const nextConfig = checks.find((check) => check.id === "CFG-003");

    expect(nextConfig?.status).toBe("pass");
  });
});
