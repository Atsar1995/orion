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
  AI_INSIGHTS,
  BUSINESS_HEALTH_MODULES,
  BUSINESS_METRICS,
  INTELLIGENCE_RECOMMENDATIONS,
  PRIORITY_ALERTS,
} from "@/lib/intelligence-data";

export default function IntelligenceWorkspacePage() {
  return (
    <div className="space-y-8">
      <IntelligenceWorkspaceHeader />

      <section aria-label="Intelligence Workspace" className="space-y-6">
        <ExecutiveBriefingCard />

        <div className="space-y-4">
          <SectionHeader
            title="Business Health"
            subtitle="Operational snapshot across core business modules."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {BUSINESS_HEALTH_MODULES.map((module) => (
              <BusinessHealthCard key={module.title} module={module} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

        <div className="space-y-4">
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
