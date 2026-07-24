import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { FINANCE_PAYABLES_SNAPSHOT } from "@/lib/finance-data";

/** Payables snapshot for the Finance Overview page. */
export function FinancePayablesSnapshot() {
  const items = [
    { label: "Total Outstanding", value: FINANCE_PAYABLES_SNAPSHOT.total },
    { label: "Due This Week", value: FINANCE_PAYABLES_SNAPSHOT.dueThisWeek },
    { label: "Overdue", value: FINANCE_PAYABLES_SNAPSHOT.overdue },
    { label: "Largest Vendor", value: FINANCE_PAYABLES_SNAPSHOT.largestVendor },
  ];

  return (
    <Card title="Payables Snapshot">
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
