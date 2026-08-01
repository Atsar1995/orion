import { Card } from "@/components/ui/Card";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";
import type { CrmInsight } from "@/lib/crm/models/domain";

type CrmExecutiveInsightsProps = {
  insights: CrmInsight[];
};

/** Prioritised executive insights for customer intelligence. */
export function CrmExecutiveInsights({ insights }: CrmExecutiveInsightsProps) {
  return (
    <Card title="Executive Insights">
      <ol className={WORKSPACE_FIELD_LIST_CLASS}>
        {insights.map((insight) => (
          <li
            key={insight.priority}
            className="border-b border-white/[0.04] pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex gap-3">
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-orion-gold/25 bg-orion-gold/10 text-xs font-semibold text-orion-gold"
              >
                {insight.priority}
              </span>
              <div>
                <p className="text-sm font-medium text-white/85">{insight.title}</p>
                <p className="mt-1 text-sm font-light leading-relaxed text-white/55">
                  {insight.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
