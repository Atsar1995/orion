"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import type { CustomerIntelligenceDashboardView } from "@/lib/crm/models/customer-intelligence";
import { cn } from "@/lib/utils";

type CrmCustomerIntelligenceDashboardProps = {
  view: CustomerIntelligenceDashboardView;
};

/** Customer analytics hub — profiles, segments, retention, growth (Mission P-008.6). */
export function CrmCustomerIntelligenceDashboard({ view }: CrmCustomerIntelligenceDashboardProps) {
  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-4`}>
        <StatCard label="Customer Profiles" value={String(view.hub.profiles.length)} />
        <StatCard label="VIP Customers" value={String(view.hub.vipCount)} />
        <StatCard label="At Risk" value={String(view.hub.atRiskCount)} />
        <StatCard label="Total CLV" value={view.hub.totalLifetimeValue} />
      </div>

      <Card title="Customer Profile Hub" subtitle="Unified profiles anchored on party identity">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Segment</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">CLV</th>
                <th className="px-3 py-2 font-medium">Retention</th>
                <th className="px-3 py-2 font-medium">Growth</th>
              </tr>
            </thead>
            <tbody>
              {view.hub.profiles.map((item) => (
                <tr key={item.partyId} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2">
                    <Link
                      href={`/crm/customer-analytics/${item.partyId}`}
                      className="font-medium text-orion-gold/90 hover:text-orion-gold"
                    >
                      {item.displayName}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{item.segment}</td>
                  <td className="px-3 py-2 tabular-nums">{item.relationshipScore}</td>
                  <td className="px-3 py-2">{item.lifetimeValue}</td>
                  <td className="px-3 py-2 capitalize">{item.retentionRisk}</td>
                  <td className="px-3 py-2 tabular-nums">{item.growthPotential}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Segmentation" subtitle={`${view.segments.length} active segments`}>
          <ul className="space-y-2 text-sm">
            {view.segments.map((entry) => (
              <li key={entry.segment} className="flex justify-between gap-4">
                <span>{entry.label}</span>
                <span className="text-muted-foreground">
                  {entry.count} · avg {entry.averageRelationshipScore}/100
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Journey Summary" subtitle="Events across acquisition → advocacy">
          <ul className="space-y-2 text-sm">
            {view.journeySummary.map((entry) => (
              <li key={entry.stage} className="flex justify-between gap-4 capitalize">
                <span>{entry.stage.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">{entry.count} events</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Retention Dashboard" subtitle={`${view.retention.length} account(s) need attention`}>
          <ul className="space-y-3 text-sm">
            {view.retention.map((entry) => (
              <li key={entry.partyId} className="rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{entry.partyName}</span>
                  <span
                    className={cn(
                      "capitalize text-xs",
                      entry.riskLevel === "critical" && "text-red-400",
                      entry.riskLevel === "high" && "text-amber-400",
                    )}
                  >
                    {entry.riskLevel}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{entry.recommendedAction}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Growth Opportunities" subtitle={`${view.growth.length} expansion signal(s)`}>
          <ul className="space-y-3 text-sm">
            {view.growth.map((entry) => (
              <li key={entry.id} className="rounded-md border border-border/60 p-3">
                <p className="font-medium">{entry.title}</p>
                <p className="text-muted-foreground">{entry.partyName}</p>
                <p className="mt-1 text-xs text-emerald-400">{entry.confidence}% confidence</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Customer Insights" subtitle="Strategic derived metrics — separate from operational events">
        <ul className="space-y-4 text-sm">
          {view.insights.map((insight) => (
            <li key={insight.id} className="rounded-md border border-border/60 p-4">
              <p className="font-medium">{insight.title}</p>
              <p className="mt-1">{insight.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">{insight.recommendedAction}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
