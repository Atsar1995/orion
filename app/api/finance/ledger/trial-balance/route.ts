import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const url = new URL(request.url);
  const periodId = url.searchParams.get("periodId");

  if (!periodId) {
    return NextResponse.json({ success: false, error: "PERIOD_ID_REQUIRED" }, { status: 400 });
  }

  const result = financeGeneralLedgerService.getTrialBalance(periodId, context);
  return NextResponse.json({ success: true, data: result });
}
