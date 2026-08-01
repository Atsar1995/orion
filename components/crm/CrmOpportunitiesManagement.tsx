import { CrmOpportunityPipeline } from "@/components/crm/CrmOpportunityPipeline";
import { ExecutiveRecommendations } from "@/components/crm/ExecutiveRecommendations";
import { OpportunityManagement } from "@/components/crm/OpportunityManagement";
import { OpportunityPriority } from "@/components/crm/OpportunityPriority";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import type { CrmPipelineView } from "@/lib/crm/models/overview";
import { OPPORTUNITY_EXECUTIVE_SUMMARY } from "@/lib/crm-relationships-opportunities";

type CrmOpportunitiesManagementProps = {
  pipeline: CrmPipelineView;
};

/** Full opportunity management section for the CRM workspace. */
export function CrmOpportunitiesManagement({ pipeline }: CrmOpportunitiesManagementProps) {
  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{OPPORTUNITY_EXECUTIVE_SUMMARY}</p>
      </Card>
      <CrmOpportunityPipeline pipeline={pipeline} />
      <div className={WORKSPACE_GRID_2_COL}>
        <OpportunityManagement />
        <OpportunityPriority />
      </div>
      <ExecutiveRecommendations />
    </div>
  );
}
