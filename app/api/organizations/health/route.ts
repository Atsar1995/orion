import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { userManagementService } from "@/lib/platform/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const health = userManagementService.getOrganizationHealth(context);

  return NextResponse.json({ success: true, data: { health } });
}
