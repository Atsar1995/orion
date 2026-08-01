import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import type { TransitionDecisionInput } from "@/types/decisions";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();

  let body: TransitionDecisionInput;

  try {
    body = (await request.json()) as TransitionDecisionInput;
  } catch {
    return NextResponse.json({ success: false, error: { message: "Invalid body." } }, { status: 400 });
  }

  const updated = decisionService.transitionToStatus(id, body, context, executiveName);

  if (!updated) {
    return NextResponse.json(
      { success: false, error: { message: "Transition not allowed or decision not found." } },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, data: { decision: updated } });
}
