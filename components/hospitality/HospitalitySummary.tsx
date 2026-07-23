import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { HOSPITALITY_SUMMARY } from "@/lib/hospitality-data";

/** One-line hospitality performance summary for executive scanning. */
export function HospitalitySummary() {
  return (
    <Card title="Hospitality Summary" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{HOSPITALITY_SUMMARY}</p>
    </Card>
  );
}
