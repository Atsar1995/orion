import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeEventPipelineService } from "@/lib/finance";
import type { BusinessEventIntakeInput } from "@/types/finance-event-pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as BusinessEventIntakeInput;

  try {
    const result = financeEventPipelineService.processIntake(body, context);
    const status = result.success ? 201 : 400;
    return NextResponse.json({ success: result.success, data: result }, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PIPELINE_INTAKE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
