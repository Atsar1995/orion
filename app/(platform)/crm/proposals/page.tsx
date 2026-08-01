import { CrmProposalDirectory } from "@/components/crm/CrmProposalDirectory";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmAgreementsService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Proposals — proposal management (Mission P-008.3). */
export default async function CrmProposalsPage() {
  const { context } = await getDecisionServiceContext();
  const proposals = crmAgreementsService.proposals.list(context);

  return (
    <>
      <CrmSectionHeader
        title="Proposals"
        subtitle="Commercial offers with version control, internal review, and customer approval."
      />
      <section aria-label="CRM Proposals" className={WORKSPACE_SECTION_CLASS}>
        <CrmProposalDirectory items={proposals} />
      </section>
    </>
  );
}
