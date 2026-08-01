import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityHousekeepingService } from "@/lib/hospitality";
import type { CreateMaintenanceInput } from "@/types/hospitality-housekeeping";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId") ?? DEFAULT_PROPERTY_ID;

  const maintenance = hospitalityHousekeepingService.maintenance.getDashboard(context, propertyId);
  return NextResponse.json({ success: true, data: maintenance });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateMaintenanceInput;

  try {
    const order = hospitalityHousekeepingService.maintenance.create(
      { ...body, propertyId: body.propertyId ?? DEFAULT_PROPERTY_ID },
      context,
      executiveName,
    );
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MAINTENANCE_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
