import { AskOrionPanel } from "@/components/intelligence/AskOrionPanel";
import { BusinessHealthCard } from "@/components/intelligence/BusinessHealthCard";
import { ExecutiveBriefingCard } from "@/components/intelligence/ExecutiveBriefingCard";
import { InsightListCard } from "@/components/intelligence/InsightListCard";
import { IntelligenceQuickActionsCard } from "@/components/intelligence/IntelligenceQuickActionsCard";
import { IntelligenceWorkspaceHeader } from "@/components/intelligence/IntelligenceWorkspaceHeader";
import { Divider } from "@/components/ui/Divider";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_GRID_3_COL,
  WORKSPACE_GRID_4_COL,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_SECTION_GROUP_CLASS,
} from "@/lib/constants";
import {
  AI_INSIGHTS,
  BUSINESS_HEALTH_MODULES,
  BUSINESS_METRICS,
  INTELLIGENCE_RECOMMENDATIONS,
  PRIORITY_ALERTS,
} from "@/lib/intelligence-data";

export default function IntelligenceWorkspacePage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <IntelligenceWorkspaceHeader />

      <section aria-label="Intelligence Workspace" className={WORKSPACE_SECTION_CLASS}>
        <ExecutiveBriefingCard />

        <div className={WORKSPACE_SECTION_GROUP_CLASS}>
          <SectionHeader
            title="Business Health"
            subtitle="Operational snapshot across core business modules."
          />
          <div className={WORKSPACE_GRID_4_COL}>
            {BUSINESS_HEALTH_MODULES.map((module) => (
              <BusinessHealthCard key={module.title} module={module} />
            ))}
          </div>
        </div>

        <div className={WORKSPACE_GRID_3_COL}>
          <InsightListCard title="AI Insights" items={AI_INSIGHTS} />
          <InsightListCard
            title="Recommendations"
            items={INTELLIGENCE_RECOMMENDATIONS}
            marker="check"
          />
          <InsightListCard
            title="Priority Alerts"
            items={PRIORITY_ALERTS}
            marker="alert"
          />
        </div>

        <div className={WORKSPACE_SECTION_GROUP_CLASS}>
          <SectionHeader
            title="Business Metrics"
            subtitle="Key performance indicators at a glance."
          />
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            {BUSINESS_METRICS.map((metric) => (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>
        </div>

        <Divider />

        <AskOrionPanel />

        <IntelligenceQuickActionsCard />
      </section>
    </div>
  );
}
