import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as { fromEventId?: string };
  const service = getIntelligenceIntegrationService();
  const result = await service.replay(context, body.fromEventId);

  return NextResponse.json({ success: true, data: { result } });
}
