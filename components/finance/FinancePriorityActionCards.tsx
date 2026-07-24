import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import type { FinanceInsight } from "@/lib/finance-insights";

type FinancePriorityActionCardsProps = {
  title: string;
  actions: FinanceInsight[];
};

/** Reusable prioritised action cards for finance workflows. */
export function FinancePriorityActionCards({
  title,
  actions,
}: FinancePriorityActionCardsProps) {
  return (
    <Card title={title}>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {actions.map((action) => (
          <li
            key={action.priority}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
              Priority {action.priority}
            </p>
            <p className="mt-2 text-sm font-medium text-white/90">{action.title}</p>
            <p className={`mt-2 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{action.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
