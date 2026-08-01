import { NextResponse } from "next/server";
import type {
  HcmApiErrorResponse,
  HcmApiSuccessResponse,
  HcmPaginatedData,
  HcmPaginationMeta,
} from "@/lib/hcm/api/hcm-api-types";

export function hcmOk<T>(data: T, status = 200): NextResponse<HcmApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function hcmCreated<T>(data: T): NextResponse<HcmApiSuccessResponse<T>> {
  return hcmOk(data, 201);
}

export function hcmPaginated<T>(
  items: readonly T[],
  pagination: HcmPaginationMeta,
): NextResponse<HcmApiSuccessResponse<HcmPaginatedData<T>>> {
  return hcmOk({ items, pagination });
}

export function hcmError(error: string, status: number): NextResponse<HcmApiErrorResponse> {
  return NextResponse.json({ success: false, error }, { status });
}
