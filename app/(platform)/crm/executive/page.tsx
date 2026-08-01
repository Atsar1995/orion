import { CrmExecutiveDashboard } from "@/components/crm/CrmExecutiveDashboard";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmExecutiveDashboardService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Executive — unified commercial executive dashboard (Mission P-008.7). */
export default async function CrmExecutivePage() {
  const { context } = await getDecisionServiceContext();
  const view = crmExecutiveDashboardService.executive.getDashboard(context);

  return (
    <>
      <CrmSectionHeader
        title="Commercial Executive Dashboard"
        subtitle={view.briefingLine}
      />
      <section aria-label="CRM Commercial Executive Dashboard" className={WORKSPACE_SECTION_CLASS}>
        <CrmExecutiveDashboard view={view} />
      </section>
    </>
  );
}
