import { describe, expect, it } from "vitest";
import {
  GA4Normalizer,
  MetaNormalizer,
  ShopifyNormalizer,
} from "@/lib/business-health/normalizers";
import {
  sampleGA4Signals,
  sampleMetaSignals,
  sampleShopifySignals,
} from "@/tests/fixtures/business-health";

describe("Provider normalizers", () => {
  it("normalizes GA4 signals into provider-independent KPI names", () => {
    const result = new GA4Normalizer().normalize(sampleGA4Signals);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.kpis.map((kpi) => kpi.name)).toEqual(
        expect.arrayContaining(["Website Sessions", "Website Users", "Revenue", "Bounce Rate"]),
      );
      expect(result.kpis.every((kpi) => kpi.source === "ga4")).toBe(true);
    }
  });

  it("normalizes Shopify signals into revenue and operations KPIs", () => {
    const result = new ShopifyNormalizer().normalize(sampleShopifySignals);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.kpis.map((kpi) => kpi.name)).toEqual(
        expect.arrayContaining(["Orders", "Revenue", "Refund Value"]),
      );
    }
  });

  it("normalizes Meta signals into marketing and operations KPIs", () => {
    const result = new MetaNormalizer().normalize(sampleMetaSignals);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.kpis.some((kpi) => kpi.name === "Ad Clicks")).toBe(true);
      expect(result.kpis.some((kpi) => kpi.category === "operations")).toBe(true);
    }
  });

  it("returns graceful errors for empty provider payloads", () => {
    const result = new GA4Normalizer().normalize({
      sessions: 0,
      users: 0,
      revenue: 0,
      bounceRate: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]?.code).toBe("EMPTY_PROVIDER");
    }
  });
});
