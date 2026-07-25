import { ConfidenceIndicator } from "@/components/executive/ConfidenceIndicator";
import type { AiExecutiveSummary } from "@/types/executive";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type AiExecutiveSummaryProps = {
  summary: AiExecutiveSummary;
};

/** AI-generated executive synthesis with sources and confidence. */
export function AiExecutiveSummaryCard({ summary }: AiExecutiveSummaryProps) {
  return (
    <Card title="AI Executive Summary" variant="premium">
      <blockquote className={WORKSPACE_SUMMARY_CLASS}>{summary.narrative}</blockquote>

      <div className="mt-5 flex flex-col gap-3 border-t border-orion-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
            Sources
          </p>
          <p className="mt-1 text-sm font-light text-orion-muted">
            {summary.sources.join(" · ")}
          </p>
        </div>
        <ConfidenceIndicator confidence={summary.confidence} />
      </div>
    </Card>
  );
}
