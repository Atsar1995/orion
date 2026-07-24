import { CustomerPortfolio } from "@/components/crm/CustomerPortfolio";
import { CustomerProfileList } from "@/components/crm/CustomerProfileCard";
import { ExecutiveRecommendations } from "@/components/crm/ExecutiveRecommendations";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import {
  CUSTOMER_PROFILES,
  RELATIONSHIP_EXECUTIVE_SUMMARY,
} from "@/lib/crm-relationships-opportunities";

/** Full customer profile management section for the CRM workspace. */
export function CrmCustomersManagement() {
  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{RELATIONSHIP_EXECUTIVE_SUMMARY}</p>
      </Card>
      <CustomerPortfolio />
      <CustomerProfileList title="Priority Customer Profiles" profiles={CUSTOMER_PROFILES} />
      <ExecutiveRecommendations />
    </div>
  );
}
