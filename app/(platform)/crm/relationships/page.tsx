import { CrmRelationshipsManagement } from "@/components/crm/CrmRelationshipsManagement";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmRelationshipsPage() {
  return (
    <>
      <CrmSectionHeader
        title="Relationships"
        subtitle="Key contacts, stakeholders, and account relationships."
      />
      <section aria-label="CRM Relationships" className={WORKSPACE_SECTION_CLASS}>
        <CrmRelationshipsManagement />
      </section>
    </>
  );
}
