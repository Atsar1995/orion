import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import {
  entityLookupService,
  identityService,
  masterDataRegistryService,
} from "@/lib/platform/data";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;

  const entity = entityLookupService.getById(id, context);
  if (!entity) {
    return NextResponse.json({ success: false, error: "ENTITY_NOT_FOUND" }, { status: 404 });
  }

  const identity = identityService.resolve(id, context);
  return NextResponse.json({ success: true, data: { entity, identity } });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;
  const body = await request.json();

  try {
    if (body.action === "activate") {
      const entity = masterDataRegistryService.activate(id, context);
      return NextResponse.json({ success: true, data: entity });
    }
    if (body.action === "deactivate") {
      const entity = masterDataRegistryService.deactivate(id, context);
      return NextResponse.json({ success: true, data: entity });
    }
    if (body.action === "archive") {
      const entity = masterDataRegistryService.archive(id, context);
      return NextResponse.json({ success: true, data: entity });
    }

    const entity = masterDataRegistryService.update(
      { entityId: id, displayName: body.displayName, ownerId: body.ownerId, metadata: body.metadata },
      context,
    );
    return NextResponse.json({ success: true, data: entity });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
