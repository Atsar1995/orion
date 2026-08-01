import { CrmRenewalDashboard } from "@/components/crm/CrmRenewalDashboard";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmAgreementsService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Renewals — renewal dashboard (Mission P-008.3). */
export default async function CrmRenewalsPage() {
  const { context } = await getDecisionServiceContext();
  const view = crmAgreementsService.renewals.getDashboard(context);
  const signals = crmAgreementsService.analytics.getBriefSignals(context);

  return (
    <>
      <CrmSectionHeader title="Renewals" subtitle={signals.briefingLine} />
      <section aria-label="CRM Renewals" className={WORKSPACE_SECTION_CLASS}>
        <CrmRenewalDashboard view={view} />
      </section>
    </>
  );
}
