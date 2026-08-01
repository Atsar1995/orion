import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const analytics = hospitalityInventoryService.analytics.getAnalytics(context);

  return NextResponse.json({ success: true, data: { analytics } });
}
