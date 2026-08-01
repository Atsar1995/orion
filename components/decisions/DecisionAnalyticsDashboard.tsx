import { Card } from "@/components/ui/Card";
import { ExecutiveLearningInsights } from "@/components/decisions/ExecutiveLearningInsights";
import {
  WORKSPACE_GRID_2_COL,
  WORKSPACE_GRID_3_COL,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import type { DecisionAnalyticsSnapshot } from "@/types/decisions";

type DecisionAnalyticsDashboardProps = {
  analytics: DecisionAnalyticsSnapshot;
};

function MetricCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card title={label}>
      <p className="text-3xl font-semibold text-orion-text">{value}</p>
      {detail ? <p className="mt-2 text-sm font-light text-orion-muted">{detail}</p> : null}
    </Card>
  );
}

function TrendList({
  title,
  items,
  valueKey,
}: {
  title: string;
  items: readonly { date: string }[];
  valueKey: string;
}) {
  return (
    <Card title={title}>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-orion-muted">No trend data yet.</li>
        ) : (
          items.slice(-7).map((item) => (
            <li
              key={item.date}
              className="flex items-center justify-between text-sm text-orion-muted"
            >
              <span>{item.date}</span>
              <span className="font-medium text-orion-text">
                {String((item as Record<string, string | number>)[valueKey])}
              </span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}

/** Platform decision analytics dashboard (Mission S1B+ / S1F). */
export function DecisionAnalyticsDashboard({ analytics }: DecisionAnalyticsDashboardProps) {
  const { learning, executiveLearning } = analytics;

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <h1 className={WORKSPACE_TITLE_CLASS}>Decision Analytics</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Executive Decision Intelligence — acceptance, outcomes, and learning metrics.
        </p>
      </header>

      <div className={WORKSPACE_GRID_3_COL}>
        <MetricCard label="Total decisions" value={String(analytics.totalDecisions)} />
        <MetricCard
          label="Acceptance rate"
          value={`${learning.acceptanceRate}%`}
          detail={`Completion ${learning.completionRate}%`}
        />
        <MetricCard
          label="Business value"
          value={`$${learning.businessValueDelivered.toLocaleString()}`}
          detail={`Confidence accuracy ${learning.confidenceAccuracy}%`}
        />
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <TrendList title="Decision trend" items={analytics.decisionTrend} valueKey="count" />
        <TrendList title="Acceptance trend" items={analytics.acceptanceTrend} valueKey="rate" />
        <TrendList title="Outcome trend" items={analytics.outcomeTrend} valueKey="value" />
        <TrendList
          title="Business value trend"
          items={analytics.businessValueTrend}
          valueKey="value"
        />
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Learning metrics">
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-orion-muted">Delegation rate</dt>
              <dd className="font-medium text-orion-text">{learning.delegationRate}%</dd>
            </div>
            <div>
              <dt className="text-orion-muted">Dismissal rate</dt>
              <dd className="font-medium text-orion-text">{learning.dismissalRate}%</dd>
            </div>
            <div>
              <dt className="text-orion-muted">Avg resolution time</dt>
              <dd className="font-medium text-orion-text">{learning.averageResolutionTimeHours}h</dd>
            </div>
            <div>
              <dt className="text-orion-muted">Avg decision age</dt>
              <dd className="font-medium text-orion-text">{learning.averageDecisionAgeHours}h</dd>
            </div>
            <div>
              <dt className="text-orion-muted">Average confidence</dt>
              <dd className="font-medium text-orion-text">{analytics.averageConfidence}%</dd>
            </div>
          </dl>
        </Card>

        <Card title="Top recommendation types">
          <ul className="space-y-2">
            {analytics.topRecommendationTypes.map((entry) => (
              <li key={entry.type} className="flex justify-between text-sm text-orion-muted">
                <span className="capitalize">{entry.type}</span>
                <span className="font-medium text-orion-text">{entry.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Top executives">
        <ul className="space-y-2">
          {analytics.topExecutives.length === 0 ? (
            <li className="text-sm text-orion-muted">No executive actions recorded yet.</li>
          ) : (
            analytics.topExecutives.map((entry) => (
              <li key={entry.executiveId} className="flex justify-between text-sm text-orion-muted">
                <span>{entry.name}</span>
                <span className="font-medium text-orion-text">{entry.count} actions</span>
              </li>
            ))
          )}
        </ul>
      </Card>

      {executiveLearning ? (
        <>
          <div className={WORKSPACE_GRID_2_COL}>
            <Card title="Recommendation quality by type">
              <ul className="space-y-3">
                {executiveLearning.quality.byType.map((entry) => (
                  <li key={entry.type} className="text-sm">
                    <div className="flex justify-between capitalize text-orion-text">
                      <span>{entry.type}</span>
                      <span>{entry.acceptanceRate}% accepted</span>
                    </div>
                    <p className="mt-1 text-orion-muted">
                      Completion {entry.completionRate}% · Action {entry.averageTimeToActionHours}h
                      · Impact ${entry.businessImpactRealized.toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Executive behavior">
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-orion-muted">Snooze frequency</dt>
                  <dd className="font-medium text-orion-text">
                    {executiveLearning.behavior.snoozeFrequency}
                  </dd>
                </div>
                <div>
                  <dt className="text-orion-muted">Reopened decisions</dt>
                  <dd className="font-medium text-orion-text">
                    {executiveLearning.behavior.reopenedDecisions}
                  </dd>
                </div>
                <div>
                  <dt className="text-orion-muted">Follow-through rate</dt>
                  <dd className="font-medium text-orion-text">
                    {executiveLearning.behavior.followThroughRate}%
                  </dd>
                </div>
                <div>
                  <dt className="text-orion-muted">Confidence calibration</dt>
                  <dd className="font-medium text-orion-text">
                    {executiveLearning.quality.overallConfidenceCalibration}%
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          <div className={WORKSPACE_GRID_2_COL}>
            <Card title="Outcome correlations">
              <ul className="space-y-2">
                {executiveLearning.correlations.length === 0 ? (
                  <li className="text-sm text-orion-muted">No correlated outcomes yet.</li>
                ) : (
                  executiveLearning.correlations.slice(0, 5).map((entry) => (
                    <li key={entry.decisionId} className="text-sm text-orion-muted">
                      <span className="font-medium text-orion-text">{entry.recommendationTitle}</span>
                      <span className="block">
                        {entry.action} → ${entry.outcomeValue.toLocaleString()} · {entry.cycleHours}h
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </Card>

            <Card title={`Scorecard — ${executiveLearning.scorecard.executiveName}`}>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-orion-muted">Average decision cycle</p>
                  <p className="font-medium text-orion-text">
                    {executiveLearning.scorecard.averageDecisionCycleHours}h
                  </p>
                </div>
                {executiveLearning.scorecard.highImpactActions.length > 0 ? (
                  <div>
                    <p className="text-orion-muted">High-impact actions</p>
                    <ul className="mt-1 space-y-1">
                      {executiveLearning.scorecard.highImpactActions.map((action) => (
                        <li key={action.title} className="flex justify-between text-orion-muted">
                          <span>{action.title}</span>
                          <span className="text-orion-gold">${action.value.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <ExecutiveLearningInsights insights={executiveLearning.insights} limit={6} />
        </>
      ) : null}
    </div>
  );
}
