import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmExecutiveDashboardService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const alerts = crmExecutiveDashboardService.alerts.list(context);
  return NextResponse.json({ success: true, data: alerts });
}
