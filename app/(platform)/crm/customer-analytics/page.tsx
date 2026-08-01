import { CrmCustomerIntelligenceDashboard } from "@/components/crm/CrmCustomerIntelligenceDashboard";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmCustomerIntelligenceService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Customer Analytics — profile hub and relationship intelligence (Mission P-008.6). */
export default async function CrmCustomerAnalyticsPage() {
  const { context } = await getDecisionServiceContext();
  const view = crmCustomerIntelligenceService.executive.getDashboard(context);

  return (
    <>
      <CrmSectionHeader title="Customer Analytics" subtitle={view.hub.briefingLine} />
      <section aria-label="CRM Customer Analytics" className={WORKSPACE_SECTION_CLASS}>
        <CrmCustomerIntelligenceDashboard view={view} />
      </section>
    </>
  );
}
