import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeFiscalPeriodService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ year: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
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
