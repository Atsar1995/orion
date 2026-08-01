import { NextResponse } from "next/server";
import { permissionService } from "@/lib/platform/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const matrix = permissionService.buildMatrix();
  return NextResponse.json({ success: true, data: { matrix } });
}
