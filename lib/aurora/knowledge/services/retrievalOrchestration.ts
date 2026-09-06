import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import { RETRIEVAL_TASK_DOMAIN_MAP } from "@/lib/aurora/knowledge/retrieval/contextAssembly";
import {
  DEFAULT_RETRIEVAL_TOP_K,
  RETRIEVAL_TASK_TYPES,
  type RetrievalQuery,
  type RetrievalRequest,
  type RetrievalTaskType,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

/** Roles constrained to validated-only retrieval reads (ES-AURORA-007 §7.10). */
export const VALIDATED_ONLY_RETRIEVAL_ROLES = ["aurora.viewer", "aurora.approver"] as const;

export class RetrievalInvalidRequestError extends Error {
  readonly name = "RetrievalInvalidRequestError";

  constructor(message: string) {
    super(message);
  }
}

export class RetrievalUnsupportedTaskError extends Error {
  readonly name = "RetrievalUnsupportedTaskError";

  constructor(taskType: string) {
    super(`Unsupported retrieval task type: ${taskType}`);
  }
}

export type QueryVectorResolution = {
  readonly queryVector?: readonly number[];
  readonly semanticDegraded: boolean;
  readonly semanticDegradationReason?: string;
};

export function assertSupportedRetrievalTask(taskType: RetrievalTaskType): void {
  if (!RETRIEVAL_TASK_TYPES.includes(taskType)) {
    throw new RetrievalUnsupportedTaskError(taskType);
  }
}

export function validateRetrievalRequest(request: RetrievalRequest): void {
  assertSupportedRetrievalTask(request.taskType);

  if (!request.query.trim()) {
    throw new RetrievalInvalidRequestError("Retrieval query must not be empty.");
  }
}

export function requiresValidatedOnlyRetrieval(ctx: AuroraRuntimeContext): boolean {
  return ctx.roles.some((role) =>
    VALIDATED_ONLY_RETRIEVAL_ROLES.includes(role as (typeof VALIDATED_ONLY_RETRIEVAL_ROLES)[number]),
  );
}

export function resolveRetrievalDomains(request: RetrievalRequest): readonly KnowledgeDomain[] | undefined {
  if (request.domains?.length) {
    return request.domains;
  }

  const mapping = RETRIEVAL_TASK_DOMAIN_MAP[request.taskType];
  return [...mapping.primary, ...mapping.secondary];
}

export function resolveRetrievalQueryFilters(
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
): Pick<RetrievalQuery, "validatedOnly" | "includeProvisional"> {
  const roleRequiresValidatedOnly = requiresValidatedOnlyRetrieval(ctx);

  if (roleRequiresValidatedOnly) {
    return {
      validatedOnly: true,
      includeProvisional: false,
    };
  }

  const validatedOnly = request.validatedOnly ?? false;

  return {
    validatedOnly,
    includeProvisional: request.includeProvisional ?? !validatedOnly,
  };
}

export function buildRetrievalQueryFromRequest(
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
): RetrievalQuery {
  const filters = resolveRetrievalQueryFilters(ctx, request);

  return {
    query: request.query.trim(),
    domains: resolveRetrievalDomains(request),
    brandId: ctx.brandId || undefined,
    campaignId: request.campaignId,
    validatedOnly: filters.validatedOnly,
    includeProvisional: filters.includeProvisional,
    topK: DEFAULT_RETRIEVAL_TOP_K,
  };
}

/** Sprint 3 memory tiers are stubbed — ERR-3 applies for orchestration metadata. */
export const SPRINT3_MEMORY_RETRIEVAL_DEGRADED = true as const;
