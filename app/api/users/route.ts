import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { userManagementService } from "@/lib/platform/organization";
import type { InviteUserInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const users = userManagementService.listUsers(context);

  return NextResponse.json({ success: true, data: { users } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();

  try {
    const body = (await request.json()) as InviteUserInput;
    const user = userManagementService.inviteUser(body, context, executiveName);
    return NextResponse.json({ success: true, data: { user } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PERMISSION_DENIED") {
        return NextResponse.json(
          { success: false, error: { code: "PERMISSION_DENIED", message: "Permission denied." } },
          { status: 403 },
        );
      }

      if (error.message === "INVALID_EMAIL") {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_EMAIL", message: "Invalid email address." } },
          { status: 400 },
        );
      }

      if (error.message === "DUPLICATE_USER") {
        return NextResponse.json(
          { success: false, error: { code: "DUPLICATE_USER", message: "User already exists." } },
          { status: 409 },
        );
      }
    }

    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}
