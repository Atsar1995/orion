import { NextResponse } from "next/server";
import { healthStatusService } from "@/lib/observability";

export const dynamic = "force-dynamic";

/** Platform health status endpoint (Mission S1D). */
export async function GET() {
  const report = healthStatusService.getReport();

  return NextResponse.json(
    {
      success: true,
      data: report,
    },
    {
      status: report.status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
