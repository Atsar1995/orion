import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityFrontOfficeService } from "@/lib/hospitality";
import type { CheckInInput } from "@/types/hospitality-front-office";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CheckInInput;

  try {
    const stay = hospitalityFrontOfficeService.checkIn.execute(body, context, executiveName);
    return NextResponse.json({ success: true, data: stay });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHECK_IN_FAILED";
    const status =
      message === "STAY_NOT_FOUND" ? 404 : message === "ROOM_ASSIGNMENT_REQUIRED" || message === "ROOM_NOT_READY" ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
