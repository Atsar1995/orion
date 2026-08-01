import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";
import type { CreateOrganisationInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const result = crmPartyService.organisations.list(context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateOrganisationInput;

  try {
    const organisation = crmPartyService.organisations.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: organisation }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ORGANISATION_CREATE_FAILED";
    const status = message === "INVALID_ORGANISATION_NAME" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
