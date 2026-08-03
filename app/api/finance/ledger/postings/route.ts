import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeGeneralLedgerService } from "@/lib/finance";
import type { LedgerPostingInput } from "@/types/finance-general-ledger";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const body = (await request.json()) as LedgerPostingInput;

  try {
    const posting = financeGeneralLedgerService.applyPosting(body, context);
    return NextResponse.json({ success: true, data: posting }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LEDGER_POSTING_FAILED";
    const status =
      message.includes("DUPLICATE") ||
      message.includes("INVALID") ||
      message.includes("UNBALANCED") ||
      message.includes("PERIOD") ||
      message.includes("ACCOUNT") ||
      message.includes("REQUIRED")
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
