import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmCommercialService } from "@/lib/crm";
import type { ModifyOpportunityInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
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
  const { context, executiveName } = await getDecisionServiceContext();
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
