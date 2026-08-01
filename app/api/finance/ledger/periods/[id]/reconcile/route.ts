import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;

  try {
    const result = financeGeneralLedgerService.reconcilePeriod(id, context);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PERIOD_RECONCILE_FAILED";
    const status = message.includes("BALANCED") || message.includes("CONSISTENCY") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
