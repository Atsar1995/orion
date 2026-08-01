import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context, executiveName } = await getDecisionServiceContext();
  const analytics = decisionService.getAnalytics(context, executiveName);

  return NextResponse.json({ success: true, data: analytics });
}
