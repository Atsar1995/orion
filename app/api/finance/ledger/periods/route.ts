import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeGeneralLedgerService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const periods = financeGeneralLedgerService.listPeriods(context);
  const current = financeGeneralLedgerService.getCurrentPeriod(context);

  return NextResponse.json({ success: true, data: { periods, currentPeriodId: current?.id ?? null } });
}
