import {
  buildNormalizedKPI,
  type KPISignalNormalizer,
  type NormalizationResult,
} from "@/lib/business-health/normalizers/types";

export type MetaRawSignals = {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  previousSpend?: number;
  previousClicks?: number;
  timestamp?: string;
};

/** Normalizes Meta ads signals into provider-independent KPIs. */
export class MetaNormalizer implements KPISignalNormalizer<MetaRawSignals> {
  readonly source = "meta";

  normalize(raw: MetaRawSignals): NormalizationResult {
    if (raw.impressions === 0 && raw.clicks === 0 && raw.conversions === 0 && raw.spend === 0) {
      return {
        success: false,
        errors: [{ code: "EMPTY_PROVIDER", message: "Meta provider returned no measurable signals." }],
      };
    }

    const timestamp = raw.timestamp ?? new Date().toISOString();

    return {
      success: true,
      kpis: [
        buildNormalizedKPI({
          id: "kpi-meta-clicks",
          name: "Ad Clicks",
          description: "Paid media clicks from Meta campaigns",
          category: "marketing",
          currentValue: raw.clicks,
          previousValue: raw.previousClicks ?? raw.clicks,
          targetValue: null,
          weight: 1,
          source: this.source,
          confidence: 95,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-meta-conversions",
          name: "Ad Conversions",
          description: "Paid media conversions from Meta campaigns",
          category: "marketing",
          currentValue: raw.conversions,
          previousValue: raw.conversions,
          targetValue: null,
          weight: 1.1,
          source: this.source,
          confidence: 95,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-meta-spend",
          name: "Ad Spend",
          description: "Paid media spend from Meta campaigns",
          category: "operations",
          currentValue: raw.spend,
          previousValue: raw.previousSpend ?? raw.spend,
          targetValue: null,
          weight: 0.7,
          source: this.source,
          confidence: 95,
          valueDirection: "lower_is_better",
          timestamp,
        }),
      ],
    };
  }
}
