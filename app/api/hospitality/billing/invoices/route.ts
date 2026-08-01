import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityBillingService } from "@/lib/hospitality";
import type { GenerateInvoiceInput } from "@/types/hospitality-billing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId") ?? DEFAULT_PROPERTY_ID;

  const invoices = hospitalityBillingService.invoices.list(context, propertyId);
  return NextResponse.json({ success: true, data: invoices });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as GenerateInvoiceInput;

  try {
    const invoice = hospitalityBillingService.invoices.generate(body, context, executiveName);
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "INVOICE_FAILED";
    const status = message === "FOLIO_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
