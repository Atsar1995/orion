import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeExecutiveIntelligenceService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const periodId = url.searchParams.get("periodId") ?? undefined;

  const dashboard = financeExecutiveIntelligenceService.getDashboard(context, periodId);
  return NextResponse.json({ success: true, data: dashboard });
}
