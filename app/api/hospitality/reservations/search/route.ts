import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityReservationService } from "@/lib/hospitality";
import type { ReservationSearchFilter } from "@/types/hospitality-reservation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const filter: ReservationSearchFilter = {
    propertyId: params.get("propertyId") ?? undefined,
    query: params.get("query") ?? undefined,
    reservationNumber: params.get("reservationNumber") ?? undefined,
    guestId: params.get("guestId") ?? undefined,
    status: (params.get("status") as ReservationSearchFilter["status"]) ?? undefined,
    source: (params.get("source") as ReservationSearchFilter["source"]) ?? undefined,
    arrivalFrom: params.get("arrivalFrom") ?? undefined,
    arrivalTo: params.get("arrivalTo") ?? undefined,
    agentName: params.get("agentName") ?? undefined,
    companyName: params.get("companyName") ?? undefined,
  };

  const result = hospitalityReservationService.reservations.search(filter, context);
  return NextResponse.json({ success: true, data: result });
}
