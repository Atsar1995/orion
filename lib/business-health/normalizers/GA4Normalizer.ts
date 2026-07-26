import {
  buildNormalizedKPI,
  type KPISignalNormalizer,
  type NormalizationResult,
} from "@/lib/business-health/normalizers/types";

export type GA4RawSignals = {
  sessions: number;
  users: number;
  revenue: number;
  bounceRate: number;
  timestamp?: string;
};

/** Normalizes GA4 analytics signals into provider-independent KPIs. */
export class GA4Normalizer implements KPISignalNormalizer<GA4RawSignals> {
  readonly source = "ga4";

  normalize(raw: GA4RawSignals): NormalizationResult {
    if (this.isEmpty(raw)) {
      return {
        success: false,
        errors: [{ code: "EMPTY_PROVIDER", message: "GA4 provider returned no measurable signals." }],
      };
    }

    const timestamp = raw.timestamp ?? new Date().toISOString();

    return {
      success: true,
      kpis: [
        buildNormalizedKPI({
          id: "kpi-website-sessions",
          name: "Website Sessions",
          description: "Total website sessions tracked in GA4",
          category: "marketing",
          currentValue: raw.sessions,
          previousValue: raw.sessions,
          targetValue: null,
          weight: 1,
          source: this.source,
          confidence: 98,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-website-users",
          name: "Website Users",
          description: "Unique website users tracked in GA4",
          category: "marketing",
          currentValue: raw.users,
          previousValue: raw.users,
          targetValue: null,
          weight: 1,
          source: this.source,
          confidence: 98,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-ga4-revenue",
          name: "Revenue",
          description: "E-commerce revenue tracked in GA4",
          category: "revenue",
          currentValue: raw.revenue,
          previousValue: raw.revenue,
          targetValue: null,
          weight: 1.2,
          source: this.source,
          confidence: 98,
          timestamp,
        }),
        buildNormalizedKPI({
          id: "kpi-bounce-rate",
          name: "Bounce Rate",
          description: "Landing page bounce rate tracked in GA4",
          category: "marketing",
          currentValue: raw.bounceRate,
          previousValue: raw.bounceRate,
          targetValue: 0.45,
          weight: 0.8,
          source: this.source,
          confidence: 98,
          valueDirection: "lower_is_better",
          timestamp,
        }),
      ],
    };
  }

  private isEmpty(raw: GA4RawSignals): boolean {
    return raw.sessions === 0 && raw.users === 0 && raw.revenue === 0 && raw.bounceRate === 0;
  }
}
