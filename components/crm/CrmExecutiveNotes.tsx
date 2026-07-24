import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { CRM_EXECUTIVE_NOTES } from "@/lib/crm-data";

/** Executive notes and decision context for customer intelligence. */
export function CrmExecutiveNotes() {
  return (
    <Card title="Executive Notes">
      <p className={WORKSPACE_SUMMARY_CLASS}>{CRM_EXECUTIVE_NOTES}</p>
    </Card>
  );
}
