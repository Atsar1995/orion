import { OrionIntelligence } from "@/components/dashboard/OrionIntelligence";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatGrid } from "@/components/ui/StatCard";
import {
  commerceMetrics,
  hotelsMetrics,
  marketingMetrics,
  missionControlTasks,
} from "@/lib/dashboard-data";

export default function MissionControlPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mission Control"
        subtitle="Your business at a glance."
      />

      <section
        aria-label="Mission Control dashboard"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div className="xl:col-span-3">
          <BriefingCard />
        </div>

        <Card title="Hotels">
          <StatGrid stats={hotelsMetrics} />
        </Card>

        <Card title="Commerce">
          <StatGrid stats={commerceMetrics} />
        </Card>

        <Card title="Marketing">
          <StatGrid stats={marketingMetrics} />
        </Card>

        <div className="md:col-span-2">
          <OrionIntelligence />
        </div>

        <Card title="Tasks">
          <TaskList tasks={missionControlTasks} />
        </Card>
      </section>
    </div>
  );
}
