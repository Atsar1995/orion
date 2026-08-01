import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { GuestPreference } from "@/types/hospitality-guest";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();

  try {
    const preferences = hospitalityGuestService.preferences.list(id, context);
    return NextResponse.json({ success: true, data: { preferences } });
  } catch {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as { preferences: GuestPreference[] };

  try {
    const updated = hospitalityGuestService.preferences.update(id, body.preferences, context, executiveName);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }
}
