import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { FINANCE_RECEIVABLES_SNAPSHOT } from "@/lib/finance-data";

/** Receivables snapshot for the Finance Overview page. */
export function FinanceReceivablesSnapshot() {
  const items = [
    { label: "Total Outstanding", value: FINANCE_RECEIVABLES_SNAPSHOT.total },
    { label: "Overdue", value: FINANCE_RECEIVABLES_SNAPSHOT.overdue },
    { label: "Due This Week", value: FINANCE_RECEIVABLES_SNAPSHOT.dueThisWeek },
    { label: "Top Debtor", value: FINANCE_RECEIVABLES_SNAPSHOT.topDebtor },
  ];

  return (
    <Card title="Receivables Snapshot">
      <dl className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className={WORKSPACE_FIELD_ROW_CLASS}>
            <dt className="text-sm font-light text-white/50">{item.label}</dt>
            <dd className="text-sm font-medium text-white/85">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
