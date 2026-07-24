import type {
  BusinessAlert,
  ExecutiveRecommendation,
  RiskIndicator,
} from "@/lib/intelligence/models";

/**
 * ORION AI Provider contracts — architecture only.
 * @see docs/02_Engineering/ES-039-AI-Orchestration-Agent-Framework.md
 */

/** Context for future AI recommendation generation. */
export type RecommendationContext = {
  workspaceId: string;
  data: unknown;
};

/** Context for future AI prediction requests. */
export type PredictionContext = {
  workspaceId: string;
  metric: string;
  data: unknown;
};

/** Context for future AI forecast requests. */
export type ForecastContext = {
  workspaceId: string;
  horizon: string;
  data: unknown;
};

/** Context for future AI risk assessment. */
export type RiskAssessmentContext = {
  workspaceId: string;
  alerts: BusinessAlert[];
};

/** Context for future AI conversation requests. */
export type ConversationContext = {
  workspaceId: string;
  prompt: string;
  context: unknown;
};

/** Empty contract — future AI recommendation provider. */
export interface RecommendationProvider {
  generate(context: RecommendationContext): Promise<ExecutiveRecommendation[]>;
}

/** Empty contract — future AI prediction provider. */
export interface PredictionProvider {
  predict(context: PredictionContext): Promise<unknown>;
}

/** Empty contract — future AI forecast provider. */
export interface ForecastProvider {
  forecast(context: ForecastContext): Promise<unknown>;
}

/** Empty contract — future AI risk assessment provider. */
export interface RiskAssessmentProvider {
  assess(context: RiskAssessmentContext): Promise<RiskIndicator[]>;
}

/** Empty contract — future AI conversation provider. */
export interface ConversationProvider {
  converse(context: ConversationContext): Promise<unknown>;
}

/** Placeholder AI service registry for future integration. */
export const AI_PROVIDER_REGISTRY = {
  recommendation: null as RecommendationProvider | null,
  prediction: null as PredictionProvider | null,
  forecast: null as ForecastProvider | null,
  riskAssessment: null as RiskAssessmentProvider | null,
  conversation: null as ConversationProvider | null,
};

/** Returns whether any AI provider is registered. */
export function isAiEnabled(): boolean {
  return Object.values(AI_PROVIDER_REGISTRY).some((provider) => provider !== null);
}

/** Maps business alerts to risk indicators for AI provider input. */
export function mapAlertsToRiskIndicators(alerts: BusinessAlert[]): RiskIndicator[] {
  return alerts.map((alert) => ({
    severity: alert.severity,
    message: alert.message,
    source: alert.category,
  }));
}
