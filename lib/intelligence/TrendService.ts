import { buildTrendsFromProviders } from "@/lib/providers/dashboard-aggregator";
import type { Trend } from "@/types/intelligence";

/** Trend service — maps to Trend Engine (ES-031) via Provider Framework. */
export const trendService = {
  async getTrends(): Promise<Trend[]> {
    return buildTrendsFromProviders();
  },
};
