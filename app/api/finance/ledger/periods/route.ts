import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const periods = financeGeneralLedgerService.listPeriods(context);
  const current = financeGeneralLedgerService.getCurrentPeriod(context);

  return NextResponse.json({ success: true, data: { periods, currentPeriodId: current?.id ?? null } });
}
