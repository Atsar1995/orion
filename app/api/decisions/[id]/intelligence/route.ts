import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const intelligence = decisionService.getIntelligence(id, context);

  if (!intelligence) {
    return NextResponse.json({ success: false, error: { message: "Decision not found." } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { intelligence } });
}
