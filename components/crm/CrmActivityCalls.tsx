import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_FIELD_ROW_CLASS } from "@/lib/constants";
import type { CrmActivityCallItem } from "@/lib/crm/models/activities";

type CrmActivityCallsProps = {
  calls: CrmActivityCallItem[];
};

/** CRM placeholder call history section. */
export function CrmActivityCalls({ calls }: CrmActivityCallsProps) {
  return (
    <Card title="Calls">
      {calls.length === 0 ? (
        <EmptyState description="No calls match the current filters." />
      ) : (
        <ul className={WORKSPACE_FIELD_LIST_CLASS}>
          {calls.map((call) => (
            <li key={call.id} className={WORKSPACE_FIELD_ROW_CLASS}>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-white/85">{call.customer}</p>
                <p className="text-xs font-light text-white/45">{call.date}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-medium text-white/70">{call.duration}</p>
                <p className="font-light text-white/50">{call.outcome}</p>
                <p className="mt-1 font-light text-white/45">
                  Follow-up: {call.followUpRequired ? "Required" : "Not required"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
