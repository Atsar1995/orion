import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { FINANCE_EXECUTIVE_NOTES } from "@/lib/finance-data";

/** Executive notes and decision context for finance. */
export function FinanceExecutiveNotes() {
  return (
    <Card title="Executive Notes">
      <p className={WORKSPACE_SUMMARY_CLASS}>{FINANCE_EXECUTIVE_NOTES}</p>
    </Card>
  );
}
