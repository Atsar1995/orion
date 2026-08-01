import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeGeneralLedgerService } from "@/lib/finance";
import type { LedgerInquiryQuery } from "@/types/finance-general-ledger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);

  const query: LedgerInquiryQuery = {
    periodId: url.searchParams.get("periodId") ?? undefined,
    accountId: url.searchParams.get("accountId") ?? undefined,
    currency: url.searchParams.get("currency") ?? undefined,
  };

  const result = financeGeneralLedgerService.inquiry(query, context);
  return NextResponse.json({ success: true, data: result });
}
