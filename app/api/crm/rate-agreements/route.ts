import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmAgreementsService } from "@/lib/crm";
import type { CreateRateAgreementInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const rates = crmAgreementsService.rates.list(context);
  return NextResponse.json({ success: true, data: rates });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as CreateRateAgreementInput;

  try {
    const rate = crmAgreementsService.rates.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: rate }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RATE_AGREEMENT_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
