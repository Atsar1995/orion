import { describe, expect, it } from "vitest";
import { financeExecutiveIntelligenceService, financeService } from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Executive Financial Intelligence operations (P-009.7)", () => {
  it("returns executive dashboard with KPIs derived from GL", () => {
    const dashboard = financeExecutiveIntelligenceService.getDashboard(CONTEXT, "period-2026-07");

    expect(dashboard.kpis.length).toBeGreaterThanOrEqual(10);
    expect(dashboard.summary.healthScore).toBeGreaterThan(0);
    expect(dashboard.profitability.revenue).toBeGreaterThan(0);
    expect(dashboard.liquidityIndicators.currentRatio).toBeGreaterThan(0);
  });

  it("includes executive KPI keys", () => {
    const kpis = financeExecutiveIntelligenceService.getFinancialKpis(CONTEXT, "period-2026-07");
    const keys = new Set(kpis.map((kpi) => kpi.key));

    expect(keys.has("revenue")).toBe(true);
    expect(keys.has("cash_position")).toBe(true);
    expect(keys.has("operating_margin")).toBe(true);
    expect(keys.has("organization_health_score")).toBe(true);
  });

  it("generates financial alerts", () => {
    const dashboard = financeExecutiveIntelligenceService.getDashboard(CONTEXT, "period-2026-07");
    expect(Array.isArray(dashboard.alerts)).toBe(true);
  });

  it("generates executive recommendations", () => {
    const dashboard = financeExecutiveIntelligenceService.getDashboard(CONTEXT, "period-2026-07");
    expect(dashboard.recommendations.length).toBeGreaterThan(0);
    expect(dashboard.recommendations[0]?.priority).toBeGreaterThan(0);
  });

  it("provides trend analysis", () => {
    const trends = financeExecutiveIntelligenceService.getTrendAnalysis(CONTEXT);
    expect(trends.periods.length).toBeGreaterThanOrEqual(4);
    expect(["up", "down", "stable"]).toContain(trends.revenueTrend);
  });

  it("provides variance analysis", () => {
    const variance = financeExecutiveIntelligenceService.getVarianceAnalysis(CONTEXT, "period-2026-07");
    expect(variance.lines.length).toBeGreaterThan(0);
    expect(variance.totalBudget).toBeGreaterThan(0);
  });

  it("provides daily executive summary", () => {
    const summary = financeExecutiveIntelligenceService.getDailySummary(CONTEXT);
    expect(summary.summary.briefingLine.length).toBeGreaterThan(0);
    expect(summary.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("exposes legacy intelligence KPI adapter", () => {
    const result = financeService.intelligence.getFinancialKpis(CONTEXT);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it("marks domain ready for certification", () => {
    const status = financeService.getDomainStatus();
    expect(status.executiveIntelligenceImplemented).toBe(true);
    expect(status.readyForCertification).toBe(true);
  });
});
