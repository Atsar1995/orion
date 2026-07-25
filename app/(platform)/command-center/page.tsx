import { ActivityTimeline } from "@/components/command-center/ActivityTimeline";
import { AlertPanel } from "@/components/command-center/AlertPanel";
import { BusinessHealthPanel } from "@/components/command-center/BusinessHealthPanel";
import { BusinessSnapshot } from "@/components/command-center/BusinessSnapshot";
import { CommandCenterLayout } from "@/components/command-center/CommandCenterLayout";
import { DecisionCenter } from "@/components/command-center/DecisionCenter";
import { ExecutiveBriefPanel } from "@/components/command-center/ExecutiveBriefPanel";
import { ExecutiveHeader } from "@/components/command-center/ExecutiveHeader";
import { QuickActions } from "@/components/command-center/QuickActions";
import { WORKSPACE_GRID_2_COL } from "@/lib/constants";
import { executiveIntelligenceService } from "@/lib/intelligence/ExecutiveIntelligenceService";

export const dynamic = "force-dynamic";

/** Sprint 5 Executive Command Center — orchestrator-fed executive surface. */
export default async function ExecutiveCommandCenterPage() {
  const snapshot = await executiveIntelligenceService.getDashboardSnapshot();

  return (
    <CommandCenterLayout>
      <ExecutiveHeader snapshot={snapshot} />

      <BusinessSnapshot snapshot={snapshot} />

      <div className={WORKSPACE_GRID_2_COL}>
        <BusinessHealthPanel snapshot={snapshot} />
        <ExecutiveBriefPanel snapshot={snapshot} />
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <DecisionCenter snapshot={snapshot} />
        <AlertPanel snapshot={snapshot} />
      </div>

      <ActivityTimeline snapshot={snapshot} />

      <QuickActions />
    </CommandCenterLayout>
  );
}
