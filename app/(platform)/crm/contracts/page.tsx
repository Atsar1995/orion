import { CrmContractRegistry } from "@/components/crm/CrmContractRegistry";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmAgreementsService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Contracts — contract registry (Mission P-008.3). */
export default async function CrmContractsPage() {
  const { context } = await getDecisionServiceContext();
  const contracts = crmAgreementsService.contracts.list(context);

  return (
    <>
      <CrmSectionHeader
        title="Contracts"
        subtitle="Authoritative registry of commercial commitments, effective dates, and renewal rules."
      />
      <section aria-label="CRM Contracts" className={WORKSPACE_SECTION_CLASS}>
        <CrmContractRegistry items={contracts} />
      </section>
    </>
  );
}
