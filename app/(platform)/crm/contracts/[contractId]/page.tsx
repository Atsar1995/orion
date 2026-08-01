import { notFound } from "next/navigation";
import { CrmContractDetailContent } from "@/components/crm/CrmContractDetailContent";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmAgreementsService } from "@/lib/crm";
import { partyName } from "@/lib/crm/agreements";
import { defaultCrmRepository } from "@/lib/crm/repositories/InMemoryCrmRepository";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

type PageProps = {
  params: Promise<{ contractId: string }>;
};

/** CRM Contract detail — version history and commercial terms (Mission P-008.3). */
export default async function CrmContractDetailPage({ params }: PageProps) {
  const { contractId } = await params;
  const { context } = await getDecisionServiceContext();
  const contract = crmAgreementsService.contracts.get(contractId, context);

  if (!contract) {
    notFound();
  }

  return (
    <>
      <CrmSectionHeader title={contract.title} subtitle={`Contract · ${contract.status.replace(/_/g, " ")}`} />
      <section aria-label="CRM Contract Detail" className={WORKSPACE_SECTION_CLASS}>
        <CrmContractDetailContent
          contract={contract}
          partyName={partyName(defaultCrmRepository, contract.partyId)}
        />
      </section>
    </>
  );
}
