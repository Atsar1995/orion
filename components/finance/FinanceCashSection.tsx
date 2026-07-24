import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
  WORKSPACE_SUMMARY_CLASS,
} from "@/lib/constants";
import type { FinanceLedgerItem } from "@/lib/finance-data";
import {
  CASH_ACCOUNTS,
  CASH_FLOW_ITEMS,
  FINANCE_CASH_POSITION,
} from "@/lib/finance-data";

function LedgerList({ items }: { items: FinanceLedgerItem[] }) {
  return (
    <ul className={WORKSPACE_FIELD_LIST_CLASS}>
      {items.map((item) => (
        <li key={item.label} className={WORKSPACE_FIELD_ROW_CLASS}>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-light text-white/70">{item.label}</p>
            {item.due ? (
              <p className="text-xs font-light text-white/40">{item.due}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {item.status ? <StatusIndicator status={item.status} /> : null}
            <span className="text-sm font-medium text-white/85">{item.amount}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Cash workspace section with accounts and flow summary. */
export function FinanceCashSection() {
  return (
    <div className="space-y-6">
      <Card title="Cash Position" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{FINANCE_CASH_POSITION.summary}</p>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <StatCard label="Available" value={FINANCE_CASH_POSITION.available} />
          <StatCard label="Reserved" value={FINANCE_CASH_POSITION.reserved} />
          <StatCard
            label="30-Day Projected"
            value={FINANCE_CASH_POSITION.projected30Day}
          />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Cash Accounts">
          <dl className="space-y-3">
            {CASH_ACCOUNTS.map((account) => (
              <div key={account.label} className={WORKSPACE_FIELD_ROW_CLASS}>
                <dt className="text-sm font-light text-white/50">{account.label}</dt>
                <dd className="text-sm font-medium text-white/85">{account.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title="Recent Cash Flow">
          <LedgerList items={CASH_FLOW_ITEMS} />
        </Card>
      </div>
    </div>
  );
}
