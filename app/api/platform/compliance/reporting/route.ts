import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { reportingService } from "@/lib/platform/compliance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const dashboard = reportingService.getDashboard(context);
  return NextResponse.json({ success: true, data: dashboard });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as { format?: "json" | "csv"; query?: import("@/types/enterprise-audit").AuditSearchQuery };

  try {
    const exportRecord = reportingService.exportAudits(context, body.query, body.format ?? "json");
    return NextResponse.json({ success: true, data: exportRecord }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
