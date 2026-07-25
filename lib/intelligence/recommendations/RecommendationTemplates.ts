import type {
  Recommendation,
  RecommendationAction,
  RecommendationCategory,
  RecommendationImpact,
  RecommendationPriority,
} from "@/types/recommendations";

export type RecommendationTemplate = {
  id: string;
  title: string;
  summary: string;
  businessReason: string;
  expectedBenefit: string;
  impact: RecommendationImpact;
  suggestedActions: Omit<RecommendationAction, "id">[];
};

const TEMPLATES: RecommendationTemplate[] = [
  {
    id: "resolve-guest-complaint",
    title: "Resolve guest complaint before VIP check-in",
    summary: "Address Room 305 complaint to protect satisfaction and review scores.",
    businessReason: "Unresolved guest issues escalate to public reviews and VIP dissatisfaction.",
    expectedBenefit: "Protect guest satisfaction score and prevent negative reviews.",
    impact: {
      magnitude: "high",
      metric: "Guest Satisfaction",
      estimatedChange: "+8 pts",
      timeframe: "24h",
    },
    suggestedActions: [
      {
        label: "Contact guest immediately",
        description: "Assign duty manager to resolve Room 305 issue before arrival.",
        priority: "critical",
      },
      {
        label: "Offer recovery gesture",
        description: "Prepare complimentary upgrade or service credit for affected guest.",
        priority: "high",
      },
    ],
  },
  {
    id: "increase-weekend-rates",
    title: "Increase weekend room rates",
    summary: "Capture demand premium with limited inventory this weekend.",
    businessReason: "Occupancy exceeds forecast with constrained premium inventory.",
    expectedBenefit: "Increase RevPAR without additional acquisition cost.",
    impact: {
      magnitude: "high",
      metric: "RevPAR",
      estimatedChange: "+6%",
      timeframe: "weekend",
    },
    suggestedActions: [
      {
        label: "Adjust BAR rates",
        description: "Raise best-available rates on premium room categories.",
        priority: "high",
      },
    ],
  },
  {
    id: "refresh-ad-creative",
    title: "Refresh underperforming ad creative",
    summary: "Meta campaign CTR declined — test new creative variants.",
    businessReason: "Declining CTR increases cost per acquisition and reduces ROAS.",
    expectedBenefit: "Restore marketing efficiency and protect ROAS target.",
    impact: {
      magnitude: "medium",
      metric: "ROAS",
      estimatedChange: "+0.4×",
      timeframe: "14d",
    },
    suggestedActions: [
      {
        label: "Launch A/B creative test",
        description: "Deploy two new ad variants against current control.",
        priority: "medium",
      },
    ],
  },
  {
    id: "clear-supplier-payment",
    title: "Clear overdue supplier payment",
    summary: "Housekeeping linen supplier payment is overdue.",
    businessReason: "Payment delays risk supply disruption and vendor relationship damage.",
    expectedBenefit: "Maintain supply continuity and vendor trust.",
    impact: {
      magnitude: "medium",
      metric: "Operational Risk",
      estimatedChange: "Reduced",
      timeframe: "48h",
    },
    suggestedActions: [
      {
        label: "Approve invoice",
        description: "Review and release payment for overdue supplier invoice.",
        priority: "high",
      },
    ],
  },
  {
    id: "boost-pipeline-conversion",
    title: "Accelerate high-value pipeline follow-up",
    summary: "CRM pipeline grew — prioritize conversion on warm opportunities.",
    businessReason: "New active relationships require timely follow-up to convert.",
    expectedBenefit: "Convert pipeline growth into closed revenue.",
    impact: {
      magnitude: "medium",
      metric: "Pipeline Conversion",
      estimatedChange: "+5%",
      timeframe: "30d",
    },
    suggestedActions: [
      {
        label: "Schedule executive outreach",
        description: "Prioritize top 5 pipeline accounts for direct follow-up.",
        priority: "medium",
      },
    ],
  },
  {
    id: "address-occupancy-gap",
    title: "Close weekday occupancy gap",
    summary: "Tuesday arrivals below target — activate demand recovery tactics.",
    businessReason: "Weekday occupancy shortfall reduces revenue yield.",
    expectedBenefit: "Lift weekday occupancy toward target.",
    impact: {
      magnitude: "medium",
      metric: "Occupancy",
      estimatedChange: "+4 pts",
      timeframe: "7d",
    },
    suggestedActions: [
      {
        label: "Deploy weekday promotion",
        description: "Activate targeted offer for underperforming arrival dates.",
        priority: "high",
      },
    ],
  },
  {
    id: "renew-travel-partner",
    title: "Complete travel partner contract renewal",
    summary: "Contract renewal pending signature — revenue channel at risk.",
    businessReason: "Unsigned renewal may interrupt partner booking channel.",
    expectedBenefit: "Secure continued partner revenue stream.",
    impact: {
      magnitude: "high",
      metric: "Partner Revenue",
      estimatedChange: "Protected",
      timeframe: "7d",
    },
    suggestedActions: [
      {
        label: "Schedule signing call",
        description: "Confirm terms and obtain signature this week.",
        priority: "high",
      },
    ],
  },
  {
    id: "platform-health-recovery",
    title: "Address platform health attention areas",
    summary: "Platform health score below optimal — review underperforming workspaces.",
    businessReason: "Attention-level health signals indicate emerging operational risk.",
    expectedBenefit: "Restore platform health score above attention threshold.",
    impact: {
      magnitude: "medium",
      metric: "Platform Health",
      estimatedChange: "+10 pts",
      timeframe: "14d",
    },
    suggestedActions: [
      {
        label: "Review health drivers",
        description: "Inspect workspaces flagged below healthy status.",
        priority: "medium",
      },
    ],
  },
];

export function getRecommendationTemplate(templateId: string): RecommendationTemplate | undefined {
  return TEMPLATES.find((template) => template.id === templateId);
}

export function buildRecommendationFromTemplate(
  templateId: string,
  overrides: {
    id: string;
    category: RecommendationCategory;
    priority: RecommendationPriority;
    source: Recommendation["source"];
    generatedAt: string;
  },
): Recommendation | undefined {
  const template = getRecommendationTemplate(templateId);

  if (!template) {
    return undefined;
  }

  return {
    id: overrides.id,
    title: template.title,
    summary: template.summary,
    businessReason: template.businessReason,
    evidence: [],
    expectedBenefit: template.expectedBenefit,
    estimatedImpact: template.impact,
    priority: overrides.priority,
    category: overrides.category,
    confidenceScore: 0,
    suggestedActions: template.suggestedActions.map((action, index) => ({
      id: `${overrides.id}-action-${index}`,
      ...action,
    })),
    source: overrides.source,
    score: {
      businessValue: 0,
      confidence: 0,
      urgency: 0,
      total: 0,
    },
    generatedAt: overrides.generatedAt,
  };
}

export function listRecommendationTemplates(): RecommendationTemplate[] {
  return TEMPLATES;
}
