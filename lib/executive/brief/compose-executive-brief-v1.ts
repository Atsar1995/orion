import "@/lib/intelligence/register-executive-providers";

import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import { normalizeDecisionStatus } from "@/lib/decisions/lifecycle/DecisionLifecycle";
import { mapIntelligenceBusToBriefView } from "@/lib/executive/brief/map-intelligence-bus-to-brief";
import { memoryService } from "@/lib/executive/memory";
import { userManagementService, syncOrganizationMemory } from "@/lib/platform/organization";
import { hospitalityService } from "@/lib/hospitality";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import { seedBriefIntelligenceEvents } from "@/lib/platform/intelligence/seed-brief-events";
import { getProviders } from "@/lib/intelligence/provider-registry";
import type { ConfidenceLabel } from "@/types/executive/confidence";
import type {
  BriefBusinessHealth,
  BriefDecisionItem,
  BriefHealthInsight,
  BriefPriorityDecision,
  BriefView,
  BusinessTrendItem,
  CrossWorkspaceSignal,
  ExecutiveDecisionsSummary,
  MorningBriefSummary,
} from "@/types/executive";
import type { ExecutiveDecision, ExecutiveLearningSnapshot } from "@/types/decisions";
import type { ExecutiveRecommendation } from "@/types/executive/recommendation";
import type { ServiceContext } from "@/types/services";

const CANON_WORKSPACES: readonly {
  id: string;
  label: string;
  href: string;
  providerIds: readonly string[];
}[] = [
  { id: "hospitality", label: "Hospitality", href: "/hospitality", providerIds: ["hospitality"] },
  { id: "crm", label: "CRM", href: "/crm", providerIds: ["crm"] },
  { id: "finance", label: "Finance", href: "/finance", providerIds: ["finance"] },
  { id: "commerce", label: "Commerce", href: "/marketing", providerIds: [] },
  { id: "marketing", label: "Marketing", href: "/marketing", providerIds: [] },
  { id: "projects", label: "Projects", href: "/engineering", providerIds: [] },
  { id: "operations", label: "Operations", href: "/command-center", providerIds: [] },
  { id: "hr", label: "HR", href: "/profile", providerIds: [] },
];

const DEFAULT_RECOMMENDATION_ACTIONS: ExecutiveRecommendation["actions"] = [
  "act",
  "delegate",
  "defer",
  "reject",
  "complete",
  "explain",
];

function normalizeConfidenceLabel(label: string): ConfidenceLabel {
  if (label === "high" || label === "medium" || label === "low") {
    return label;
  }

  return "medium";
}

function enrichRecommendation(recommendation: ExecutiveRecommendation): ExecutiveRecommendation {
  return {
    ...recommendation,
    businessValue: recommendation.businessValue ?? recommendation.impact,
    riskLevel:
      recommendation.riskLevel ??
      (recommendation.category === "risk"
        ? "high"
        : recommendation.priority === 1
          ? "medium"
          : "low"),
    recommendedAction:
      recommendation.recommendedAction ??
      (recommendation.category === "risk" ? "Review and decide today" : "Accept and assign owner"),
    alternativeActions: recommendation.alternativeActions ?? [
      "Delegate to operations lead",
      "Defer until next review cycle",
      "Reject with documented rationale",
    ],
    expectedOutcome:
      recommendation.expectedOutcome ??
      `Resolve ${recommendation.title.toLowerCase()} with measurable business impact.`,
    actions: DEFAULT_RECOMMENDATION_ACTIONS,
  };
}

function mapDecisionItem(decision: ExecutiveDecision): BriefDecisionItem {
  return {
    id: decision.id,
    title: decision.title || decision.recommendation.title,
    status: normalizeDecisionStatus(decision.status),
    href: `/decisions#${decision.id}`,
    priority: decision.recommendation.priority,
    delegatedTo: decision.delegatedToName,
  };
}

function buildExecutiveDecisions(decisions: ExecutiveDecision[]): ExecutiveDecisionsSummary {
  const pending = decisions
    .filter((entry) =>
      ["recommended", "accepted", "in_progress", "reopened", "new"].includes(
        normalizeDecisionStatus(entry.status),
      ),
    )
    .slice(0, 5)
    .map(mapDecisionItem);

  const delegated = decisions
    .filter((entry) => normalizeDecisionStatus(entry.status) === "delegated")
    .slice(0, 5)
    .map(mapDecisionItem);

  const awaitingReview = decisions
    .filter((entry) =>
      ["pending_review", "deferred"].includes(normalizeDecisionStatus(entry.status)),
    )
    .slice(0, 5)
    .map(mapDecisionItem);

  const recentlyCompleted = decisions
    .filter((entry) => normalizeDecisionStatus(entry.status) === "completed")
    .slice(0, 5)
    .map(mapDecisionItem);

  return { pending, delegated, awaitingReview, recentlyCompleted };
}

function buildPriorityDecisions(
  recommendations: ExecutiveRecommendation[],
  decisions: ExecutiveDecision[],
): BriefPriorityDecision[] {
  const openDecisions = decisions
    .filter(
      (entry) =>
        !["completed", "archived", "rejected"].includes(normalizeDecisionStatus(entry.status)),
    )
    .sort(
      (left, right) =>
        left.recommendation.priority - right.recommendation.priority ||
        (right.recommendation.estimatedValue ?? 0) - (left.recommendation.estimatedValue ?? 0),
    )
    .slice(0, 5);

  if (openDecisions.length > 0) {
    return openDecisions.map((decision, index) => ({
      id: decision.id,
      rank: index + 1,
      title: decision.title || decision.recommendation.title,
      priority: decision.recommendation.priority,
      confidence: {
        value: decision.recommendation.confidenceScore,
        label: normalizeConfidenceLabel(decision.recommendation.confidenceLabel),
      },
      businessImpact: decision.recommendation.businessImpact,
      recommendedAction:
        decision.recommendation.recommendationType === "risk"
          ? "Review and decide today"
          : "Accept and assign owner",
      evidence: decision.recommendation.evidence,
      decisionId: decision.id,
      href: `/decisions#${decision.id}`,
    }));
  }

  return recommendations.slice(0, 3).map((recommendation, index) => ({
    id: recommendation.id,
    rank: index + 1,
    title: recommendation.title,
    priority: recommendation.priority,
    confidence: recommendation.confidence,
    businessImpact: recommendation.businessValue ?? recommendation.impact,
    recommendedAction: recommendation.recommendedAction ?? "Accept and assign owner",
    evidence: recommendation.evidence,
    href: recommendation.href,
  }));
}

function buildCrossWorkspaceSignals(): CrossWorkspaceSignal[] {
  const liveProviderIds = new Set(getProviders().map((provider) => provider.id));

  return CANON_WORKSPACES.map((workspace) => {
    const liveCount = workspace.providerIds.filter((id) => liveProviderIds.has(id)).length;
    const status =
      liveCount === workspace.providerIds.length && workspace.providerIds.length > 0
        ? "live"
        : liveCount > 0
          ? "partial"
          : "pending";

    const provider = workspace.providerIds
      .map((id) => getProviders().find((entry) => entry.id === id))
      .find(Boolean);

    return {
      workspaceId: workspace.id,
      label: workspace.label,
      status,
      summary:
        provider?.getBriefingLine() ??
        (status === "pending"
          ? `${workspace.label} intelligence will appear here when the workspace is connected.`
          : `${workspace.label} signals are being aggregated.`),
      href: workspace.href,
      signalCount: provider ? provider.getAlerts().length + provider.getRecommendations().length : 0,
    };
  });
}

function buildBusinessTrends(brief: BriefView): BusinessTrendItem[] {
  const trends: BusinessTrendItem[] = brief.overnightChanges.map((change) => ({
    id: `trend-${change.id}`,
    label: change.label,
    direction: change.direction === "up" ? "positive" : change.direction === "down" ? "negative" : "emerging_risk",
    summary: `${change.label} moved ${change.value} overnight.`,
    confidence: { value: 78, label: "medium" },
  }));

  for (const risk of brief.businessHealth.majorRisks.slice(0, 2)) {
    trends.push({
      id: risk.id,
      label: risk.label,
      direction: "emerging_risk",
      summary: risk.summary,
      confidence: { value: 84, label: "high" },
    });
  }

  for (const opportunity of brief.businessHealth.majorOpportunities.slice(0, 2)) {
    trends.push({
      id: opportunity.id,
      label: opportunity.label,
      direction: "emerging_opportunity",
      summary: opportunity.summary,
      confidence: { value: 80, label: "high" },
    });
  }

  return trends.slice(0, 6);
}

function buildMorningSummary(brief: BriefView): MorningBriefSummary {
  return {
    todaySummary: brief.aiSummary.narrative,
    criticalDecisions: brief.executiveDecisions.pending.slice(0, 3).map((item) => item.title),
    businessHealthHeadline: `${brief.businessHealth.score}/${brief.businessHealth.maxScore} — ${brief.businessHealth.summary}`,
    priorityActions: brief.priorityDecisions.slice(0, 3).map((item) => item.title),
    executiveNotes: [
      brief.greeting.subheadline,
      brief.endSummary.firstAction ? `First action: ${brief.endSummary.firstAction}` : "",
    ].filter(Boolean),
  };
}

function buildHealthInsights(brief: BriefView): Pick<BriefBusinessHealth, "majorRisks" | "majorOpportunities"> {
  const majorRisks: BriefHealthInsight[] = brief.criticalAlerts.slice(0, 3).map((alert) => ({
    id: alert.id,
    label: alert.category,
    summary: alert.message,
    severity: alert.severity,
  }));

  const majorOpportunities: BriefHealthInsight[] = brief.recommendations
    .filter((entry) => entry.category === "growth" || entry.priority === 1)
    .slice(0, 3)
    .map((entry) => ({
      id: `opp-${entry.id}`,
      label: entry.category,
      summary: entry.title,
      severity: "positive" as const,
    }));

  return { majorRisks, majorOpportunities };
}

function resolveOperatingMode(score: number): BriefView["greeting"]["operatingMode"] {
  if (score >= 85) {
    return "growth";
  }

  if (score < 65) {
    return "recovery";
  }

  return "standard";
}

/** Composes Executive Brief v1.0 from intelligence bus + decision platform (Mission P-002 / P-004). */
export function composeExecutiveBriefV1(input: {
  executiveName: string;
  organizationName?: string;
  profileLabel?: string;
  serviceContext?: ServiceContext;
  decisions?: ExecutiveDecision[];
  learning?: ExecutiveLearningSnapshot;
}): BriefView {
  const base = mapIntelligenceBusToBriefView(input.executiveName);
  const decisions = input.decisions ?? [];
  const context: ServiceContext = input.serviceContext ?? {
    organizationId: "org-orania",
    workspaceId: "workspace-orania",
    userId: "user-executive",
    role: "executive",
  };
  const recommendations = base.recommendations.map(enrichRecommendation);
  const healthInsights = buildHealthInsights({ ...base, recommendations });

  const businessHealth: BriefBusinessHealth = {
    ...base.businessHealth,
    ...healthInsights,
  };

  const executiveDecisions = buildExecutiveDecisions(decisions);
  const priorityDecisions = buildPriorityDecisions(recommendations, decisions);
  const crossWorkspaceSignals = buildCrossWorkspaceSignals();
  memoryService.syncFromDecisions(decisions, context, input.learning);
  syncOrganizationMemory(context, input.executiveName);
  seedBriefIntelligenceEvents(context);
  const intelligenceService = getIntelligenceIntegrationService();
  const executiveMemory = memoryService.getBriefItems(context);
  const organizationHealth = userManagementService.getOrganizationHealth(context);
  const hospitalityHealth = hospitalityService.getBriefContribution(context);
  const intelligenceFeed = intelligenceService.getBriefFeed(context);

  const draft: BriefView = {
    ...base,
    greeting: {
      ...base.greeting,
      organizationName: input.organizationName ?? DEMO_ORGANIZATION.name,
      profileLabel: input.profileLabel ?? "Executive",
      operatingMode: resolveOperatingMode(businessHealth.score),
    },
    businessHealth,
    organizationHealth,
    hospitalityHealth,
    intelligenceFeed,
    recommendations,
    priorityDecisions,
    executiveDecisions,
    crossWorkspaceSignals,
    executiveMemory,
    businessTrends: [],
    morningSummary: {
      todaySummary: base.aiSummary.narrative,
      criticalDecisions: [],
      businessHealthHeadline: businessHealth.summary,
      priorityActions: priorityDecisions.map((item) => item.title),
      executiveNotes: [base.greeting.subheadline],
    },
    endSummary: {
      ...base.endSummary,
      firstAction: priorityDecisions[0]?.title ?? base.endSummary.firstAction,
    },
  };

  draft.businessTrends = buildBusinessTrends(draft);
  draft.morningSummary = buildMorningSummary(draft);

  return draft;
}
