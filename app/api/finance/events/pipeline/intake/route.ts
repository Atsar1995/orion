import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeEventPipelineService } from "@/lib/finance";
import type { BusinessEventIntakeInput } from "@/types/finance-event-pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
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
