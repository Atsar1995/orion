import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { CRM_EXECUTIVE_SUMMARY } from "@/lib/crm-data";

/** Executive-level customer intelligence summary. */
export function CrmExecutiveSummary() {
  return (
    <Card title="Executive Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{CRM_EXECUTIVE_SUMMARY}</p>
    </Card>
  );
}
