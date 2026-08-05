import { NextResponse } from "next/server";
import { getProcurementApiContextForRequest } from "@/lib/procurement";

export const dynamic = "force-dynamic";

/** Supplier invoice approval — service layer ships in P-010.13. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  await params;

  return NextResponse.json(
    { success: false, error: "SUPPLIER_INVOICE_SERVICE_NOT_IMPLEMENTED" },
    { status: 501 },
  );
}
