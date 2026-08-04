import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialService } from "@/lib/crm";
import type { CreateLeadInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const result = crmCommercialService.leads.list(context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as CreateLeadInput;

  try {
    const lead = crmCommercialService.leads.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LEAD_CREATE_FAILED";
    const status = message === "INVALID_LEAD_NAME" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
