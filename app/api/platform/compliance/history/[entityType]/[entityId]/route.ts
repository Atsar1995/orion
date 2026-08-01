import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { entityHistoryService } from "@/lib/platform/compliance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ entityType: string; entityId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { entityType, entityId } = await params;
  const history = entityHistoryService.getEntityHistory(entityType, entityId, context);
  return NextResponse.json({ success: true, data: history });
}
