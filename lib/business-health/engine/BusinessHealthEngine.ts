import type { CategoryScorer } from "@/lib/business-health/scorers/CategoryScorer";
import type { ScoringStrategy } from "@/lib/business-health/interfaces/ScoringStrategy";
import type { CategoryDefinition } from "@/lib/business-health/models/Category";
import {
  DEFAULT_HEALTH_STATUS_THRESHOLDS,
  type HealthScore,
  type HealthStatusThresholds,
} from "@/lib/business-health/models/HealthScore";
import type { KPI } from "@/lib/business-health/models/KPI";
import type { KPISignalNormalizer, NormalizationResult } from "@/lib/business-health/normalizers";
import { KPIRegistry } from "@/lib/business-health/registry/KPIRegistry";
import { createDefaultCategoryScorers } from "@/lib/business-health/scorers";
import { WeightedAverageStrategy } from "@/lib/business-health/strategies/WeightedAverageStrategy";
import { buildHealthSummary, deriveHealthStatusLabel, finalizeKPI } from "@/lib/business-health/utils/HealthUtils";

export type ProviderCalculationInput = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  normalizer: KPISignalNormalizer<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any;
};

export type BusinessHealthEngineErrorCode =
  | "NORMALIZATION_FAILED"
  | "REGISTRY_FAILED"
  | "MISSING_CATEGORY"
  | "EMPTY_INPUT";

export type BusinessHealthEngineError = {
  code: BusinessHealthEngineErrorCode;
  message: string;
  details?: string[];
};

export type BusinessHealthEngineResult =
  | { success: true; data: HealthScore }
  | { success: false; error: BusinessHealthEngineError };

export type BusinessHealthEngineOptions = {
  registry?: KPIRegistry;
  strategy?: ScoringStrategy;
  scorers?: CategoryScorer[];
  categories?: CategoryDefinition[];
  thresholds?: HealthStatusThresholds;
};

const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: "revenue", name: "Revenue", weight: 0.25 },
  { id: "marketing", name: "Marketing", weight: 0.2 },
  { id: "customer", name: "Customer", weight: 0.2 },
  { id: "operations", name: "Operations", weight: 0.15 },
];

/** Provider-independent Business Health Engine (EC-002A). */
export class BusinessHealthEngine {
  private readonly registry: KPIRegistry;
  private readonly strategy: ScoringStrategy;
  private readonly scorers: CategoryScorer[];
  private readonly categories: CategoryDefinition[];
  private readonly thresholds: HealthStatusThresholds;

  constructor(options: BusinessHealthEngineOptions = {}) {
    this.registry = options.registry ?? new KPIRegistry();
    this.strategy = options.strategy ?? new WeightedAverageStrategy();
    this.scorers = options.scorers ?? createDefaultCategoryScorers(this.strategy);
    this.categories = options.categories ?? DEFAULT_CATEGORIES;
    this.thresholds = options.thresholds ?? DEFAULT_HEALTH_STATUS_THRESHOLDS;
  }

  getKPIRegistry(): KPIRegistry {
    return this.registry;
  }

  calculate(normalizedKpis: KPI[]): BusinessHealthEngineResult {
    if (normalizedKpis.length === 0) {
      return {
        success: false,
        error: {
          code: "EMPTY_INPUT",
          message: "No KPI signals were supplied for scoring.",
        },
      };
    }

    this.registry.clear();

    const evaluated = normalizedKpis.map((kpi) => finalizeKPI(kpi));
    const registration = this.registry.registerMany(evaluated);

    if (!registration.success) {
      return {
        success: false,
        error: {
          code: "REGISTRY_FAILED",
          message: registration.error.message,
          details: [registration.error.code],
        },
      };
    }

    return this.calculateFromRegistry();
  }

  calculateFromNormalizer<TRaw>(
    normalizer: KPISignalNormalizer<TRaw>,
    raw: TRaw,
  ): BusinessHealthEngineResult {
    const normalized = normalizer.normalize(raw);

    if (!normalized.success) {
      return {
        success: false,
        error: {
          code: "NORMALIZATION_FAILED",
          message: normalized.errors.map((entry) => entry.message).join(" "),
          details: normalized.errors.map((entry) => entry.code),
        },
      };
    }

    return this.calculate(normalized.kpis);
  }

  calculateFromProviders(
    providers: ProviderCalculationInput[],
  ): BusinessHealthEngineResult {
    const combined: KPI[] = [];
    const errors: string[] = [];

    for (const provider of providers) {
      const normalized = provider.normalizer.normalize(provider.raw);

      if (!normalized.success) {
        errors.push(...normalized.errors.map((entry) => entry.message));
        continue;
      }

      combined.push(...normalized.kpis);
    }

    if (combined.length === 0) {
      return {
        success: false,
        error: {
          code: "NORMALIZATION_FAILED",
          message: errors.join(" ") || "All providers returned empty signal sets.",
          details: errors,
        },
      };
    }

    return this.calculate(combined);
  }

  private calculateFromRegistry(): BusinessHealthEngineResult {
    const categoryScores = this.scorers.map((scorer) => {
      const kpis = this.registry.getByCategory(scorer.categoryId);
      return scorer.score(kpis);
    });

    const categories = this.categories.map((category) => ({
      ...category,
      kpis: this.registry.getByCategory(category.id),
    }));

    const missingCategories = categories.filter(
      (category) => category.kpis.length === 0 && category.weight > 0,
    );

    if (missingCategories.length === categories.length) {
      return {
        success: false,
        error: {
          code: "MISSING_CATEGORY",
          message: "No category KPI assignments were available for scoring.",
        },
      };
    }

    const strategyResult = this.strategy.calculateOverallScore(categoryScores, this.categories);

    const status = deriveHealthStatusLabel(strategyResult.overallScore, this.thresholds);
    const timestamp = new Date().toISOString();
    const summary = buildHealthSummary(
      strategyResult.overallScore,
      status,
      categoryScores.map((entry) => ({
        categoryName: entry.categoryName,
        score: entry.score,
      })),
    );

    return {
      success: true,
      data: {
        overallScore: strategyResult.overallScore,
        status,
        categoryScores,
        confidence: strategyResult.confidence,
        timestamp,
        summary,
        breakdown: strategyResult.breakdown,
      },
    };
  }
}

export type { NormalizationResult };
