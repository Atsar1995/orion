import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { composeExecutiveBriefV1 } from "@/lib/executive/brief/compose-executive-brief-v1";
import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import { getServerSession } from "@/lib/identity/server-session";

export const dynamic = "force-dynamic";

/** Executive Brief v1.0 API — shared brief composition for all workspaces (Mission P-002). */
export async function GET() {
  const { session } = await getServerSession();
  const { context, executiveName } = await getDecisionServiceContext();

  const decisions = decisionService.searchDecisions({}, context);
  const learning = decisionService.getExecutiveLearning(context, executiveName);

  const brief = composeExecutiveBriefV1({
    executiveName,
    organizationName: DEMO_ORGANIZATION.name,
    profileLabel: session?.user.role ?? "Executive",
    serviceContext: context,
    decisions,
    learning,
  });

  return NextResponse.json({ success: true, data: { brief } });
}
