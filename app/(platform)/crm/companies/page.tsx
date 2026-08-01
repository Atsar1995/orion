import { CrmOrganisationDirectory } from "@/components/crm/CrmOrganisationDirectory";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmPartyService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Companies — universal organisation directory (Mission P-008.1). */
export default async function CrmCompaniesPage() {
  const { context } = await getDecisionServiceContext();
  const directory = crmPartyService.organisations.list(context);

  return (
    <>
      <CrmSectionHeader
        title="Companies"
        subtitle="Organisations, corporate accounts, agencies, and partners — the shared customer domain across ORION."
      />
      <section aria-label="CRM Companies" className={WORKSPACE_SECTION_CLASS}>
        <CrmOrganisationDirectory items={directory.items} filterOptions={directory.filterOptions} />
      </section>
    </>
  );
}
