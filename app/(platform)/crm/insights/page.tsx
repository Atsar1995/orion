import { CustomerAlerts } from "@/components/crm/CustomerAlerts";
import { CrmExecutiveInsights } from "@/components/crm/CrmExecutiveInsights";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { ExecutiveRecommendations } from "@/components/crm/ExecutiveRecommendations";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmInsightsPage() {
  return (
    <>
      <CrmSectionHeader
        title="Insights"
        subtitle="Customer intelligence recommendations and risk signals."
      />
      <section aria-label="CRM Insights" className={WORKSPACE_SECTION_CLASS}>
        <ExecutiveRecommendations />
        <div className={WORKSPACE_GRID_2_COL}>
          <CrmExecutiveInsights />
          <CustomerAlerts />
        </div>
      </section>
    </>
  );
}
