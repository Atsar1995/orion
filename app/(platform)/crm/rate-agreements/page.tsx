import { CrmRateAgreementDirectory } from "@/components/crm/CrmRateAgreementDirectory";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmAgreementsService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Rate Agreements — corporate, seasonal, and negotiated pricing (Mission P-008.3). */
export default async function CrmRateAgreementsPage() {
  const { context } = await getDecisionServiceContext();
  const items = crmAgreementsService.rates.list(context);

  return (
    <>
      <CrmSectionHeader
        title="Rate Agreements"
        subtitle="Corporate, travel agent, seasonal, promotional, and negotiated pricing schedules."
      />
      <section aria-label="CRM Rate Agreements" className={WORKSPACE_SECTION_CLASS}>
        <CrmRateAgreementDirectory items={items} />
      </section>
    </>
  );
}
