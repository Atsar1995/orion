import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmPartyService } from "@/lib/crm";
import type { MergePartiesInput } from "@/types/crm-party";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as MergePartiesInput;

  try {
    const merged = crmPartyService.merge.merge(body, context, executiveName);
    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PARTY_MERGE_FAILED";
    const status =
      message === "PRIMARY_NOT_FOUND" || message === "DUPLICATE_NOT_FOUND" || message === "INVALID_MERGE"
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
