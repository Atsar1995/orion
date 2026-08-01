import { DecisionAnalyticsDashboard } from "@/components/decisions/DecisionAnalyticsDashboard";
import { DecisionSearchPanel } from "@/components/decisions/DecisionSearchPanel";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Executive Decision Intelligence analytics dashboard (Mission S1B+ / P-003). */
export default async function DecisionsAnalyticsPage() {
  const { context, executiveName } = await getDecisionServiceContext();
  const analytics = decisionService.getAnalytics(context, executiveName);

  return (
    <div className="space-y-6">
      <DecisionSearchPanel />
      <DecisionAnalyticsDashboard analytics={analytics} />
    </div>
  );
}
