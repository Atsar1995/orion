import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { MergeGuestsInput } from "@/types/hospitality-guest";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as MergeGuestsInput;

  try {
    const merged = hospitalityGuestService.guests.merge(body, context, executiveName);
    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MERGE_FAILED";
    const status =
      message === "GUEST_NOT_FOUND" || message === "DUPLICATE_NOT_FOUND" ? 404 : message === "INVALID_MERGE" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
