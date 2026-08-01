import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityHousekeepingService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId") ?? DEFAULT_PROPERTY_ID;

  const dashboard = hospitalityHousekeepingService.board.getDashboard(context, propertyId);
  const maintenance = hospitalityHousekeepingService.maintenance.getDashboard(context, propertyId);
  const assets = hospitalityHousekeepingService.maintenance.listAssets(context, propertyId);
  const schedules = hospitalityHousekeepingService.maintenance.listSchedules(context, propertyId);
  const linen = hospitalityHousekeepingService.listLinen(context, propertyId);
  const lostAndFound = hospitalityHousekeepingService.listLostAndFound(context, propertyId);

  return NextResponse.json({
    success: true,
    data: { dashboard, maintenance, assets, schedules, linen, lostAndFound },
  });
}
