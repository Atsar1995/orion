import { CrmOpportunitiesManagement } from "@/components/crm/CrmOpportunitiesManagement";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmOpportunitiesPage() {
  return (
    <>
      <CrmSectionHeader
        title="Opportunities"
        subtitle="Pipeline stages, deal values, and closing forecasts."
      />
      <section aria-label="CRM Opportunities" className={WORKSPACE_SECTION_CLASS}>
        <CrmOpportunitiesManagement />
      </section>
    </>
  );
}
