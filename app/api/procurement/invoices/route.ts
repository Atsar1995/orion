import { NextResponse } from "next/server";
import { getProcurementApiContextForRequest } from "@/lib/procurement";

export const dynamic = "force-dynamic";

/** Supplier invoice routes — service layer ships in P-010.13. */
export async function GET(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  return NextResponse.json(
    { success: false, error: "SUPPLIER_INVOICE_SERVICE_NOT_IMPLEMENTED" },
    { status: 501 },
  );
}

export async function POST(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  return NextResponse.json(
    { success: false, error: "SUPPLIER_INVOICE_SERVICE_NOT_IMPLEMENTED" },
    { status: 501 },
  );
}
