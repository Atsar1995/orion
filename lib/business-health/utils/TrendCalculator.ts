import type { KPITrend } from "@/lib/business-health/models/KPI";

/** Computes directional trend from current and previous KPI values. */
export function calculateTrend(
  currentValue: number,
  previousValue: number,
  epsilon = 0.0001,
): KPITrend {
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return "neutral";
  }

  if (Math.abs(currentValue - previousValue) <= epsilon) {
    return "neutral";
  }

  return currentValue > previousValue ? "up" : "down";
}

/** Percentage change between current and previous values. */
export function calculatePercentChange(currentValue: number, previousValue: number): number {
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return 0;
  }

  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}
