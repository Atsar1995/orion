import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeFiscalPeriodService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ year: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(_request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { year } = await params;
  const fiscalYear = Number(year);

  if (Number.isNaN(fiscalYear)) {
    return NextResponse.json({ success: false, error: "INVALID_FISCAL_YEAR" }, { status: 400 });
  }

  try {
    const result = financeFiscalPeriodService.closeYear(fiscalYear, context);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "YEAR_CLOSE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
