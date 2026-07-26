/** KPI category identifiers for Business Health scoring. */
export type KPICategoryId =
  | "revenue"
  | "marketing"
  | "customer"
  | "operations"
  | "finance"
  | "hospitality";

/** Provider or import source for a normalized KPI signal. */
export type KPISource = "ga4" | "shopify" | "meta" | "manual" | "spreadsheet" | string;

/** Directional trend for a KPI period comparison. */
export type KPITrend = "up" | "down" | "neutral";

/** Per-KPI health classification derived during evaluation. */
export type KPIStatus = "excellent" | "healthy" | "fair" | "poor" | "critical" | "unknown";

/** Whether rising values improve or degrade business health for this KPI. */
export type KPIValueDirection = "higher_is_better" | "lower_is_better";

/** Normalized KPI signal consumed by the Business Health Engine. */
export type KPI = {
  id: string;
  name: string;
  description: string;
  category: KPICategoryId;
  currentValue: number;
  previousValue: number;
  targetValue: number | null;
  weight: number;
  source: KPISource;
  confidence: number;
  trend: KPITrend;
  timestamp: string;
  status: KPIStatus;
  valueDirection?: KPIValueDirection;
};

/** Partial KPI used when constructing signals before evaluation. */
export type KPIInput = Omit<KPI, "trend" | "status" | "timestamp"> & {
  trend?: KPITrend;
  status?: KPIStatus;
  timestamp?: string;
};
