import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeFiscalPeriodService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const calendar = financeFiscalPeriodService.getCalendar(context);

  if (!calendar) {
    return NextResponse.json({ success: false, error: "CALENDAR_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: calendar });
}
