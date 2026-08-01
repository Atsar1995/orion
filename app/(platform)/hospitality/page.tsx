import { HospitalityOverview } from "@/components/hospitality/HospitalityOverview";
import { WorkspacePageHeader } from "@/components/workspace/WorkspacePageHeader";
import { hospitalityService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import { formatWorkspaceDateLabel, getWorkspaceGreetingPeriod } from "@/lib/workspace-format";

export const dynamic = "force-dynamic";

/** Hospitality Workspace overview (Mission P-007). */
export default async function HospitalityWorkspacePage() {
  const { context } = await getDecisionServiceContext();
  const dashboard = hospitalityService.getDashboard(context);

  return (
    <>
      <WorkspacePageHeader
        greetingPeriod={getWorkspaceGreetingPeriod()}
        executiveName={FOUNDER_NAME}
        title="Hospitality"
        dateLabel={formatWorkspaceDateLabel()}
      />
      <HospitalityOverview dashboard={dashboard} />
    </>
  );
}
