import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { organizationService } from "@/lib/platform/organization";
import type { CreateOrganizationInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const organizations = organizationService.list(context);

  return NextResponse.json({ success: true, data: { organizations } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();

  try {
    const body = (await request.json()) as CreateOrganizationInput;
    const organization = organizationService.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: { organization } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PERMISSION_DENIED") {
        return NextResponse.json(
          { success: false, error: { code: "PERMISSION_DENIED", message: "Permission denied." } },
          { status: 403 },
        );
      }

      if (error.message === "DUPLICATE_ORGANIZATION") {
        return NextResponse.json(
          { success: false, error: { code: "DUPLICATE_ORGANIZATION", message: "Organization already exists." } },
          { status: 409 },
        );
      }
    }

    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}
