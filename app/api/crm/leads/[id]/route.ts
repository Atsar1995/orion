import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialService } from "@/lib/crm";
import type { ModifyLeadInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(_request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const detail = crmCommercialService.leads.getDetail(id, context);

  if (!detail) {
    return NextResponse.json({ success: false, error: "LEAD_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: detail });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const body = (await request.json()) as ModifyLeadInput;

  try {
    const lead = crmCommercialService.leads.modify(id, body, context);
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LEAD_UPDATE_FAILED";
    const status = message === "LEAD_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
