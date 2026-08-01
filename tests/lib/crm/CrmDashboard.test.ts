import { describe, expect, it } from "vitest";
import { InMemoryCrmRepository, mapCrmDashboardView, CrmService } from "@/lib/crm";

describe("mapCrmDashboardView", () => {
  it("returns five KPI summary metrics", () => {
    const dashboard = mapCrmDashboardView(new InMemoryCrmRepository());

    expect(dashboard.kpis).toHaveLength(5);
    expect(dashboard.kpis.map((metric) => metric.label)).toEqual([
      "Total Customers",
      "Active Customers",
      "Pipeline Value",
      "Win Rate",
      "Open Opportunities",
    ]);
  });

  it("maps pipeline stages with Lead label and recommendations", () => {
    const dashboard = mapCrmDashboardView(new InMemoryCrmRepository());

    expect(dashboard.pipelineStages[0]?.label).toBe("Lead");
    expect(dashboard.pipelineStages.some((stage) => stage.label === "Won")).toBe(true);
    expect(dashboard.recommendations).toHaveLength(3);
    expect(dashboard.recentActivity.some((item) => item.type === "Call")).toBe(true);
  });
});

describe("CrmService.getDashboard", () => {
  it("exposes dashboard view from service layer", () => {
    const dashboard = new CrmService(new InMemoryCrmRepository()).getDashboard();

    expect(dashboard.header.title).toBe("Customer Intelligence");
    expect(dashboard.customerHealthDistribution.length).toBeGreaterThan(0);
    expect(dashboard.pipelineValue).toBe("₹1.8Cr");
  });
});
