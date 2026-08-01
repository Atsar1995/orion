import { CrmForecastDashboard } from "@/components/crm/CrmForecastDashboard";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmCommercialService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Forecast — revenue forecast dashboard (Mission P-008.2). */
export default async function CrmForecastPage() {
  const { context } = await getDecisionServiceContext();
  const view = crmCommercialService.forecast.getDashboard(context);

  return (
    <>
      <CrmSectionHeader
        title="Revenue Forecast"
        subtitle={view.briefingLine}
      />
      <section aria-label="CRM Forecast" className={WORKSPACE_SECTION_CLASS}>
        <CrmForecastDashboard view={view} />
      </section>
    </>
  );
}
