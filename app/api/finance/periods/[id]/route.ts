import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeFiscalPeriodService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;

  const period = financeFiscalPeriodService.getPeriod(id, context);
  if (!period) {
    return NextResponse.json({ success: false, error: "PERIOD_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: period });
}
