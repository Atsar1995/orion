import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Executive learning snapshot — quality, behavior, correlations, scorecard (Mission S1F). */
export async function GET() {
  const { context, executiveName } = await getDecisionServiceContext();
  const learning = decisionService.getExecutiveLearning(context, executiveName);

  return NextResponse.json({ success: true, data: learning });
}
