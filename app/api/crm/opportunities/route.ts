import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialService } from "@/lib/crm";
import type { CreateOpportunityInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const opportunities = crmCommercialService.opportunities.list(context);
  return NextResponse.json({ success: true, data: opportunities });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as CreateOpportunityInput;

  try {
    const opportunity = crmCommercialService.opportunities.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: opportunity }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OPPORTUNITY_CREATE_FAILED";
    const status = message === "PARTY_REQUIRED" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
