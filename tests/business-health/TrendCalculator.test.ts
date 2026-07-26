import { describe, expect, it } from "vitest";
import { calculatePercentChange, calculateTrend } from "@/lib/business-health/utils/TrendCalculator";

describe("TrendCalculator", () => {
  it("derives up, down, and neutral trends", () => {
    expect(calculateTrend(110, 100)).toBe("up");
    expect(calculateTrend(90, 100)).toBe("down");
    expect(calculateTrend(100, 100)).toBe("neutral");
  });

  it("calculates percent change with zero-safe handling", () => {
    expect(calculatePercentChange(120, 100)).toBe(20);
    expect(calculatePercentChange(50, 0)).toBe(100);
    expect(calculatePercentChange(0, 0)).toBe(0);
  });
});
