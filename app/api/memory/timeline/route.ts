import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { memoryService } from "@/lib/executive/memory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const timeline = memoryService.getTimeline(context, {
    workspace: params.get("workspace") ?? undefined,
    fromDate: params.get("fromDate") ?? undefined,
    toDate: params.get("toDate") ?? undefined,
  });

  return NextResponse.json({ success: true, data: { timeline } });
}
