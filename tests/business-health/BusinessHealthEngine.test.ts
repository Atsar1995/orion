import { describe, expect, it } from "vitest";
import { BusinessHealthEngine } from "@/lib/business-health/engine/BusinessHealthEngine";
import {
  GA4Normalizer,
  MetaNormalizer,
  ShopifyNormalizer,
} from "@/lib/business-health/normalizers";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import {
  createTestKPI,
  sampleGA4Signals,
  sampleMetaSignals,
  sampleShopifySignals,
} from "@/tests/fixtures/business-health";

describe("BusinessHealthEngine", () => {
  it("calculates a deterministic business health score from normalized KPIs", () => {
    const engine = new BusinessHealthEngine();
    const result = engine.calculate([
      finalizeKPI(
        createTestKPI({
          id: "rev",
          name: "Revenue",
          category: "revenue",
          currentValue: 120,
          previousValue: 100,
          targetValue: 100,
          confidence: 100,
        }),
      ),
      finalizeKPI(
        createTestKPI({
          id: "sessions",
          name: "Website Sessions",
          category: "marketing",
          currentValue: 1500,
          previousValue: 1200,
          targetValue: null,
          confidence: 98,
        }),
      ),
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overallScore).toBeGreaterThan(0);
      expect(result.data.overallScore).toBeLessThanOrEqual(100);
      expect(result.data.categoryScores.length).toBeGreaterThan(0);
      expect(result.data.breakdown.length).toBeGreaterThan(0);
      expect(result.data.confidence).toBeGreaterThan(0);
    }
  });

  it("normalizes provider signals before scoring", () => {
    const engine = new BusinessHealthEngine();
    const result = engine.calculateFromNormalizer(new GA4Normalizer(), sampleGA4Signals);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toContain("Business health");
      expect(result.data.status).toBeTruthy();
    }
  });

  it("combines multiple providers into one score", () => {
    const engine = new BusinessHealthEngine();
    const result = engine.calculateFromProviders([
      { normalizer: new GA4Normalizer(), raw: sampleGA4Signals },
      { normalizer: new ShopifyNormalizer(), raw: sampleShopifySignals },
      { normalizer: new MetaNormalizer(), raw: sampleMetaSignals },
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoryScores.some((entry) => entry.categoryId === "revenue")).toBe(true);
      expect(result.data.categoryScores.some((entry) => entry.categoryId === "marketing")).toBe(true);
    }
  });

  it("handles duplicate KPI registration gracefully", () => {
    const engine = new BusinessHealthEngine();
    const kpi = finalizeKPI(
      createTestKPI({ id: "dup", name: "Revenue", category: "revenue" }),
    );

    const result = engine.calculate([kpi, kpi]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("REGISTRY_FAILED");
    }
  });

  it("handles empty input and failed normalization without throwing", () => {
    const engine = new BusinessHealthEngine();

    expect(engine.calculate([]).success).toBe(false);
    expect(
      engine.calculateFromNormalizer(new GA4Normalizer(), {
        sessions: 0,
        users: 0,
        revenue: 0,
        bounceRate: 0,
      }).success,
    ).toBe(false);
  });

  it("exposes positive and negative category contributions", () => {
    const engine = new BusinessHealthEngine();
    const result = engine.calculateFromProviders([
      { normalizer: new GA4Normalizer(), raw: sampleGA4Signals },
      { normalizer: new ShopifyNormalizer(), raw: sampleShopifySignals },
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      const revenueBreakdown = result.data.breakdown.find((entry) => entry.category === "Revenue");
      expect(revenueBreakdown?.explanation).toContain("Revenue");
    }
  });

  it("handles zero-confidence KPIs without throwing", () => {
    const engine = new BusinessHealthEngine();
    const result = engine.calculate([
      finalizeKPI(
        createTestKPI({
          id: "zero-confidence",
          name: "Manual Import",
          category: "revenue",
          confidence: 0,
          currentValue: 50,
          previousValue: 50,
          targetValue: 100,
        }),
      ),
      finalizeKPI(
        createTestKPI({
          id: "sessions",
          name: "Website Sessions",
          category: "marketing",
          confidence: 98,
          currentValue: 1500,
          previousValue: 1200,
          targetValue: null,
        }),
      ),
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.confidence).toBeGreaterThanOrEqual(0);
      expect(result.data.overallScore).toBeGreaterThan(0);
    }
  });
});
