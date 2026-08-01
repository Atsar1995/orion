import { describe, expect, it } from "vitest";
import { composeDashboard } from "@/lib/dashboard/DashboardComposer";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/dashboard/DashboardLayoutConfig";
import { DashboardWidgetRegistry } from "@/lib/dashboard/WidgetRegistry";
import {
  MOCK_DASHBOARD_GENERATED_AT,
  createMockDashboardState,
} from "@/lib/dashboard/mock";

describe("DashboardComposer", () => {
  it("composes all default layout sections from mock state", () => {
    const composition = composeDashboard({ state: createMockDashboardState() });

    expect(composition.state.generatedAt).toBe(MOCK_DASHBOARD_GENERATED_AT);
    expect(composition.sections).toHaveLength(DEFAULT_DASHBOARD_LAYOUT.length);
    expect(composition.sections.map((section) => section.id)).toEqual([
      "overview",
      "brief",
      "intelligence",
      "alert-center",
      "action",
    ]);
  });

  it("orders widgets within a section by configured order", () => {
    const composition = composeDashboard({ state: createMockDashboardState() });
    const overview = composition.sections.find((section) => section.id === "overview");

    expect(overview?.widgets.map((widget) => widget.id)).toEqual([
      "business-health",
      "confidence",
      "kpi-highlights",
    ]);
  });

  it("uses the widget registry to render section widgets", () => {
    const registry = new DashboardWidgetRegistry();
    registry.register("business-health", () => "health-widget");

    const composition = composeDashboard({
      layout: [
        {
          id: "single",
          widgets: [{ id: "business-health", order: 1, span: "full" }],
        },
      ],
      state: createMockDashboardState(),
      registry,
    });

    expect(composition.sections[0]?.widgets[0]?.node).toBe("health-widget");
  });
});
