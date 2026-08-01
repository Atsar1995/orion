import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityHousekeepingService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { context, executiveName } = await getDecisionServiceContext();
  const { id } = await params;

  try {
    const task = hospitalityHousekeepingService.cleaning.complete(id, context, executiveName);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "COMPLETE_FAILED";
    const status =
      message === "TASK_NOT_FOUND" ? 404 : message === "INVALID_TASK_STATUS" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
