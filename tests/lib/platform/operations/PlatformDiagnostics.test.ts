import { describe, expect, it } from "vitest";
import {
  emitStructuredLog,
  formatStructuredLog,
  operationalMetrics,
  platformDiagnostics,
} from "@/lib/platform/operations";

describe("PlatformDiagnostics", () => {
  it("collects platform diagnostics with correlation ID", () => {
    const report = platformDiagnostics.collect("corr-test-001");

    expect(report.correlationId).toBe("corr-test-001");
    expect(report.version).toBeTruthy();
    expect(report.checks.length).toBeGreaterThan(0);
    expect(["healthy", "degraded", "unhealthy"]).toContain(report.status);
  });

  it("formats structured JSON logs", () => {
    const formatted = formatStructuredLog({
      timestamp: "2026-08-01T00:00:00.000Z",
      level: "info",
      message: "Test message",
      correlationId: "corr-123",
      service: "platform-ops",
      category: "operations",
      metadata: { check: "health" },
    });

    const parsed = JSON.parse(formatted) as { correlationId: string; message: string };
    expect(parsed.correlationId).toBe("corr-123");
    expect(parsed.message).toBe("Test message");
  });

  it("emits structured log entries with auto correlation ID", () => {
    const entry = emitStructuredLog({
      level: "info",
      message: "Operational check complete",
      service: "platform-diagnostics",
      category: "operations",
    });

    expect(entry.correlationId).toMatch(/^corr-/);
    expect(entry.timestamp).toBeTruthy();
  });

  it("records operational metrics", () => {
    operationalMetrics.clear();
    operationalMetrics.record({
      name: "platform.health.checks",
      value: 1,
      unit: "count",
    });

    const snapshot = operationalMetrics.getSnapshot();
    expect(snapshot.metrics.length).toBe(1);
    expect(snapshot.status).toBe("healthy");
  });
});
