import { describe, expect, it } from "vitest";
import {
  aggregateConfidence,
  clampScore,
  normalizeWeights,
  weightedAverage,
} from "@/lib/business-health/utils/WeightCalculator";

describe("WeightCalculator", () => {
  it("clamps scores to 0–100", () => {
    expect(clampScore(120)).toBe(100);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(Number.NaN)).toBe(0);
  });

  it("normalizes weights to sum to 1", () => {
    expect(normalizeWeights([2, 2])).toEqual([0.5, 0.5]);
    expect(normalizeWeights([0, 0, 0]).reduce((sum, weight) => sum + weight, 0)).toBeCloseTo(1);
  });

  it("calculates weighted averages", () => {
    expect(weightedAverage([80, 60], [1, 1])).toBe(70);
  });

  it("aggregates confidence scores", () => {
    expect(aggregateConfidence([100, 80], [1, 1])).toBe(90);
  });
});
