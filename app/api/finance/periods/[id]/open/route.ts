import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeFiscalPeriodService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;

  try {
    const result = financeFiscalPeriodService.openPeriod(id, context);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PERIOD_OPEN_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
