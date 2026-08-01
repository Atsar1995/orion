import { Card } from "@/components/ui/Card";
import type { CrmRecommendedAction } from "@/lib/crm/models/domain";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type CrmRecommendedActionCardProps = {
  action: CrmRecommendedAction;
};

/** Featured priority action for CRM overview. */
export function CrmRecommendedActionCard({ action }: CrmRecommendedActionCardProps) {
  return (
    <Card title="Priority Action" variant="premium">
      <div className="rounded-orion-md border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3">
        <p className="text-sm font-medium text-white/90">{action.title}</p>
        <p className={WORKSPACE_SUMMARY_CLASS}>{action.description}</p>
      </div>
    </Card>
  );
}
