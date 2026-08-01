import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId");
  const date = params.get("date") ?? new Date().toISOString().slice(0, 10);

  if (!propertyId) {
    return NextResponse.json({ success: false, error: "propertyId is required" }, { status: 400 });
  }

  const availability = hospitalityInventoryService.search.queryAvailability(propertyId, date, context);
  return NextResponse.json({ success: true, data: { availability, date } });
}
