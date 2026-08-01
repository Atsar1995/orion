import { describe, expect, it, beforeEach } from "vitest";
import { validateEnvironment } from "@/lib/config/env";
import { isValidEmail, isValidPassword, sanitizeTextInput } from "@/lib/security/sanitize";
import { buildContentSecurityPolicy } from "@/lib/security/headers";
import {
  healthStatusService,
  observabilityStore,
  readinessAssessmentService,
  scoreWebVitals,
} from "@/lib/observability";

describe("Mission S1D production readiness", () => {
  beforeEach(() => {
    observabilityStore.clear();
  });

  it("validates environment configuration", () => {
    const result = validateEnvironment();
    expect(result.nodeEnv).toBeTruthy();
    expect(typeof result.valid).toBe("boolean");
  });

  it("sanitizes and validates auth inputs", () => {
    expect(sanitizeTextInput("  hello\x00world  ")).toBe("helloworld");
    expect(isValidEmail("founder@orion.dev")).toBe(true);
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidPassword("orion-dev")).toBe(true);
    expect(isValidPassword("abc")).toBe(false);
  });

  it("builds content security policy", () => {
    const policy = buildContentSecurityPolicy(true);
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("reports platform health status", () => {
    const report = healthStatusService.getReport("0.2.0");
    expect(report.checks.length).toBeGreaterThan(0);
    expect(["healthy", "degraded", "unhealthy"]).toContain(report.status);
  });

  it("records performance metrics and scores web vitals", () => {
    observabilityStore.recordMetric({
      name: "web_vitals.lcp",
      value: 2000,
      unit: "ms",
      route: "/brief",
    });

    const score = scoreWebVitals(observabilityStore.getWebVitalsSummary());
    expect(score).toBeGreaterThan(0);
  });

  it("reports errors to observability store", () => {
    observabilityStore.reportError({
      message: "Test failure",
      route: "/test",
    });

    expect(observabilityStore.getErrors(1)[0]?.message).toBe("Test failure");
  });

  it("assesses release readiness", () => {
    const report = readinessAssessmentService.assess();
    expect(report.scores.length).toBeGreaterThan(0);
    expect(report.technicalDebt.length).toBeGreaterThan(0);
    expect(report.overallScore).toBeGreaterThan(0);
  });
});
