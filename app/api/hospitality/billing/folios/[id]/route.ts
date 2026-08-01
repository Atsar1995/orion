import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityBillingService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;

  const detail = hospitalityBillingService.folios.getDetail(id, context);
  if (!detail) {
    return NextResponse.json({ success: false, error: "FOLIO_NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: detail });
}

export async function POST(_request: Request, { params }: RouteContext) {
  const { context, executiveName } = await getDecisionServiceContext();
  const { id } = await params;

  try {
    const folio = hospitalityBillingService.folios.settle(id, context, executiveName);
    return NextResponse.json({ success: true, data: folio });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SETTLE_FAILED";
    const status =
      message === "FOLIO_NOT_FOUND" ? 404 : message === "OUTSTANDING_BALANCE" ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
