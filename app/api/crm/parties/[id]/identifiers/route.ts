import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmPartyService } from "@/lib/crm";
import type { LinkExternalIdentifierInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(_request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const identifiers = crmPartyService.identity.list(id, context);
  return NextResponse.json({ success: true, data: identifiers });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as Omit<LinkExternalIdentifierInput, "partyId">;

  try {
    const identifier = crmPartyService.identity.link({ ...body, partyId: id }, context, executiveName);
    return NextResponse.json({ success: true, data: identifier }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IDENTIFIER_LINK_FAILED";
    const status = message === "PARTY_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
