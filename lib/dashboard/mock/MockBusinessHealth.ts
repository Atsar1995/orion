/** Deterministic business health status for EP-002 mock dashboard. */
export type MockHealthStatus = "healthy" | "attention" | "critical";

export type MockHealthDriver = {
  readonly label: string;
  readonly status: MockHealthStatus;
};

/** Mock business health widget payload. */
export type MockBusinessHealthData = {
  readonly score: number;
  readonly maxScore: number;
  readonly trend: string;
  readonly status: MockHealthStatus;
  readonly summary: string;
  readonly drivers: readonly MockHealthDriver[];
};

/** Mock confidence widget payload — presentation only, no EC-002B logic. */
export type MockConfidenceData = {
  readonly score: number;
  readonly band: "high" | "medium" | "low";
  readonly summary: string;
  readonly factors: readonly string[];
};

export const MOCK_BUSINESS_HEALTH: MockBusinessHealthData = {
  score: 82,
  maxScore: 100,
  trend: "+3",
  status: "attention",
  summary: "Platform condition is stable with hospitality occupancy requiring attention.",
  drivers: [
    { label: "Finance", status: "healthy" },
    { label: "Hospitality", status: "attention" },
    { label: "CRM", status: "healthy" },
  ],
} as const;

export const MOCK_CONFIDENCE: MockConfidenceData = {
  score: 0.86,
  band: "high",
  summary: "Signals are consistent across registered workspace providers.",
  factors: [
    "Finance metrics reconciled",
    "Hospitality occupancy variance within threshold",
    "Alert volume below escalation threshold",
  ],
} as const;
