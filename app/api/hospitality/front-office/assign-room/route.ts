import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityFrontOfficeService } from "@/lib/hospitality";
import type { AssignRoomInput } from "@/types/hospitality-front-office";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as AssignRoomInput & { roomId?: string };

  try {
    if (!body.inventoryItemId) {
      return NextResponse.json({ success: false, error: "inventoryItemId required" }, { status: 400 });
    }
    const stay = hospitalityFrontOfficeService.assignment.assignRoom(
      { stayId: body.stayId, inventoryItemId: body.inventoryItemId },
      context,
      executiveName,
    );
    return NextResponse.json({ success: true, data: stay });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ASSIGNMENT_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: message === "ROOM_NOT_READY" ? 409 : 400 });
  }
}

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const stayId = new URL(request.url).searchParams.get("stayId");
  if (!stayId) {
    return NextResponse.json({ success: false, error: "stayId required" }, { status: 400 });
  }
  const rooms = hospitalityFrontOfficeService.assignment.listAvailableRooms(stayId, context);
  return NextResponse.json({ success: true, data: { rooms } });
}
