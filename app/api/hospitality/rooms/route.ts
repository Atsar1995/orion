import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const rooms = hospitalityService.listRooms(context);
  const structure = hospitalityService.getPropertyStructure(context);

  return NextResponse.json({ success: true, data: { rooms, structure } });
}
