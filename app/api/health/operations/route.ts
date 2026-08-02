import { NextResponse } from "next/server";
import { operationalHealthService, operationalReadinessService } from "@/lib/platform/operations";

export const dynamic = "force-dynamic";

/** Operational health aggregation endpoint (Mission P-015.8). */
export async function GET() {
  const [health, readiness] = await Promise.all([
    operationalHealthService.getAggregatedReport(),
    operationalReadinessService.assess(),
  ]);

  return NextResponse.json(
    {
      success: true,
      data: {
        health,
        readiness: {
          status: readiness.status,
          scores: readiness.scores,
          staging: readiness.staging,
          runbookCount: readiness.runbookCount,
        },
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
