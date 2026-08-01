import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { memoryService } from "@/lib/executive/memory";
import type { MemorySearchFilter } from "@/types/executive/memory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const filter: MemorySearchFilter = {
    query: params.get("q") ?? params.get("query") ?? undefined,
    keyword: params.get("keyword") ?? undefined,
    workspace: params.get("workspace") ?? undefined,
    entityType: params.get("entityType") ?? undefined,
    entityId: params.get("entityId") ?? undefined,
    category: params.get("category") as MemorySearchFilter["category"],
    relatedToMemoryId: params.get("relatedToMemoryId") ?? undefined,
  };

  const results = memoryService.searchMemories(filter, context);

  return NextResponse.json({ success: true, data: { results } });
}
