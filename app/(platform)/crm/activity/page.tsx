import { RelationshipTimeline } from "@/components/crm/RelationshipTimeline";
import { CrmSectionHeader } from "@/components/crm/CrmSectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

export default function CrmActivityPage() {
  return (
    <>
      <CrmSectionHeader
        title="Activity"
        subtitle="Calls, meetings, and customer touchpoints."
      />
      <section aria-label="CRM Activity" className={WORKSPACE_SECTION_CLASS}>
        <RelationshipTimeline title="Activity Timeline" />
      </section>
    </>
  );
}
