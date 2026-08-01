import type { HcmPaginationParams } from "@/lib/hcm/api/hcm-api-types";

export function parseOptionalString(url: URL, key: string): string | undefined {
  const value = url.searchParams.get(key);
  return value && value.length > 0 ? value : undefined;
}

export function parseOptionalNumber(url: URL, key: string): number | undefined {
  const raw = url.searchParams.get(key);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export function parsePagination(url: URL): HcmPaginationParams {
  return {
    page: parseOptionalNumber(url, "page"),
    pageSize: parseOptionalNumber(url, "pageSize"),
  };
}

export function resolvePagination(
  params: HcmPaginationParams,
  total: number,
): { page: number; pageSize: number; total: number } {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 50;
  return { page, pageSize, total };
}
