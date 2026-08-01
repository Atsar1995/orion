import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeEventPipelineService } from "@/lib/finance";
import type { PipelineInquiryQuery } from "@/types/finance-event-pipeline";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);

  const query: PipelineInquiryQuery = {
    status: (url.searchParams.get("status") as PipelineInquiryQuery["status"]) ?? undefined,
    classification:
      (url.searchParams.get("classification") as PipelineInquiryQuery["classification"]) ?? undefined,
    businessEventType:
      (url.searchParams.get("businessEventType") as PipelineInquiryQuery["businessEventType"]) ?? undefined,
  };

  const result = financeEventPipelineService.inquiry(query, context);
  return NextResponse.json({ success: true, data: result });
}
