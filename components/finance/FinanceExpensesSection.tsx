import { FinanceExpenseBreakdown } from "@/components/finance/FinanceExpenseBreakdown";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

/** Expenses workspace section with visual breakdown. */
export function FinanceExpensesSection() {
  return (
    <div className="space-y-6">
      <FinanceExpenseBreakdown />
      <Card title="Budget Comparison">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
          <StatCard label="Monthly Total" value="₹32.3L" />
          <StatCard label="vs Budget" value="+2.1%" />
          <StatCard label="Largest Category" value="Payroll" />
        </div>
      </Card>
    </div>
  );
}
