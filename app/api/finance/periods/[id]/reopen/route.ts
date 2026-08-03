import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeFiscalPeriodService } from "@/lib/finance";
import type { PeriodReopenInput } from "@/types/finance-period";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;
  const body = (await request.json()) as Omit<PeriodReopenInput, "periodId">;

  try {
    const result = financeFiscalPeriodService.reopenPeriod(
      { periodId: id, reason: body.reason, authorizationReference: body.authorizationReference },
      context,
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "REOPEN_FAILED";
    const status = message.includes("UNAUTHORIZED") ? 403 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
