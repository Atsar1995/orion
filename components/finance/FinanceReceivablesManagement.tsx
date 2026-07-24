import { FinanceHorizontalBreakdown } from "@/components/finance/FinanceHorizontalBreakdown";
import { FinanceLedgerList } from "@/components/finance/FinanceLedgerList";
import { FinancePriorityActionCards } from "@/components/finance/FinancePriorityActionCards";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import {
  COLLECTION_PRIORITY,
  RECEIVABLES_AGING,
  RECEIVABLES_EXECUTIVE_SUMMARY,
  RECEIVABLES_RECOMMENDED_ACTIONS,
  TOP_OUTSTANDING_CUSTOMERS,
} from "@/lib/finance-receivables-payables";

/** Full receivables management section for the Finance workspace. */
export function FinanceReceivablesManagement() {
  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{RECEIVABLES_EXECUTIVE_SUMMARY}</p>
      </Card>
      <Card title="Aging Analysis">
        <FinanceHorizontalBreakdown
          items={RECEIVABLES_AGING}
          ariaLabel="Receivables aging analysis by bucket"
        />
      </Card>
      <FinanceLedgerList
        title="Top Outstanding Customers"
        items={TOP_OUTSTANDING_CUSTOMERS}
      />
      <FinanceLedgerList
        title="Collection Priority"
        items={COLLECTION_PRIORITY}
        showPriority
      />
      <FinancePriorityActionCards
        title="Recommended Actions"
        actions={RECEIVABLES_RECOMMENDED_ACTIONS}
      />
    </div>
  );
}
