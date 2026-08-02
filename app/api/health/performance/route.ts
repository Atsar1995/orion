import { NextResponse } from "next/server";
import { performanceHealthService, performanceDashboard, performanceMetrics } from "@/lib/platform/performance";

export const dynamic = "force-dynamic";

/** Performance health and metrics endpoint (Mission P-015.9). */
export async function GET() {
  const health = performanceHealthService.getReport();
  const dashboard = performanceDashboard.build({ health });

  return NextResponse.json(
    {
      success: true,
      data: {
        health,
        summary: dashboard.summary,
        statistics: performanceMetrics.getAllStatistics(),
      },
    },
    {
      status: health.status === "unhealthy" ? 503 : 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
