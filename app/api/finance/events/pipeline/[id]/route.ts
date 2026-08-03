import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeEventPipelineService } from "@/lib/finance";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(_request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;

  const event = financeEventPipelineService.getEvent(id, context);
  if (!event) {
    return NextResponse.json({ success: false, error: "EVENT_NOT_FOUND" }, { status: 404 });
  }

  const audit = financeEventPipelineService.getAuditTrail(id, context);
  return NextResponse.json({ success: true, data: { event, audit } });
}

export async function POST(_request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(_request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;

  const result = financeEventPipelineService.retryEvent(id, context);
  const status = result.success ? 200 : 400;
  return NextResponse.json({ success: result.success, data: result }, { status });
}
