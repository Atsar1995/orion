import type { BriefSeverity, ExecutiveInsight, ExecutivePriority } from "@/types/brief";

const PRIORITY_WEIGHT: Record<ExecutivePriority, number> = {
  critical: 400,
  high: 300,
  medium: 200,
  low: 100,
};

const SEVERITY_WEIGHT: Record<BriefSeverity, number> = {
  critical: 80,
  attention: 50,
  healthy: 20,
  info: 10,
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Assigns a composite impact score used for ranking insights. */
export function calculateImpactScore(
  priority: ExecutivePriority,
  severity?: BriefSeverity,
  metricChange?: string,
): number {
  let score = PRIORITY_WEIGHT[priority];

  if (severity) {
    score += SEVERITY_WEIGHT[severity];
  }

  if (metricChange?.startsWith("+")) {
    score += 15;
  } else if (metricChange?.startsWith("-")) {
    score += 25;
  }

  return score;
}

export function mapAlertSeverityToPriority(severity: string): ExecutivePriority {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "attention") {
    return "high";
  }

  return "medium";
}

export function mapRecommendationPriority(priority: number): ExecutivePriority {
  if (priority === 1) {
    return "critical";
  }

  if (priority === 2) {
    return "high";
  }

  if (priority === 3) {
    return "medium";
  }

  return "low";
}

/** Removes duplicate insights by dedupe key or normalized title/content. */
export function deduplicateInsights(insights: ExecutiveInsight[]): ExecutiveInsight[] {
  const seen = new Set<string>();
  const unique: ExecutiveInsight[] = [];

  for (const insight of insights) {
    const key =
      insight.dedupeKey ??
      `${insight.category}:${normalizeKey(insight.title)}:${normalizeKey(insight.content)}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(insight);
  }

  return unique;
}

/** Ranks insights by business impact (priority weight + impact score). */
export function rankByImpact(insights: ExecutiveInsight[]): ExecutiveInsight[] {
  return [...insights].sort((a, b) => {
    const priorityDelta = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return b.impactScore - a.impactScore;
  });
}

export function selectTopPriorities(
  insights: ExecutiveInsight[],
  limit = 5,
): ExecutiveInsight[] {
  return rankByImpact(insights)
    .filter((insight) => insight.category !== "executive-summary")
    .slice(0, limit);
}
