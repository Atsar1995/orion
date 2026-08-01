import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeChartOfAccountsService } from "@/lib/finance";
import type { CreateChartOfAccountInput, ChartOfAccountListQuery } from "@/types/finance-chart-of-accounts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);

  const query: ChartOfAccountListQuery = {
    accountType: (url.searchParams.get("accountType") as ChartOfAccountListQuery["accountType"]) ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    status: (url.searchParams.get("status") as ChartOfAccountListQuery["status"]) ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    postingAllowed:
      url.searchParams.get("postingAllowed") === "true"
        ? true
        : url.searchParams.get("postingAllowed") === "false"
          ? false
          : undefined,
  };

  const result = financeChartOfAccountsService.accounts.list(query, context);
  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateChartOfAccountInput;

  try {
    const account = financeChartOfAccountsService.accounts.create(body, context);
    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "COA_CREATE_FAILED";
    const status = message.includes("DUPLICATE") || message.includes("INVALID") || message.includes("REQUIRED") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
