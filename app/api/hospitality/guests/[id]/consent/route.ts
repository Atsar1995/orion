import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { GuestConsent } from "@/types/hospitality-guest";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();

  try {
    const consents = hospitalityGuestService.consent.list(id, context);
    return NextResponse.json({ success: true, data: { consents } });
  } catch {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as { consents: GuestConsent[] };

  try {
    const updated = hospitalityGuestService.consent.update(id, body.consents, context, executiveName);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "GUEST_NOT_FOUND" }, { status: 404 });
  }
}
