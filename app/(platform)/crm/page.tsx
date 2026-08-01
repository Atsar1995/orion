import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { CrmEnhancedKpiCards } from "@/components/crm/CrmEnhancedKpiCards";
import { CrmRecentActivity } from "@/components/crm/CrmRecentActivity";
import { RelationshipHealth } from "@/components/crm/RelationshipHealth";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WorkspacePageHeader } from "@/components/workspace/WorkspacePageHeader";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { crmService } from "@/lib/crm";

/** CRM Overview — executive dashboard (Mission 16A.2). */
export default function CrmOverviewPage() {
  const dashboard = crmService.getDashboard();

  return (
    <>
      <WorkspacePageHeader {...dashboard.header} />

      <section aria-label="CRM Dashboard" className={WORKSPACE_SECTION_CLASS}>
        <CrmEnhancedKpiCards metrics={dashboard.kpis} title="KPI Summary" />

        <div className={WORKSPACE_GRID_2_COL}>
          <RelationshipHealth
            segments={dashboard.customerHealthDistribution}
            title="Customer Health"
          />
          <Card title="Sales Pipeline Overview">
            <p className="mb-4 text-sm font-light text-white/50">
              Total pipeline value:{" "}
              <span className="font-medium text-orion-gold/90">{dashboard.pipelineValue}</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {dashboard.pipelineStages.map((stage) => (
                <StatCard key={stage.label} label={stage.label} value={stage.displayValue} />
              ))}
            </div>
          </Card>
        </div>

        <div className={WORKSPACE_GRID_2_COL}>
          <CrmRecentActivity activities={dashboard.recentActivity} />
          <Card title="Executive Recommendations" variant="premium">
            <ul className="grid grid-cols-1 gap-3" aria-label="Executive Recommendations">
              {dashboard.recommendations.map((recommendation) => (
                <li key={recommendation.id}>
                  <RecommendationCard recommendation={recommendation} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}
