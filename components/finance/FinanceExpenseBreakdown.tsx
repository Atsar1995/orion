import { Card } from "@/components/ui/Card";
import { FinanceHorizontalBreakdown } from "@/components/finance/FinanceHorizontalBreakdown";
import { EXPENSE_BREAKDOWN_SERIES } from "@/lib/finance-insights";

/** Expense category breakdown with proportional bars. */
export function FinanceExpenseBreakdown() {
  return (
    <Card title="Expense Breakdown">
      <FinanceHorizontalBreakdown
        items={EXPENSE_BREAKDOWN_SERIES}
        ariaLabel="Monthly expense breakdown by category"
      />
    </Card>
  );
}
