import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import type { RelationshipAction } from "@/lib/crm-relationships-opportunities";
import { RELATIONSHIP_ACTIONS } from "@/lib/crm-relationships-opportunities";

type RelationshipActionsProps = {
  actions?: RelationshipAction[];
  title?: string;
};

/** Recommended relationship actions generated from business logic. */
export function RelationshipActions({
  actions = RELATIONSHIP_ACTIONS,
  title = "Relationship Actions",
}: RelationshipActionsProps) {
  return (
    <Card title={title}>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2" aria-label={title}>
        {actions.map((item) => (
          <li
            key={item.priority}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
                Priority {item.priority}
              </p>
              <span className="rounded-orion-sm border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/55">
                {item.action}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-white/85">{item.customer}</p>
            <p className={`mt-2 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.description}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
