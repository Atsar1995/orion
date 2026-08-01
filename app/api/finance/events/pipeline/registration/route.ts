import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeEventPipelineService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const registration = financeEventPipelineService.getRegistration();
  return NextResponse.json({ success: true, data: registration });
}
