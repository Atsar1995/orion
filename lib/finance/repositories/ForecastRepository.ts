import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Forecast contract — implementation P-009.5+. */
export type ForecastRepository = FinanceRepository & {
  countForecastSnapshots(organizationId: string): number;
};
