import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { webhookService } from "@/lib/platform/integration";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const connectorId = url.searchParams.get("connectorId") ?? undefined;
  return NextResponse.json({ success: true, data: webhookService.list(context, connectorId) });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = await request.json();

  try {
    const subscription = webhookService.register(body, context);
    return NextResponse.json({ success: true, data: subscription }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
