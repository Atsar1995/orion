import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeEventPipelineService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const deadLetters = financeEventPipelineService.listDeadLetters(context);
  return NextResponse.json({ success: true, data: deadLetters });
}
