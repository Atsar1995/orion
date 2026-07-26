import type { KPICategoryId, KPI } from "@/lib/business-health/models/KPI";

/** Weighted KPI grouping for category-level scoring. */
export type Category = {
  id: KPICategoryId;
  name: string;
  weight: number;
  kpis: KPI[];
};

/** Category configuration without resolved KPI instances. */
export type CategoryDefinition = {
  id: KPICategoryId;
  name: string;
  weight: number;
};
