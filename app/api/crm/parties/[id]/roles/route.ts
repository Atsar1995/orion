import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";
import type { AssignPartyRoleInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const roles = crmPartyService.roles.list(id, context);
  return NextResponse.json({ success: true, data: roles });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as Omit<AssignPartyRoleInput, "partyId">;

  try {
    const roles = crmPartyService.roles.assign({ ...body, partyId: id }, context, executiveName);
    return NextResponse.json({ success: true, data: roles }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ROLE_ASSIGN_FAILED";
    const status = message === "PARTY_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
