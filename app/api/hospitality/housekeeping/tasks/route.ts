import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityHousekeepingService } from "@/lib/hospitality";
import type { CreateHousekeepingTaskInput } from "@/types/hospitality-housekeeping";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateHousekeepingTaskInput;

  try {
    const task = hospitalityHousekeepingService.cleaning.createTask(
      { ...body, propertyId: body.propertyId ?? DEFAULT_PROPERTY_ID },
      context,
      executiveName,
    );
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TASK_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
