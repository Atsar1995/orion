import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityFrontOfficeService } from "@/lib/hospitality";
import type { StayMovementInput } from "@/types/hospitality-front-office";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const stay = hospitalityFrontOfficeService.stays.getStay(id, context);
  if (!stay) {
    return NextResponse.json({ success: false, error: "STAY_NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: stay });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as StayMovementInput;

  try {
    const stay = hospitalityFrontOfficeService.stays.executeMovement({ ...body, stayId: id }, context, executiveName);
    return NextResponse.json({ success: true, data: stay });
  } catch (error) {
    const message = error instanceof Error ? error.message : "STAY_UPDATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
