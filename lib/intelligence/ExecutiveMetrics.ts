import { buildExecutiveMetricsFromProviders } from "@/lib/providers/dashboard-aggregator";
import type { ExecutiveMetric, ExecutiveMetricsBundle } from "@/types/intelligence";

/** Executive workspace KPI metrics for the dashboard (Metrics Engine layer). */
export const executiveMetrics = {
  async getExecutiveMetrics(): Promise<ExecutiveMetricsBundle> {
    return buildExecutiveMetricsFromProviders();
  },

  async getMetric(id: keyof ExecutiveMetricsBundle): Promise<ExecutiveMetric> {
    const metrics = await this.getExecutiveMetrics();
    return metrics[id];
  },
};
