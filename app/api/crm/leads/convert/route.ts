import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialService } from "@/lib/crm";
import type { ConvertLeadInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as ConvertLeadInput;

  try {
    const opportunity = crmCommercialService.opportunities.convertLead(body, context, executiveName);
    return NextResponse.json({ success: true, data: opportunity }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LEAD_CONVERT_FAILED";
    const status =
      message === "LEAD_NOT_FOUND" || message === "LEAD_ALREADY_CONVERTED" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
