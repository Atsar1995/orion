import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import { RECOMMENDED_ACTIONS } from "@/lib/hospitality-data";

/** Prioritized hospitality action cards for owners and managers. */
export function RecommendedActions() {
  return (
    <Card title="Recommended Actions">
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {RECOMMENDED_ACTIONS.map((action) => (
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
