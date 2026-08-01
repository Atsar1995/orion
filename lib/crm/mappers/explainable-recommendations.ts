import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import type { CrmExplainableRecommendation } from "@/lib/crm/models/insights";

function confidenceFromScore(score: number) {
  if (score >= 80) {
    return { value: 88, label: "high" as const };
  }

  if (score >= 60) {
    return { value: 72, label: "medium" as const };
  }

  return { value: 55, label: "low" as const };
}

/** Generates explainable CRM recommendations from deterministic business rules. */
export function mapCrmExplainableRecommendations(
  intelligence: CrmIntelligenceResult,
): CrmExplainableRecommendation[] {
  const { signals } = intelligence;
  const recommendations: CrmExplainableRecommendation[] = [];

  const topFollowUp = signals.followUpPriority.items[0];
  if (topFollowUp) {
    recommendations.push({
      id: "crm-rec-follow-up-abc",
      priority: 1,
      priorityLabel: "Priority 1",
      title: `Follow up with ${topFollowUp.customer} within 48 hours`,
      description: topFollowUp.description,
      reason: "Follow-up priority rule — VIP inactivity exceeds executive threshold.",
      recommendedAction: topFollowUp.action,
      impact: "Prevents churn on a high-value account and protects retention forecast.",
      category: "follow-up",
      confidence: confidenceFromScore(85),
      evidence: [
        {
          id: "ev-follow-up-rank",
          type: "metric",
          source: "CRM Follow-up Priority Service",
          label: "Urgency rank",
          value: `#${topFollowUp.rank}`,
        },
        {
          id: "ev-follow-up-customer",
          type: "event",
          source: "CRM Activity Records",
          label: "Customer",
          value: topFollowUp.customer,
        },
      ],
      actions: ["act", "delegate", "explain"],
    });
  }

  const stalledDeal = signals.lostOpportunities.opportunities[0];
  if (stalledDeal) {
    recommendations.push({
      id: "crm-rec-stalled-deal",
      priority: 2,
      priorityLabel: "Priority 2",
      title: `${stalledDeal.dealName} has stalled for 14+ days`,
      description: stalledDeal.reason,
      reason: "Lost opportunity detection rule — probability decay and inactivity signal.",
      recommendedAction: "Schedule executive review and reset next action within 48 hours.",
      impact: "Recovers pipeline value before quarter-end forecast lock.",
      category: "risk",
      confidence: confidenceFromScore(78),
      evidence: [
        {
          id: "ev-stall-stage",
          type: "metric",
          source: "CRM Pipeline",
          label: "Stage",
          value: stalledDeal.stage,
        },
        {
          id: "ev-stall-probability",
          type: "metric",
          source: "CRM Deal Risk Service",
          label: "Win probability",
          value: `${stalledDeal.probability}%`,
        },
      ],
      actions: ["act", "snooze", "explain"],
    });
  }

  recommendations.push({
    id: "crm-rec-proposal-approval",
    priority: 3,
    priorityLabel: "Priority 3",
    title: "High-value proposal awaiting approval",
    description:
      "Commerce Partner platform expansion and ABC Industries equipment upgrade blocked on internal approval.",
    reason: "Deal risk rule — proposal stage deals with founder dependency flagged.",
    recommendedAction: "Approve pricing and release proposals before end of week.",
    impact: "Unblocks ₹17L combined pipeline value in active negotiation stages.",
    category: "executive",
    confidence: confidenceFromScore(82),
    evidence: [
      {
        id: "ev-proposal-pipeline",
        type: "metric",
        source: "CRM Revenue Forecast Service",
        label: "Weighted forecast",
        value: signals.revenueForecast.weightedForecastDisplay,
      },
      {
        id: "ev-proposal-risk",
        type: "metric",
        source: "CRM Deal Risk Service",
        label: "High-risk deals",
        value: String(signals.dealRisk.highRiskCount),
      },
    ],
    actions: ["act", "delegate", "explain"],
  });

  const atRiskProfile = intelligence.brief.snapshot.highestRiskCustomer;
  recommendations.push({
    id: "crm-rec-declining-engagement",
    priority: 4,
    priorityLabel: "Priority 4",
    title: `${atRiskProfile.name} has declining engagement`,
    description: atRiskProfile.detail,
    reason: "Customer health score rule — engagement decay on strategic account.",
    recommendedAction: "Founder-led re-engagement call and retention package review.",
    impact: "Protects lifetime value and reduces churn exposure in VIP segment.",
    category: "risk",
    confidence: confidenceFromScore(76),
    evidence: [
      {
        id: "ev-engagement-health",
        type: "metric",
        source: "CRM Customer Health Score Service",
        label: "Customer health",
        value: `${signals.customerHealthScore.score}/100`,
      },
      {
        id: "ev-engagement-status",
        type: "event",
        source: "CRM Customer Records",
        label: "Risk status",
        value: atRiskProfile.status,
      },
    ],
    actions: ["act", "delegate", "snooze", "explain"],
  });

  return recommendations.sort((left, right) => left.priority - right.priority);
}
