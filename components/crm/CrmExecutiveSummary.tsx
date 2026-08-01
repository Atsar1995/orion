import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type CrmExecutiveSummaryProps = {
  summary: string;
};

/** Executive-level customer intelligence summary. */
export function CrmExecutiveSummary({ summary }: CrmExecutiveSummaryProps) {
  return (
    <Card title="Executive Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{summary}</p>
    </Card>
  );
}
