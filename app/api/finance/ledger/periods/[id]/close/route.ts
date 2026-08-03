import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(_request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;

  try {
    const period = financeGeneralLedgerService.closePeriod(id, context);
    return NextResponse.json({ success: true, data: period });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PERIOD_CLOSE_FAILED";
    const status = message.includes("BALANCED") || message.includes("CONSISTENCY") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
