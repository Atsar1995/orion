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
  const organisation = crmPartyService.organisations.getDetail(id, context);
  if (organisation) {
    return NextResponse.json({ success: true, data: organisation });
  }

  const person = crmPartyService.persons.getDetail(id, context);
  if (person) {
    return NextResponse.json({ success: true, data: person });
  }

  return NextResponse.json({ success: false, error: "PARTY_NOT_FOUND" }, { status: 404 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as ModifyPartyInput;

  try {
    if (crmPartyService.organisations.getDetail(id, context)) {
      const organisation = crmPartyService.organisations.modify(id, body, context, executiveName);
      return NextResponse.json({ success: true, data: organisation });
    }

    const person = crmPartyService.persons.modify(id, body, context, executiveName);
    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PARTY_UPDATE_FAILED";
    const status =
      message === "ORGANISATION_NOT_FOUND" || message === "PERSON_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
