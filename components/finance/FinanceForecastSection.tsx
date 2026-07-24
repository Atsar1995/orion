import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { FinanceChartPlaceholder } from "@/components/finance/FinanceChartPlaceholder";
import { FORECAST_PROJECTIONS } from "@/lib/finance-data";

/** Forecast workspace section with projections placeholder. */
export function FinanceForecastSection() {
  return (
    <div className="space-y-6">
      <FinanceChartPlaceholder
        title="90-Day Forecast"
        description="Forecast modelling will integrate with live ledger and pipeline data."
      />
      <Card title="Projection Summary">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {FORECAST_PROJECTIONS.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </Card>
    </div>
  );
}
