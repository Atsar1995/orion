import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { CommandCenterHeader } from "@/components/dashboard/CommandCenterHeader";
import { ModulePreviewCard } from "@/components/dashboard/ModulePreviewCard";
import { OrionIntelligence } from "@/components/dashboard/OrionIntelligence";
import { PlatformHealthCard } from "@/components/dashboard/PlatformHealthCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { Card } from "@/components/ui/Card";
import { missionControlTasks } from "@/lib/dashboard-data";

export default function CommandCenterPage() {
  return (
    <div className="space-y-8">
      <CommandCenterHeader />

      <section aria-label="ORION Command Center" className="space-y-6">
        <BriefingCard />

        <div>
          <h2 className="mb-4 text-lg font-medium tracking-tight text-white/90 md:text-xl">
            Business Modules
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ModulePreviewCard title="🏨 ORANIA" />
            <ModulePreviewCard title="🛍 ATSAR" />
            <ModulePreviewCard title="📈 Marketing" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PlatformHealthCard />
          <QuickActionsCard />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2">
            <OrionIntelligence />
          </div>

          <Card title="Tasks">
            <TaskList tasks={missionControlTasks} />
          </Card>
        </div>
      </section>
    </div>
  );
}
