import type { KPICategoryId } from "@/lib/business-health/models/KPI";

/** Relative importance of an explanation item in the overall assessment. */
export type ExplanationImportance = "critical" | "high" | "medium" | "low";

/** Reference to a KPI supporting an explanation item. */
export type SupportingKPIReference = {
  readonly id: string;
  readonly name: string;
};

/** One contributing business factor in a Business Health explanation. */
export type ExplanationItem = {
  readonly id: string;
  readonly title: string;
  readonly category: KPICategoryId;
  /** Signed contribution to the overall health assessment. */
  readonly contribution: number;
  readonly importance: ExplanationImportance;
  readonly description: string;
  readonly supportingKpis: readonly SupportingKPIReference[];
};
