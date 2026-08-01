import { CrmCommercialAnalyticsDashboard } from "@/components/crm/CrmCommercialAnalyticsDashboard";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmCommercialIntelligenceService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Analytics — commercial intelligence executive dashboard (Mission P-008.5). */
export default async function CrmAnalyticsPage() {
  const { context } = await getDecisionServiceContext();
  const view = crmCommercialIntelligenceService.executive.getExecutiveDashboard(context);

  return (
    <>
      <CrmSectionHeader title="Commercial Analytics" subtitle={view.briefingLine} />
      <section aria-label="CRM Commercial Analytics" className={WORKSPACE_SECTION_CLASS}>
        <CrmCommercialAnalyticsDashboard view={view} />
      </section>
    </>
  );
}
