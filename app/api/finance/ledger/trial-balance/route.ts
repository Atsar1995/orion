import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const periodId = url.searchParams.get("periodId");

  if (!periodId) {
    return NextResponse.json({ success: false, error: "PERIOD_ID_REQUIRED" }, { status: 400 });
  }

  const result = financeGeneralLedgerService.getTrialBalance(periodId, context);
  return NextResponse.json({ success: true, data: result });
}
