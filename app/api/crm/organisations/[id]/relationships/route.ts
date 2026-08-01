import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";
import type { LinkPartyRelationshipInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const relationships = crmPartyService.relationships.listForParty(id, context);
  return NextResponse.json({ success: true, data: relationships });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as Omit<LinkPartyRelationshipInput, "fromPartyId">;

  try {
    const relationship = crmPartyService.relationships.link(
      { ...body, fromPartyId: id },
      context,
      executiveName,
    );
    return NextResponse.json({ success: true, data: relationship }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RELATIONSHIP_LINK_FAILED";
    const status = message === "INVALID_RELATIONSHIP" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
