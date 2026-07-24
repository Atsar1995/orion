import Link from "next/link";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { FinanceKpiSummaryRow } from "@/components/finance/FinanceEnhancedKpiCards";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import {
  getProviderBriefingLine,
  getProviderCardSnapshot,
} from "@/lib/intelligence/intelligence-bus";
import type { FinanceAdvisorSnapshot } from "@/lib/finance/finance-advisor-snapshot";
import type { PriorityObligation } from "@/lib/finance-receivables-payables";

function PriorityObligationBlock({
  label,
  obligation,
  href,
}: {
  label: string;
  obligation: PriorityObligation;
  href: string;
}) {
  return (
    <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-white/40 uppercase">{label}</p>
        <StatusIndicator status={obligation.status} showLabel={false} />
      </div>
      <p className="mt-2 text-sm font-medium text-white/85">{obligation.name}</p>
      <p className="mt-1 text-sm font-light text-white/55">
        {obligation.amount} · {obligation.due}
      </p>
      <p className="mt-2 text-sm font-light text-white/50">{obligation.action}</p>
      <Link
        href={href}
        className="mt-3 inline-block text-xs font-medium text-orion-gold/90 transition-colors hover:text-orion-gold"
      >
        View details →
      </Link>
    </div>
  );
}

/** Finance insights integrated into the daily Executive Brief (ADR-006). */
export function FinanceInsightsCard() {
  const snapshot = getProviderCardSnapshot<FinanceAdvisorSnapshot>("finance");
  const briefingLine = getProviderBriefingLine("finance");

  if (!snapshot) {
    return null;
  }

  return (
    <Card
      title="Finance Insights"
      variant="premium"
      action={
        <Link
          href="/finance"
          className="text-xs font-medium text-orion-gold/90 transition-colors hover:text-orion-gold"
        >
          Open Finance →
        </Link>
      }
    >
      <div className="space-y-5">
        <p className={WORKSPACE_SUMMARY_CLASS}>{briefingLine}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Health Score
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {snapshot.healthScore}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusIndicator status={snapshot.status} />
            <StatCard label="Trend" value={snapshot.trend} />
          </div>
        </div>
        <FinanceKpiSummaryRow />
        <div className={WORKSPACE_GRID_2_COL}>
          <PriorityObligationBlock
            label="Highest-Priority Receivable"
            obligation={snapshot.topReceivable}
            href="/finance/receivables"
          />
          <PriorityObligationBlock
            label="Highest-Priority Payable"
            obligation={snapshot.topPayable}
            href="/finance/payables"
          />
        </div>
        <div className="rounded-orion-md border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-amber-400/80 uppercase">
            Top Priority
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            {snapshot.topInsight.title}
          </p>
          <p className="mt-1 text-sm font-light text-white/55">
            {snapshot.topInsight.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
