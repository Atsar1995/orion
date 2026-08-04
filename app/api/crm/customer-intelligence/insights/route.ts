import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCustomerIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const insights = crmCustomerIntelligenceService.insights.generate(context);
  return NextResponse.json({ success: true, data: insights });
}
