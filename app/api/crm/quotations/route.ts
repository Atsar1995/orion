import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmAgreementsService } from "@/lib/crm";
import type { CreateQuotationInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const quotations = crmAgreementsService.quotations.list(context);
  return NextResponse.json({ success: true, data: quotations });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateQuotationInput;

  try {
    const quotation = crmAgreementsService.quotations.create(body, context);
    return NextResponse.json({ success: true, data: quotation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "QUOTATION_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
