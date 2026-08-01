import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityReservationService } from "@/lib/hospitality";
import type { AvailabilityQuery } from "@/types/hospitality-reservation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const query: AvailabilityQuery = {
    propertyId: params.get("propertyId") ?? "",
    arrival: params.get("arrival") ?? "",
    departure: params.get("departure") ?? "",
    accommodationTypeId: params.get("accommodationTypeId") ?? undefined,
    guestCount: params.get("adults")
      ? {
          adults: Number(params.get("adults")),
          children: Number(params.get("children") ?? 0),
          infants: Number(params.get("infants") ?? 0),
        }
      : undefined,
  };

  if (!query.propertyId || !query.arrival || !query.departure) {
    return NextResponse.json(
      { success: false, error: "propertyId, arrival, and departure are required" },
      { status: 400 },
    );
  }

  try {
    const availability = hospitalityReservationService.availability.checkAvailability(query, context.organizationId);
    return NextResponse.json({ success: true, data: { availability } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AVAILABILITY_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
