/**
 * Quantity helpers for goods receipt validation (Mission P-010.10).
 */

export function parseQuantity(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("INVALID_QUANTITY");
  }
  return parsed;
}

export function assertQuantityNotExceeded(received: string, ordered: string): void {
  if (parseQuantity(received) > parseQuantity(ordered)) {
    throw new Error("QUANTITY_EXCEEDS_ORDERED");
  }
}

export function isFullyReceived(received: string, ordered: string): boolean {
  return parseQuantity(received) === parseQuantity(ordered);
}

export function hasPartialReceipt(received: string, ordered: string): boolean {
  const receivedQty = parseQuantity(received);
  const orderedQty = parseQuantity(ordered);
  return receivedQty > 0 && receivedQty < orderedQty;
}

export function isAnyLineReceived(lines: readonly { readonly receivedQuantity: string }[]): boolean {
  return lines.some((line) => parseQuantity(line.receivedQuantity) > 0);
}

export function areAllLinesFullyReceived(
  lines: readonly { readonly receivedQuantity: string; readonly orderedQuantity: string }[],
): boolean {
  if (lines.length === 0) {
    return false;
  }
  return lines.every((line) => isFullyReceived(line.receivedQuantity, line.orderedQuantity));
}

export function hasAnyPartialLine(
  lines: readonly { readonly receivedQuantity: string; readonly orderedQuantity: string }[],
): boolean {
  return lines.some((line) => hasPartialReceipt(line.receivedQuantity, line.orderedQuantity));
}
