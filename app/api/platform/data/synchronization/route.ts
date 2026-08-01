import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { synchronizationMonitoringService, synchronizationService } from "@/lib/platform/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId");

  if (jobId) {
    const job = synchronizationService.getJob(jobId, context);
    if (!job) return NextResponse.json({ success: false, error: "JOB_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ success: true, data: job });
  }

  const jobs = synchronizationService.listJobs(context);
  const stats = synchronizationMonitoringService.getStats(context);
  return NextResponse.json({ success: true, data: { jobs, stats } });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as import("@/types/enterprise-data-synchronization").EnqueueSyncInput;

  try {
    const job = synchronizationService.enqueue(body, context);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
