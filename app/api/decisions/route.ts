import { NextResponse } from "next/server";
import { decisionService } from "@/lib/decisions";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import type { CreateDecisionInput, DecisionSearchFilter } from "@/types/decisions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const filter: DecisionSearchFilter = {
    status: params.get("status") as DecisionSearchFilter["status"],
    executiveId: params.get("executiveId") ?? undefined,
    ownerId: params.get("ownerId") ?? undefined,
    workspace: params.get("workspace") ?? undefined,
    entityType: params.get("entityType") ?? undefined,
    entityId: params.get("entityId") ?? undefined,
    fromDate: params.get("fromDate") ?? undefined,
    toDate: params.get("toDate") ?? undefined,
    query: params.get("query") ?? undefined,
    keyword: params.get("keyword") ?? undefined,
    hasOutcome: params.get("hasOutcome") === "true" ? true : undefined,
    riskLevel: params.get("riskLevel") as DecisionSearchFilter["riskLevel"],
    minPriority: params.get("minPriority") ? Number(params.get("minPriority")) : undefined,
    minConfidence: params.get("minConfidence") ? Number(params.get("minConfidence")) : undefined,
    maxConfidence: params.get("maxConfidence") ? Number(params.get("maxConfidence")) : undefined,
    escalationStatus: params.get("escalationStatus") as DecisionSearchFilter["escalationStatus"],
  };

  const withIntelligence = params.get("withIntelligence") === "true";

  if (withIntelligence) {
    const results = decisionService.searchDecisionsWithIntelligence(filter, context);
    return NextResponse.json({ success: true, data: { results } });
  }

  const decisions = decisionService.searchDecisions(filter, context);

  return NextResponse.json({ success: true, data: { decisions } });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();

  try {
    const body = (await request.json()) as CreateDecisionInput;
    const decision = decisionService.createDecision(body, context);
    return NextResponse.json({ success: true, data: { decision } }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}
