import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmCommercialService } from "@/lib/crm";
import type { CreateLeadInput } from "@/types/crm-commercial";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const result = crmCommercialService.leads.list(context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
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
