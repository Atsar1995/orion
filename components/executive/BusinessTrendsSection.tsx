import { BriefSection } from "@/components/executive/BriefSection";
import { ConfidenceIndicator } from "@/components/executive/ConfidenceIndicator";
import type { BusinessTrendItem } from "@/types/executive";

type BusinessTrendsSectionProps = {
  trends: readonly BusinessTrendItem[];
};

const DIRECTION_LABELS: Record<BusinessTrendItem["direction"], string> = {
  positive: "Positive trend",
  negative: "Negative trend",
  emerging_risk: "Emerging risk",
  emerging_opportunity: "Emerging opportunity",
};

/** Business trends with confidence indicators (Mission P-002). */
export function BusinessTrendsSection({ trends }: BusinessTrendsSectionProps) {
  return (
    <BriefSection
      id="brief-trends"
      title="Business Trends"
      subtitle="Positive and negative movement, emerging risks and opportunities"
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {trends.map((trend) => (
          <li
            key={trend.id}
            className="rounded-orion-md border border-orion-border/60 bg-orion-surface/30 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                  {DIRECTION_LABELS[trend.direction]}
                </p>
                <p className="mt-1 text-sm font-medium text-orion-text">{trend.label}</p>
                <p className="mt-1 text-xs font-light text-orion-muted">{trend.summary}</p>
              </div>
              <ConfidenceIndicator confidence={trend.confidence} showLabel={false} />
            </div>
          </li>
        ))}
      </ul>
    </BriefSection>
  );
}
