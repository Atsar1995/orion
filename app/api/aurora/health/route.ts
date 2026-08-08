import { NextResponse } from "next/server";
import { createTestAuroraWiring } from "@/lib/aurora/wiring/createTestAuroraWiring";

export const dynamic = "force-dynamic";

/** Aurora platform health endpoint (ES-AURORA-005 §2.8). */
export async function GET() {
  const wiring = createTestAuroraWiring();
  const report = await wiring.healthCheck();

  const status =
    report.lifecycle === "ready"
      ? 200
      : report.lifecycle === "degraded"
        ? 200
        : 503;

  return NextResponse.json(
    {
      success: report.lifecycle === "ready" || report.lifecycle === "degraded",
      data: report,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
