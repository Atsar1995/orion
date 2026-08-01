import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { GuestRelationship } from "@/types/hospitality-guest";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();

  try {
    const relationships = hospitalityGuestService.relationships.list(id, context);
    return NextResponse.json({ success: true, data: { relationships } });
  } catch {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as { relationships: GuestRelationship[] };

  try {
    const updated = hospitalityGuestService.relationships.update(id, body.relationships, context);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }
}
