import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeGeneralLedgerService } from "@/lib/finance";
import type { LedgerOpeningBalanceInput } from "@/types/finance-general-ledger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as LedgerOpeningBalanceInput;

  try {
    const balance = financeGeneralLedgerService.applyOpeningBalance(body, context);
    return NextResponse.json({ success: true, data: balance }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OPENING_BALANCE_FAILED";
    const status =
      message.includes("INVALID") ||
      message.includes("PERIOD") ||
      message.includes("ACCOUNT") ||
      message.includes("REQUIRED")
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
