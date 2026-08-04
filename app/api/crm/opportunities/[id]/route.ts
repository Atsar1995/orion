import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialService } from "@/lib/crm";
import type { ModifyOpportunityInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(_request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const opportunity = crmCommercialService.opportunities.get(id, context);

  if (!opportunity) {
    return NextResponse.json({ success: false, error: "OPPORTUNITY_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: opportunity });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as ModifyOpportunityInput;

  try {
    const opportunity = crmCommercialService.opportunities.modify(id, body, context, executiveName);
    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OPPORTUNITY_UPDATE_FAILED";
    const status = message === "OPPORTUNITY_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
