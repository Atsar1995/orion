import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { validationService } from "@/lib/platform/data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as import("@/types/enterprise-data-validation").ValidateEntityInput;

  try {
    const report = validationService.validate(body, context);
    return NextResponse.json({ success: true, data: report }, { status: report.passed ? 200 : 422 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
