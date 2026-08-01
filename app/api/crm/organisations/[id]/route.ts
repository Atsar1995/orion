import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";
import type { ModifyPartyInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = crmPartyService.organisations.getDetail(id, context);

  if (!detail) {
    return NextResponse.json({ success: false, error: "ORGANISATION_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: detail });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as ModifyPartyInput;

  try {
    const organisation = crmPartyService.organisations.modify(id, body, context, executiveName);
    return NextResponse.json({ success: true, data: organisation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ORGANISATION_UPDATE_FAILED";
    const status = message === "ORGANISATION_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
