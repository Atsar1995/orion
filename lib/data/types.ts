/** Data fetch lifecycle status for executive surfaces (Mission S1C). */
export type DataStatus = "ready" | "loading" | "empty" | "error" | "stale";

/** Freshness metadata attached to platform data responses. */
export type DataFreshness = {
  readonly generatedAt: string;
  readonly lastUpdatedAt: string;
  readonly ttlSeconds: number;
  readonly isStale: boolean;
  readonly sourceCount: number;
};

/** Typed data envelope — every executive insight travels with provenance (Mission S1C). */
export type DataEnvelope<T> = {
  readonly status: DataStatus;
  readonly data: T | null;
  readonly freshness: DataFreshness;
  readonly sources: readonly string[];
  readonly errors: readonly DataError[];
};

/** Standard data-layer error descriptor. */
export type DataError = {
  readonly code: DataErrorCode;
  readonly message: string;
  readonly source?: string;
  readonly retryable: boolean;
};

export enum DataErrorCode {
  ValidationFailed = "VALIDATION_FAILED",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
  ProviderFailed = "PROVIDER_FAILED",
  NotFound = "NOT_FOUND",
  CacheMiss = "CACHE_MISS",
  Unknown = "UNKNOWN",
}

/** Result type for data service operations. */
export type DataResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: DataError };

/** Executive insight with mandatory explainability fields (Mission S1C). */
export type ExecutiveInsightRecord = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly source: string;
  readonly confidence: number;
  readonly confidenceLabel: "high" | "medium" | "low";
  readonly businessImpact: string;
  readonly evidence: readonly string[];
  readonly generatedAt: string;
  readonly workspace?: string;
  readonly entityType?: string;
  readonly entityId?: string;
};
