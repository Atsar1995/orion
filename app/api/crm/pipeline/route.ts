import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmCommercialService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const pipeline = crmCommercialService.pipeline.getView(context);
  return NextResponse.json({ success: true, data: pipeline });
}
