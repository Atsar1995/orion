import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmPartyService } from "@/lib/crm";
import type { CreatePersonInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const result = crmPartyService.search.search({}, context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
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
