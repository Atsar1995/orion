import type { ManagedOpportunity } from "@/lib/crm-relationships-opportunities";
import type { RevenueForecastResult } from "@/lib/crm/models/intelligence";

function formatInr(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  }

  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)}L`;
  }

  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Forecasts revenue from weighted pipeline probability rules (no AI). */
export function computeRevenueForecast(opportunities: ManagedOpportunity[]): RevenueForecastResult {
  const weightedForecast = opportunities.reduce(
    (sum, opportunity) => sum + opportunity.valueAmount * (opportunity.probability / 100),
    0,
  );

  const conservativeForecast = weightedForecast * 0.85;
  const optimisticForecast = weightedForecast * 1.1;

  const closingThisQuarter = opportunities
    .filter(
      (opportunity) =>
        opportunity.probability >= 60 &&
        (opportunity.stage === "Negotiation" || opportunity.stage === "Proposal"),
    )
    .reduce((sum, opportunity) => sum + opportunity.valueAmount * (opportunity.probability / 100), 0);

  return {
    weightedForecast,
    weightedForecastDisplay: formatInr(weightedForecast),
    conservativeForecast,
    conservativeForecastDisplay: formatInr(conservativeForecast),
    optimisticForecast,
    optimisticForecastDisplay: formatInr(optimisticForecast),
    closingThisQuarter,
    closingThisQuarterDisplay: formatInr(closingThisQuarter),
    summary: `Weighted pipeline forecast ${formatInr(weightedForecast)} with ${formatInr(closingThisQuarter)} expected to close this quarter at current probabilities.`,
  };
}
