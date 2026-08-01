import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const duplicates = hospitalityGuestService.guests.findDuplicates(context);
  return NextResponse.json({ success: true, data: { duplicates, total: duplicates.length } });
}
