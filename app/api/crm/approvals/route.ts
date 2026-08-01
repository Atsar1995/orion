import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmAgreementsService } from "@/lib/crm";
import type { DecideApprovalInput, RequestApprovalInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const pending = crmAgreementsService.approvals.listPending(context);
  return NextResponse.json({ success: true, data: pending });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
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
  const { context, executiveName } = await getDecisionServiceContext();
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
