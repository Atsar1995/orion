import { notFound } from "next/navigation";
import { CrmOpportunityDetailContent } from "@/components/crm/CrmOpportunityDetailContent";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmService } from "@/lib/crm";

type CrmOpportunityDetailPageProps = {
  params: Promise<{ opportunityId: string }>;
};

/** CRM Opportunity detail page (Mission 16A.4). */
export default async function CrmOpportunityDetailPage({
  params,
}: CrmOpportunityDetailPageProps) {
  const { opportunityId } = await params;
  const detail = crmService.getOpportunityDetail(opportunityId);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <CrmSectionHeader
        title={detail.opportunity.name}
        subtitle={`${detail.opportunity.customer} · ${detail.opportunity.stage}`}
      />
      <section aria-label="CRM Opportunity Detail" className={WORKSPACE_SECTION_CLASS}>
        <CrmOpportunityDetailContent detail={detail} />
      </section>
    </>
  );
}
