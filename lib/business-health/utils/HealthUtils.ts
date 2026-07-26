import {
  DEFAULT_HEALTH_STATUS_THRESHOLDS,
  type HealthStatusLabel,
  type HealthStatusThresholds,
} from "@/lib/business-health/models/HealthScore";
import type { KPI, KPIInput, KPIStatus, KPIValueDirection } from "@/lib/business-health/models/KPI";
import { calculatePercentChange, calculateTrend } from "@/lib/business-health/utils/TrendCalculator";
import { clampScore } from "@/lib/business-health/utils/WeightCalculator";

/** Maps an overall score to an executive health status label. */
export function deriveHealthStatusLabel(
  score: number,
  thresholds: HealthStatusThresholds = DEFAULT_HEALTH_STATUS_THRESHOLDS,
): HealthStatusLabel {
  const clamped = clampScore(score);

  if (clamped >= thresholds.excellent) {
    return "excellent";
  }

  if (clamped >= thresholds.healthy) {
    return "healthy";
  }

  if (clamped >= thresholds.fair) {
    return "fair";
  }

  if (clamped >= thresholds.poor) {
    return "poor";
  }

  return "critical";
}

/** Maps a KPI score to a KPI status band. */
export function deriveKPIStatus(score: number): KPIStatus {
  const clamped = clampScore(score);

  if (clamped >= 90) {
    return "excellent";
  }

  if (clamped >= 75) {
    return "healthy";
  }

  if (clamped >= 60) {
    return "fair";
  }

  if (clamped >= 40) {
    return "poor";
  }

  return "critical";
}

/** Evaluates a single KPI into a deterministic 0–100 score. */
export function evaluateKPIScore(kpi: KPI): number {
  const direction = kpi.valueDirection ?? inferValueDirection(kpi.id, kpi.name);
  const current = sanitizeValue(kpi.currentValue);
  const previous = sanitizeValue(kpi.previousValue);
  const target = kpi.targetValue === null ? null : sanitizeValue(kpi.targetValue);

  if (target !== null && target > 0) {
    if (direction === "lower_is_better") {
      if (current <= 0) {
        return 100;
      }

      return clampScore(Math.min(100, (target / current) * 100));
    }

    return clampScore((current / target) * 100);
  }

  const change = calculatePercentChange(current, previous);
  const directionalChange = direction === "lower_is_better" ? -change : change;
  return clampScore(70 + directionalChange * 0.5);
}

/** Builds a fully evaluated KPI with trend and status populated. */
export function finalizeKPI(input: KPIInput): KPI {
  const timestamp = input.timestamp ?? new Date().toISOString();
  const trend = input.trend ?? calculateTrend(input.currentValue, input.previousValue);
  const base: KPI = {
    ...input,
    timestamp,
    trend,
    status: input.status ?? "unknown",
  };

  return {
    ...base,
    status: input.status ?? deriveKPIStatus(evaluateKPIScore(base)),
  };
}

function sanitizeValue(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

function inferValueDirection(id: string, name: string): KPIValueDirection {
  const key = `${id} ${name}`.toLowerCase();

  if (
    key.includes("bounce") ||
    key.includes("refund") ||
    key.includes("churn") ||
    key.includes("cost")
  ) {
    return "lower_is_better";
  }

  return "higher_is_better";
}

/** Builds a concise executive summary from category scores. */
export function buildHealthSummary(
  overallScore: number,
  status: HealthStatusLabel,
  categoryScores: Array<{ categoryName: string; score: number }>,
): string {
  const strongest = [...categoryScores].sort((a, b) => b.score - a.score)[0];
  const weakest = [...categoryScores].sort((a, b) => a.score - b.score)[0];

  if (!strongest || !weakest) {
    return `Business health is ${status} at ${overallScore}/100.`;
  }

  return `Business health is ${status} at ${overallScore}/100. ${strongest.categoryName} leads at ${strongest.score}; ${weakest.categoryName} needs attention at ${weakest.score}.`;
}
