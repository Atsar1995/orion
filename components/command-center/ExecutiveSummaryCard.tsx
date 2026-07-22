import { Card } from "@/components/ui/Card";
import { EXECUTIVE_SUMMARY } from "@/lib/command-center-data";

/** Single-sentence daily executive summary. */
export function ExecutiveSummaryCard() {
  return (
    <Card title="Executive Summary" variant="premium">
      <p className="text-base font-light leading-relaxed text-white/75">
        {EXECUTIVE_SUMMARY}
      </p>
    </Card>
  );
}
