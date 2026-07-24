import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
} from "@/lib/constants";
import type { ManagedOpportunity } from "@/lib/crm-relationships-opportunities";
import { MANAGED_OPPORTUNITIES } from "@/lib/crm-relationships-opportunities";

type OpportunityManagementProps = {
  opportunities?: ManagedOpportunity[];
  title?: string;
};

/** Opportunity management list with stage, probability, and next actions. */
export function OpportunityManagement({
  opportunities = MANAGED_OPPORTUNITIES,
  title = "Opportunity Management",
}: OpportunityManagementProps) {
  return (
    <Card title={title}>
      <ul className={WORKSPACE_FIELD_LIST_CLASS} aria-label={title}>
        {opportunities.map((opportunity) => (
          <li key={opportunity.name} className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4">
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-white/85">{opportunity.name}</p>
                <p className="text-xs font-light text-white/45">{opportunity.customer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusIndicator status={opportunity.relationshipStatus} />
                <span className="text-sm font-medium tabular-nums text-white/85">
                  {opportunity.value}
                </span>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div>
                <dt className="font-medium tracking-wide text-white/35 uppercase">Stage</dt>
                <dd className="mt-1 font-light text-white/65">{opportunity.stage}</dd>
              </div>
              <div>
                <dt className="font-medium tracking-wide text-white/35 uppercase">Probability</dt>
                <dd className="mt-1 font-light text-white/65">{opportunity.probability}%</dd>
              </div>
              <div>
                <dt className="font-medium tracking-wide text-white/35 uppercase">Expected Close</dt>
                <dd className="mt-1 font-light text-white/65">{opportunity.expectedClose}</dd>
              </div>
              <div>
                <dt className="font-medium tracking-wide text-white/35 uppercase">Priority</dt>
                <dd className="mt-1 font-light capitalize text-white/65">{opportunity.priority}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm font-light text-white/50">
              <span className="font-medium text-white/60">Next Action:</span>{" "}
              {opportunity.nextAction}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
