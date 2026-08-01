import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { importService } from "@/lib/platform/integration";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  return NextResponse.json({ success: true, data: importService.list(context) });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = await request.json();

  try {
    const job = importService.request(body, context);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}
