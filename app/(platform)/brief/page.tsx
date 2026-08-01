import { BriefPageContent } from "@/components/executive/BriefPageContent";
import { EmptyState } from "@/components/ui/EmptyState";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { composeExecutiveBriefV1 } from "@/lib/executive/brief/compose-executive-brief-v1";
import { getExecutiveMorningBrief } from "@/lib/data";
import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import { getServerSession } from "@/lib/identity/server-session";

export const dynamic = "force-dynamic";

/** Executive Brief v1.0 — primary executive workspace (Mission P-002). */
export default async function ExecutiveBriefPage() {
  const { session } = await getServerSession();
  const [envelope, decisionContext] = await Promise.all([
    getExecutiveMorningBrief(session?.user.name),
    getDecisionServiceContext(),
  ]);

  if (envelope.status === "error") {
    return (
      <EmptyState
        title="Executive Brief unavailable"
        description={
          envelope.errors[0]?.message ??
          "Executive intelligence providers did not return brief data. Retry shortly."
        }
      />
    );
  }

  const decisions = decisionService.searchDecisions({}, decisionContext.context);
  const learning = decisionService.getExecutiveLearning(
    decisionContext.context,
    decisionContext.executiveName,
  );

  const brief = composeExecutiveBriefV1({
    executiveName: decisionContext.executiveName,
    organizationName: DEMO_ORGANIZATION.name,
    profileLabel: session?.user.role ?? "Executive",
    serviceContext: decisionContext.context,
    decisions,
    learning,
  });

  const decisionIntelligence = decisionService.getBriefIntelligence(
    decisionContext.context,
    decisionContext.executiveName,
  );

  return (
    <BriefPageContent
      brief={brief}
      dataSources={envelope.sources}
      dataStatus={envelope.status === "empty" ? "empty" : envelope.status}
      lastUpdatedAt={envelope.freshness.lastUpdatedAt}
      decisionIntelligence={decisionIntelligence}
    />
  );
}
