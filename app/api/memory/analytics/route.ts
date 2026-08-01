import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { memoryService } from "@/lib/executive/memory";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const decisions = decisionService.searchDecisions({}, context);
  const analytics = memoryService.getAnalytics(context, decisions);
  const patterns = memoryService.getPatterns(context, decisions);

  return NextResponse.json({ success: true, data: { analytics, patterns } });
}
