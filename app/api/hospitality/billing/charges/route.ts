import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityBillingService } from "@/lib/hospitality";
import type { PostChargeInput } from "@/types/hospitality-billing";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as PostChargeInput;

  try {
    const charge = hospitalityBillingService.charges.post(body, context, executiveName);
    return NextResponse.json({ success: true, data: charge });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHARGE_FAILED";
    const status =
      message === "FOLIO_NOT_FOUND" ? 404 : message === "INVALID_FOLIO_STATUS" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
