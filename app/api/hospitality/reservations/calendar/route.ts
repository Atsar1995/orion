import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityReservationService } from "@/lib/hospitality";
import type { CalendarViewMode } from "@/types/hospitality-reservation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const mode = (params.get("mode") ?? "weekly") as CalendarViewMode;
  const anchorDate = params.get("date") ?? new Date().toISOString().slice(0, 10);
  const propertyId = params.get("propertyId") ?? undefined;

  const calendar = hospitalityReservationService.calendar.getCalendarView(context, mode, anchorDate, propertyId);
  return NextResponse.json({ success: true, data: { calendar } });
}
