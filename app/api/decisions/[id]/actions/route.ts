import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import type { CreateDecisionInput, RecordDecisionActionInput } from "@/types/decisions";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();

  let body: RecordDecisionActionInput & { createInput?: CreateDecisionInput };

  try {
    body = (await request.json()) as RecordDecisionActionInput & {
      createInput?: CreateDecisionInput;
    };
  } catch {
    return NextResponse.json({ success: false, error: { message: "Invalid body." } }, { status: 400 });
  }

  let decision = decisionService.getDecision(id, context);

  if (!decision && body.createInput) {
    decision = decisionService.createDecision(body.createInput, context);
  }

  if (!decision) {
    decision = decisionService.getDecision(id, context);
  }

  if (!decision) {
    return NextResponse.json({ success: false, error: { message: "Decision not found." } }, { status: 404 });
  }

  const updated = decisionService.recordAction(
    decision.id,
    {
      action: body.action,
      notes: body.notes,
      delegateId: body.delegateId,
      delegateName: body.delegateName,
      dueDate: body.dueDate,
    },
    context,
    executiveName,
  );

  return NextResponse.json({ success: true, data: { decision: updated } });
}
