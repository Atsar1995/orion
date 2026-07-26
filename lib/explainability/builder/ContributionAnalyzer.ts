import type { CategoryScore } from "@/lib/business-health/models/HealthScore";
import type { KPICategoryId } from "@/lib/business-health/models/KPI";
import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";
import {
  EXPLANATION_ITEM_TEMPLATES,
  renderTemplate,
} from "@/lib/explainability/builder/MessageTemplates";
import type {
  ExplanationImportance,
  ExplanationItem,
  SupportingKPIReference,
} from "@/lib/explainability/models/ExplanationItem";

/** Contribution direction derived from EC-002A breakdown values. */
export type ContributionGroup = "positive" | "negative" | "neutral";

/** Ranked breakdown entry with deterministic ordering metadata. */
export type RankedContribution = {
  readonly rank: number;
  readonly group: ContributionGroup;
  readonly breakdown: ScoreBreakdown;
  readonly absoluteContribution: number;
};

/** Output of deterministic contributor analysis — no score mutation. */
export type ContributionAnalysis = {
  readonly positives: readonly RankedContribution[];
  readonly negatives: readonly RankedContribution[];
  readonly neutrals: readonly RankedContribution[];
  readonly all: readonly RankedContribution[];
  readonly explanationItems: readonly ExplanationItem[];
};

/** Importance thresholds based on absolute contribution magnitude only. */
export type ContributionImportanceThresholds = {
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
};

export const DEFAULT_CONTRIBUTION_IMPORTANCE_THRESHOLDS: ContributionImportanceThresholds = {
  critical: 15,
  high: 10,
  medium: 5,
};

const CATEGORY_IDS: readonly KPICategoryId[] = [
  "revenue",
  "marketing",
  "customer",
  "operations",
  "finance",
  "hospitality",
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveContributionGroup(contribution: number): ContributionGroup {
  if (contribution > 0) {
    return "positive";
  }

  if (contribution < 0) {
    return "negative";
  }

  return "neutral";
}

function resolveImportance(
  absoluteContribution: number,
  thresholds: ContributionImportanceThresholds,
): ExplanationImportance {
  if (absoluteContribution >= thresholds.critical) {
    return "critical";
  }

  if (absoluteContribution >= thresholds.high) {
    return "high";
  }

  if (absoluteContribution >= thresholds.medium) {
    return "medium";
  }

  return "low";
}

function resolveCategoryId(
  categoryName: string,
  categoryScores: readonly CategoryScore[],
): KPICategoryId {
  const normalized = categoryName.trim().toLowerCase();

  const matchedCategory = categoryScores.find(
    (entry) =>
      entry.categoryName.toLowerCase() === normalized ||
      entry.categoryId.toLowerCase() === normalized,
  );

  if (matchedCategory) {
    return matchedCategory.categoryId;
  }

  const directMatch = CATEGORY_IDS.find((categoryId) => categoryId === normalized);
  if (directMatch) {
    return directMatch;
  }

  const partialMatch = CATEGORY_IDS.find((categoryId) => normalized.includes(categoryId));
  return partialMatch ?? "operations";
}

function parseSupportingKpis(
  breakdown: ScoreBreakdown,
  group: ContributionGroup,
): readonly SupportingKPIReference[] {
  const source =
    group === "positive"
      ? breakdown.positiveContributions
      : group === "negative"
        ? breakdown.negativeContributions
        : [...(breakdown.positiveContributions ?? []), ...(breakdown.negativeContributions ?? [])];

  if (!source || source.length === 0) {
    return [{ id: slugify(breakdown.category), name: breakdown.category }];
  }

  return source.map((entry, index) => {
    const [namePart] = entry.split(":");
    const name = namePart?.trim() || entry.trim();

    return {
      id: `${slugify(name)}-${index}`,
      name,
    };
  });
}

function buildExplanationItem(
  ranked: RankedContribution,
  categoryScores: readonly CategoryScore[],
  thresholds: ContributionImportanceThresholds,
): ExplanationItem {
  const { breakdown, group, absoluteContribution } = ranked;
  const contributionMagnitude = Math.abs(breakdown.contribution);
  const category = resolveCategoryId(breakdown.category, categoryScores);

  const titleTemplate =
    group === "positive"
      ? EXPLANATION_ITEM_TEMPLATES.positiveTitle
      : group === "negative"
        ? EXPLANATION_ITEM_TEMPLATES.negativeTitle
        : EXPLANATION_ITEM_TEMPLATES.neutralTitle;

  const summaryTemplate =
    group === "positive"
      ? EXPLANATION_ITEM_TEMPLATES.positiveSummary
      : group === "negative"
        ? EXPLANATION_ITEM_TEMPLATES.negativeSummary
        : EXPLANATION_ITEM_TEMPLATES.neutralSummary;

  const templateVariables = {
    category: breakdown.category,
    contribution: contributionMagnitude.toFixed(1),
    explanation: breakdown.explanation,
  };

  return {
    id: `${slugify(breakdown.category)}-${ranked.rank}`,
    title: renderTemplate(titleTemplate, templateVariables),
    category,
    contribution: breakdown.contribution,
    importance: resolveImportance(absoluteContribution, thresholds),
    description: renderTemplate(summaryTemplate, templateVariables),
    supportingKpis: parseSupportingKpis(breakdown, group),
  };
}

/** Ranks EC-002A breakdown entries without recalculating scores. */
export class ContributionAnalyzer {
  private readonly importanceThresholds: ContributionImportanceThresholds;

  constructor(
    importanceThresholds: ContributionImportanceThresholds = DEFAULT_CONTRIBUTION_IMPORTANCE_THRESHOLDS,
  ) {
    this.importanceThresholds = importanceThresholds;
  }

  analyze(
    breakdown: readonly ScoreBreakdown[],
    categoryScores: readonly CategoryScore[] = [],
  ): ContributionAnalysis {
    const ranked = [...breakdown]
      .map((entry) => ({
        breakdown: entry,
        group: resolveContributionGroup(entry.contribution),
        absoluteContribution: Math.abs(entry.contribution),
      }))
      .sort((left, right) => {
        if (right.absoluteContribution !== left.absoluteContribution) {
          return right.absoluteContribution - left.absoluteContribution;
        }

        return left.breakdown.category.localeCompare(right.breakdown.category);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    const positives = ranked.filter((entry) => entry.group === "positive");
    const negatives = ranked.filter((entry) => entry.group === "negative");
    const neutrals = ranked.filter((entry) => entry.group === "neutral");

    const explanationItems = ranked.map((entry) =>
      buildExplanationItem(entry, categoryScores, this.importanceThresholds),
    );

    return {
      positives,
      negatives,
      neutrals,
      all: ranked,
      explanationItems,
    };
  }
}

/** Pure helper for selecting top contributors from an analysis result. */
export function selectTopContributions(
  contributions: readonly RankedContribution[],
  limit: number,
): readonly RankedContribution[] {
  return contributions.slice(0, Math.max(0, limit));
}
