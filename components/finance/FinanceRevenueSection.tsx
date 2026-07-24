import { FinanceExpenseBreakdown } from "@/components/finance/FinanceExpenseBreakdown";
import { FinanceRevenueTrendChart } from "@/components/finance/FinanceRevenueTrendChart";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { FINANCE_REVENUE_TREND } from "@/lib/finance-data";
import { REVENUE_BREAKDOWN } from "@/lib/finance-data";

/** Revenue workspace section with trend chart and channel breakdown. */
export function FinanceRevenueSection() {
  return (
    <div className="space-y-6">
      <FinanceRevenueTrendChart />
      <Card title="Revenue by Channel">
        <dl className="space-y-3">
          {REVENUE_BREAKDOWN.map((item) => (
            <div key={item.label} className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm font-light text-white/50">
                {item.label}{" "}
                <span className="text-white/35">({item.share})</span>
              </dt>
              <dd className="text-sm font-medium text-white/85">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <FinanceExpenseBreakdown />
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCard label="Period" value={FINANCE_REVENUE_TREND.period} />
        <StatCard label="Change" value={FINANCE_REVENUE_TREND.change} />
      </div>
    </div>
  );
}
