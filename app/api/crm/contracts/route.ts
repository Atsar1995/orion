import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmAgreementsService } from "@/lib/crm";
import type { AgreementSearchFilter, CreateContractInput } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const filter: AgreementSearchFilter = {
    query: url.searchParams.get("query") ?? undefined,
    status: (url.searchParams.get("status") as AgreementSearchFilter["status"]) ?? undefined,
    partyId: url.searchParams.get("partyId") ?? undefined,
    owner: url.searchParams.get("owner") ?? undefined,
  };
  const contracts = crmAgreementsService.contracts.list(context, filter);
  return NextResponse.json({ success: true, data: contracts });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateContractInput;

  try {
    const contract = crmAgreementsService.contracts.create(body, context);
    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CONTRACT_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
