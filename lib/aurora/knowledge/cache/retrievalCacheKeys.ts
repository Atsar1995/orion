import { createHash } from "node:crypto";
import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import {
  requiresValidatedOnlyRetrieval,
  resolveRetrievalQueryFilters,
} from "@/lib/aurora/knowledge/services/retrievalOrchestration";
import type { RetrievalQuery, RetrievalRequest } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

/** Default retrieval cache TTL (ES-AURORA-007 §4.9). */
export const RETRIEVAL_CACHE_TTL_SECONDS = 120 as const;

/** Deterministic sentinel when retrieval is not brand-scoped. */
export const RETRIEVAL_CACHE_UNSCOPED_BRAND = "_" as const;

export const RETRIEVAL_CACHE_KEY_PREFIX = "aurora:retrieval" as const;

export type RetrievalAccessFingerprint = {
  readonly restrictedAccess: boolean;
  readonly validatedOnlyRole: boolean;
};

export type RetrievalQueryFingerprint = {
  readonly query: string;
  readonly taskType: RetrievalRequest["taskType"];
  readonly domains: readonly KnowledgeDomain[] | null;
  readonly campaignId: string | null;
  readonly validatedOnly: boolean;
  readonly includeProvisional: boolean;
  readonly maxTokens: number | null;
  readonly access: RetrievalAccessFingerprint;
};

export function buildRetrievalAccessFingerprint(
  ctx: AuroraRuntimeContext,
): RetrievalAccessFingerprint {
  return {
    restrictedAccess: ctx.roles.includes("aurora.admin"),
    validatedOnlyRole: requiresValidatedOnlyRetrieval(ctx),
  };
}

export function buildRetrievalQueryFingerprint(
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
  retrievalQuery: RetrievalQuery,
): RetrievalQueryFingerprint {
  const filters = resolveRetrievalQueryFilters(ctx, request);
  const domains = retrievalQuery.domains ? [...retrievalQuery.domains].sort() : null;

  return {
    query: request.query.trim(),
    taskType: request.taskType,
    domains,
    campaignId: request.campaignId ?? null,
    validatedOnly: filters.validatedOnly ?? false,
    includeProvisional: filters.includeProvisional ?? false,
    maxTokens: request.maxTokens ?? null,
    access: buildRetrievalAccessFingerprint(ctx),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

export function buildRetrievalQueryHash(
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
  retrievalQuery: RetrievalQuery,
): string {
  const fingerprint = buildRetrievalQueryFingerprint(ctx, request, retrievalQuery);
  return createHash("sha256").update(stableStringify(fingerprint), "utf8").digest("hex");
}

export function resolveRetrievalCacheBrandId(ctx: AuroraRuntimeContext): string {
  const brandId = ctx.brandId?.trim();
  return brandId ? brandId : RETRIEVAL_CACHE_UNSCOPED_BRAND;
}

export function buildRetrievalCacheKey(
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
  retrievalQuery: RetrievalQuery,
): string {
  const queryHash = buildRetrievalQueryHash(ctx, request, retrievalQuery);
  return `${RETRIEVAL_CACHE_KEY_PREFIX}:${ctx.tenantId}:${resolveRetrievalCacheBrandId(ctx)}:${queryHash}`;
}
