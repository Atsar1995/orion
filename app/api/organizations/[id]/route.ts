import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hierarchyService, organizationService } from "@/lib/platform/organization";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;
  const organization = organizationService.get(id, context);

  if (!organization) {
    return NextResponse.json(
      { success: false, error: { message: "Organization not found." } },
      { status: 404 },
    );
  }

  const structure = organizationService.getStructure(context);

  return NextResponse.json({
    success: true,
    data: { organization, structure, hierarchy: hierarchyService.buildTree(context) },
  });
}
