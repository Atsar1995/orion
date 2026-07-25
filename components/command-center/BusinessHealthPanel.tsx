import { HealthScore } from "@/components/dashboard/HealthScore";
import type { DashboardSnapshot } from "@/types/intelligence";

type BusinessHealthPanelProps = {
  snapshot: DashboardSnapshot;
};

/** Executive health score and driver breakdown from orchestrator snapshot. */
export function BusinessHealthPanel({ snapshot }: BusinessHealthPanelProps) {
  return <HealthScore health={snapshot.businessHealth} />;
}
