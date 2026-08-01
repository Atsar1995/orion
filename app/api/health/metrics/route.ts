import { NextResponse } from "next/server";
import { observabilityStore } from "@/lib/observability";

export const dynamic = "force-dynamic";

/** Accepts client-side Web Vitals beacons (Mission S1D). */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      value?: number;
      unit?: "ms" | "score" | "count";
      route?: string;
    };

    if (body.name && typeof body.value === "number") {
      observabilityStore.recordMetric({
        name: body.name,
        value: body.value,
        unit: body.unit ?? "ms",
        route: body.route,
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      metrics: observabilityStore.getMetrics(20),
      webVitals: observabilityStore.getWebVitalsSummary(),
    },
  });
}
