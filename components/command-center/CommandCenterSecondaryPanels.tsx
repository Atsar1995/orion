"use client";

import { ActivityTimeline } from "@/components/command-center/ActivityTimeline";
import { QuickActions } from "@/components/command-center/QuickActions";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import type { DashboardSnapshot } from "@/types/intelligence";

type CommandCenterSecondaryPanelsProps = {
  snapshot: DashboardSnapshot;
};

/** Lower-priority Command Center panels with progressive disclosure. */
export function CommandCenterSecondaryPanels({ snapshot }: CommandCenterSecondaryPanelsProps) {
  return (
    <div className="space-y-4">
      <CollapsibleSection
        title="Activity Timeline"
        subtitle="Recent business signals across workspaces"
      >
        <ActivityTimeline snapshot={snapshot} />
      </CollapsibleSection>

      <CollapsibleSection title="Quick Actions" subtitle="Refresh and navigate">
        <QuickActions />
      </CollapsibleSection>
    </div>
  );
}
