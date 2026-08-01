import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmCustomerIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const partyId = url.searchParams.get("partyId");

  if (partyId) {
    const journey = crmCustomerIntelligenceService.journey.getForParty(partyId, context);
    return NextResponse.json({ success: true, data: journey });
  }

  const summary = crmCustomerIntelligenceService.journey.getSummary(context);
  return NextResponse.json({ success: true, data: summary });
}
