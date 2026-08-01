import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmAgreementsService } from "@/lib/crm";
import type { AgreementSearchFilter, CreateProposalInput } from "@/types/crm-agreements";

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
  const proposals = crmAgreementsService.proposals.list(context, filter);
  return NextResponse.json({ success: true, data: proposals });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateProposalInput;

  try {
    const proposal = crmAgreementsService.proposals.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: proposal }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PROPOSAL_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
