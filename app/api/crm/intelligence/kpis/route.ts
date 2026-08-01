import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmCommercialIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const kpis = crmCommercialIntelligenceService.kpis.getKpis(context);
  return NextResponse.json({ success: true, data: kpis });
}
