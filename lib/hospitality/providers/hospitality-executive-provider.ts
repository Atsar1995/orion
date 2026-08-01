import { PROVIDER_VERSION, WORKSPACE_IDS } from "@/lib/intelligence/constants";
import { buildHealthScore } from "@/lib/intelligence/health-engine";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";
import { hospitalityService } from "@/lib/hospitality/services/HospitalityService";

const DEFAULT_CONTEXT = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive" as const,
};

function getIntelligence() {
  return hospitalityService.getIntelligence(DEFAULT_CONTEXT);
}

/** Hospitality Executive Provider (ADR-006 / Mission P-007). */
export const hospitalityExecutiveProvider: RegisteredExecutiveProvider = {
  id: WORKSPACE_IDS.HOSPITALITY,
  workspace: "Hospitality",
  version: PROVIDER_VERSION,

  getHealth() {
    const ops = getIntelligence().operations;
    const score = Math.min(100, 60 + Math.round(ops.occupancyPercent * 0.3));
    return buildHealthScore({
      score,
      trend: "+2% vs last week",
      status: ops.occupancyPercent >= 80 ? "healthy" : "attention",
      summary: `${ops.occupancyPercent}% occupancy · RevPAR ₹${ops.revpar.toLocaleString("en-IN")}`,
      drivers: [
        { label: "Occupancy", status: ops.occupancyPercent >= 80 ? "healthy" : "attention" },
        { label: "Guest satisfaction", status: getIntelligence().patterns[0]?.description.includes("Positive") || getIntelligence().patterns[0]?.description.includes("Improving") ? "healthy" : "attention" },
        { label: "Maintenance", status: getIntelligence().alerts.some((a) => a.severity === "critical") ? "critical" : "healthy" },
      ],
    });
  },

  getAlerts() {
    return getIntelligence().alerts.map((alert) => ({
      severity: alert.severity,
      message: alert.message,
      category: "operational" as const,
    }));
  },

  getRecommendations() {
    return getIntelligence().recommendations.map((entry) => ({
      priority: entry.priority,
      title: entry.title,
      description: entry.description,
      category: "executive" as const,
    }));
  },

  getExecutiveSummary() {
    const contribution = hospitalityService.getBriefContribution(DEFAULT_CONTEXT);
    return {
      headline: "Hospitality",
      body: contribution.briefingLine,
      status: contribution.healthScore >= 80 ? "healthy" : "attention",
    };
  },

  getMetrics() {
    const ops = getIntelligence().operations;
    return [
      { label: "Occupancy", value: `${ops.occupancyPercent}%` },
      { label: "ADR", value: `₹${ops.adr.toLocaleString("en-IN")}` },
      { label: "RevPAR", value: `₹${ops.revpar.toLocaleString("en-IN")}` },
    ];
  },

  getRisks() {
    return getIntelligence().alerts.map((alert) => ({
      severity: alert.severity,
      message: alert.message,
      source: "hospitality",
    }));
  },

  getPriorities() {
    return getIntelligence().recommendations.map((entry) => ({
      rank: entry.priority,
      title: entry.title,
      description: entry.description,
      impact:
        entry.priority === 1 ? ("high" as const) : entry.priority === 2 ? ("medium" as const) : ("low" as const),
      status: entry.priority === 1 ? ("attention" as const) : ("healthy" as const),
    }));
  },

  getBriefingLine() {
    return hospitalityService.getBriefContribution(DEFAULT_CONTEXT).briefingLine;
  },

  getBriefCardSnapshot() {
    const contribution = hospitalityService.getBriefContribution(DEFAULT_CONTEXT);
    const ops = getIntelligence().operations;
    return {
      occupancyToday: contribution.occupancyToday,
      revenueToday: contribution.revenueToday,
      vipArrivals: contribution.vipArrivals,
      adr: ops.adr,
      revpar: ops.revpar,
      criticalIssues: contribution.criticalIssues,
    };
  },
};
