import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmAgreementsService } from "@/lib/crm";
import type { RenewContractInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const dashboard = crmAgreementsService.renewals.getDashboard(context);
  return NextResponse.json({ success: true, data: dashboard });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as RenewContractInput;

  try {
    const contract = crmAgreementsService.renewals.renew(body, context, executiveName);
    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RENEWAL_FAILED";
    const status = message === "CONTRACT_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
