import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { CrmSectionPlaceholder } from "@/components/crm/CrmSectionPlaceholder";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmCommunicationsPage() {
  return (
    <>
      <CrmSectionHeader
        title="Communications"
        subtitle="Email, messages, and outreach history."
      />
      <section aria-label="CRM Communications" className={WORKSPACE_SECTION_CLASS}>
        <CrmSectionPlaceholder
          title="Communication Hub"
          description="Email and messaging integration will connect to the communications service in a future release."
        />
      </section>
    </>
  );
}
