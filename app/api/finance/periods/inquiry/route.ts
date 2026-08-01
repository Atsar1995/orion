import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeFiscalPeriodService } from "@/lib/finance";
import type { PeriodInquiryQuery } from "@/types/finance-period";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
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
