import {
  BusinessHealthEngine,
  type BusinessHealthEngineResult,
} from "@/lib/business-health/engine/BusinessHealthEngine";
import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import type { KPI } from "@/lib/business-health/models/KPI";
import {
  createExplainabilityConfig,
  DEFAULT_EXPLAINABILITY_CONFIG,
  type ExplainabilityConfig,
} from "@/lib/explainability/ExplainabilityConfig";
import {
  ExplainabilityPipeline,
  toConfidenceContext,
  type ExplainabilityContext,
} from "@/lib/explainability/ExplainabilityPipeline";
import type {
  ExplainabilityEngineResult,
  ExplainabilityError,
} from "@/lib/explainability/ExplainabilityResult";

function validateHealthScore(healthScore: HealthScore): ExplainabilityError | null {
  if (!healthScore.timestamp) {
    return {
      code: "INVALID_HEALTH_SCORE",
      message: "HealthScore.timestamp is required for explainability generation.",
    };
  }

  if (Number.isNaN(healthScore.overallScore)) {
    return {
      code: "INVALID_HEALTH_SCORE",
      message: "HealthScore.overallScore must be a valid number.",
    };
  }

  return null;
}

/** Public entry point for deterministic explainability generation. */
export class ExplainabilityEngine {
  private readonly config: ExplainabilityConfig;
  private readonly pipeline: ExplainabilityPipeline;
  private readonly healthEngine: BusinessHealthEngine;

  constructor(
    config: ExplainabilityConfig = DEFAULT_EXPLAINABILITY_CONFIG,
    healthEngine: BusinessHealthEngine = new BusinessHealthEngine(),
  ) {
    this.config = createExplainabilityConfig(config);
    this.pipeline = new ExplainabilityPipeline(this.config);
    this.healthEngine = healthEngine;
  }

  explain(
    healthScore: HealthScore,
    context?: ExplainabilityContext,
  ): ExplainabilityEngineResult {
    const validationError = validateHealthScore(healthScore);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const snapshot = this.pipeline.execute({ healthScore, context });
    return { success: true, data: snapshot };
  }

  explainFromKPIs(
    kpis: readonly KPI[],
    context?: ExplainabilityContext,
  ): ExplainabilityEngineResult {
    if (kpis.length === 0) {
      return {
        success: false,
        error: {
          code: "EMPTY_INPUT",
          message: "At least one KPI is required for explainFromKPIs.",
        },
      };
    }

    const healthResult = this.healthEngine.calculate([...kpis]);
    return this.mapHealthResult(healthResult, toConfidenceContext(context, kpis));
  }

  private mapHealthResult(
    healthResult: BusinessHealthEngineResult,
    context?: ExplainabilityContext,
  ): ExplainabilityEngineResult {
    if (!healthResult.success) {
      return {
        success: false,
        error: {
          code: "HEALTH_SCORE_FAILED",
          message: healthResult.error.message,
          details: healthResult.error.details,
        },
      };
    }

    return this.explain(healthResult.data, context);
  }
}

export const defaultExplainabilityEngine = new ExplainabilityEngine();
