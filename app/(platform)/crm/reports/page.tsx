import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { CrmSectionPlaceholder } from "@/components/crm/CrmSectionPlaceholder";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmReportsPage() {
  return (
    <>
      <CrmSectionHeader
        title="Reports"
        subtitle="Customer intelligence reports and exports."
      />
      <section aria-label="CRM Reports" className={WORKSPACE_SECTION_CLASS}>
        <CrmSectionPlaceholder
          title="Available Reports"
          description="Pipeline, retention, and engagement reports will be available when reporting integrations ship."
        />
      </section>
    </>
  );
}
