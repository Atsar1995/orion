import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { CustomerAlerts } from "@/components/crm/CustomerAlerts";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_GRID_3_COL,
  WORKSPACE_SUMMARY_CLASS,
} from "@/lib/constants";
import type { CrmInsightsView } from "@/lib/crm/models/insights";

type CrmInsightsWorkspaceProps = {
  view: CrmInsightsView;
};

/** CRM Intelligence & Insights workspace (Mission 16A.6). */
export function CrmInsightsWorkspace({ view }: CrmInsightsWorkspaceProps) {
  const { executiveSummary, dashboard, recommendations, alerts, businessHealth, briefHighlights } =
    view;

  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{executiveSummary.narrative}</p>
        <ul className="mt-4 space-y-2">
          {executiveSummary.keyPoints.map((point) => (
            <li key={point} className="text-sm font-light text-white/55">
              {point}
            </li>
          ))}
        </ul>
      </Card>

      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-3`}>
        <Card title="Pipeline Health">
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold text-white">
              {dashboard.pipelineHealth.score}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
            <StatusIndicator status={dashboard.pipelineHealth.status} />
          </div>
          <p className="mt-2 text-sm font-light text-white/55">{dashboard.pipelineHealth.summary}</p>
        </Card>

        <Card title="Revenue Forecast">
          <StatCard label="Weighted Forecast" value={dashboard.revenueForecast.weightedForecastDisplay} />
          <p className="mt-3 text-sm font-light text-white/55">{dashboard.revenueForecast.summary}</p>
        </Card>

        <Card title="Win Rate Trend">
          <StatCard
            label="Current Win Rate"
            value={`${dashboard.winRateTrend.currentWinRate}%`}
          />
          <p className="mt-2 text-sm font-light text-white/55">
            {dashboard.winRateTrend.trend} vs prior period · {dashboard.winRateTrend.summary}
          </p>
        </Card>

        <Card title="Activity Effectiveness">
          <StatCard
            label="Completion Rate"
            value={`${dashboard.activityEffectiveness.completionRate}%`}
          />
          <p className="mt-2 text-sm font-light text-white/55">
            {dashboard.activityEffectiveness.summary}
          </p>
        </Card>

        <Card title="Sales Momentum">
          <StatCard label="Momentum Score" value={`${dashboard.salesMomentum.score}/100`} />
          <p className="mt-2 text-sm font-light text-white/55">{dashboard.salesMomentum.summary}</p>
        </Card>

        <Card title="Opportunity Risk Summary">
          <StatCard
            label="High-Risk Deals"
            value={String(dashboard.opportunityRiskSummary.highRiskCount)}
          />
          <p className="mt-2 text-sm font-light text-white/55">
            {dashboard.opportunityRiskSummary.summary}
          </p>
        </Card>
      </div>

      <Card title="Customer Health Distribution">
        <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-4`}>
          {dashboard.customerHealthDistribution.map((segment) => (
            <StatCard key={segment.label} label={segment.label} value={segment.displayValue} />
          ))}
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Executive Recommendations">
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="space-y-2">
                <ExecutiveRecommendationCard recommendation={recommendation} />
                <p className="px-1 text-xs font-light text-white/45">
                  <span className="text-white/55">Reason:</span> {recommendation.reason} ·{" "}
                  <span className="text-white/55">Action:</span> {recommendation.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <CustomerAlerts alerts={alerts} />
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Business Health Contribution">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatCard
              label={businessHealth.customerHealth.label}
              value={businessHealth.customerHealth.value}
            />
            <StatCard
              label={businessHealth.pipelineHealth.label}
              value={businessHealth.pipelineHealth.value}
            />
            <StatCard
              label={businessHealth.salesPerformance.label}
              value={businessHealth.salesPerformance.value}
            />
            <StatCard
              label={businessHealth.activityCompletion.label}
              value={businessHealth.activityCompletion.value}
            />
          </div>
          <p className="mt-4 text-sm font-light text-white/55">
            Overall CRM health contribution: {businessHealth.overallScore}/100
          </p>
        </Card>

        <Card title="Executive Brief Highlights">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
                Overnight Changes
              </p>
              <ul className={`mt-2 ${WORKSPACE_FIELD_LIST_CLASS}`}>
                {briefHighlights.overnightChanges.map((change) => (
                  <li key={change} className="text-sm font-light text-white/60">
                    {change}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
                Upcoming Priorities
              </p>
              <ul className={`mt-2 ${WORKSPACE_FIELD_LIST_CLASS}`}>
                {briefHighlights.upcomingPriorities.map((priority) => (
                  <li key={priority} className="text-sm font-light text-white/60">
                    {priority}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
