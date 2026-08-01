import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { userManagementService } from "@/lib/platform/organization";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { id } = await params;
  const user = userManagementService.getUser(id, context);

  if (!user) {
    return NextResponse.json({ success: false, error: { message: "User not found." } }, { status: 404 });
  }

  const executiveProfile = userManagementService.getExecutiveProfile(id, context);

  return NextResponse.json({ success: true, data: { user, executiveProfile } });
}
