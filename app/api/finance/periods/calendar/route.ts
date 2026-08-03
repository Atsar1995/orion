import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeFiscalPeriodService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const calendar = financeFiscalPeriodService.getCalendar(context);

  if (!calendar) {
    return NextResponse.json({ success: false, error: "CALENDAR_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: calendar });
}
