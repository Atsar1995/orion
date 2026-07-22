import { Card } from "@/components/ui/Card";
import { StatGrid } from "@/components/ui/StatCard";
import type { BusinessHealthModule } from "@/lib/intelligence-data";

type BusinessHealthCardProps = {
  module: BusinessHealthModule;
};

/** Business health summary card with placeholder operational metrics. */
export function BusinessHealthCard({ module }: BusinessHealthCardProps) {
  return (
    <Card title={module.title}>
      <StatGrid stats={[...module.metrics]} />
    </Card>
  );
}
