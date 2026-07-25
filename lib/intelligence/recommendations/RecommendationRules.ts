import type {
  RecommendationContext,
  RecommendationRuleDefinition,
} from "@/types/recommendations";

/** Configuration-driven business rules for the Recommendation Engine (ES-029). */
export const RECOMMENDATION_RULES: RecommendationRuleDefinition[] = [
  {
    id: "rule-critical-guest-complaint",
    name: "Critical Guest Complaint",
    enabled: true,
    category: "customer-experience",
    priority: "critical",
    templateId: "resolve-guest-complaint",
    sources: ["alert"],
    match: {
      alertSeverity: "critical",
      messageContains: "guest complaint",
      providerId: "hospitality",
    },
  },
  {
    id: "rule-weekend-pricing",
    name: "Weekend Rate Optimization",
    enabled: true,
    category: "revenue",
    priority: "critical",
    templateId: "increase-weekend-rates",
    sources: ["provider", "brief"],
    match: {
      providerId: "hospitality",
      messageContains: "weekend",
    },
  },
  {
    id: "rule-marketing-roas-decline",
    name: "Marketing ROAS Decline",
    enabled: true,
    category: "marketing",
    priority: "medium",
    templateId: "refresh-ad-creative",
    sources: ["trend", "provider"],
    match: {
      trendDirection: "down",
      workspace: "Marketing",
      providerId: "marketing",
    },
  },
  {
    id: "rule-supplier-payment-overdue",
    name: "Overdue Supplier Payment",
    enabled: true,
    category: "finance",
    priority: "high",
    templateId: "clear-supplier-payment",
    sources: ["alert"],
    match: {
      alertCategory: "follow-up",
      messageContains: "payment overdue",
      providerId: "finance",
    },
  },
  {
    id: "rule-pipeline-growth",
    name: "Pipeline Growth Follow-up",
    enabled: true,
    category: "sales",
    priority: "medium",
    templateId: "boost-pipeline-conversion",
    sources: ["trend", "provider"],
    match: {
      trendDirection: "up",
      workspace: "CRM",
      providerId: "crm",
    },
  },
  {
    id: "rule-weekday-occupancy-gap",
    name: "Weekday Occupancy Gap",
    enabled: true,
    category: "hospitality",
    priority: "high",
    templateId: "address-occupancy-gap",
    sources: ["alert"],
    match: {
      messageContains: "occupancy below target",
      providerId: "hospitality",
    },
  },
  {
    id: "rule-contract-renewal",
    name: "Contract Renewal Pending",
    enabled: true,
    category: "compliance",
    priority: "high",
    templateId: "renew-travel-partner",
    sources: ["alert"],
    match: {
      messageContains: "contract renewal",
      providerId: "email",
    },
  },
  {
    id: "rule-platform-health-attention",
    name: "Platform Health Attention",
    enabled: true,
    category: "risk",
    priority: "medium",
    templateId: "platform-health-recovery",
    sources: ["health"],
    match: {
      healthStatus: "attention",
    },
  },
];

function messageMatches(text: string, pattern?: string): boolean {
  if (!pattern) {
    return true;
  }

  return text.toLowerCase().includes(pattern.toLowerCase());
}

function ruleMatchesAlert(
  rule: RecommendationRuleDefinition,
  context: RecommendationContext,
): boolean {
  return context.alerts.some(
    (alert) =>
      messageMatches(alert.message, rule.match.messageContains) &&
      (!rule.match.alertSeverity || alert.severity === rule.match.alertSeverity) &&
      (!rule.match.alertCategory || alert.category === rule.match.alertCategory),
  );
}

function ruleMatchesTrend(
  rule: RecommendationRuleDefinition,
  context: RecommendationContext,
): boolean {
  return context.trends.some(
    (trend) =>
      (!rule.match.trendDirection || trend.direction === rule.match.trendDirection) &&
      (!rule.match.workspace || trend.workspace === rule.match.workspace),
  );
}

function ruleMatchesHealth(
  rule: RecommendationRuleDefinition,
  context: RecommendationContext,
): boolean {
  return (
    !rule.match.healthStatus || context.businessHealth.status === rule.match.healthStatus
  );
}

function ruleMatchesProvider(
  rule: RecommendationRuleDefinition,
  context: RecommendationContext,
): boolean {
  if (!rule.match.providerId) {
    return true;
  }

  return context.contributions.some((contribution) => {
    if (contribution.providerId !== rule.match.providerId) {
      return false;
    }

    const segments = contribution.briefSegments ?? [];
    const recommendations = contribution.recommendations ?? [];

    if (rule.match.messageContains) {
      const inSegments = segments.some((segment) =>
        messageMatches(segment, rule.match.messageContains),
      );
      const inRecommendations = recommendations.some(
        (rec) =>
          messageMatches(rec.title, rule.match.messageContains) ||
          messageMatches(rec.description, rule.match.messageContains),
      );

      return inSegments || inRecommendations;
    }

    return true;
  });
}

function ruleMatchesBrief(
  rule: RecommendationRuleDefinition,
  context: RecommendationContext,
): boolean {
  if (!rule.match.messageContains) {
    return context.dailyBrief.topPriorities.length > 0;
  }

  return context.dailyBrief.topPriorities.some((item) =>
    messageMatches(item.title, rule.match.messageContains),
  );
}

/** Evaluates whether a configuration rule matches the current intelligence context. */
export function evaluateRule(
  rule: RecommendationRuleDefinition,
  context: RecommendationContext,
): boolean {
  if (!rule.enabled) {
    return false;
  }

  return rule.sources.some((source) => {
    switch (source) {
      case "alert":
        return ruleMatchesAlert(rule, context);
      case "trend":
        return ruleMatchesTrend(rule, context);
      case "health":
        return ruleMatchesHealth(rule, context);
      case "provider":
        return ruleMatchesProvider(rule, context);
      case "brief":
        return ruleMatchesBrief(rule, context);
      case "platform":
        return ruleMatchesHealth(rule, context);
      default:
        return false;
    }
  });
}

export function getEnabledRules(): RecommendationRuleDefinition[] {
  return RECOMMENDATION_RULES.filter((rule) => rule.enabled);
}

export function evaluateAllRules(context: RecommendationContext): RecommendationRuleDefinition[] {
  return getEnabledRules().filter((rule) => evaluateRule(rule, context));
}
