import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService, publishInventoryEvent } from "@/lib/hospitality";
import type { HospitalityProperty } from "@/types/hospitality";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = hospitalityInventoryService.properties.getPropertyDetail(id, context);

  if (!detail) {
    return NextResponse.json({ success: false, error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: detail });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as Partial<HospitalityProperty>;

  try {
    const property = hospitalityInventoryService.properties.updateProperty(id, body, context);
    publishInventoryEvent(
      { eventType: "PropertyUpdated", entityId: id, actorId: context.userId, actorName: executiveName },
      context,
    );
    return NextResponse.json({ success: true, data: { property } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED";
    const status = message === "DUPLICATE_PROPERTY" ? 409 : message === "PROPERTY_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();

  try {
    const deleted = hospitalityInventoryService.properties.deleteProperty(id, context);
    return NextResponse.json({ success: true, data: { deleted } });
  } catch {
    return NextResponse.json({ success: false, error: "PROPERTY_NOT_FOUND" }, { status: 404 });
  }
}
