import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const service = getIntelligenceIntegrationService();
  const records = service.listDeadLetter(context);

  return NextResponse.json({ success: true, data: { records } });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as { id: string };
  const service = getIntelligenceIntegrationService();
  const event = await service.retryDeadLetter(body.id, context);

  if (!event) {
    return NextResponse.json({ success: false, error: { message: "Dead-letter record not found." } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { event } });
}
