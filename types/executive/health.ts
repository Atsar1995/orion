import type { HealthStatus } from "@/lib/command-center-data";

/** Domain-level health signal within the Business Health Engine (EC-002). */
export type DomainHealth = {
  id: string;
  label: string;
  status: HealthStatus;
  summary: string;
};

/** Platform health snapshot composed for executive surfaces. */
export type HealthSnapshot = {
  score: number;
  maxScore: number;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  status: HealthStatus;
  summary: string;
  domains: DomainHealth[];
  explanationAvailable: boolean;
};

export type HealthExplanation = {
  score: number;
  summary: string;
  drivers: DomainHealth[];
};
