import { NextResponse } from "next/server";
import { readinessAssessmentService } from "@/lib/observability";

export const dynamic = "force-dynamic";

/** Release readiness assessment API (Mission S1D). */
export async function GET() {
  const report = readinessAssessmentService.assess();

  return NextResponse.json(
    {
      success: true,
      data: report,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
