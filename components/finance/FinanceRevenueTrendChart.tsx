import { Card } from "@/components/ui/Card";
import { FinanceBarChart } from "@/components/finance/FinanceBarChart";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { FINANCE_REVENUE_TREND } from "@/lib/finance-data";
import { REVENUE_TREND_SERIES } from "@/lib/finance-insights";

/** Six-month revenue trend visualisation. */
export function FinanceRevenueTrendChart() {
  return (
    <Card title="Revenue Trend">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={WORKSPACE_SUMMARY_CLASS}>{FINANCE_REVENUE_TREND.summary}</p>
          <span className="text-sm font-semibold text-orion-gold/90">
            {FINANCE_REVENUE_TREND.change}
          </span>
        </div>
        <FinanceBarChart
          data={REVENUE_TREND_SERIES}
          ariaLabel={`Revenue trend over ${FINANCE_REVENUE_TREND.period}`}
        />
      </div>
    </Card>
  );
}
