import { CrmOpportunityWorkspace } from "@/components/crm/CrmOpportunityWorkspace";

import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";

import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

import { crmService } from "@/lib/crm";



/** CRM Opportunities — pipeline board, list view, metrics, recommendations (Mission 16A.4). */

export default function CrmOpportunitiesPage() {

  const view = crmService.getOpportunityWorkspace();



  return (

    <>

      <CrmSectionHeader

        title="Opportunities"

        subtitle="Pipeline stages, deal values, and closing forecasts."

      />

      <section aria-label="CRM Opportunities" className={WORKSPACE_SECTION_CLASS}>

        <CrmOpportunityWorkspace view={view} />

      </section>

    </>

  );

}

