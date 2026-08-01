import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";
import type { CreatePersonInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const result = crmPartyService.search.search({}, context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreatePersonInput;

  try {
    const person = crmPartyService.persons.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PARTY_CREATE_FAILED";
    const status =
      message === "CONTACT_REQUIRED" || message === "INVALID_PERSON_NAME" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
