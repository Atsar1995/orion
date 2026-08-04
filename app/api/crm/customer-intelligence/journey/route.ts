import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCustomerIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const url = new URL(request.url);
  const partyId = url.searchParams.get("partyId");

  if (partyId) {
    const journey = crmCustomerIntelligenceService.journey.getForParty(partyId, context);
    return NextResponse.json({ success: true, data: journey });
  }

  const summary = crmCustomerIntelligenceService.journey.getSummary(context);
  return NextResponse.json({ success: true, data: summary });
}
