import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { memoryService } from "@/lib/executive/memory";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const entry = memoryService.getMemory(id, context);

  if (!entry) {
    return NextResponse.json({ success: false, error: { message: "Memory not found." } }, { status: 404 });
  }

  const context_ = memoryService.getRetrievalContext(id, context);

  return NextResponse.json({ success: true, data: { entry, context: context_ } });
}
