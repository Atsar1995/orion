import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { CrmSectionPlaceholder } from "@/components/crm/CrmSectionPlaceholder";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmSettingsPage() {
  return (
    <>
      <CrmSectionHeader
        title="Settings"
        subtitle="Customer Intelligence workspace preferences."
      />
      <section aria-label="CRM Settings" className={WORKSPACE_SECTION_CLASS}>
        <CrmSectionPlaceholder
          title="Workspace Settings"
          description="CRM preferences, pipeline stages, and alert thresholds will be configurable in a future release."
        />
      </section>
    </>
  );
}
