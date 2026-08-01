"use client";

import { useState } from "react";
import { CrmOpportunityDirectory } from "@/components/crm/CrmOpportunityDirectory";
import { CrmOpportunityPipelineBoard } from "@/components/crm/CrmOpportunityPipelineBoard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import type { CrmOpportunityWorkspaceView } from "@/lib/crm/models/opportunities";
import { OPPORTUNITY_STAGES } from "@/lib/crm/data/opportunity-records";
import { cn } from "@/lib/utils";

type CrmOpportunityWorkspaceProps = {
  view: CrmOpportunityWorkspaceView;
};

type OpportunityViewMode = "pipeline" | "list";

/** CRM opportunities workspace — pipeline board, list view, metrics, recommendations. */
export function CrmOpportunityWorkspace({ view }: CrmOpportunityWorkspaceProps) {
  const [viewMode, setViewMode] = useState<OpportunityViewMode>("pipeline");
  const { metrics, recommendations, records } = view;

  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-5`}>
        <StatCard label="Total Pipeline Value" value={metrics.totalPipelineValue} />
        <StatCard label="Open Opportunities" value={String(metrics.openOpportunities)} />
        <StatCard label="Average Deal Size" value={metrics.averageDealSize} />
        <StatCard label="Expected Monthly Revenue" value={metrics.expectedMonthlyRevenue} />
        <StatCard label="Win Rate" value={metrics.winRate} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-orion-md border border-white/[0.08] bg-white/[0.02] p-1"
          role="tablist"
          aria-label="Opportunity view mode"
        >
          <Button
            type="button"
            variant="primary"
            className={cn(
              "px-4 py-2 text-xs",
              viewMode !== "pipeline" && "border-transparent bg-transparent text-white/55",
            )}
            role="tab"
            aria-selected={viewMode === "pipeline"}
            onClick={() => setViewMode("pipeline")}
          >
            Pipeline
          </Button>
          <Button
            type="button"
            variant="primary"
            className={cn(
              "px-4 py-2 text-xs",
              viewMode !== "list" && "border-transparent bg-transparent text-white/55",
            )}
            role="tab"
            aria-selected={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {viewMode === "pipeline" ? (
        <CrmOpportunityPipelineBoard records={records} stages={OPPORTUNITY_STAGES} />
      ) : (
        <CrmOpportunityDirectory records={records} />
      )}

      <Card title="Executive Recommendations">
        <div className={WORKSPACE_GRID_2_COL}>
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </Card>
    </div>
  );
}
