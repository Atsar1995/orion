import { NextResponse } from "next/server";
import { AURORA_PLATFORM_VERSION } from "@/lib/aurora/constants";
import {
  getAuroraHealthReport,
  getAuroraRuntime,
  initializeAuroraModule,
} from "@/lib/aurora/runtime/initializeAuroraModule";
import type { AuroraHealthReport } from "@/types/aurora-platform";

export const dynamic = "force-dynamic";

function notInitializedReport(): AuroraHealthReport {
  return {
    lifecycle: "created",
    modules: {},
    infrastructure: {},
    queues: {},
    uptime: 0,
    degradedReasons: ["Aurora module not initialized."],
    version: AURORA_PLATFORM_VERSION,
  };
}

/** Aurora platform health endpoint (ES-AURORA-005 §2.8). */
export async function GET() {
  let runtime = getAuroraRuntime();

  if (!runtime) {
    try {
      runtime = await initializeAuroraModule();
    } catch {
      const report = (await getAuroraHealthReport()) ?? notInitializedReport();
      return NextResponse.json(
        { success: false, data: { ...report, lifecycle: "failed" } },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  const report = (await getAuroraHealthReport()) ?? notInitializedReport();
  const lifecycle = runtime.getLifecycleState();

  const status =
    lifecycle === "ready" || lifecycle === "degraded"
      ? 200
      : 503;

  return NextResponse.json(
    {
      success: lifecycle === "ready" || lifecycle === "degraded",
      data: {
        ...report,
        lifecycle,
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
