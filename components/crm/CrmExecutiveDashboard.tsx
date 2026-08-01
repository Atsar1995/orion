"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import { formatCommercialCurrency } from "@/lib/crm/commercial";
import type { CrmExecutiveDashboardView } from "@/lib/crm/models/crm-executive-dashboard";
import { cn } from "@/lib/utils";

type CrmExecutiveDashboardProps = {
  view: CrmExecutiveDashboardView;
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-red-400",
  high: "text-amber-400",
  medium: "text-sky-400",
  low: "text-muted-foreground",
};

/** Commercial executive dashboard — exceptions-first executive workspace (Mission P-008.7). */
export function CrmExecutiveDashboard({ view }: CrmExecutiveDashboardProps) {
  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-4`}>
        <StatCard label="Pipeline Value" value={view.summary.pipelineValue} />
        <StatCard label="Forecast Revenue" value={view.summary.forecastRevenue} />
        <StatCard label="Revenue Won" value={view.summary.revenueWon} />
        <StatCard label="Relationship Health" value={`${view.summary.relationshipHealthIndex}/100`} />
        <StatCard label="Active Contracts" value={String(view.summary.activeContracts)} />
        <StatCard label="Contracts Expiring" value={String(view.summary.contractsExpiring)} />
        <StatCard label="Customer CLV" value={view.summary.customerLifetimeValue} />
        <StatCard label="Revenue Lost" value={view.summary.revenueLost} />
      </div>

      <div id="alerts">
      <Card
        title="Executive Alerts"
        subtitle="Exceptions requiring attention — risks, renewals, and variances"
      >
        <ul className="space-y-3 text-sm">
          {view.alerts.map((alert) => (
            <li key={alert.id} className="rounded-md border border-border/60 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className={cn("font-medium capitalize", SEVERITY_CLASS[alert.severity])}>
                    {alert.severity} · {alert.title}
                  </p>
                  <p className="mt-1 text-muted-foreground">{alert.message}</p>
                  <p className="mt-2 text-xs text-orion-gold/90">{alert.recommendedAction}</p>
                </div>
                {alert.drillDownHref ? (
                  <Link
                    href={alert.drillDownHref}
                    className="shrink-0 text-xs font-medium text-orion-gold/90 hover:text-orion-gold"
                  >
                    Drill down →
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      </div>

      <Card title="Priority Widgets" subtitle="Exception-first executive attention model">
        <div className={`${WORKSPACE_GRID_2_COL} lg:grid-cols-4`}>
          {view.widgets.map((widget) => (
            <div key={widget.id} className="rounded-md border border-border/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{widget.type}</p>
              <p className="mt-1 font-medium">{widget.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{widget.summary}</p>
              {widget.drillDownHref ? (
                <Link
                  href={widget.drillDownHref}
                  className="mt-3 inline-block text-xs font-medium text-orion-gold/90 hover:text-orion-gold"
                >
                  View →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Sales Performance — Pipeline by Stage">
          <ul className="space-y-2 text-sm">
            {view.salesPerformance.pipelineByStage.map((entry) => (
              <li key={entry.stage} className="flex justify-between gap-4">
                <span className="capitalize">{entry.stage}</span>
                <span className="text-muted-foreground">
                  {entry.count} · {entry.value}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Win rate {view.salesPerformance.winRate} · Velocity {view.salesPerformance.salesVelocity}
          </p>
        </Card>

        <Card title="Pipeline by Territory">
          <ul className="space-y-2 text-sm">
            {view.salesPerformance.pipelineByTerritory.map((entry) => (
              <li key={entry.territory} className="flex justify-between gap-4">
                <span>{entry.territory}</span>
                <span className="text-muted-foreground">
                  {entry.count} · {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Pipeline by Industry">
          <ul className="space-y-2 text-sm">
            {view.salesPerformance.pipelineByIndustry.map((entry) => (
              <li key={entry.industry} className="flex justify-between gap-4">
                <span>{entry.industry}</span>
                <span className="text-muted-foreground">
                  {entry.count} · {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Opportunity Aging" subtitle="Longest-open deals first">
          <ul className="space-y-2 text-sm">
            {view.salesPerformance.opportunityAging.map((entry) => (
              <li key={entry.opportunityId} className="flex justify-between gap-4">
                <Link
                  href={entry.href}
                  className="font-medium text-orion-gold/90 hover:text-orion-gold"
                >
                  {entry.title}
                </Link>
                <span className="text-muted-foreground">
                  {entry.daysOpen}d · {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="VIP Customers">
          <ul className="space-y-2 text-sm">
            {view.customerIntelligence.vipCustomers.map((entry) => (
              <li key={entry.partyId}>
                <Link
                  href={entry.href}
                  className="font-medium text-orion-gold/90 hover:text-orion-gold"
                >
                  {entry.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="At-Risk Customers" subtitle={view.customerIntelligence.retentionTrend}>
          <ul className="space-y-2 text-sm">
            {view.customerIntelligence.atRiskCustomers.map((entry) => (
              <li key={entry.partyId} className="flex justify-between gap-4">
                <Link
                  href={entry.href}
                  className="font-medium text-orion-gold/90 hover:text-orion-gold"
                >
                  {entry.displayName}
                </Link>
                <span className="capitalize text-amber-400">{entry.risk}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Growth Opportunities">
        <ul className="space-y-2 text-sm">
          {view.customerIntelligence.growthOpportunities.map((entry) => (
            <li key={entry.partyId} className="flex justify-between gap-4">
              <Link
                href={entry.href}
                className="font-medium text-orion-gold/90 hover:text-orion-gold"
              >
                {entry.displayName}
              </Link>
              <span className="text-muted-foreground">{entry.potentialValue}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Commercial Activity">
          <div className={`${WORKSPACE_GRID_3_COL} mb-4 md:grid-cols-3`}>
            <StatCard label="Meetings" value={String(view.commercialActivity.meetings)} />
            <StatCard label="Calls" value={String(view.commercialActivity.calls)} />
            <StatCard label="Tasks" value={String(view.commercialActivity.tasks)} />
            <StatCard label="Follow-ups" value={String(view.commercialActivity.followUps)} />
            <StatCard label="Proposals Pending" value={String(view.commercialActivity.proposalsPending)} />
            <StatCard label="Renewals Due" value={String(view.commercialActivity.renewalsDue)} />
          </div>
          <ul className="space-y-2 text-sm">
            {view.commercialActivity.recentActivities.map((entry) => (
              <li key={entry.id} className="flex justify-between gap-4">
                <Link href={entry.href} className="text-orion-gold/90 hover:text-orion-gold">
                  {entry.type} — {entry.customer}
                </Link>
                <span className="text-muted-foreground">{entry.date}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Performance Trends">
          <ul className="space-y-2 text-sm">
            {view.trends.map((entry) => (
              <li key={entry.id} className="flex justify-between gap-4">
                <span>{entry.period}</span>
                <span className="text-muted-foreground">
                  {formatCommercialCurrency(entry.pipelineValue)} · {entry.winRate}% win · health{" "}
                  {entry.relationshipHealthIndex}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Executive Recommendations">
          <ul className="space-y-3 text-sm">
            {view.recommendations.map((entry) => (
              <li key={entry.id} className="rounded-md border border-border/60 p-3">
                <p className="font-medium">{entry.title}</p>
                <p className="mt-1 text-muted-foreground">{entry.rationale}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Drill-down Navigation" subtitle="Enterprise metrics to entity detail">
          <ul className="space-y-2 text-sm">
            {view.drillDowns.map((entry) => (
              <li key={`${entry.entityType}-${entry.href}`}>
                <Link
                  href={entry.href}
                  className="font-medium text-orion-gold/90 hover:text-orion-gold"
                >
                  {entry.label}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">({entry.entityType})</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
