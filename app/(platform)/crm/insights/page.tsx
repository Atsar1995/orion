import { CrmInsightsWorkspace } from "@/components/crm/CrmInsightsWorkspace";

import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";

import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

import { crmService } from "@/lib/crm";



/** CRM Insights — intelligence dashboard and executive decision support (Mission 16A.6). */

export default function CrmInsightsPage() {

  const view = crmService.getInsights();



  return (

    <>

      <CrmSectionHeader

        title="Insights"

        subtitle="Customer intelligence recommendations and risk signals."

      />

      <section aria-label="CRM Insights" className={WORKSPACE_SECTION_CLASS}>

        <CrmInsightsWorkspace view={view} />

      </section>

    </>

  );

}

