import { buildBusinessHealthFromProviders } from "@/lib/providers/dashboard-aggregator";
import type { BusinessHealth } from "@/types/intelligence";

/** Business health service — maps to Health Engine (ES-032) via Provider Framework. */
export const businessHealthService = {
  async getBusinessHealth(): Promise<BusinessHealth> {
    return buildBusinessHealthFromProviders();
  },
};
