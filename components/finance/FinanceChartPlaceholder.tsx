import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type FinanceChartPlaceholderProps = {
  title: string;
  description: string;
  metric?: string;
};

/** Placeholder for finance charts pending real data integration. */
export function FinanceChartPlaceholder({
  title,
  description,
  metric,
}: FinanceChartPlaceholderProps) {
  return (
    <Card title={title}>
      <div className="space-y-4">
        {metric ? (
          <p className="text-2xl font-semibold tracking-tight text-white">{metric}</p>
        ) : null}
        <EmptyState
          title="Chart preview"
          description={description}
        />
      </div>
    </Card>
  );
}
