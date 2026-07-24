import { CrmCustomersManagement } from "@/components/crm/CrmCustomersManagement";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmCustomersPage() {
  return (
    <>
      <CrmSectionHeader
        title="Customers"
        subtitle="Active accounts, segments, and customer profiles."
      />
      <section aria-label="CRM Customers" className={WORKSPACE_SECTION_CLASS}>
        <CrmCustomersManagement />
      </section>
    </>
  );
}
