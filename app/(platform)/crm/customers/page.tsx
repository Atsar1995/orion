import { CrmCustomerDirectory } from "@/components/crm/CrmCustomerDirectory";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmService } from "@/lib/crm";

/** CRM Customers — directory with search, filters, sort, and pagination (Mission 16A.3). */
export default function CrmCustomersPage() {
  const records = crmService.customers.getCustomerCatalog();

  return (
    <>
      <CrmSectionHeader
        title="Customers"
        subtitle="Active accounts, segments, and customer profiles."
      />
      <section aria-label="CRM Customers" className={WORKSPACE_SECTION_CLASS}>
        <CrmCustomerDirectory records={records} />
      </section>
    </>
  );
}
