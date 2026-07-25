import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { BriefCard } from "@/components/dashboard/BriefCard";
import { DashboardGrid, DashboardGridItem } from "@/components/dashboard/DashboardGrid";
import { ExecutiveCard } from "@/components/dashboard/ExecutiveCard";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TaskList } from "@/components/dashboard/TaskList";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import { executiveIntelligenceService } from "@/lib/intelligence/ExecutiveIntelligenceService";

export const dynamic = "force-dynamic";

function getGreetingPeriod(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ExecutiveDashboardPage() {
  const snapshot = await executiveIntelligenceService.getDashboardSnapshot();

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-1 border-b border-orion-border pb-[var(--orion-space-4)]">
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Executive Dashboard</h1>
        <p className="text-sm font-light text-orion-muted">{formatTodayDate()}</p>
      </header>

      <section aria-label="Executive metrics" className={WORKSPACE_SECTION_CLASS}>
        <SectionHeader
          title="Platform Overview"
          subtitle="Intelligence Orchestrator · Provider Framework · ES-060 · ES-065"
        />
        <DashboardGrid variant="metrics">
          <DashboardGridItem span="score">
            <HealthScore health={snapshot.businessHealth} />
          </DashboardGridItem>
          <DashboardGridItem span="metric">
            <MetricCard
              label={snapshot.metrics.revenue.label}
              value={snapshot.metrics.revenue.value}
              change={snapshot.metrics.revenue.change}
              trend={snapshot.metrics.revenue.trend}
              workspace={snapshot.metrics.revenue.workspace}
            />
          </DashboardGridItem>
          <DashboardGridItem span="metric">
            <MetricCard
              label={snapshot.metrics.occupancy.label}
              value={snapshot.metrics.occupancy.value}
              change={snapshot.metrics.occupancy.change}
              trend={snapshot.metrics.occupancy.trend}
              workspace={snapshot.metrics.occupancy.workspace}
            />
          </DashboardGridItem>
          <DashboardGridItem span="metric">
            <MetricCard
              label={snapshot.metrics.customer.label}
              value={snapshot.metrics.customer.value}
              change={snapshot.metrics.customer.change}
              trend={snapshot.metrics.customer.trend}
              workspace={snapshot.metrics.customer.workspace}
            />
          </DashboardGridItem>
          <DashboardGridItem span="metric">
            <MetricCard
              label={snapshot.metrics.marketing.label}
              value={snapshot.metrics.marketing.value}
              change={snapshot.metrics.marketing.change}
              trend={snapshot.metrics.marketing.trend}
              workspace={snapshot.metrics.marketing.workspace}
            />
          </DashboardGridItem>
        </DashboardGrid>
      </section>

      <section aria-label="Executive Brief" className={WORKSPACE_SECTION_CLASS}>
        <BriefCard brief={snapshot.brief} />
      </section>

      <section aria-label="Recommendations" className={WORKSPACE_SECTION_CLASS}>
        <ExecutiveCard title="Recommendations">
          <DashboardGrid columns={3}>
            {snapshot.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </DashboardGrid>
        </ExecutiveCard>
      </section>

      <section aria-label="Alerts" className={WORKSPACE_SECTION_CLASS}>
        <AlertPanel panel={snapshot.alertPanel} />
      </section>

      <section aria-label="Today's tasks" className={WORKSPACE_SECTION_CLASS}>
        <ExecutiveCard title="Today's Tasks">
          <TaskList tasks={snapshot.tasks} />
        </ExecutiveCard>
      </section>
    </div>
  );
}
