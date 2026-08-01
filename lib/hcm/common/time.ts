/** Shared HCM time helpers. */
export function nowIso(): string {
  return new Date().toISOString();
}

export function isValidDateRange(from: string, to?: string): boolean {
  if (!from.trim()) return false;
  if (!to) return true;
  return to >= from;
}

export function rangesOverlap(
  aFrom: string,
  aTo: string | undefined,
  bFrom: string,
  bTo: string | undefined,
): boolean {
  const aEnd = aTo ?? "9999-12-31T23:59:59.999Z";
  const bEnd = bTo ?? "9999-12-31T23:59:59.999Z";
  return aFrom <= bEnd && bFrom <= aEnd;
}
