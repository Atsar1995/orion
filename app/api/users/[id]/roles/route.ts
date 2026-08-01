import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { roleService } from "@/lib/platform/organization";
import type { AssignRoleInput } from "@/types/organization";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { context, executiveName } = await getDecisionServiceContext();
  const { id } = await params;

  try {
    const body = (await request.json()) as Omit<AssignRoleInput, "userId">;
    const result = roleService.assignRole({ userId: id, role: body.role }, context, executiveName);

    if (!result) {
      return NextResponse.json({ success: false, error: { message: "User not found." } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "PERMISSION_DENIED") {
      return NextResponse.json(
        { success: false, error: { code: "PERMISSION_DENIED", message: "Permission denied." } },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}
