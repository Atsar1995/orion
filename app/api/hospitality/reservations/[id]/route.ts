import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityReservationService } from "@/lib/hospitality";
import type { ModifyReservationInput, ReservationAction } from "@/types/hospitality-reservation";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = hospitalityReservationService.reservations.getDetail(id, context);

  if (!detail) {
    return NextResponse.json({ success: false, error: "Reservation not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: detail });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as ModifyReservationInput & {
    action?: ReservationAction;
    payload?: { departure?: string; inventoryItemId?: string; accommodationTypeId?: string };
  };

  try {
    if (body.action) {
      const updated = hospitalityReservationService.reservations.executeAction(
        id,
        body.action,
        context,
        executiveName,
        body.payload,
      );
      return NextResponse.json({ success: true, data: { reservation: updated } });
    }

    const updated = hospitalityReservationService.reservations.modify(id, body, context, executiveName);
    return NextResponse.json({ success: true, data: { reservation: updated } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED";
    const status =
      message === "RESERVATION_NOT_FOUND"
        ? 404
        : message === "RESERVATION_CONFLICT" || message === "INVALID_TRANSITION"
          ? 409
          : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
