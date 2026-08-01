import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { memoryService } from "@/lib/executive/memory";
import type { CreateMemoryInput, MemorySearchFilter } from "@/types/executive/memory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const filter: MemorySearchFilter = {
    query: params.get("query") ?? undefined,
    keyword: params.get("keyword") ?? undefined,
    workspace: params.get("workspace") ?? undefined,
    entityType: params.get("entityType") ?? undefined,
    entityId: params.get("entityId") ?? undefined,
    tag: params.get("tag") ?? undefined,
    category: params.get("category") as MemorySearchFilter["category"],
    fromDate: params.get("fromDate") ?? undefined,
    toDate: params.get("toDate") ?? undefined,
    relatedToMemoryId: params.get("relatedToMemoryId") ?? undefined,
    relatedToDecisionId: params.get("relatedToDecisionId") ?? undefined,
  };

  const results = memoryService.searchMemories(filter, context);

  return NextResponse.json({ success: true, data: { results } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();

  try {
    const body = (await request.json()) as CreateMemoryInput;
    const entry = memoryService.createMemory(body, context, executiveName);
    return NextResponse.json({ success: true, data: { entry } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}
