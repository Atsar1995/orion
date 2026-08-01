import { NextResponse } from "next/server";
import { decisionService, mapRecommendationToDecisionInput } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import type { ExecutiveRecommendationAction } from "@/types/executive";
import type { ExecutiveActionType } from "@/types/decisions";

export const dynamic = "force-dynamic";

const ACTION_MAP: Partial<Record<ExecutiveRecommendationAction, ExecutiveActionType>> = {
  act: "accepted",
  delegate: "delegated",
  defer: "deferred",
  snooze: "deferred",
  reject: "rejected",
  complete: "completed",
};

type RecommendationActionBody = {
  recommendation: import("@/types/executive").ExecutiveRecommendation;
  action: ExecutiveRecommendationAction;
  notes?: string;
  delegateName?: string;
  dueDate?: string;
};

/** Records an executive action against a recommendation (creates decision if needed). */
export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();

  let body: RecommendationActionBody;

  try {
    body = (await request.json()) as RecommendationActionBody;
  } catch {
    return NextResponse.json({ success: false, error: { message: "Invalid body." } }, { status: 400 });
  }

  const mappedAction = ACTION_MAP[body.action];

  if (!mappedAction) {
    return NextResponse.json({ success: true, data: { decision: null } });
  }

  const createInput = mapRecommendationToDecisionInput(
    body.recommendation,
    context.workspaceId,
  );

  const decision = decisionService.recordActionByRecommendation(
    body.recommendation.id,
    createInput,
    {
      action: mappedAction,
      notes: body.notes,
      delegateName: body.delegateName,
      dueDate: body.dueDate ?? (mappedAction === "deferred"
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined),
    },
    context,
    executiveName,
  );

  return NextResponse.json({ success: true, data: { decision } });
}
