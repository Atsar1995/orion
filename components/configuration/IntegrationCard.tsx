import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type IntegrationCardProps = {
  name: string;
};

/** Placeholder integration card with disconnected status. */
export function IntegrationCard({ name }: IntegrationCardProps) {
  return (
    <Card title={name}>
      <div className="flex min-h-[88px] items-center">
        <EmptyState
          description="Not Connected"
          className="py-0 sm:items-start sm:text-left"
        />
      </div>
    </Card>
  );
}
