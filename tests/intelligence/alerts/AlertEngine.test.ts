import { describe, expect, it } from "vitest";
import { evaluateAlertContext } from "@/lib/intelligence/alerts/AlertEvaluator";
import { alertEngine, toDashboardAlert } from "@/lib/intelligence/alerts/AlertEngine";
import { createTestAlert } from "../../fixtures/alerts";

describe("AlertEvaluator and AlertEngine", () => {
  it("evaluates mock events into structured alerts", async () => {
    const context = await alertEngine.buildContext();
    const alerts = evaluateAlertContext(context);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((alert) => alert.severity === "critical")).toBe(true);
    expect(alerts.some((alert) => alert.category === "infrastructure")).toBe(true);
  });

  it("generates alert bundle with active and resolved alerts", async () => {
    const bundle = await alertEngine.generateAlertBundle();

    expect(bundle.active.length).toBeGreaterThan(0);
    expect(bundle.counts.active).toBe(bundle.active.length);
    expect(bundle.resolved.length).toBeGreaterThan(0);
  });

  it("maps structured alerts to dashboard alert format", () => {
    const dashboardAlert = toDashboardAlert(
      createTestAlert({ severity: "critical", message: "Guest complaint awaiting response" }),
    );

    expect(dashboardAlert.severity).toBe("critical");
    expect(dashboardAlert.message).toContain("Guest complaint");
  });

  it("returns alert panel snapshot for dashboard consumption", async () => {
    const panel = await alertEngine.getAlertPanelSnapshot();

    expect(panel.counts.total).toBeGreaterThan(0);
    expect(panel.recent.length).toBeGreaterThan(0);
    expect(panel.critical.length).toBeGreaterThan(0);
  });
});
