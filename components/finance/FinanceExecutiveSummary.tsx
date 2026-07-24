import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { FINANCE_EXECUTIVE_SUMMARY } from "@/lib/finance-data";

/** Executive-level finance summary for the Overview page. */
export function FinanceExecutiveSummary() {
  return (
    <Card title="Executive Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{FINANCE_EXECUTIVE_SUMMARY}</p>
    </Card>
  );
}
