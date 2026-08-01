import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { defaultCrmRepository } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const snapshots = defaultCrmRepository.listDashboardSnapshots(context.organizationId);
  return NextResponse.json({ success: true, data: snapshots });
}
