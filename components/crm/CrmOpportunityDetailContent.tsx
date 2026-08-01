import Link from "next/link";
import { CrmRecentActivity } from "@/components/crm/CrmRecentActivity";
import { CrmSectionPlaceholder } from "@/components/crm/CrmSectionPlaceholder";
import { OpportunityHealthBadge } from "@/components/crm/OpportunityHealthBadge";
import { OpportunityPriorityBadge } from "@/components/crm/OpportunityPriorityBadge";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_SUMMARY_CLASS,
} from "@/lib/constants";
import type { CrmOpportunityDetailView } from "@/lib/crm/models/opportunities";

type CrmOpportunityDetailContentProps = {
  detail: CrmOpportunityDetailView;
};

/** CRM opportunity detail presentation (Mission 16A.4). */
export function CrmOpportunityDetailContent({ detail }: CrmOpportunityDetailContentProps) {
  const { opportunity } = detail;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/crm/opportunities"
          className="text-sm font-medium text-orion-gold/90 hover:text-orion-gold"
        >
          ← Back to Opportunities
        </Link>
      </div>

      <Card title="Opportunity Summary" variant="premium">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">{opportunity.name}</h2>
            <p className="mt-1 text-sm font-light text-white/55">{opportunity.customer}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OpportunityHealthBadge label={opportunity.healthLabel} />
            <OpportunityPriorityBadge label={opportunity.priority} />
          </div>
        </div>
        <p className={WORKSPACE_SUMMARY_CLASS}>{opportunity.summary}</p>
        <div className={`mt-4 ${WORKSPACE_GRID_2_COL}`}>
          <StatCard label="Stage" value={opportunity.stage} />
          <StatCard label="Deal Value" value={opportunity.value} />
          <StatCard label="Expected Revenue" value={opportunity.expectedRevenue} />
          <StatCard label="Probability" value={`${opportunity.probability}%`} />
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Customer">
          <ul className={WORKSPACE_FIELD_LIST_CLASS}>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Customer</span>
              <Link
                href={`/crm/customers/${opportunity.customerId}`}
                className="text-sm text-orion-gold/90 hover:text-orion-gold"
              >
                {opportunity.customer}
              </Link>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Expected Close</span>
              <span className="text-sm text-white/85">{opportunity.expectedClose}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Assigned Owner</span>
              <span className="text-sm text-white/85">{opportunity.assignedOwner}</span>
            </li>
            <li className={WORKSPACE_FIELD_ROW_CLASS}>
              <span className="text-sm font-light text-white/60">Last Updated</span>
              <span className="text-sm text-white/85">{opportunity.lastUpdated}</span>
            </li>
          </ul>
        </Card>

        <Card title="Next Action">
          <p className="text-sm font-light leading-relaxed text-white/70">{opportunity.nextAction}</p>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <CrmRecentActivity activities={detail.recentActivity} />
        <Card title="Executive Recommendations">
          <div className="space-y-3">
            {detail.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <CrmSectionPlaceholder
          title="Timeline"
          description="Full deal timeline will appear when activity integrations are connected."
        />
        <CrmSectionPlaceholder
          title="Notes"
          description="Opportunity notes and executive context will be editable when CRM persistence ships."
        />
      </div>

      <CrmSectionPlaceholder
        title="Attachments"
        description="Proposal documents and contract attachments will be available when document storage is connected."
      />
    </div>
  );
}
