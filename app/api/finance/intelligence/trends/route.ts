import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeExecutiveIntelligenceService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const trends = financeExecutiveIntelligenceService.getTrendAnalysis(context);
  return NextResponse.json({ success: true, data: trends });
}
