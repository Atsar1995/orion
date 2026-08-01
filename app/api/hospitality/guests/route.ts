import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { CreateGuestInput } from "@/types/hospitality-guest";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const result = hospitalityGuestService.guests.search({}, context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateGuestInput;

  try {
    const guest = hospitalityGuestService.guests.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: guest }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GUEST_CREATE_FAILED";
    const status = message === "CONTACT_REQUIRED" || message === "INVALID_GUEST_NAME" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
