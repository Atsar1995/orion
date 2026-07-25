import { getSectionTitle } from "@/lib/intelligence/brief/ExecutiveBriefTemplates";
import {
  deduplicateInsights,
  rankByImpact,
  selectTopPriorities,
} from "@/lib/intelligence/brief/ExecutiveBriefPrioritizer";
import type {
  BriefCategory,
  BriefTemplate,
  DailyExecutiveBrief,
  ExecutiveAction,
  ExecutiveBriefSection,
  ExecutiveInsight,
  ExecutiveSummary,
} from "@/types/brief";
import type { ExecutiveBrief } from "@/types/intelligence";

type FormatDailyBriefInput = {
  insights: ExecutiveInsight[];
  actions: ExecutiveAction[];
  template: BriefTemplate;
  scheduledFor: string;
  generatedAt: string;
  healthScore?: number;
  healthStatus?: string;
};

function groupInsightsByCategory(
  insights: ExecutiveInsight[],
  categories: BriefCategory[],
): ExecutiveBriefSection[] {
  return categories.map((category) => {
    const sectionInsights = insights.filter((insight) => insight.category === category);

    return {
      id: category,
      title: getSectionTitle(category),
      insights: rankByImpact(sectionInsights),
      actions:
        category === "actions"
          ? sectionInsights.map((insight) => ({
              id: `section-action-${insight.id}`,
              title: insight.title,
              description: insight.content,
              priority: insight.priority,
              source: insight.source,
              category: "actions" as const,
            }))
          : undefined,
    };
  });
}

function buildExecutiveSummary(
  insights: ExecutiveInsight[],
  healthScore?: number,
  healthStatus?: string,
): ExecutiveSummary {
  const summaryInsight = insights.find((insight) => insight.category === "executive-summary");
  const highlights = insights
    .filter((insight) => insight.category === "key-highlights")
    .slice(0, 2)
    .map((insight) => insight.content);

  const narrativeParts = [
    summaryInsight?.content,
    highlights.length > 0 ? highlights.join(" ") : undefined,
  ].filter(Boolean);

  return {
    headline: "Daily Executive Brief",
    narrative:
      narrativeParts.length > 0
        ? narrativeParts.join(" ")
        : "Executive brief generated from registered provider signals.",
    healthScore,
    healthStatus,
  };
}

/** Formats prioritized insights into a structured daily executive brief. */
export function formatDailyBrief(input: FormatDailyBriefInput): DailyExecutiveBrief {
  const deduped = deduplicateInsights(input.insights);
  const ranked = rankByImpact(deduped);
  const topPriorities = selectTopPriorities(ranked);

  const recommendedActions = sortActions(
    input.actions.length > 0
      ? input.actions
      : topPriorities.slice(0, 4).map((insight) => ({
          id: `action-${insight.id}`,
          title: insight.title,
          description: insight.content,
          priority: insight.priority,
          source: insight.source,
          category: "actions" as const,
        })),
  );

  const sections = groupInsightsByCategory(ranked, input.template.sections).map((section) =>
    section.id === "actions" ? { ...section, actions: recommendedActions } : section,
  );

  const summary = buildExecutiveSummary(ranked, input.healthScore, input.healthStatus);

  return {
    id: `brief-${input.scheduledFor}`,
    generatedAt: input.generatedAt,
    scheduledFor: input.scheduledFor,
    templateId: input.template.id,
    summary,
    sections,
    topPriorities,
    recommendedActions,
  };
}

const ACTION_PRIORITY_WEIGHT: Record<ExecutiveAction["priority"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function sortActions(actions: ExecutiveAction[]): ExecutiveAction[] {
  return [...actions].sort(
    (a, b) => ACTION_PRIORITY_WEIGHT[b.priority] - ACTION_PRIORITY_WEIGHT[a.priority],
  );
}

/** Maps structured daily brief to dashboard panel format (headline + body). */
export function toDashboardBrief(dailyBrief: DailyExecutiveBrief): ExecutiveBrief {
  const criticalCount = dailyBrief.sections
    .find((section) => section.id === "critical-issues")
    ?.insights.filter((insight) => insight.priority === "critical").length;

  const priorityPreview = dailyBrief.topPriorities
    .slice(0, 2)
    .map((item) => item.title)
    .join(" · ");

  const bodyParts = [
    dailyBrief.summary.narrative,
    criticalCount ? `${criticalCount} critical issue(s) require attention.` : undefined,
    priorityPreview ? `Top priorities: ${priorityPreview}.` : undefined,
  ].filter(Boolean);

  return {
    headline: dailyBrief.summary.headline,
    body: bodyParts.join(" "),
    generatedAt: dailyBrief.generatedAt,
  };
}

export const executiveBriefFormatter = {
  formatDailyBrief,
  toDashboardBrief,
};
