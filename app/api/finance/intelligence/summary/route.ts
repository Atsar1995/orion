import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeExecutiveIntelligenceService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const summary = financeExecutiveIntelligenceService.getDailySummary(context);
  return NextResponse.json({ success: true, data: summary });
}
