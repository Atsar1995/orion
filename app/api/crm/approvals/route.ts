import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmAgreementsService } from "@/lib/crm";
import type { DecideApprovalInput, RequestApprovalInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const pending = crmAgreementsService.approvals.listPending(context);
  return NextResponse.json({ success: true, data: pending });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const body = (await request.json()) as RequestApprovalInput;

  try {
    const approval = crmAgreementsService.approvals.request(body, context);
    return NextResponse.json({ success: true, data: approval }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "APPROVAL_REQUEST_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as DecideApprovalInput;

  try {
    const approval = crmAgreementsService.approvals.decide(body, context, executiveName);
    return NextResponse.json({ success: true, data: approval });
  } catch (error) {
    const message = error instanceof Error ? error.message : "APPROVAL_DECIDE_FAILED";
    const status = message === "APPROVAL_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
