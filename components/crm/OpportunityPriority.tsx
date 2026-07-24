import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { OpportunityPriorityGroup } from "@/lib/crm-relationships-opportunities";
import { OPPORTUNITY_PRIORITY_GROUPS } from "@/lib/crm-relationships-opportunities";

const TIER_CLASS = {
  high: "border-red-400/20 bg-red-400/[0.06] text-red-400/90",
  medium: "border-amber-400/20 bg-amber-400/[0.06] text-amber-400/90",
  low: "border-white/[0.08] bg-white/[0.02] text-white/50",
} as const;

type OpportunityPriorityProps = {
  groups?: OpportunityPriorityGroup[];
  title?: string;
};

/** Opportunity prioritisation by calculated priority tier — presentation only. */
export function OpportunityPriority({
  groups = OPPORTUNITY_PRIORITY_GROUPS,
  title = "Opportunity Prioritisation",
}: OpportunityPriorityProps) {
  return (
    <Card title={title}>
      <div className="space-y-5" aria-label={title}>
        {groups.map((group) => (
          <div key={group.tier}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p
                className={`inline-flex rounded-orion-sm border px-2.5 py-1 text-xs font-medium tracking-wide uppercase ${TIER_CLASS[group.tier]}`}
              >
                {group.label}
              </p>
              <StatCard label="Count" value={String(group.opportunities.length)} />
            </div>
            {group.opportunities.length > 0 ? (
              <ul className={WORKSPACE_FIELD_LIST_CLASS}>
                {group.opportunities.map((opportunity) => (
                  <li key={opportunity.name} className={WORKSPACE_FIELD_ROW_CLASS}>
                    <div className="min-w-0">
                      <p className="text-sm font-light text-white/70">{opportunity.name}</p>
                      <p className="text-xs font-light text-white/40">{opportunity.customer}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium tabular-nums text-white/85">
                        {opportunity.value}
                      </p>
                      <p className="text-xs font-light text-white/40">
                        Score {opportunity.priorityScore}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm font-light text-white/40">No opportunities in this tier.</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
