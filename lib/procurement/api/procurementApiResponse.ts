import { NextResponse } from "next/server";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";

const NOT_FOUND_ERRORS = new Set([
  "VENDOR_NOT_FOUND",
  "GOODS_RECEIPT_NOT_FOUND",
  "RECEIVING_LINE_NOT_FOUND",
  "REQUISITION_NOT_FOUND",
  "PURCHASE_ORDER_NOT_FOUND",
  "CONTRACT_NOT_FOUND",
]);

const BAD_REQUEST_ERRORS = new Set([
  "INVALID_VENDOR_NAME",
  "INVALID_VENDOR_CODE",
  "INVALID_GOODS_RECEIPT_NUMBER",
  "INVALID_ITEM_CODE",
  "INVALID_QUANTITY",
  "INVALID_ACTION",
  "RECEIVE_ITEMS_EMPTY",
  "NOT_A_PARTIAL_RECEIPT",
]);

const CONFLICT_ERRORS = new Set([
  "DUPLICATE_VENDOR_CODE",
  "DUPLICATE_GOODS_RECEIPT_NUMBER",
  "DUPLICATE_PURCHASE_ORDER_NUMBER",
  "DUPLICATE_CONTRACT_NUMBER",
]);

export function procurementOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function procurementCreated<T>(data: T): NextResponse {
  return procurementOk(data, 201);
}

export function procurementFromError(error: unknown): NextResponse {
  if (error instanceof AuthorizationError) {
    const status = error.code === "UNAUTHORIZED" ? 401 : 403;
    return NextResponse.json({ success: false, error: error.code }, { status });
  }

  const message = error instanceof Error ? error.message : "PROCUREMENT_REQUEST_FAILED";
  let status = 500;
  if (NOT_FOUND_ERRORS.has(message)) status = 404;
  else if (BAD_REQUEST_ERRORS.has(message)) status = 400;
  else if (CONFLICT_ERRORS.has(message)) status = 409;

  return NextResponse.json({ success: false, error: message }, { status });
}
