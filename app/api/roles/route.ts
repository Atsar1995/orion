import { NextResponse } from "next/server";
import { roleService } from "@/lib/platform/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const roles = roleService.listRoles();
  return NextResponse.json({ success: true, data: { roles } });
}
