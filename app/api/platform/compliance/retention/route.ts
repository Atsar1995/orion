import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { retentionService } from "@/lib/platform/compliance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const policies = retentionService.listPolicies(context);
  return NextResponse.json({ success: true, data: policies });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = await request.json();

  try {
    const policy = retentionService.upsertPolicy(body, context);
    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
