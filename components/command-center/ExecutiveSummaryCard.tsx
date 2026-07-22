import { Card } from "@/components/ui/Card";
import { EXECUTIVE_SUMMARY } from "@/lib/command-center-data";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

/** Single-sentence daily executive summary. */
export function ExecutiveSummaryCard() {
  return (
    <Card title="Executive Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{EXECUTIVE_SUMMARY}</p>
    </Card>
  );
}
