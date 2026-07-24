import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import { FINANCE_CASH_FLOW_SUMMARY } from "@/lib/finance-insights";

/** Cash flow summary with inflow, outflow, and net position. */
export function FinanceCashFlowSummary() {
  return (
    <Card title="Cash Flow Summary">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusIndicator status={FINANCE_CASH_FLOW_SUMMARY.status} />
          <p className="text-sm font-light text-white/45">
            {FINANCE_CASH_FLOW_SUMMARY.period}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <StatCard label="Inflow" value={FINANCE_CASH_FLOW_SUMMARY.inflow} />
          <StatCard label="Outflow" value={FINANCE_CASH_FLOW_SUMMARY.outflow} />
          <StatCard label="Net" value={FINANCE_CASH_FLOW_SUMMARY.net} />
        </div>
        <dl className="space-y-3">
          {FINANCE_CASH_FLOW_SUMMARY.items.map((item) => (
            <div key={item.label} className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm font-light text-white/50">{item.label}</dt>
              <dd className="text-sm font-medium tabular-nums text-white/85">
                {item.amount}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
