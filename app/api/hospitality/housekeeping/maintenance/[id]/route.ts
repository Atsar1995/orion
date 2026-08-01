import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityHousekeepingService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { context, executiveName } = await getDecisionServiceContext();
  const { id } = await params;

  try {
    const order = hospitalityHousekeepingService.maintenance.resolve(id, context, executiveName);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RESOLVE_FAILED";
    const status =
      message === "WORK_ORDER_NOT_FOUND"
        ? 404
        : message === "INVALID_WORK_ORDER_STATUS"
          ? 400
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
