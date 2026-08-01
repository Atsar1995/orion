import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { enterpriseAuditService } from "@/lib/platform/compliance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);

  const result = enterpriseAuditService.search(context, {
    domainKey: url.searchParams.get("domainKey") ?? undefined,
    entityType: url.searchParams.get("entityType") ?? undefined,
    entityId: url.searchParams.get("entityId") ?? undefined,
    userId: url.searchParams.get("userId") ?? undefined,
    action: (url.searchParams.get("action") as import("@/types/enterprise-audit").AuditActionType) ?? undefined,
    riskClassification:
      (url.searchParams.get("risk") as import("@/types/enterprise-audit").AuditRiskClassification) ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    page: Number(url.searchParams.get("page") ?? 1),
    pageSize: Number(url.searchParams.get("pageSize") ?? 50),
  });

  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as import("@/types/enterprise-audit").RecordAuditInput;

  try {
    const record = enterpriseAuditService.record(body, context);
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
