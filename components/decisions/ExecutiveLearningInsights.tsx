import { Card } from "@/components/ui/Card";
import { ORION_EXECUTIVE_KICKER_CLASS } from "@/lib/constants";
import type { ExecutiveInsight } from "@/types/decisions";

type ExecutiveLearningInsightsProps = {
  insights: readonly ExecutiveInsight[];
  title?: string;
  limit?: number;
};

/** Actionable learning insights for the Executive Brief (Mission S1F). */
export function ExecutiveLearningInsights({
  insights,
  title = "Executive Learning Insights",
  limit = 4,
}: ExecutiveLearningInsightsProps) {
  const visible = insights.slice(0, limit);

  if (visible.length === 0) {
    return null;
  }

  return (
    <Card title={title}>
      <ul className="space-y-4">
        {visible.map((insight) => (
          <li key={insight.id} className="border-b border-orion-border/60 pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={ORION_EXECUTIVE_KICKER_CLASS}>{insight.category}</p>
                <p className="mt-1 text-sm font-medium text-orion-text">{insight.headline}</p>
                <p className="mt-1 text-sm font-light text-orion-muted">{insight.detail}</p>
              </div>
              {insight.metric ? (
                <span className="shrink-0 text-sm font-semibold text-orion-gold">{insight.metric}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
