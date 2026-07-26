import type { KPI, KPIInput } from "@/lib/business-health/models/KPI";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";

export type NormalizationError = {
  code: "EMPTY_PROVIDER" | "INVALID_VALUE";
  message: string;
};

export type NormalizationResult =
  | { success: true; kpis: KPI[] }
  | { success: false; errors: NormalizationError[] };

/** Contract for provider-specific KPI normalization. */
export interface KPISignalNormalizer<TRaw> {
  readonly source: KPI["source"];
  normalize(raw: TRaw): NormalizationResult;
}

/** Builds a finalized KPI from normalized signal input. */
export function buildNormalizedKPI(input: KPIInput): KPI {
  return finalizeKPI({
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
  });
}
