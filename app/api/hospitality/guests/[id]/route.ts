import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { ModifyGuestInput } from "@/types/hospitality-guest";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = hospitalityGuestService.guests.getDetail(id, context);

  if (!detail) {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: detail });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as ModifyGuestInput;

  try {
    const updated = hospitalityGuestService.guests.modify(id, body, context, executiveName);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GUEST_UPDATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: message === "GUEST_NOT_FOUND" ? 404 : 400 });
  }
}
