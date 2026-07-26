import {
  buildNormalizedKPI,
  type KPISignalNormalizer,
  type NormalizationResult,
} from "@/lib/business-health/normalizers/types";

export type ShopifyRawSignals = {
  orders: number;
  sales: number;
  refunds: number;
  previousOrders?: number;
  previousSales?: number;
  previousRefunds?: number;
  timestamp?: string;
};

/** Normalizes Shopify commerce signals into provider-independent KPIs. */
export class ShopifyNormalizer implements KPISignalNormalizer<ShopifyRawSignals> {
  readonly source = "shopify";

  normalize(raw: ShopifyRawSignals): NormalizationResult {
    if (raw.orders === 0 && raw.sales === 0 && raw.refunds === 0) {
      return {
        success: false,
        errors: [{ code: "EMPTY_PROVIDER", message: "Shopify provider returned no measurable signals." }],
      };
    }

    const timestamp = raw.timestamp ?? new Date().toISOString();

    return {
      success: true,
      kpis: [
        buildNormalizedKPI({
          id: "kpi-shopify-orders",
          name: "Orders",
          description: "Completed Shopify orders",
          category: "revenue",
          currentValue: raw.orders,
          previousValue: raw.previousOrders ?? raw.orders,
          targetValue: null,
          weight: 1,
          source: this.source,
          confidence: 100,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-shopify-revenue",
          name: "Revenue",
          description: "Shopify gross sales",
          category: "revenue",
          currentValue: raw.sales,
          previousValue: raw.previousSales ?? raw.sales,
          targetValue: null,
          weight: 1.2,
          source: this.source,
          confidence: 100,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-refund-value",
          name: "Refund Value",
          description: "Shopify refund volume",
          category: "operations",
          currentValue: raw.refunds,
          previousValue: raw.previousRefunds ?? raw.refunds,
          targetValue: null,
          weight: 0.8,
          source: this.source,
          confidence: 100,
          valueDirection: "lower_is_better",
          timestamp,
        }),
      ],
    };
  }
}
