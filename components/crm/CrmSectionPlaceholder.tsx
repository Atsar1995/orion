import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

type CrmSectionPlaceholderProps = {
  title: string;
  description: string;
};

/** Placeholder section for CRM sub-pages pending data integrations (Mission 16A.1+). */
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
