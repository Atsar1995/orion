import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { HOSPITALITY_SUMMARY } from "@/lib/hospitality-data";

type HospitalitySummaryProps = { summary?: string };

/** One-line hospitality performance summary for executive scanning. */
export function HospitalitySummary({ summary = HOSPITALITY_SUMMARY }: HospitalitySummaryProps) {
  return (
    <Card title="Hospitality Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{summary}</p>
    </Card>
  );
}
