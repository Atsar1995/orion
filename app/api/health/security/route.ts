import { NextResponse } from "next/server";
import { securityCertification } from "@/lib/platform/security/compliance";

export const dynamic = "force-dynamic";

/** Security and compliance certification endpoint (Mission P-015.10). */
export async function GET() {
  const report = securityCertification.certify();

  return NextResponse.json(
    {
      success: true,
      data: {
        mission: report.mission,
        verdict: report.verdict,
        message: report.message,
        executiveRecommendation: report.executiveRecommendation,
        scorecard: report.dashboard.scorecard,
        complianceScore: report.dashboard.compliance.complianceScore,
        checklistSummary: report.dashboard.checklistSummary,
        riskRegister: report.riskRegister,
      },
    },
    {
      status: report.verdict === "NO-GO" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
