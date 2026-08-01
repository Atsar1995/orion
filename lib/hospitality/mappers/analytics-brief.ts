import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import { HospitalityAnalyticsFacade } from "@/lib/hospitality/analytics";
import type { AnalyticsBriefContribution } from "@/lib/hospitality/models/analytics";

export function mapAnalyticsBriefContribution(
  repository: BillingRepository,
  organizationId: string,
  propertyId: string,
): AnalyticsBriefContribution {
  const analytics = new HospitalityAnalyticsFacade(repository);
  const signals = analytics.getBriefSignals(
    { organizationId, workspaceId: "workspace-orania", userId: "user-executive", role: "executive" },
    propertyId,
  );
  const insights = analytics.insights.generate(
    { organizationId, workspaceId: "workspace-orania", userId: "user-executive", role: "executive" },
    propertyId,
    analytics.kpis.getKpis({ organizationId, workspaceId: "workspace-orania", userId: "user-executive", role: "executive" }, propertyId),
    analytics.forecasts.getForecasts({ organizationId, workspaceId: "workspace-orania", userId: "user-executive", role: "executive" }, propertyId),
  );

  return {
    operationalHealth: signals.operationalHealth,
    revenueHealth: signals.revenueHealth,
    guestExperienceHealth: signals.guestExperienceHealth,
    forecastOccupancy: signals.forecastOccupancy,
    forecastRevenue: signals.forecastRevenue,
    criticalRiskCount: signals.criticalRiskCount,
    topInsight: insights[0]?.title ?? "Performance stable",
  };
}
