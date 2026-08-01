import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { connectorService } from "@/lib/platform/integration";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;
  const connector = connectorService.get(id, context);
  if (!connector) return NextResponse.json({ success: false, error: "NOT_FOUND" }, { status: 404 });

  const history = connectorService.getExecutionHistory(id, context);
  return NextResponse.json({ success: true, data: { connector, history } });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;
  const body = (await request.json()) as { action?: string; healthStatus?: string };

  try {
    if (body.action === "activate") {
      return NextResponse.json({ success: true, data: connectorService.activate(id, context) });
    }
    if (body.action === "deactivate") {
      return NextResponse.json({ success: true, data: connectorService.deactivate(id, context) });
    }
    if (body.healthStatus) {
      return NextResponse.json({
        success: true,
        data: connectorService.updateHealth(
          id,
          body.healthStatus as import("@/types/integration").ConnectorHealthStatus,
          context,
        ),
      });
    }
    return NextResponse.json({ success: false, error: "INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
