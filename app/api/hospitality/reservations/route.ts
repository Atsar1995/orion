import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityReservationService } from "@/lib/hospitality";
import type { CreateReservationInput, ReservationSearchFilter } from "@/types/hospitality-reservation";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const search = hospitalityReservationService.reservations.search({}, context);
  return NextResponse.json({ success: true, data: { reservations: search.items, total: search.total } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateReservationInput;

  try {
    const reservation = hospitalityReservationService.reservations.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: { reservation } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED";
    const status = message === "RESERVATION_CONFLICT" ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
