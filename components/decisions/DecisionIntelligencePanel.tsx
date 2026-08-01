import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ExecutiveLearningInsights } from "@/components/decisions/ExecutiveLearningInsights";
import {
  ORION_EXECUTIVE_KICKER_CLASS,
  ORION_SECONDARY_LINK_CLASS,
  WORKSPACE_GRID_2_COL,
} from "@/lib/constants";
import type { DecisionBriefIntelligence } from "@/types/decisions";

type DecisionIntelligencePanelProps = {
  intelligence: DecisionBriefIntelligence;
};

/** Executive Brief decision intelligence block (Mission S1B+ / S1F). */
export function DecisionIntelligencePanel({ intelligence }: DecisionIntelligencePanelProps) {
  return (
    <div className="space-y-6">
      <Card title="Executive Decision Intelligence">
        <div className="space-y-5">
          <div>
            <p className={ORION_EXECUTIVE_KICKER_CLASS}>{intelligence.periodLabel}</p>
            <ul className="mt-3 space-y-1.5 text-sm font-light text-orion-muted">
              <li>{intelligence.recommendationsGenerated} recommendations generated</li>
              <li>{intelligence.accepted} accepted</li>
              <li>{intelligence.delegated} delegated</li>
              <li>{intelligence.dismissed} dismissed</li>
            </ul>
          </div>

          <div className={WORKSPACE_GRID_2_COL}>
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Revenue impact
              </p>
              <p className="mt-1 text-2xl font-semibold text-orion-gold">
                +${intelligence.revenueImpact.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                Confidence accuracy
              </p>
              <p className="mt-1 text-2xl font-semibold text-orion-text">
                {intelligence.confidenceAccuracy}%
              </p>
            </div>
          </div>

          {intelligence.topRecommendation ? (
            <div className="rounded-orion-md border border-orion-gold/20 bg-orion-gold/5 p-4">
              <p className={ORION_EXECUTIVE_KICKER_CLASS}>
                Today&apos;s highest-value recommendation
              </p>
              <p className="mt-2 text-base font-medium text-orion-text">
                {intelligence.topRecommendation.title}
              </p>
              <p className="mt-1 text-sm text-orion-muted">
                Estimated savings $
                {intelligence.topRecommendation.estimatedSavings.toLocaleString()}
              </p>
            </div>
          ) : null}

          <Link href="/decisions" className={ORION_SECONDARY_LINK_CLASS}>
            Open Decision Analytics →
          </Link>
        </div>
      </Card>

      {intelligence.insights && intelligence.insights.length > 0 ? (
        <ExecutiveLearningInsights insights={intelligence.insights} limit={3} />
      ) : null}
    </div>
  );
}
