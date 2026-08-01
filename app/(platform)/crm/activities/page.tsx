import { CrmActivityWorkspace } from "@/components/crm/CrmActivityWorkspace";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmService } from "@/lib/crm";

/** CRM Activities — timeline, list, tasks, meetings, calls, emails (Mission 16A.5). */
export default function CrmActivitiesPage() {
  const view = crmService.getActivityWorkspace();

  return (
    <>
      <CrmSectionHeader
        title="Activities"
        subtitle="Calls, meetings, emails, and customer touchpoints."
      />
      <section aria-label="CRM Activities" className={WORKSPACE_SECTION_CLASS}>
        <CrmActivityWorkspace view={view} />
      </section>
    </>
  );
}
