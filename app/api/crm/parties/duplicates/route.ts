import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const duplicates = crmPartyService.duplicates.findDuplicates(context);
  return NextResponse.json({ success: true, data: duplicates });
}
