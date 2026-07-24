import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { FinanceLedgerList } from "@/components/finance/FinanceLedgerList";
import { FinancePriorityActionCards } from "@/components/finance/FinancePriorityActionCards";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import {
  PAYABLES_CASH_IMPACT,
  PAYABLES_EXECUTIVE_SUMMARY,
  PAYABLES_RECOMMENDATIONS,
  UPCOMING_PAYMENTS,
  VENDOR_PRIORITY,
} from "@/lib/finance-receivables-payables";

/** Full payables management section for the Finance workspace. */
export function FinancePayablesManagement() {
  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{PAYABLES_EXECUTIVE_SUMMARY}</p>
      </Card>
      <FinanceLedgerList title="Upcoming Payments" items={UPCOMING_PAYMENTS} />
      <FinanceLedgerList
        title="Vendor Priority"
        items={VENDOR_PRIORITY}
        showPriority
      />
      <Card title="Cash Impact">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <StatusIndicator status={PAYABLES_CASH_IMPACT.status} />
            <p className={WORKSPACE_SUMMARY_CLASS}>{PAYABLES_CASH_IMPACT.summary}</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <StatCard label="Due This Week" value={PAYABLES_CASH_IMPACT.dueThisWeek} />
            <StatCard label="Due Next 30 Days" value={PAYABLES_CASH_IMPACT.dueNext30Days} />
            <StatCard
              label="Cash After Payments"
              value={PAYABLES_CASH_IMPACT.cashAfterPayments}
            />
          </div>
        </div>
      </Card>
      <FinancePriorityActionCards
        title="Executive Recommendations"
        actions={PAYABLES_RECOMMENDATIONS}
      />
    </div>
  );
}
