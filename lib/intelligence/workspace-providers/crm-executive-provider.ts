import { PROVIDER_VERSION, WORKSPACE_IDS } from "@/lib/intelligence/constants";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";
import { CRM_INTELLIGENCE } from "@/lib/crm/crm-intelligence-pipeline";

/** Customer Intelligence Executive Provider (ADR-006). */
export const crmExecutiveProvider: RegisteredExecutiveProvider = {
  id: WORKSPACE_IDS.CRM,
  workspace: "Customer Intelligence",
  version: PROVIDER_VERSION,

  getHealth() {
    return CRM_INTELLIGENCE.health.customer;
  },

  getAlerts() {
    return CRM_INTELLIGENCE.recommendations.riskAlerts;
  },

  getRecommendations() {
    return CRM_INTELLIGENCE.brief.snapshot.executiveRecommendations;
  },

  getExecutiveSummary() {
    return {
      headline: "Customer Intelligence",
      body: CRM_INTELLIGENCE.brief.weeklySummary,
      status: CRM_INTELLIGENCE.health.customer.status,
    };
  },

  getMetrics() {
    return [
      { label: "Customer Health", value: `${CRM_INTELLIGENCE.health.customer.score}/100` },
      { label: "Pipeline Value", value: "₹1.8Cr" },
      { label: "Open Opportunities", value: "24" },
    ];
  },

  getRisks() {
    return CRM_INTELLIGENCE.recommendations.riskAlerts.map((alert) => ({
      severity: alert.severity,
      message: alert.message,
      source: alert.category ?? "crm",
    }));
  },

  getPriorities() {
    return CRM_INTELLIGENCE.recommendations.executivePriorities;
  },

  getBriefingLine() {
    return CRM_INTELLIGENCE.brief.briefingLine;
  },

  getBriefCardSnapshot() {
    return CRM_INTELLIGENCE.brief.snapshot;
  },
};
