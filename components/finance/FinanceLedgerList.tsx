import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
} from "@/lib/constants";
import type { LedgerAccount } from "@/lib/finance-receivables-payables";

type FinanceLedgerListProps = {
  title: string;
  items: LedgerAccount[];
  showPriority?: boolean;
};

/** Reusable ledger list for receivables and payables accounts. */
export function FinanceLedgerList({
  title,
  items,
  showPriority = false,
}: FinanceLedgerListProps) {
  return (
    <Card title={title}>
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label={title}>
        {items.map((item) => (
          <li key={item.name} className={WORKSPACE_FIELD_ROW_CLASS}>
            <div className="flex min-w-0 items-start gap-3">
              {showPriority ? (
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orion-gold/25 bg-orion-gold/10 text-xs font-semibold text-orion-gold"
                >
                  {item.priority}
                </span>
              ) : null}
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-light text-white/70">{item.name}</p>
                <p className="text-xs font-light text-white/40">{item.due}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusIndicator status={item.status} />
              <span className="text-sm font-medium tabular-nums text-white/85">
                {item.amount}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
