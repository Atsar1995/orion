import { CrmPartySearchDirectory } from "@/components/crm/CrmPartySearchDirectory";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmPartyService } from "@/lib/crm";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

/** CRM Parties — universal party search (Mission P-008.1). */
export default async function CrmPartiesPage() {
  const { context } = await getDecisionServiceContext();
  const results = crmPartyService.search.search({}, context);

  return (
    <>
      <CrmSectionHeader
        title="Party Registry"
        subtitle="Universal search across individuals and organisations — the canonical business identity model for ORION."
      />
      <section aria-label="CRM Party Search" className={WORKSPACE_SECTION_CLASS}>
        <CrmPartySearchDirectory initialResults={results} />
      </section>
    </>
  );
}
