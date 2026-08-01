import { Card } from "@/components/ui/Card";
import type { RevenueDashboardView } from "@/lib/hospitality/models/billing";

type RevenuePanelProps = {
  readonly revenue: RevenueDashboardView;
};

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Revenue analytics panel (Mission P-007.6). */
export function RevenuePanel({ revenue }: RevenuePanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Revenue by Source">
        <ul className="space-y-2">
          {revenue.bySource.map((entry) => (
            <li key={entry.source} className="flex justify-between text-sm text-white/70">
              <span>{entry.source}</span>
              <span>{formatCurrency(entry.revenue)} ({entry.share}%)</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Revenue by Accommodation">
        <ul className="space-y-2">
          {revenue.byAccommodationType.map((entry) => (
            <li key={entry.type} className="flex justify-between text-sm text-white/70">
              <span>{entry.type}</span>
              <span>{formatCurrency(entry.revenue)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Revenue by Property">
        <ul className="space-y-2">
          {revenue.byProperty.map((entry) => (
            <li key={entry.propertyId} className="flex justify-between text-sm text-white/70">
              <span>{entry.propertyName}</span>
              <span>{formatCurrency(entry.revenue)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Market Segments">
        <ul className="space-y-2">
          {revenue.byMarketSegment.map((entry) => (
            <li key={entry.segment} className="flex justify-between text-sm text-white/70">
              <span>{entry.segment}</span>
              <span>{formatCurrency(entry.revenue)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
