import { OrionIntelligence } from "@/components/dashboard/OrionIntelligence";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MetricGrid } from "@/components/dashboard/MetricCard";
import { TaskList } from "@/components/dashboard/TaskList";
import {
  commerceMetrics,
  hotelsMetrics,
  marketingMetrics,
  missionControlTasks,
} from "@/lib/dashboard-data";

export default function MissionControlPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Mission Control
        </h2>
        <p className="mt-1 text-sm font-light text-white/45">
          Your business at a glance.
        </p>
      </header>

      <section
        aria-label="Mission Control dashboard"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div className="xl:col-span-3">
          <BriefingCard />
        </div>

        <DashboardCard title="Hotels">
          <MetricGrid metrics={hotelsMetrics} />
        </DashboardCard>

        <DashboardCard title="Commerce">
          <MetricGrid metrics={commerceMetrics} />
        </DashboardCard>

        <DashboardCard title="Marketing">
          <MetricGrid metrics={marketingMetrics} />
        </DashboardCard>

        <div className="md:col-span-2">
          <OrionIntelligence />
        </div>

        <DashboardCard title="Tasks">
          <TaskList tasks={missionControlTasks} />
        </DashboardCard>
      </section>
    </div>
  );
}
