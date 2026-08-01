import { CustomerPortfolio } from "@/components/crm/CustomerPortfolio";
import { ExecutiveRecommendations } from "@/components/crm/ExecutiveRecommendations";
import { RelationshipActions } from "@/components/crm/RelationshipActions";
import { RelationshipHealth } from "@/components/crm/RelationshipHealth";
import { RelationshipTimeline } from "@/components/crm/RelationshipTimeline";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import type { CrmRelationshipSegment } from "@/lib/crm/models/domain";
import { RELATIONSHIP_EXECUTIVE_SUMMARY } from "@/lib/crm-relationships-opportunities";

type CrmRelationshipsManagementProps = {
  relationshipHealth: CrmRelationshipSegment[];
};

/** Full relationship management section for the CRM workspace. */
export function CrmRelationshipsManagement({
  relationshipHealth,
}: CrmRelationshipsManagementProps) {
  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{RELATIONSHIP_EXECUTIVE_SUMMARY}</p>
      </Card>
      <RelationshipHealth segments={relationshipHealth} />
      <div className={WORKSPACE_GRID_2_COL}>
        <RelationshipTimeline />
        <RelationshipActions />
      </div>
      <CustomerPortfolio />
      <ExecutiveRecommendations />
    </div>
  );
}
