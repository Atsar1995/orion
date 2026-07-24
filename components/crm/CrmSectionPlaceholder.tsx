import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type CrmSectionPlaceholderProps = {
  title: string;
  description: string;
};

/** Placeholder section for Customer Intelligence sub-pages pending Mission 16B+. */
export function CrmSectionPlaceholder({
  title,
  description,
}: CrmSectionPlaceholderProps) {
  return (
    <Card title={title}>
      <EmptyState description={description} />
    </Card>
  );
}
