import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { MARKETING_SUMMARY } from "@/lib/marketing-data";

/** One-line marketing performance summary for executive scanning. */
export function MarketingSummary() {
  return (
    <Card title="Marketing Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{MARKETING_SUMMARY}</p>
    </Card>
  );
}
