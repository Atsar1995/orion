import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import type { CrmWorkspaceIntelligence } from "@/lib/crm/models/intelligence";

type CrmIntelligencePanelProps = {
  intelligence: CrmWorkspaceIntelligence;
};

/** CRM intelligence signals panel — Mission 16B business-rule outputs. */
export function CrmIntelligencePanel({ intelligence }: CrmIntelligencePanelProps) {
  const topDealRisks = intelligence.dealRisk.deals.filter((deal) => deal.riskLevel === "high").slice(0, 3);
  const topFollowUps = intelligence.followUpPriority.items.slice(0, 4);
  const lostSignals = intelligence.lostOpportunities.opportunities.slice(0, 3);

  return (
    <div className="space-y-6">
      <Card title="Executive Summary" variant="premium">
        <p className={WORKSPACE_SUMMARY_CLASS}>{intelligence.executiveSummary.narrative}</p>
        <ul className="mt-4 space-y-2">
          {intelligence.executiveSummary.keyPoints.map((point) => (
            <li key={point} className="text-sm font-light text-white/55">
              {point}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Customer Health Score">
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold text-white">
              {intelligence.customerHealthScore.score}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
            <StatusIndicator status={intelligence.customerHealthScore.status} />
          </div>
          <p className="mt-2 text-sm font-light text-white/55">
            {intelligence.customerHealthScore.summary}
          </p>
        </Card>

        <Card title="Pipeline Health">
          <div className="flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold text-white">
              {intelligence.pipelineHealth.score}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
            <StatusIndicator status={intelligence.pipelineHealth.status} />
          </div>
          <p className="mt-2 text-sm font-light text-white/55">
            {intelligence.pipelineHealth.summary}
          </p>
        </Card>

        <Card title="Revenue Forecast">
          <StatCard
            label="Weighted Forecast"
            value={intelligence.revenueForecast.weightedForecastDisplay}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatCard
              label="Conservative"
              value={intelligence.revenueForecast.conservativeForecastDisplay}
            />
            <StatCard
              label="This Quarter"
              value={intelligence.revenueForecast.closingThisQuarterDisplay}
            />
          </div>
          <p className="mt-3 text-sm font-light text-white/55">
            {intelligence.revenueForecast.summary}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Deal Risk">
          <p className={WORKSPACE_SUMMARY_CLASS}>{intelligence.dealRisk.summary}</p>
          <ul className={`mt-4 ${WORKSPACE_FIELD_LIST_CLASS}`}>
            {topDealRisks.map((deal) => (
              <li key={deal.dealName} className="border-b border-white/[0.04] pb-3 last:border-b-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white/85">{deal.dealName}</p>
                    <p className="mt-1 text-xs font-light text-white/45">{deal.reason}</p>
                  </div>
                  <StatusIndicator status={deal.status} showLabel={false} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Lost Opportunity Detection">
          <p className={WORKSPACE_SUMMARY_CLASS}>{intelligence.lostOpportunities.summary}</p>
          <ul className={`mt-4 ${WORKSPACE_FIELD_LIST_CLASS}`}>
            {lostSignals.map((item) => (
              <li key={item.dealName} className="border-b border-white/[0.04] pb-3 last:border-b-0">
                <p className="text-sm font-medium text-white/85">{item.dealName}</p>
                <p className="mt-1 text-xs font-light text-white/45">{item.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Follow-up Priority">
        <p className={WORKSPACE_SUMMARY_CLASS}>{intelligence.followUpPriority.summary}</p>
        <ol className={`mt-4 ${WORKSPACE_FIELD_LIST_CLASS}`}>
          {topFollowUps.map((item) => (
            <li key={`${item.rank}-${item.customer}`} className="border-b border-white/[0.04] pb-3 last:border-b-0">
              <div className="flex gap-3">
                <span className="text-xs font-semibold text-orion-gold">{item.rank}</span>
                <div>
                  <p className="text-sm font-medium text-white/85">
                    {item.action} — {item.customer}
                  </p>
                  <p className="mt-1 text-xs font-light text-white/45">{item.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
