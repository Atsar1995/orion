import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(_request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;

  const balances = financeGeneralLedgerService.getClosingBalances(id, context);
  return NextResponse.json({ success: true, data: balances });
}
