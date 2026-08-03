import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeFiscalPeriodService } from "@/lib/finance";
import type { PeriodInquiryQuery } from "@/types/finance-period";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const url = new URL(request.url);

  const query: PeriodInquiryQuery = {
    fiscalYear: url.searchParams.get("fiscalYear")
      ? Number(url.searchParams.get("fiscalYear"))
      : undefined,
    state: (url.searchParams.get("state") as PeriodInquiryQuery["state"]) ?? undefined,
  };

  const result = financeFiscalPeriodService.inquiry(query, context);
  return NextResponse.json({ success: true, data: result });
}
