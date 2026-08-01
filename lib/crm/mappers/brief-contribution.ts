import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import { mapCrmBusinessHealthContribution } from "@/lib/crm/mappers/business-health-contribution";
import { mapCrmExplainableRecommendations } from "@/lib/crm/mappers/explainable-recommendations";
import { mapCrmInsightsView } from "@/lib/crm/mappers/insights";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import { WORKSPACE_IDS } from "@/lib/intelligence/constants";
import type {
  BusinessAlert,
  ExecutiveRecommendation as PlatformRecommendation,
} from "@/lib/intelligence/models";
import type { CrmExplainableRecommendation } from "@/lib/crm/models/insights";
import type { BriefAlert, OvernightChange } from "@/types/executive";

const CRM_WORKSPACE_LABEL = "Customer Intelligence";

/** CRM executive summary line for the shared Executive Brief. */
export function mapCrmBriefExecutiveSummary(intelligence: CrmIntelligenceResult): string {
  const followUp = intelligence.signals.followUpPriority.items[0];

  if (followUp) {
    return `CRM activity remains healthy with one high-priority customer requiring immediate attention — ${followUp.customer}.`;
  }

  return intelligence.signals.executiveSummary.narrative;
}

/** Maps CRM explainable recommendations for the shared Executive Brief (EC-003). */
export function mapCrmBriefRecommendations(
  intelligence: CrmIntelligenceResult,
): CrmExplainableRecommendation[] {
  return mapCrmExplainableRecommendations(intelligence).map((recommendation) => ({
    ...recommendation,
    href: resolveCrmRecommendationHref(recommendation),
  }));
}

/** Maps CRM recommendations to platform provider contract (ADR-006). */
export function mapCrmBriefPlatformRecommendations(
  intelligence: CrmIntelligenceResult,
): PlatformRecommendation[] {
  return mapCrmExplainableRecommendations(intelligence).map((recommendation) => ({
    priority: recommendation.priority,
    title: recommendation.title,
    description: recommendation.description,
    category: recommendation.category,
  }));
}

/** Maps CRM intelligence alerts for the shared Executive Brief. */
export function mapCrmBriefAlerts(
  repository: CrmRepository,
  intelligence: CrmIntelligenceResult,
): BriefAlert[] {
  const insights = mapCrmInsightsView(repository, intelligence);

  return insights.alerts.map((alert, index) => ({
    id: `crm-alert-${index + 1}`,
    severity: alert.severity === "critical" ? "critical" : "attention",
    message: alert.message,
    category: CRM_WORKSPACE_LABEL,
    href: resolveCrmAlertHref(alert.message),
  }));
}

/** Maps CRM alerts to platform BusinessAlert contract. */
export function mapCrmBriefPlatformAlerts(
  repository: CrmRepository,
  intelligence: CrmIntelligenceResult,
): BusinessAlert[] {
  return mapCrmBriefAlerts(repository, intelligence).map((alert) => ({
    severity: alert.severity === "critical" ? "critical" : "attention",
    message: alert.message,
    category: "risk",
  }));
}

/** Placeholder overnight CRM events for the shared Executive Brief. */
export function mapCrmBriefOvernightChanges(
  intelligence: CrmIntelligenceResult,
): OvernightChange[] {
  const { signals } = intelligence;
  const followUpsDue = intelligence.brief.snapshot.followUpDueCount;

  return [
    {
      id: "crm-overnight-opportunities",
      label: "New Opportunities",
      value: "Two new opportunities created",
      direction: "up",
      href: "/crm/opportunities",
    },
    {
      id: "crm-overnight-proposal",
      label: "Proposal Accepted",
      value: "One proposal accepted",
      direction: "up",
      href: "/crm/opportunities/commerce-platform-expansion",
    },
    {
      id: "crm-overnight-followups",
      label: "Follow-ups Overdue",
      value: `${Math.max(followUpsDue, 3)} follow-ups overdue`,
      direction: "down",
      href: "/crm/activities",
    },
    {
      id: "crm-overnight-health",
      label: "Customer Health",
      value: `Health score ${signals.customerHealthScore.score}/100 (${signals.customerHealthScore.trend})`,
      direction: signals.customerHealthScore.trend.startsWith("+") ? "up" : "neutral",
      href: "/crm/insights",
    },
  ];
}

/** CRM Business Health Engine placeholder inputs. */
export function mapCrmBriefBusinessHealth(intelligence: CrmIntelligenceResult) {
  return mapCrmBusinessHealthContribution(intelligence);
}

function resolveCrmRecommendationHref(recommendation: CrmExplainableRecommendation): string {
  if (recommendation.id.includes("follow-up")) {
    return "/crm/customers/retail-channel-co";
  }

  if (recommendation.id.includes("proposal")) {
    return "/crm/opportunities";
  }

  if (recommendation.id.includes("stalled")) {
    return "/crm/opportunities";
  }

  if (recommendation.id.includes("declining")) {
    return "/crm/customers";
  }

  return "/crm/insights";
}

function resolveCrmAlertHref(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("overdue") || normalized.includes("follow-up")) {
    return "/crm/activities";
  }

  if (normalized.includes("stall") || normalized.includes("deal") || normalized.includes("pipeline")) {
    return "/crm/opportunities";
  }

  if (normalized.includes("forecast") || normalized.includes("revenue")) {
    return "/crm/insights";
  }

  if (normalized.includes("health") || normalized.includes("churn")) {
    return "/crm/customers";
  }

  return "/crm/insights";
}

export const CRM_BRIEF_WORKSPACE_ID = WORKSPACE_IDS.CRM;
