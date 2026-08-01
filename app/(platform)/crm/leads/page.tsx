import { CrmLeadDirectory } from "@/components/crm/CrmLeadDirectory";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmCommercialService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Leads — lead management (Mission P-008.2). */
export default async function CrmLeadsPage() {
  const { context } = await getDecisionServiceContext();
  const directory = crmCommercialService.leads.list(context);

  return (
    <>
      <CrmSectionHeader
        title="Leads"
        subtitle="Commercial lifecycle from initial interest through qualification and conversion."
      />
      <section aria-label="CRM Leads" className={WORKSPACE_SECTION_CLASS}>
        <CrmLeadDirectory items={directory.items} filterOptions={directory.filterOptions} />
      </section>
    </>
  );
}
