import { KPIGrid } from "@/components/command-center/KPIGrid";
import { Card } from "@/components/ui/Card";
import { buildCommandCenterKpis } from "@/lib/command-center/snapshot-view";
import type { DashboardSnapshot } from "@/types/intelligence";

type BusinessSnapshotProps = {
  snapshot: DashboardSnapshot;
};

/** Business snapshot section — KPI grid from orchestrator metrics and trends. */
export function BusinessSnapshot({ snapshot }: BusinessSnapshotProps) {
  const kpis = buildCommandCenterKpis(snapshot);

  return (
    <Card title="Business Snapshot">
      <KPIGrid kpis={kpis} />
    </Card>
  );
}
