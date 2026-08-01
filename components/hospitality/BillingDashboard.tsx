import { Card } from "@/components/ui/Card";
import type { BillingDashboardView } from "@/lib/hospitality/models/billing";

type BillingDashboardProps = {
  readonly dashboard: BillingDashboardView;
};

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Billing operations summary (Mission P-007.6). */
export function BillingDashboard({ dashboard }: BillingDashboardProps) {
  const { summary } = dashboard;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card title="Today's Revenue">
        <p className="text-2xl font-semibold text-orion-gold">{formatCurrency(summary.todaysRevenue)}</p>
        <p className="mt-1 text-sm text-white/45">ADR {formatCurrency(summary.averageDailyRate)} · RevPAR {formatCurrency(summary.revpar)}</p>
      </Card>
      <Card title="Outstanding">
        <p className="text-2xl font-semibold text-orion-gold">{formatCurrency(summary.outstandingBalances)}</p>
        <p className="mt-1 text-sm text-white/45">{summary.pendingPayments} pending settlement</p>
      </Card>
      <Card title="Open Folios">
        <p className="text-2xl font-semibold text-orion-gold">{summary.openFolios}</p>
        <p className="mt-1 text-sm text-white/45">{summary.settledToday} settled today</p>
      </Card>
      <Card title="Revenue Mix">
        <p className="text-sm text-white/70">
          {dashboard.revenueByCategory.slice(0, 3).map((entry) => `${entry.category} ${formatCurrency(entry.amount)}`).join(" · ") || "No charges posted"}
        </p>
      </Card>
    </div>
  );
}
