import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import { HOSPITALITY_QUICK_ACTIONS } from "@/lib/hospitality-data";

/** Static quick action buttons for the Hospitality Workspace. */
export function QuickActions() {
  return (
    <Card title="Quick Actions">
      <div className="flex flex-wrap gap-2.5">
        {HOSPITALITY_QUICK_ACTIONS.map((action) => (
          <Button key={action.label} className={QUICK_ACTION_BUTTON_CLASSNAME}>
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
