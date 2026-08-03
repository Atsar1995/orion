import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeGeneralLedgerService } from "@/lib/finance";
import type { LedgerInquiryQuery } from "@/types/finance-general-ledger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const url = new URL(request.url);

  const query: LedgerInquiryQuery = {
    periodId: url.searchParams.get("periodId") ?? undefined,
    accountId: url.searchParams.get("accountId") ?? undefined,
    currency: url.searchParams.get("currency") ?? undefined,
  };

  const result = financeGeneralLedgerService.inquiry(query, context);
  return NextResponse.json({ success: true, data: result });
}
