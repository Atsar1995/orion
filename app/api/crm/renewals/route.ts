import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmAgreementsService } from "@/lib/crm";
import type { RenewContractInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const dashboard = crmAgreementsService.renewals.getDashboard(context);
  return NextResponse.json({ success: true, data: dashboard });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
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
