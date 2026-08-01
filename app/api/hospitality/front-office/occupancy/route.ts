import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityFrontOfficeService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const propertyId = new URL(request.url).searchParams.get("propertyId") ?? DEFAULT_PROPERTY_ID;
  const board = hospitalityFrontOfficeService.occupancy.getOccupancyBoard(context, propertyId);
  return NextResponse.json({ success: true, data: { board, total: board.length } });
}
